# Implementation Plan: Neon Database Configuration

**Feature**: 005-neon-database-config | **Branch**: 005-neon-database-config | **Date**: 2025-12-31
**Status**: Ready for Execution | **Phase**: Planning

## Executive Summary

This plan outlines the step-by-step implementation of Neon database provisioning and configuration as the persistent data store for Phase 2 Web API. The plan uses Neon MCP tools to automate project creation, credential retrieval, and verification.

**Scope**: Provision Neon project, configure connection string, validate schema creation, secure environment variables

**Key Decisions**:
1. Use Neon MCP tools for all project management (create, describe, delete if needed)
2. Store credentials in `backend/.env` via environment variable injection
3. Auto-create schema on FastAPI startup using SQLModel metadata
4. Add health check endpoint for monitoring database connectivity

---

## Implementation Approach

### Phase 1: Neon Project Provisioning

**Objective**: Create a Neon project and retrieve connection credentials

**Steps**:
1. List existing Neon projects to check for duplicates (avoid multiple "aido-todo" projects)
2. Create new Neon project named "aido-todo" in user's default organization
3. Describe the created project to extract:
   - Project ID (needed for all future operations)
   - Default branch ID
   - Default compute ID
   - Database name (usually "neondb")
4. Retrieve connection string in psycopg3 format for the default branch
5. Document the project ID and connection details for team reference

**Tools Used**: `mcp__Neon__list_projects`, `mcp__Neon__create_project`, `mcp__Neon__describe_project`, `mcp__Neon__get_connection_string`

**Blockers**: None (assumed Neon account exists)

**Output**: Project ID, connection string, database name, compute ID

---

### Phase 2: Environment Configuration

**Objective**: Populate backend environment variables with Neon credentials

**Steps**:
1. Extract DATABASE_URL from Neon connection string
2. Update `backend/.env` with:
   ```
   DATABASE_URL=postgresql+psycopg://[user]:[password]@[host]/[database]?sslmode=require
   JWT_SECRET=<generate or use existing>
   API_HOST=localhost
   API_PORT=8000
   FRONTEND_URL=http://localhost:3000
   ```
3. Verify `.gitignore` excludes `.env` (prevent accidental secret commits)
4. Ensure `.env.example` has all keys documented (template for other developers)
5. Add note to setup documentation: "Copy `.env.example` to `.env` and populate DATABASE_URL"

**Output**: Populated `backend/.env` with DATABASE_URL and other vars

---

### Phase 3: Backend Database Session Configuration

**Objective**: Create `backend/src/db/session.py` to manage database connections

**Steps**:
1. Create file `backend/src/db/session.py` with:
   - Import DATABASE_URL from environment via `os.getenv()`
   - Import SQLAlchemy `create_engine`, `Session`
   - Create SQLAlchemy engine with psycopg3:
     ```python
     from sqlalchemy import create_engine
     engine = create_engine(
         DATABASE_URL,
         echo=False,
         pool_pre_ping=True,
         pool_size=5,
         max_overflow=10
     )
     ```
   - Implement `get_session()` dependency:
     ```python
     from fastapi import Depends

     def get_session():
         with Session(engine) as session:
             yield session
     ```
   - Export engine and get_session for use in routes
2. Create file `backend/src/db/__init__.py` with exports
3. Update `backend/src/main.py`:
   - Import engine from db.session
   - Update lifespan manager:
     ```python
     async def lifespan(app):
         SQLModel.metadata.create_all(engine)
         yield
         # Optional: connection pool cleanup
     ```
4. Update health check endpoint to query database:
   ```python
   from sqlalchemy import text

   @app.get("/health")
   def health_check(session: Session = Depends(get_session)):
       try:
           session.exec(text("SELECT 1"))
           return {"status": "healthy", "database": "connected"}
       except Exception as e:
           raise HTTPException(status_code=503, detail="Database unavailable")
   ```

**Output**: Functional database session management with health check

---

### Phase 4: Database Connectivity Verification

**Objective**: Verify FastAPI can connect to Neon and create schema

**Steps**:
1. Ensure `backend/requirements.txt` includes:
   - sqlalchemy>=2.0
   - sqlmodel>=0.0.14
   - psycopg[binary]>=3.1 (or psycopg2-binary if psycopg3 unavailable)
   - python-dotenv>=1.0
2. Start FastAPI development server:
   ```bash
   cd backend
   python -m pip install -r requirements.txt
   python -m uvicorn src.main:app --reload
   ```
3. Verify startup logs show:
   - "Started server process"
   - No database connection errors
   - No SQLModel table creation errors
4. Test health check endpoint:
   ```bash
   curl http://localhost:8000/health
   # Expected: {"status": "healthy", "database": "connected"}
   ```
5. Query Neon console to verify tables exist:
   - Open https://console.neon.tech/
   - View "aido-todo" project tables
   - Confirm `user` and `task` tables are created with correct columns
6. Optional: Run test query via Neon console:
   ```sql
   SELECT * FROM "user";
   -- Should return empty result (no users yet)
   ```

**Output**: Confirmed database connectivity and schema creation

---

### Phase 5: Security Validation

**Objective**: Ensure secrets are not exposed and environment is properly configured

**Steps**:
1. Verify `.gitignore` includes:
   ```
   backend/.env
   frontend/.env.local
   ```
2. Confirm `.env` is NOT committed (check git status):
   ```bash
   git status
   # Should not show backend/.env
   ```
3. Verify no hardcoded DATABASE_URL in code:
   ```bash
   grep -r "postgresql://" backend/src/
   # Should return no matches
   ```
4. Add security note to `backend/.env.example`:
   ```
   # SECURITY: Never commit actual .env file
   # DATABASE_URL contains credentials; keep in environment only
   ```
5. Document in `SETUP.md` or README:
   - How to create .env from .env.example
   - Where to get DATABASE_URL (Neon console)
   - Why .env is not committed

**Output**: Documented security practices and verified secret isolation

---

## Key Architectural Decisions

### Decision 1: Connection String Format

**Question**: Use psycopg3 or psycopg2 format?

**Options**:
- (A) **psycopg3** (`postgresql+psycopg://...`) - Modern, async-capable, recommended
- (B) **psycopg2** (`postgresql+psycopg2://...`) - Legacy, widely supported

**Rationale**: Choose **(A) psycopg3**
- Neon recommends psycopg3 for new projects
- SQLAlchemy 2.0+ has native psycopg3 support
- Async support useful for future performance improvements
- Installation: `psycopg[binary]>=3.1`

**Tradeoffs**:
- Slightly larger dependency (psycopg3 ~15MB vs psycopg2 ~5MB)
- Excellent compatibility with modern PostgreSQL (v12+)

---

### Decision 2: Schema Creation Strategy

**Question**: How to create tables (Alembic migrations vs. SQLModel auto-create)?

**Options**:
- (A) **Auto-create** (`SQLModel.metadata.create_all()`) - Fast, no migration framework
- (B) **Alembic** (`alembic revision --autogenerate`) - Formal migrations, complex

**Rationale**: Choose **(A) Auto-create** for Phase 2
- Phase 2 is initial schema (no schema evolution yet)
- SQLModel models already define schema completely
- Alembic adds complexity without current benefit
- Can migrate to Alembic in Phase 3+ if needed

**Tradeoffs**:
- Auto-create is idempotent (safe to call multiple times)
- Future schema changes require manual migration setup (out of scope for Phase 2)

---

### Decision 3: Connection Pooling

**Question**: What connection pool settings for development vs. production?

**Options**:
- (A) **Small pool** (pool_size=5) - Development, cost-effective
- (B) **Large pool** (pool_size=20+) - Production, high throughput

**Rationale**: Choose **(A) Small pool** for Phase 2
- Development environment doesn't need many concurrent connections
- Neon serverless compute auto-scales (doesn't need pre-allocated capacity)
- Reduces cost and connection limits
- Pool settings can be environment-specific in Phase 3

**Tradeoffs**:
- If workload exceeds 5 concurrent requests, additional connections are created (up to max_overflow=10)
- Production will need higher pool_size later

---

### Decision 4: Health Check Endpoint

**Question**: Include database health check in `/health` endpoint?

**Options**:
- (A) **Simple check** (`SELECT 1`) - Confirms connectivity, minimal cost
- (B) **No database check** - Faster, but doesn't catch connection issues
- (C) **Complex check** (table row counts, etc.) - Expensive, overkill for Phase 2

**Rationale**: Choose **(A) Simple check** (`SELECT 1`)
- Confirms database is reachable and responsive
- Used by load balancers/monitoring for uptime detection
- Minimal performance overhead (<1ms query)

**Tradeoffs**:
- Health check is slightly slower than app-only check
- Worth it for early problem detection

---

## Dependencies & Constraints

### Internal Dependencies
- Phase 2 models (User, Task) defined in `backend/src/models/{user,task}.py` ✅
- FastAPI app skeleton in `backend/src/main.py` ✅
- `.env.example` template in `backend/.env.example` ✅

### External Dependencies
- **Neon account**: Must exist (assumed by user request)
- **psycopg3 driver**: Installed via `requirements.txt`
- **python-dotenv**: Installed via `requirements.txt`

### Constraints
- Database URL must be in psycopg3 format (not psycopg2)
- Connection string must include `sslmode=require` (Neon default)
- Schema creation must be idempotent (safe for repeated startup)
- No authentication required beyond connection string (Neon credentials embedded in URL)

---

## Verification Steps

| Step | Verification | Expected Result |
|------|-------------|-----------------|
| 1. Project created | Neon console shows "aido-todo" project | Project visible in UI |
| 2. Connection string | `mcp__Neon__get_connection_string` returns psycopg3 URL | URL format: `postgresql+psycopg://user:password@host/db?sslmode=require` |
| 3. Environment loaded | `python -c "import os; print(os.getenv('DATABASE_URL'))"` | Prints Neon connection string |
| 4. FastAPI starts | `uvicorn src.main:app --reload` runs without errors | Server listens on http://localhost:8000 |
| 5. Health check | `curl http://localhost:8000/health` | Returns `{"status": "healthy", "database": "connected"}` |
| 6. Tables created | Query Neon console: `SELECT tablename FROM pg_tables WHERE schemaname='public'` | Returns `user` and `task` tables |
| 7. Secrets secure | `git status \| grep .env` | No output (`.env` not in git) |

---

## Success Criteria

- ✅ Neon project "aido-todo" created and accessible
- ✅ Connection string retrieved in psycopg3 format
- ✅ `backend/.env` populated with DATABASE_URL
- ✅ FastAPI backend starts without connection errors
- ✅ Health check endpoint returns database connectivity status
- ✅ SQLModel tables (user, task) exist in Neon database
- ✅ `.env` excluded from git (in .gitignore)
- ✅ Documentation complete (setup instructions, security notes)

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Connection string format wrong | Low | High | Validate in startup code; test connection immediately |
| Database not reachable | Low | Critical | Add health check; fail fast on startup |
| Secrets in git | Low | Critical | `.env` in `.gitignore`; use `.env.example` template |
| Pool exhaustion | Very Low | Medium | Monitor active connections; tune pool_size if needed |

---

## Timeline & Execution

**Estimated Effort**: 20-30 minutes

**Recommended Execution Order**:
1. Phase 1 - Neon Project Creation (5 min)
2. Phase 2 - Environment Configuration (5 min)
3. Phase 3 - Backend Session Setup (10 min)
4. Phase 4 - Connectivity Verification (5 min)
5. Phase 5 - Security Validation (5 min)

**Parallel Opportunities**:
- Phase 2 (env config) can start after Phase 1 project creation completes

---

## Next Steps After Completion

1. **Resume Phase 2 Implementation**: Complete T2.4-T2.6 (database session, environment config, FastAPI finalization)
2. **Implement Authentication (T3)**: Create signup/login endpoints and frontend auth flow
3. **Implement CRUD (T4)**: Implement task creation, retrieval, update endpoints and UI components
4. **Implement Deletion & Completion (T5-T6)**: Complete remaining task features
5. **Polish (T7)**: Error handling, performance optimization, UI refinement

---

## References

- Neon Documentation: https://neon.tech/docs/
- SQLModel Documentation: https://sqlmodel.tiangolo.com/
- FastAPI Lifespan: https://fastapi.tiangolo.com/advanced/events/
- psycopg3 Documentation: https://www.psycopg.org/psycopg3/
- SQLAlchemy Engine: https://docs.sqlalchemy.org/en/20/core/engines.html
