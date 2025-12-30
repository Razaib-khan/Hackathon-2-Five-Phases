# Implementation Plan: Phase 2 - Web API with Authentication

**Branch**: `004-phase-2-web-api` | **Date**: 2025-12-31 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-phase-2-web-api/spec.md`

## Summary

Phase 2 extends Phase 1 CLI Todo to a web architecture with REST API, JWT authentication, and PostgreSQL persistence. The system consists of three independent services: a Next.js 16+ frontend using Better Auth for email/password authentication (issuing JWT tokens), a FastAPI backend verifying JWT tokens on protected endpoints, and a Neon PostgreSQL database with SQLModel ORM managing User ↔ Task relationships. All components follow a stateless, JWT-based architecture with strict user isolation enforced at the API layer.

## Technical Context

**Frontend Language/Version**: TypeScript 5.x with Next.js 16+ (App Router)
**Backend Language/Version**: Python 3.11+ with FastAPI 0.104+
**Primary Dependencies (Frontend)**: Next.js 16+, Better Auth v1.x, React 19+, TailwindCSS 4+
**Primary Dependencies (Backend)**: FastAPI 0.104+, SQLModel 0.0.14+, Pydantic 2.x, PyJWT 2.8+, bcrypt 4.x, uvicorn 0.24+
**Storage**: Neon Serverless PostgreSQL (postgres 15+)
**Testing**: pytest (backend), Jest/Testing Library (frontend) - DEFERRED to Phase 3
**Target Platform**: Web (Linux/Cloud backends, modern browsers)
**Project Type**: Web application (frontend + backend separation)
**Performance Goals**: p95 API latency <500ms, support 100 concurrent authenticated users, frontend smooth animations (60 fps)
**Constraints**: Stateless backend, strict user isolation (403 Forbidden on mismatched user_id), JWT expiration enforced
**Scale/Scope**: 4 user stories (P1 & P2), 9 API endpoints (6 core task + 3 auth), 2 database tables (User + Task), responsive UI (desktop/tablet/mobile)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Assessment |
|-----------|--------|------------|
| **Spec-Driven Development** | ✅ PASS | Comprehensive spec.md with 4 user stories, 30 functional requirements, 7 success criteria, all acceptance scenarios defined |
| **Sequential Phase Execution** | ✅ PASS | Plan follows Phase 0 → 1 sequence; Phase 2 (tasks) and Phase 3 (implementation) deferred until approval |
| **No Overengineering** | ✅ PASS | Architecture strictly implements spec: stateless backend, simple JWT validation, direct SQLModel ORM (no custom repository pattern) |
| **Stateless Backend** | ✅ PASS | FastAPI backend uses JWT-only auth; no session storage or in-memory state; Neon handles all persistence |
| **AI via Tools & APIs** | ✅ PASS | Using Context7 MCP for research; artifact generation via scripts; no free-form code invention |
| **No Manual Coding** | ✅ PASS | Phase 0 research complete; Phase 1 will generate contracts and models; Phase 3 will execute via task-driven implementation |
| **Process Clarity** | ✅ PASS | PHR records all decisions; ADR will document JWT + Better Auth choice if needed; clear artifact structure |
| **Reusable Artifacts** | ✅ PASS | PHR created for /sp.plan; will create ADR for auth architecture; research.md consolidates findings |

**GATE RESULT**: ✅ **PASS** - All constitutional principles satisfied. Proceed to Phase 1 design.

## Project Structure

### Documentation (this feature)

```text
specs/004-phase-2-web-api/
├── spec.md              # Feature specification (COMPLETE)
├── plan.md              # This file (Phase 0-1 output)
├── research.md          # Phase 0: Technology research findings (TO BE CREATED)
├── data-model.md        # Phase 1: SQLModel entities and relationships (TO BE CREATED)
├── quickstart.md        # Phase 1: Setup and deployment instructions (TO BE CREATED)
├── contracts/           # Phase 1: API endpoint specifications (TO BE CREATED)
│   ├── openapi.json     # OpenAPI 3.0 spec
│   ├── auth-flow.md     # Authentication flow diagram
│   └── error-codes.md   # HTTP error code mapping
├── checklists/
│   └── requirements.md  # Quality validation checklist (COMPLETE)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Web application structure (frontend + backend)

backend/
├── src/
│   ├── models/              # SQLModel ORM: User, Task
│   ├── api/
│   │   ├── auth.py         # POST /auth/signup, /auth/login, /auth/logout
│   │   └── tasks.py        # GET/POST/PUT/DELETE /api/{user_id}/tasks, PATCH /complete
│   ├── security/
│   │   └── jwt.py          # JWT verification middleware + dependency injection
│   ├── db/
│   │   └── session.py      # Neon PostgreSQL session management
│   └── main.py             # FastAPI app initialization
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
└── tests/                  # pytest - deferred to Phase 3
    ├── unit/
    ├── integration/
    └── contract/

frontend/
├── src/
│   ├── app/                # Next.js 16+ App Router
│   │   ├── (auth)/         # Auth pages (signup, login, logout)
│   │   ├── (app)/          # Protected pages (tasks, dashboard)
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Reusable UI components
│   │   ├── TaskForm.tsx    # Create/edit task form
│   │   ├── TaskList.tsx    # Task list with filtering/sorting
│   │   ├── SearchBar.tsx   # Task search
│   │   └── Header.tsx      # Navigation bar
│   ├── lib/
│   │   ├── auth.ts         # Better Auth client + JWT handling
│   │   └── api.ts          # API client wrapper (includes JWT in headers)
│   ├── styles/             # TailwindCSS global styles
│   └── types/              # TypeScript types for API responses
├── package.json            # Node.js dependencies
├── tsconfig.json           # TypeScript config
├── next.config.js          # Next.js config
├── .env.local.example      # Frontend env template
└── tests/                  # Jest/Testing Library - deferred to Phase 3

.env (repository root, shared secrets)
├── DATABASE_URL            # Neon PostgreSQL connection
├── JWT_SECRET              # Shared secret for JWT signing/verification
└── API_URL                 # Backend API base URL
```

**Structure Decision**: Web application with frontend/backend separation (Option 2). Frontend handles UI/UX with Better Auth client; backend provides stateless REST API with JWT verification; Neon PostgreSQL managed externally. No changes to existing Phase 1 directories (src/, tests/); Phase 2 uses frontend/ and backend/ folders as specified.

## Complexity Tracking

No constitutional violations detected. No complexity justifications required.

---

## Phase 0: Research & Context Gathering

**Status**: ✅ **COMPLETE**

### Decision: JWT Authentication Architecture

**Decision**: Better Auth (frontend) issues JWT tokens; FastAPI verifies tokens using PyJWT with shared JWT_SECRET.

**Rationale**:
- Better Auth is a high-reputation (High Source, 85.1 benchmark score), framework-agnostic auth library with 2230+ code snippets
- Provides built-in email/password support with minimal configuration (aligns with hackathon scope)
- JWT tokens can be verified in FastAPI using standard PyJWT library (simple, no external auth service)
- Stateless backend: JWT is self-contained; FastAPI decodes and validates signature without calling external services
- Matches specification requirement: "JWT verified by FastAPI" with shared secret

**Alternatives Considered**:
- OAuth2 with external provider (Okta, Auth0): Requires additional infrastructure; overkill for hackathon
- Session-based with Redis: Violates stateless principle; adds complexity
- Better Auth with integrated backend: Requires platform lock-in; Better Auth is frontend-centric

**Context7 Research**:
- Better Auth v1.x supports email/password out-of-box and JWT token issuance
- FastAPI 0.104+ has built-in OAuth2 security schemes and Depends() for token validation
- PyJWT 2.8+ provides jwt.decode() with signature verification using HS256 algorithm
- Neon PostgreSQL fully compatible with SQLModel ORM

### Decision: SQLModel for ORM

**Decision**: Use SQLModel 0.0.14+ for User and Task models; direct database access (no repository pattern).

**Rationale**:
- SQLModel combines SQLAlchemy and Pydantic: single model definition serves as both ORM and API validation schema
- High reputation (High Source, 78.2-79.8 benchmark scores) with 2464+ code snippets
- Simple one-to-many relationship: User ↔ Task with cascade delete (standard SQLAlchemy pattern)
- No generic repository pattern needed; specification requires only 6 task CRUD endpoints
- Direct session management via FastAPI Depends() injection

**Alternatives Considered**:
- Raw SQL with psycopg3: Manual query writing defeats ORM benefits; error-prone
- Custom ORM layer: Premature abstraction (violates constitution)
- Tortoise ORM: Less mature; fewer snippets than SQLModel

**Context7 Research**:
- SQLModel relationships pattern: User.tasks = Relationship(back_populates="user") on Task
- Cascade delete configured via foreign key constraint in Task.user_id
- Session() context manager for transaction management

### Decision: FastAPI for Backend API

**Decision**: FastAPI 0.104+ with PyJWT middleware for JWT token verification.

**Rationale**:
- High reputation (High Source, 87.2 benchmark score), 881+ code snippets
- Native OAuth2 security scheme support with Depends() pattern aligns with JWT verification
- Automatic OpenAPI documentation; built-in request validation via Pydantic
- Performance goal met: FastAPI handles 100 concurrent users easily (measured in benchmarks)
- Python 3.11+ with type hints enables IDE autocomplete and runtime validation

**Alternatives Considered**:
- Flask + custom auth: Manual JWT handling; no built-in security patterns
- Django: Overkill for stateless API; extensive ORM not needed
- Express.js: Requires Node.js environment; project uses Python backend (per spec)

**Context7 Research**:
- FastAPI dependency injection pattern: async def get_current_user(token: str = Depends(oauth2_scheme))
- Token validation: jwt.decode(token, JWT_SECRET, algorithms=["HS256"]) raises JWT exceptions on invalid/expired tokens
- 401 Unauthorized for invalid tokens; 403 Forbidden for mismatched user_id (as per spec)

### Decision: Next.js 16+ with Better Auth Client

**Decision**: Next.js 16+ (App Router) for frontend; Better Auth client library for authentication flow.

**Rationale**:
- Next.js 16+ includes App Router with built-in support for server and client components
- React 19+ bundled automatically with Next.js 16
- Better Auth client handles JWT token storage and automatic header injection
- TailwindCSS 4+ enables rapid UI development (hackathon-appropriate)
- TypeScript 5.x provides type safety for API client

**Alternatives Considered**:
- Vue.js + custom auth: Smaller ecosystem; similar complexity
- React SPA (Vite): Requires separate backend routing; more configuration

**Context7 Research**:
- Better Auth provides useAuth() hook for session/token management
- Automatic JWT token storage in localStorage or HttpOnly cookie
- TypeScript types available for API response validation

### Decision: Neon PostgreSQL

**Decision**: Neon Serverless PostgreSQL (postgres 15+) managed externally; DATABASE_URL environment variable.

**Rationale**:
- Specification explicitly requires "Neon Serverless PostgreSQL"
- Serverless simplifies deployment for hackathon; no infrastructure management
- SQLModel + sqlalchemy fully compatible with Neon
- No custom database setup needed; SQLModel can auto-create tables via create_all()

---

## Phase 1: Design & Contracts

**Status**: ⏳ **PENDING** - Execution after plan approval

### Deliverables

1. **research.md** (Phase 0 → Phase 1)
   - Consolidate Context7 findings into single document
   - Decision rationale for JWT + Better Auth + FastAPI + SQLModel
   - Alternatives considered and rejected
   - Version compatibility matrix

2. **data-model.md** (Phase 1)
   - User model: id (UUID), email (unique, indexed), password_hash, created_at, updated_at
   - Task model: id (UUID), user_id (FK → users.id, indexed), title (str 200), description (str 1000, nullable), completed (bool), created_at, updated_at
   - Relationships: User.tasks (one-to-many, cascade delete); Task.user (many-to-one)
   - Indexes: (user_id), (user_id, created_at) for query performance
   - Validation rules from spec: email format, title required, description ≤1000 chars, password ≥8 chars

3. **quickstart.md** (Phase 1)
   - Prerequisites: Python 3.11+, Node.js 18+, PostgreSQL 15+
   - Setup steps: clone, install dependencies, create .env, migrate database, start frontend/backend
   - Testing workflow (Phase 3 deferred): pytest for backend, Jest for frontend
   - Deployment checklist (Phase 4 deferred)

4. **contracts/openapi.json** (Phase 1)
   - OpenAPI 3.0 schema for all 9 endpoints
   - Request/response schemas derived from spec
   - Authentication scheme: Bearer JWT
   - Error code mappings (400, 401, 403, 404, 500)

5. **contracts/auth-flow.md** (Phase 1)
   - Sequence diagram: User signup → JWT issuance → API access → JWT validation → 403 Forbidden on mismatch
   - Token lifecycle: issuer (Better Auth), verifier (FastAPI), storage (browser), expiration (spec: to be determined)

6. **contracts/error-codes.md** (Phase 1)
   - 400 Bad Request: invalid email, weak password, missing title, malformed JSON
   - 401 Unauthorized: missing JWT, invalid signature, expired token
   - 403 Forbidden: user_id mismatch, insufficient permissions
   - 404 Not Found: task doesn't exist, user doesn't exist
   - 500 Internal Server Error: database unavailable, unhandled exceptions

### Dependencies

- ✅ spec.md complete with 30 functional requirements
- ✅ Context7 research complete (JWT, FastAPI, SQLModel, Better Auth best practices)
- ✅ Constitution check passed
- ⏳ Phase 1 design awaiting approval

---

## Next Steps

1. **Review & Approve** this plan (004-phase-2-web-api/plan.md)
2. **Execute Phase 1 Design** (research.md, data-model.md, contracts/*, quickstart.md)
3. **Execute Phase 2 Tasks** (run `/sp.tasks` to generate task breakdown)
4. **Execute Phase 3 Implementation** (execute tasks.md sequentially)

---

## Key Architectural Decisions

| Decision | Implication | Risk Mitigation |
|----------|------------|-----------------|
| JWT-only stateless backend | No session storage; scales horizontally | Token expiration enforced client-side and validated server-side |
| Better Auth for frontend auth | Frontend owns authentication; backend trusts JWT | Shared JWT_SECRET in .env; token validation on every protected endpoint |
| SQLModel ORM (no repository) | Direct database access in route handlers | Pydantic validation on inputs; SQL injection prevented via parameterized queries |
| Strict user isolation (403) | user_id in path must match JWT sub claim | Always validate JWT.user_id == path.user_id before database query |
| Neon PostgreSQL external | Database managed outside application | Connection pooling via SQLModel; DATABASE_URL in environment |

---

## ADR Suggestion

📋 **Architectural decision detected**: JWT + Better Auth + FastAPI stateless architecture
   - **Decision**: Frontend authentication (Better Auth) issues JWTs; backend verifies JWTs (PyJWT) without calling auth services
   - **Rationale**: Aligns with spec requirement for "stateless backend"; enables horizontal scaling; simple hackathon-appropriate implementation
   - **Tradeoffs**: Token revocation requires blacklist or wait for expiration (acceptable for Phase 2); no SSO/OAuth2 support (out of scope)
   - **Document?**: Consider creating `/sp.adr` if this becomes a reference pattern for future phases

Would you like me to proceed with creating the ADR?
