---
adr: 001
title: Authentication Router Strategy - Handling Multiple Auth Implementations
date: 2026-01-08
status: Accepted
authors:
  - Claude Code Assistant
---

# ADR 001: Authentication Router Strategy - Handling Multiple Auth Implementations

## Context

During implementation of the Phase 2 Web API with JWT authentication, we discovered that the backend contained two separate authentication router implementations:

1. `backend/src/api/auth.py` (legacy) - Simpler auth with email/password only
2. `backend/src/api/auth_router.py` (modern) - Full-featured auth with username, first name, last name, etc.

Both routers were being registered with FastAPI in `backend/src/main.py` with and without version prefixes, creating duplicate routes for `/auth/register` and other endpoints. This resulted in persistent 500 Internal Server Error responses on authentication endpoints.

The original architecture planned for JWT-based authentication with stateless backend (as documented in specs/004-phase-2-web-api/plan.md), but the implementation had evolved to include multiple auth strategies without proper coordination.

## Decision

We decided to adopt a unified authentication router strategy:

1. **Primary Router**: Use `auth_router.py` (modern implementation) as the main authentication system
2. **Route Registration**: Register auth routes only once with version prefixes (e.g., `/api/v1/auth/register`) and once without prefixes for direct access
3. **Conflict Resolution**: Remove duplicate registrations that were causing route conflicts
4. **Service Layer**: Ensure `AuthService` contains all necessary methods for both legacy and modern auth flows

## Alternative Approaches Considered

### Alternative 1: Keep Both Routers with Different Prefixes
- **Approach**: Assign different API prefixes to each router (e.g., `/api/v1/auth-legacy`, `/api/v1/auth`)
- **Pros**: Preserves both implementations, allows gradual migration
- **Cons**: Increases complexity, potential confusion for API consumers, maintenance overhead

### Alternative 2: Merge Both Implementations into One Router
- **Approach**: Combine both auth.py and auth_router.py functionality into a single router
- **Pros**: Single source of truth, cleaner architecture
- **Cons**: Risk of breaking existing functionality, larger change scope

### Alternative 3: Remove Legacy Implementation Entirely
- **Approach**: Delete auth.py and keep only auth_router.py
- **Pros**: Simplifies architecture, reduces maintenance
- **Cons**: Potential breaking changes if legacy clients depend on the old implementation

## Consequences

### Positive
- Eliminates 500 Internal Server Error responses on authentication endpoints
- Reduces route conflicts and improves API reliability
- Provides a consistent authentication experience
- Simplifies debugging and maintenance

### Negative
- Requires careful testing to ensure all auth flows continue to work
- May break clients depending on specific router implementation details
- Need to ensure both legacy and modern auth flows are properly supported

### Neutral
- Maintains backward compatibility through versioned API endpoints
- Preserves the ability to access auth endpoints both with and without prefixes

## Implementation Details

The changes included:
1. Modifying `backend/src/main.py` to remove duplicate router registrations
2. Ensuring `AuthService.verify_token()` method exists to support refresh token functionality
3. Maintaining both versioned and non-versioned access patterns for flexibility

## References

- Original auth architecture: specs/004-phase-2-web-api/plan.md
- Backend auth implementations: backend/src/api/auth.py, backend/src/api/auth_router.py
- Authentication service: backend/src/services/auth_service.py
- Main application routing: backend/src/main.py