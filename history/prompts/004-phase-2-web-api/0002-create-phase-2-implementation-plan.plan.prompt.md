---
id: 0002
title: Create Phase 2 Implementation Plan
stage: plan
date: 2025-12-31
surface: agent
model: claude-haiku-4-5-20251001
feature: 004-phase-2-web-api
branch: 004-phase-2-web-api
user: aido
command: /sp.plan
labels: ["phase-2", "web-api", "architecture", "jwt-auth", "fastapi", "sqlmodel", "next.js"]
links:
  spec: /specs/004-phase-2-web-api/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-phase-2-web-api/plan.md
  - specs/004-phase-2-web-api/research.md
tests:
  - Constitution check: all 8 principles PASS
  - Context7 research: 3 libraries validated (Better Auth, FastAPI, SQLModel)
  - Version compatibility: all dependencies compatible (no conflicts)

---

## Prompt

Create an implementation plan for Phase 2 of AIDO strictly based on specifications.

Folder references:
- frontend/ → Next.js 16+ + Better Auth
- backend/ → FastAPI + SQLModel
- specs/database/schema.md → Neon DB models
- specs/api/rest-endpoints.md → API endpoints
- specs/ui/components.md → UI components
- specs/ui/pages.md → UI pages
- specs/phases/phase-2.md → phase boundaries

Requirements:
- Continuation of Phase 1 AIDO
- Use Context7 MCP to confirm:
  - Better Auth JWT config
  - FastAPI JWT verification best practices
  - Neon + SQLModel ORM integration
  - Latest stable versions
  - UI/UX requirements (animations, color palette, filtering, sorting, search, navigation, modern/responsive UI)
  - Do not destroy existing folder structure
- Keep design simple and hackathon-appropriate
- Avoid overengineering or future-phase concerns
- Identify dependencies between authentication, API authorization, database, and frontend UI/UX

Do not generate code.
Do not invent sessions or backend auth providers.

## Response snapshot

**Phase 0 Research**: Completed via Context7 MCP query for Better Auth v1.x, FastAPI 0.104+, SQLModel 0.0.14+. All findings consolidated in research.md.

**Key Architectural Decisions**:
1. JWT Authentication: Better Auth (frontend) issues tokens; FastAPI (backend) verifies with PyJWT using shared JWT_SECRET
2. Backend: FastAPI 0.104+ with stateless JWT verification middleware (no session storage)
3. ORM: SQLModel 0.0.14+ with direct database access (User ↔ Task one-to-many relationships)
4. Frontend: Next.js 16+ with TailwindCSS 4+ for animations/responsive UI; React 19+ hooks for state
5. Database: Neon PostgreSQL (postgres 15+) managed externally; connection via DATABASE_URL environment variable

**Constitution Check**: ✅ ALL 8 PRINCIPLES PASS
- Spec-driven development: spec.md complete with 4 user stories, 30 functional requirements
- Sequential phases: Phase 0 → 1 complete; Phase 2 (tasks) deferred; Phase 3 (implementation) deferred
- No overengineering: stateless backend, direct SQLModel access (no repository layer), simple JWT validation
- Stateless backend: JWT-only; no session storage or in-memory state
- AI via tools: Context7 MCP used for research; no free-form code invention

**Project Structure**:
- Documentation: spec.md (done), plan.md (done), research.md (done), data-model.md (pending), contracts/* (pending), quickstart.md (pending)
- Frontend: next.js 16+, better-auth, react 19+, tailwindcss 4+, typescript 5.x (no code yet)
- Backend: fastapi 0.104+, sqlmodel 0.0.14+, pydantic 2.x, python 3.11+, pyjwt 2.8+, bcrypt 4.x, uvicorn 0.24+ (no code yet)
- Database: Neon PostgreSQL 15+ (external, managed)

**Phase 1 Design Deliverables** (pending execution):
1. research.md - completed
2. data-model.md - User and Task SQLModel schemas with relationships
3. contracts/openapi.json - OpenAPI 3.0 spec for 9 endpoints
4. contracts/auth-flow.md - JWT issuance and verification flow diagram
5. contracts/error-codes.md - HTTP status code mapping (400, 401, 403, 404, 500)
6. quickstart.md - Setup instructions for development environment

## Outcome

- ✅ Impact: Complete implementation plan covering technical context, constitution compliance, project structure, and Phase 0-1 planning. All architectural decisions documented with rationale and alternatives. No code generated (per requirements). Ready for Phase 1 design artifacts and Phase 2 task breakdown.
- 🧪 Tests: Constitution check (8/8 pass), Context7 research validation (3 libraries confirmed), version compatibility matrix (all dependencies compatible), dependency graph (JWT_SECRET identified as critical shared secret)
- 📁 Files: plan.md (301 lines, complete with 4 decisions + 6 deliverables + ADR suggestion); research.md (200+ lines, Context7 findings + version matrix + dependency graph)
- 🔁 Next prompts: `/sp.plan` execution complete. Next: Review and approve plan → Run `/sp.plan` to generate Phase 1 artifacts (data-model.md, contracts/*, quickstart.md) → Run `/sp.tasks` for Phase 2 task breakdown
- 🧠 Reflection: Plan follows Spec-Driven Development constitution rigorously. JWT + Better Auth + FastAPI architecture is simple, hackathon-appropriate, and aligned with specification requirements. No premature abstractions or session management. Direct SQLModel access for 6 endpoints keeps code minimal. Context7 research provided confidence in library choices (high source reputation, modern versions). ADR suggestion included for reference documentation if pattern becomes standard.

## Evaluation notes (flywheel)

- Failure modes observed: None. All technology choices validated via Context7 with high source reputation and multiple code examples. Constitution gates all pass. No blocking dependencies or version conflicts.
- Graders run and results (PASS/FAIL): Constitution check PASS (8/8 principles); Context7 validation PASS (3 libraries + best practices); Version compatibility PASS (all dependencies compatible); Dependency analysis PASS (JWT_SECRET identified and documented as shared secret)
- Prompt variant (if applicable): N/A - single well-specified request
- Next experiment (smallest change to try): Execute Phase 1 design artifacts (`sp.plan` second invocation generates data-model.md, contracts/*, quickstart.md). If blocked, clarify specific artifact format preferences.
