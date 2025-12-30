# ADR-0001: Phase 2 JWT Authentication Architecture

> **Scope**: Frontend authentication (Better Auth) issues JWTs; backend (FastAPI) verifies tokens without calling external auth services. Stateless, scalable approach aligned with specification requirements and hackathon scope.

- **Status:** Accepted
- **Date:** 2025-12-31
- **Feature:** 004-phase-2-web-api
- **Context:** Phase 2 extends Phase 1 CLI Todo to web architecture. Application requires secure multi-user task management with strict user isolation. Specification mandates stateless backend and JWT-based authentication verified by FastAPI.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security? ✅ YES - All auth flows, API authorization, user data isolation
     2) Alternatives: Multiple viable options considered with tradeoffs? ✅ YES - OAuth2 external providers, session-based Redis, platform-specific auth
     3) Scope: Cross-cutting concern (not an isolated detail)? ✅ YES - Affects frontend (token issuance), backend (token verification), database (user models), API security
     All conditions met; ADR justified. -->

## Decision

Implement stateless JWT authentication using:

- **Frontend Auth Provider**: Better Auth v1.x (email/password signup & login, automatic JWT token generation)
- **Token Format**: JWT with HS256 signature algorithm (HMAC-SHA256)
- **Shared Secret**: JWT_SECRET environment variable (used by both Better Auth issuance and FastAPI verification)
- **Backend Verification**: FastAPI 0.104+ with PyJWT 2.8+ library for token validation
- **Middleware Pattern**: FastAPI Depends() with oauth2_scheme for dependency injection on protected endpoints
- **Token Storage**: Browser localStorage or HttpOnly cookie (managed by Better Auth client)
- **User Isolation**: Strict enforcement at API layer — JWT.user_id must match request path.user_id; 403 Forbidden on mismatch
- **Token Expiration**: JWT exp claim enforced by PyJWT.decode() (expiration time set by Better Auth)

## Consequences

### Positive

- **Stateless Backend**: No session database or in-memory state required. Backend scales horizontally without sticky sessions.
- **No External Auth Service**: JWT validation requires only shared secret; eliminates dependency on Okta, Auth0, or other external providers (reduces infrastructure complexity and cost).
- **Simple Integration**: Better Auth provides turnkey email/password support with minimal frontend configuration; FastAPI's Depends() pattern enables elegant token middleware.
- **Specification Compliance**: Directly implements specification requirement: "JWT verified by FastAPI" with "shared secret" (stateless backend mandate).
- **Security Alignment**: Token signature verified server-side on every protected request; invalid/expired tokens rejected with 401. User isolation enforced with 403 Forbidden on user_id mismatch.
- **Hackathon Scope**: Minimal infrastructure; no auth platform setup or provisioning required. Aligns with "keep design simple and hackathon-appropriate" constraint.
- **Future-Proof**: JWT standard is portable across platforms; if architecture evolves (mobile apps, third-party integrations), JWT remains viable.

### Negative

- **Token Revocation Complexity**: JWTs are self-contained; no server-side revocation mechanism without additional infrastructure (blacklist, token denylist). Once issued, token valid until expiration.
  - *Mitigation*: For Phase 2, acceptable. Short token lifetimes (e.g., 1 hour) and refresh token pattern (if added later) reduce risk. Immediate revocation can be implemented via denylist in future phases if needed.
  - *Risk*: If user password compromised, attacker can use token until expiration. Revocation adds overhead (cache layer, database check on every request).
- **Shared Secret Management**: JWT_SECRET must be identical on frontend (Better Auth) and backend (FastAPI). If secret changes, all existing tokens become invalid.
  - *Mitigation*: Rotate secret in coordination; store in .env (never commit). Versioning not implemented in Phase 2 but can be added if needed.
- **No Built-In Scopes or Permissions**: HS256 symmetric key (single secret) limits fine-grained permission model. Permission-based access control (RBAC) requires custom implementation.
  - *Mitigation*: Phase 2 spec requires only user isolation (user can access only own tasks), not RBAC. Sufficient for current scope. Permissions can be added to JWT payload in future if needed.
- **Browser-Side Storage Risk**: JWT stored in localStorage vulnerable to XSS (malicious script can steal token). HttpOnly cookie more secure but less flexible.
  - *Mitigation*: Better Auth handles storage; recommend HttpOnly cookie for Phase 2. Content Security Policy (CSP) headers reduce XSS risk.

## Alternatives Considered

### Alternative 1: OAuth2 with External Provider (Okta, Auth0, Google, GitHub)

**Components**: Third-party OAuth2 provider + OAuth2 flow (authorization code) + provider's token validation

**Pros**:
- Outsourced auth maintenance; provider handles security patches, compliance
- Support for multi-factor authentication (MFA), social logins out-of-box
- Token revocation handled by provider
- Audit trails and compliance features (GDPR, HIPAA)

**Cons**:
- Requires provider account setup, configuration, API credentials
- Network latency: every token verification calls external provider (unless cached)
- Cost: Free tier often limited; scaling can require paid plan
- Vendor lock-in; migrating requires re-architecture
- Overkill for hackathon; adds complexity without benefit for single feature (email/password, no MFA in spec)
- Specification constraint: "stateless backend" violated if backend calls provider on each request

**Why Rejected**: Exceeds hackathon scope; incompatible with "stateless backend" requirement; requires external infrastructure setup.

### Alternative 2: Session-Based Authentication with Redis/Memcached

**Components**: Session store (Redis) + session ID cookie + server-side session lookup on every request

**Pros**:
- Easy token revocation (delete session from Redis immediately)
- Immediate logout (session deleted, cookie invalid)
- Flexible permissions (stored in session, no JWT payload constraints)
- Simple password reset (session invalidated)

**Cons**:
- Violates specification mandate: "stateless backend" (session store is state)
- Requires Redis/Memcached infrastructure (setup, monitoring, failover)
- Session lookup on every request adds latency and database query load
- Does not scale horizontally without sticky sessions or session replication
- Increases operational complexity (cache invalidation, cache coherency)
- Higher memory footprint; sessions stored server-side for every user

**Why Rejected**: Direct violation of specification requirement for stateless backend; adds infrastructure; reduces scalability (sticky sessions vs horizontal scaling).

### Alternative 3: Better Auth with Platform-Integrated Backend (Better Auth Server)

**Components**: Better Auth Server (hosted) + Better Auth client + managed authentication service

**Pros**:
- Unified auth experience across frontend and backend
- Built-in dashboard for user management, audit logs
- Better Auth handles token lifecycle (issuance, refresh, revocation)
- Less custom code required

**Cons**:
- Platform lock-in to Better Auth ecosystem
- Requires paying for Better Auth managed service (not free)
- Loses stateless backend benefit (backend must call Better Auth service)
- Contradicts specification: "JWT verified by FastAPI" implies local verification, not service call
- More complex than simple JWT validation; adds network dependency
- Overkill for Phase 2 scope (email/password only; no MFA, social, or advanced features)

**Why Rejected**: Violates "stateless backend" (requires service call); incompatible with specification; adds cost and complexity for minimal benefit.

### Alternative 4: mTLS (Mutual TLS) with Certificates

**Components**: Client and server certificates + TLS handshake verification

**Pros**:
- Very strong security model (certificate-based, cryptographically verified)
- No token storage or revocation issues (based on certificate validity)
- Fine-grained control over certificate expiration

**Cons**:
- Certificate provisioning, rotation, and management complexity
- Not suitable for browser-based authentication (requires special client setup)
- Overkill for user authentication; typically used for service-to-service authentication
- No user password concept; requires certificate distribution mechanism
- Browser users cannot use mTLS directly (requires proxy or special setup)

**Why Rejected**: Not applicable for user-facing web application; designed for service authentication, not user authentication.

## Consequences Summary Table

| Aspect | JWT (Chosen) | OAuth2 (Alt 1) | Session (Alt 2) | Better Auth Server (Alt 3) |
|--------|--------------|----------------|-----------------|---------------------------|
| **Stateless** | ✅ Yes | ❌ No (provider calls) | ❌ No (session store) | ❌ No (service calls) |
| **Setup Complexity** | ✅ Low | ❌ High | ⚠️ Medium | ❌ High |
| **Scalability** | ✅ Horizontal | ⚠️ Limited | ❌ Sticky sessions | ✅ Depends on service |
| **Token Revocation** | ❌ Hard | ✅ Easy | ✅ Easy | ✅ Easy |
| **Hackathon Fit** | ✅ Excellent | ❌ Overkill | ⚠️ Over-complex | ❌ Over-complex |
| **Specification Alignment** | ✅ Full | ⚠️ Partial | ❌ No | ⚠️ Partial |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 16+)               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Better Auth Client (v1.x)                            │  │
│  │ - Email/Password Signup/Login                        │  │
│  │ - JWT Token Generation (HS256)                       │  │
│  │ - Token Storage (localStorage/HttpOnly)              │  │
│  │ - useAuth() Hook + Automatic Header Injection        │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │ JWT Token in Authorization Header    │
└──────────────────────┼──────────────────────────────────────┘
                       │
       ┌───────────────▼─────────────────┐
       │  POST /auth/signup              │
       │  POST /auth/login               │
       │  POST /api/{user_id}/tasks      │ (+ Bearer JWT)
       │  GET  /api/{user_id}/tasks      │ (+ Bearer JWT)
       │  etc.                            │
       └───────────────┬─────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Backend (FastAPI 0.104+)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ JWT Verification Middleware                          │  │
│  │ - Extract JWT from Authorization: Bearer header      │  │
│  │ - Validate signature: jwt.decode(token, JWT_SECRET,  │  │
│  │                       algorithms=["HS256"])          │  │
│  │ - Verify expiration (exp claim)                      │  │
│  │ - Extract user_id from JWT payload (sub claim)       │  │
│  │ - Enforce user_id == request.path.user_id (403)     │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │ Authenticated request                │
│  ┌───────────────────▼──────────────────────────────────┐  │
│  │ Route Handlers (Tasks CRUD, etc.)                    │  │
│  │ - Query User/Task models                             │  │
│  │ - Validate and transform data                        │  │
│  │ - Return JSON response                               │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬──────────────────────────────────────┘
                     │
        ┌────────────▼─────────────┐
        │ Database (Neon PostgreSQL)│
        │ - users table             │
        │ - tasks table             │
        │ - relationships (FK)      │
        └───────────────────────────┘

Shared Secret (in .env, never committed):
JWT_SECRET = "shared_secret_key_for_hs256_signing"
```

## References

- **Feature Specification**: [004-phase-2-web-api/spec.md](../spec.md) - Requirements for JWT-based authentication, user isolation (403 Forbidden), stateless backend
- **Implementation Plan**: [004-phase-2-web-api/plan.md](../plan.md) - Section "Decision: JWT Authentication Architecture" with Context7 research findings
- **Research Document**: [004-phase-2-web-api/research.md](../research.md) - Context7 MCP findings for Better Auth v1.x, FastAPI 0.104+, PyJWT 2.8+, SQLModel integration
- **Related ADRs**: None (first ADR for Phase 2)
- **Evaluator Evidence**: [0002-create-phase-2-implementation-plan.plan.prompt.md](../../history/prompts/004-phase-2-web-api/0002-create-phase-2-implementation-plan.plan.prompt.md) - Constitution check PASS (8/8 principles), Context7 research validation

## Implementation Notes

- **JWT_SECRET Storage**: Generate random secret (at least 256 bits of entropy). Store in .env file. Never commit to version control.
- **Token Expiration**: Configure in Better Auth client (default ~1 hour recommended). FastAPI validates exp claim automatically via jwt.decode().
- **Password Hashing**: Better Auth handles password hashing (bcrypt 4.x). Backend stores only password_hash in database.
- **User Isolation**: Middleware must extract user_id from JWT (sub claim) and compare with request path parameter. Return 403 Forbidden on mismatch (specification requirement).
- **Future Enhancements** (Phase 3+):
  - Refresh token pattern (if short-lived access tokens needed)
  - Token denylist/blacklist (if immediate revocation required)
  - Role-based access control (if permissions added to JWT)
  - Multi-factor authentication (if required)

## Decision Log

- **2025-12-31**: ADR-0001 created. Decision **Accepted** based on Context7 research and specification compliance. Stateless JWT architecture chosen as optimal for hackathon scope and scalability.
- **Approval**: Pending team review and sign-off before proceeding to Phase 2 (task breakdown) and Phase 3 (implementation).
