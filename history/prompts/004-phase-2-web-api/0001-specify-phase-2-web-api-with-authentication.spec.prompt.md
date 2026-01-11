---
id: 0001
title: Specify Phase 2 Web API with Authentication
stage: spec
date: 2025-12-31
surface: agent
model: claude-haiku-4-5-20251001
feature: 004-phase-2-web-api
branch: 004-phase-2-web-api
user: aido
command: /sp.specify
labels: ["phase-2", "web-api", "authentication", "fastapi", "next.js", "rest-api"]
links:
  spec: /specs/004-phase-2-web-api/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-phase-2-web-api/spec.md
  - specs/004-phase-2-web-api/checklists/requirements.md
tests:
  - Quality checklist validation (all items passed)
---

## Prompt

Specify Phase 2 of the AIDO Todo application.

Folder structure context:
- specs/phases/phase-2.md           → Phase 2 scope and description
- specs/features/authentication.md → Authentication feature spec
- specs/api/rest-endpoints.md      → API endpoints spec
- specs/database/schema.md         → Database schema (Neon + SQLModel)
- specs/ui/components.md           → Frontend components
- specs/ui/pages.md                → Frontend pages
- frontend/                        → Next.js 16+ implementation with Better Auth
- backend/                         → FastAPI backend (JWT + SQLModel)
- phase-1/                          → Phase 1 CLI Todo app
- .spec-kit/config.yaml             → Spec-Kit configuration

Context:
- Phase 1 implemented CLI Todo with in-memory storage
- Phase 2 extends AIDO to web architecture using frontend/ + backend/

Technology stack:
- Frontend: Next.js 16+ (App Router) in frontend/
- Backend: FastAPI in backend/
- ORM: SQLModel in backend/
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth (frontend) issuing JWTs
- Auth mechanism: JWT verified by FastAPI

Authentication model:
- Better Auth issues JWT tokens on login
- FastAPI verifies JWT tokens using shared secret
- user_id in API paths must match JWT identity
- Backend is stateless

Required API endpoints (specs/api/rest-endpoints.md):
- GET    /api/{user_id}/tasks
- POST   /api/{user_id}/tasks
- GET    /api/{user_id}/tasks/{id}
- PUT    /api/{user_id}/tasks/{id}
- DELETE /api/{user_id}/tasks/{id}
- PATCH  /api/{user_id}/tasks/{id}/complete

UI/UX requirements:
- Smooth animations and transitions
- Consistent modern color palette
- Filtering & sorting of tasks
- Search functionality
- Smooth navigation between pages/components
- Modern, responsive, visually appealing UI

Behavior constraints:
- Tasks scoped strictly to authenticated user
- Invalid/mismatched JWTs must be rejected
- Do not destroy or restructure existing folders and files

Include in spec:
- Acceptance criteria per endpoint
- Request/response formats
- Authentication/authorization behavior
- Error cases: unauthorized, forbidden, invalid input, not found
- Database model definitions using SQLModel ORM
- ORM relationships (user → tasks)
- Latest stable versions for all frameworks/dependencies (validate via Context7 MCP)

Exclusions:
- No AI/chatbot features
- No deployment/Kubernetes

## Response snapshot

Created comprehensive Phase 2 specification covering:

**User Stories (4 total, P1 & P2)**:
- P1: User authentication & session management (foundation for all features)
- P1: Create, read, update tasks (core CRUD operations)
- P2: Delete tasks (list management)
- P2: Task completion tracking (progress tracking)

**API Endpoints (6 core + 3 auth)**:
- Task CRUD: GET /api/{user_id}/tasks, POST, GET /{id}, PUT, DELETE, PATCH /complete
- Authentication: POST /auth/signup, POST /auth/login, POST /auth/logout
- All endpoints include request/response JSON examples and error cases

**Requirements (30 functional + 3 key entities)**:
- 6 authentication & authorization (signup, login, logout, JWT validation, user isolation)
- 6 task management API (CRUD + completion)
- 4 data management (SQLModel ORM, database persistence, schema constraints)
- 8 frontend UI/UX (responsive, animations, filtering, sorting, search, error messages)
- 6 error handling (400, 401, 403, 404, 500 status codes)

**Success Criteria (7 measurable outcomes)**:
- User can complete full workflow in under 5 minutes
- API p95 latency under 500ms
- System handles 100 concurrent users
- 100% user isolation enforcement
- Data persistence across restarts
- Frontend renders smoothly (no layout shifts)
- 95% task completion success rate on first attempt

**Database Schema**:
- User model: id, email, password_hash, created_at, updated_at
- Task model: id, user_id (FK), title, description, completed, timestamps
- Relationships: User ↔ Task one-to-many with cascade delete
- Indexes: (user_id), (user_id, created_at) for query performance

**Technology Stack**:
- Frontend: Next.js 16+, Better Auth v1.x, React 19+, TailwindCSS 4+, TypeScript 5.x
- Backend: FastAPI 0.104+, SQLModel 0.0.14+, Pydantic 2.x, Python 3.11+, PyJWT 2.8+, bcrypt 4.x
- Database: Neon Serverless PostgreSQL (postgres 15+)

**Quality Validation**:
- Created requirements checklist with 30 validation items
- All items passed (no implementation leakage, clear acceptance criteria, measurable success)
- Spec ready for `/sp.plan` or `/sp.clarify` phase

## Outcome

- ✅ Impact: Complete Phase 2 specification ready for planning and implementation; all 4 user stories independently testable; all 9 API endpoints fully contracted
- 🧪 Tests: Requirements checklist (all 30 items passed); no unresolved clarifications
- 📁 Files: specs/004-phase-2-web-api/spec.md (498 lines); checklists/requirements.md created
- 🔁 Next prompts: /sp.clarify (optional), /sp.plan (required), /sp.tasks (for task breakdown)
- 🧠 Reflection: Spec balances high-level business requirements with detailed technical contracts (API, database, tech stack); no implementation-specific details leaked into FR section; authentication-first design ensures user isolation from day one

## Evaluation notes (flywheel)

- Failure modes observed: None; specification complete on first pass
- Graders run and results (PASS/FAIL): Quality checklist all items PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed to /sp.plan phase for architectural design and task breakdown
