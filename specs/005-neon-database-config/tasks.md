# Task Breakdown: Neon Database Configuration

**Feature**: 005-neon-database-config | **Branch**: 005-neon-database-config | **Date**: 2025-12-31
**Status**: Ready for Execution | **Phase**: Task Breakdown

---

## Executive Summary

This document breaks the Neon database provisioning and configuration into 8 concrete, independently-testable tasks organized into 2 phases:

1. **Provisioning Phase** (4 tasks): Create Neon project, retrieve credentials, configure environment
2. **Verification Phase** (4 tasks): Backend integration, schema creation, connectivity testing, security validation

**Total Effort**: ~30 minutes | **Dependencies**: Neon account access | **Blocking**: Phase 2 Web API feature (needed for all data storage)

---

## Task Execution Graph

```
T5.1 (List projects)
         ↓
T5.2 (Create project) → T5.3 (Describe project) → T5.4 (Get connection string)
                                                         ↓
T5.5 (Configure environment) ← ← ← ← ← ← ← ← ← ← ← ← ↑
         ↓
T5.6 (Backend session config) → T5.7 (Verify connectivity) → T5.8 (Security validation)
```

**Parallel Execution**: Tasks 5.5-5.8 can start after 5.4 completes (have connection string)

---

## Phase 1: Provisioning (4 tasks)

### T5.1: List Neon Projects & Check for Duplicates

**Story**: Provisioning
**Type**: Infrastructure
**Priority**: P0 (blocking)
**Dependencies**: None (requires Neon account access)
**Estimated**: 2 min

**Acceptance Criteria**:
- [x] Neon MCP tool `list_projects` executed successfully
- [x] Output shows list of existing projects (may be empty)
- [x] No project named "aido-todo" currently exists (or accept merging into existing)
- [x] Project ID format verified (alphanumeric string ~12 chars)
- [x] Documentation shows how to list projects for future reference

**Test Scenario**:
```bash
# Execute via MCP
mcp__Neon__list_projects(params={limit: 10})

# Expected output:
# [
#   { id: "project123", name: "existing-project" },
#   ...
# ]

# Verify: No "aido-todo" in list
```

**Notes**:
- If "aido-todo" exists, use existing project (don't create duplicate)
- Proceed to T5.3 with the existing project ID
- If multiple projects exist, document each one for reference

---

### T5.2: Create Neon Project

**Story**: Provisioning
**Type**: Infrastructure
**Priority**: P0 (blocking)
**Dependencies**: T5.1
**Estimated**: 2 min

**Acceptance Criteria**:
- [x] Neon MCP tool `create_project` executed with name "aido-todo"
- [x] Project creation succeeds (returns project object)
- [x] Project ID extracted and stored for subsequent tasks
- [x] Response includes default branch ID and database name
- [x] No errors during creation (check for quota limits, permissions)

**Test Scenario**:
```bash
# Execute via MCP
mcp__Neon__create_project(params={name: "aido-todo"})

# Expected output:
# {
#   id: "project_abc123",
#   name: "aido-todo",
#   created_at: "2025-12-31T...",
#   default_branch_id: "br_xyz789",
#   organization_id: "org_..."
# }

# Verify: Project ID is not null
```

**Notes**:
- If project already exists from T5.1, skip this step and use existing project ID in T5.3
- Store project ID in a note for T5.3, T5.4, and T5.5
- Neon creates default branch automatically (use in subsequent tasks)

---

### T5.3: Describe Neon Project & Extract Metadata

**Story**: Provisioning
**Type**: Infrastructure
**Priority**: P0 (blocking)
**Dependencies**: T5.2
**Estimated**: 2 min

**Acceptance Criteria**:
- [x] Neon MCP tool `describe_project` executed with project ID from T5.2
- [x] Response includes default branch ID, compute ID, database name
- [x] Database name is "neondb" (Neon default; may be different)
- [x] Compute endpoint is accessible and ready
- [x] Document extracted metadata for T5.4 (connection string retrieval)

**Test Scenario**:
```bash
# Execute via MCP
mcp__Neon__describe_project(params={projectId: "project_abc123"})

# Expected output:
# {
#   id: "project_abc123",
#   name: "aido-todo",
#   default_branch: {
#     id: "br_xyz789",
#     name: "main"
#   },
#   default_compute: {
#     id: "ep_abc123",
#     type: "read-write"
#   },
#   databases: [
#     { name: "neondb", owner: "neondb_owner" }
#   ]
# }

# Verify: branch ID, compute ID, database name extracted
```

**Notes**:
- Store branch ID (e.g., "br_xyz789") for T5.4
- Verify compute is type "read-write" (for data mutations)
- Default database "neondb" is where User and Task tables will be created
- If custom database exists, document for team reference

---

### T5.4: Retrieve Neon Connection String (psycopg3 format)

**Story**: Provisioning
**Type**: Infrastructure
**Priority**: P0 (blocking)
**Dependencies**: T5.3
**Estimated**: 2 min

**Acceptance Criteria**:
- [x] Neon MCP tool `get_connection_string` executed with project ID and branch ID
- [x] Connection string returned in psycopg3 format: `postgresql+psycopg://user:password@host/database?sslmode=require`
- [x] Connection string includes:
  - Protocol: `postgresql+psycopg` (not psycopg2)
  - Credentials: username and password
  - Host: Neon-provided hostname
  - Database: "neondb" (or custom from T5.3)
  - SSL: `sslmode=require` (security requirement)
- [x] Connection string is valid and can be parsed
- [x] Store connection string securely for T5.5 (environment variable)

**Test Scenario**:
```bash
# Execute via MCP
mcp__Neon__get_connection_string(params={
  projectId: "project_abc123",
  branchId: "br_xyz789"
})

# Expected output:
# postgresql+psycopg://neondb_owner:password123@ep-abc123.us-east-1.neon.tech/neondb?sslmode=require

# Verify: Format is correct; can extract components (host, user, pass, db)
```

**Notes**:
- Connection string is sensitive; treat as credential (don't log in plain text)
- The password in the string is the actual database password (can change in Neon console if needed)
- `sslmode=require` is essential for security (Neon default)
- Store this string in `backend/.env` via T5.5

---

## Phase 2: Configuration & Verification (4 tasks)

### T5.5: Populate Environment Variables

**Story**: Configuration
**Type**: Configuration
**Priority**: P0 (blocking)
**Dependencies**: T5.4
**Estimated**: 3 min

**Acceptance Criteria**:
- [x] File `backend/.env` created from `backend/.env.example` (or updated if exists)
- [x] `DATABASE_URL` variable set to connection string from T5.4
- [x] All required variables present:
  - `DATABASE_URL` (Neon connection string)
  - `JWT_SECRET` (if not already set; can use dummy value for dev)
  - `API_HOST` (e.g., "localhost")
  - `API_PORT` (e.g., "8000")
  - `FRONTEND_URL` (e.g., "http://localhost:3000")
- [x] `.env` file is NOT committed to git (verify in .gitignore)
- [x] `.env.example` has all keys documented as template

**Test Scenario**:
```bash
# Create/update backend/.env
cat > backend/.env << EOF
DATABASE_URL=postgresql+psycopg://neondb_owner:password123@ep-abc123.us-east-1.neon.tech/neondb?sslmode=require
JWT_SECRET=dev-secret-key-at-least-32-chars-for-security
API_HOST=localhost
API_PORT=8000
FRONTEND_URL=http://localhost:3000
EOF

# Verify file exists
ls -la backend/.env

# Verify .gitignore includes .env
grep "^backend/.env$" .gitignore

# Verify can read variable
source backend/.env && echo "DATABASE_URL is set: ${DATABASE_URL}"
```

**Notes**:
- `.env` must NOT be committed (critical for security)
- Use `.env.example` as template (already committed)
- JWT_SECRET for development can be any value; production must use strong random secret
- All variables are required (FastAPI will fail to start if missing)

---

### T5.6: Create Backend Database Session Module

**Story**: Backend Integration
**Type**: Backend Code
**Priority**: P0 (blocking)
**Dependencies**: T5.5
**Estimated**: 10 min

**Acceptance Criteria**:
- [x] File `backend/src/db/session.py` created with SQLAlchemy engine and session management
- [x] File `backend/src/db/__init__.py` created with exports
- [x] Engine created with psycopg3 dialect:
  - Connection string loaded from environment variable `DATABASE_URL`
  - Pool size: 5, max_overflow: 10 (development settings)
  - `pool_pre_ping=True` (verify connections before use)
  - `echo=False` (don't log SQL in production; can be True for debugging)
- [x] `get_session()` dependency function implemented:
  - Returns SessionLocal context manager
  - Used in FastAPI route dependencies: `Depends(get_session)`
- [x] `engine` exported for use in main.py lifespan manager
- [x] Error handling for missing DATABASE_URL (fail fast with clear message)
- [x] Type hints added for IDE/linting support

**Test Scenario**:
```python
# backend/src/db/session.py should contain:

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    connect_args={"timeout": 10}
)

def get_session():
    with Session(engine) as session:
        yield session
```

**Acceptance Verification**:
```bash
# Test import
python -c "from backend.src.db.session import engine, get_session; print('OK')"

# Should print: OK
```

**Notes**:
- `pool_pre_ping=True` helps detect stale connections
- `connect_args={"timeout": 10}` prevents hanging on network issues
- `get_session()` is a FastAPI dependency that auto-closes connections
- Connection pooling handles concurrent requests efficiently

---

### T5.7: Update FastAPI App & Verify Schema Creation

**Story**: Backend Integration
**Type**: Backend Code
**Priority**: P0 (blocking)
**Dependencies**: T5.6
**Estimated**: 5 min

**Acceptance Criteria**:
- [x] File `backend/src/main.py` updated to import engine from db.session
- [x] Lifespan manager calls `SQLModel.metadata.create_all(engine)`:
  - Creates User and Task tables on startup
  - Idempotent (safe to call multiple times)
- [x] Updated health check endpoint queries database:
  - Endpoint: `GET /health`
  - Query: `SELECT 1` to confirm database connectivity
  - Response: `{"status": "healthy", "database": "connected"}` (or similar)
  - Error handling: Catches exceptions and returns 503 if database unreachable
- [x] All imports are correct (SQLModel, Session, create_engine)
- [x] No syntax errors (linter/formatter passes)

**Test Scenario**:
```python
# backend/src/main.py should have updated lifespan:

from contextlib import asynccontextmanager
from sqlmodel import SQLModel
from backend.src.db.session import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    SQLModel.metadata.create_all(engine)
    yield
    # Optional: cleanup on shutdown
    pass

app = FastAPI(lifespan=lifespan)

# Health check endpoint:
@app.get("/health")
def health_check(session: Session = Depends(get_session)):
    try:
        session.exec(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail="Database unavailable"
        )
```

**Acceptance Verification**:
```bash
# Start FastAPI server
cd backend
python -m uvicorn src.main:app --reload

# In another terminal, test health endpoint
curl http://localhost:8000/health

# Expected output:
# {"status":"healthy","database":"connected"}

# Check FastAPI logs for "Uvicorn running on ..." without database errors
```

**Notes**:
- `SQLModel.metadata.create_all()` is called on every startup (safe due to idempotency)
- If database is unreachable, FastAPI will fail to start (see logs)
- Health check confirms both app and database are working
- `pool_pre_ping=True` from T5.6 helps health check stay responsive

---

### T5.8: Security Validation & Documentation

**Story**: Security
**Type**: Configuration
**Priority**: P0 (blocking)
**Dependencies**: T5.5, T5.7
**Estimated**: 5 min

**Acceptance Criteria**:
- [x] `.gitignore` verified to include:
  ```
  backend/.env
  frontend/.env.local
  ```
- [x] `backend/.env` is NOT in git (run `git status` to confirm)
- [x] No hardcoded DATABASE_URL in code (search codebase):
  ```bash
  grep -r "postgresql://" backend/src/
  # Should return NO matches
  ```
- [x] `.env.example` has comments documenting each variable
- [x] Security documentation added (e.g., in README or SETUP.md):
  - How to create `.env` from `.env.example`
  - Why `.env` is not committed (contains credentials)
  - How to retrieve DATABASE_URL from Neon console if lost
- [x] Verified no other credentials in code (JWT_SECRET, API keys, etc.)
- [x] Team documentation includes:
  - Step-by-step Neon setup instructions
  - How to reset password if needed
  - How to rotate credentials (Neon console procedure)

**Test Scenario**:
```bash
# Verify .env is ignored
git status | grep "backend/.env"
# Should return NOTHING (no match means it's ignored)

# Verify .env.example is committed
git ls-files | grep "backend/.env.example"
# Should show: backend/.env.example

# Search for hardcoded credentials
grep -r "postgresql+psycopg://" backend/src/
grep -r "neon.tech" backend/src/
grep -r "password123" backend/src/
# All should return NO matches

# Verify .env file is created and has correct format
cat backend/.env | grep DATABASE_URL
# Should print: DATABASE_URL=postgresql+psycopg://...
```

**Acceptance Verification**:
```bash
# Check git status shows .env is ignored
git status --short | head -10
# Should NOT show "backend/.env" or "frontend/.env.local"

# Confirm secrets are in environment only
ls -la backend/.env
# File exists but is not in git index
```

**Notes**:
- **CRITICAL**: `.env` must never be committed (major security risk)
- Use `.env.example` as template for documentation
- Team members clone repo, copy `.env.example` → `.env`, fill in their own credentials
- If DATABASE_URL is accidentally exposed, rotate password in Neon console immediately
- Document rotation procedure for future reference

---

## Execution Dependencies & Blockers

| Task | Depends On | Blocked By | Can Run Parallel |
|------|-----------|-----------|-----------------|
| T5.1 | None | Neon account access | Solo (must list first) |
| T5.2 | T5.1 | T5.1 result | No (sequential) |
| T5.3 | T5.2 | T5.2 project ID | No (sequential) |
| T5.4 | T5.3 | T5.3 branch/compute IDs | No (sequential) |
| T5.5 | T5.4 | T5.4 connection string | Yes (from T5.4) |
| T5.6 | T5.5 | T5.5 environment setup | Yes (from T5.5) |
| T5.7 | T5.6 | T5.6 session module | Yes (from T5.6) |
| T5.8 | T5.5, T5.7 | T5.5 and T5.7 complete | Yes (from T5.7) |

**Critical Path**: T5.1 → T5.2 → T5.3 → T5.4 → (T5.5, T5.6, T5.7, T5.8 can overlap)

---

## Success Criteria (All Must Pass)

- ✅ Neon project "aido-todo" created and accessible via console
- ✅ Connection string retrieved in psycopg3 format with sslmode=require
- ✅ `backend/.env` populated with DATABASE_URL and other required variables
- ✅ FastAPI backend starts without connection errors
- ✅ `GET /health` returns `{"status": "healthy", "database": "connected"}`
- ✅ Tables `user` and `task` exist in Neon database (verified via console)
- ✅ `.env` excluded from git; `.env.example` committed as template
- ✅ No hardcoded secrets in codebase
- ✅ Security documentation complete and team-accessible
- ✅ All 8 tasks marked as DONE

---

## Estimated Timeline

| Phase | Tasks | Effort | Notes |
|-------|-------|--------|-------|
| **Provisioning** | T5.1-T5.4 | 8 min | Neon API calls (fast) |
| **Configuration** | T5.5 | 3 min | Environment variable setup |
| **Backend Integration** | T5.6-T5.7 | 15 min | Code implementation + testing |
| **Security & Docs** | T5.8 | 5 min | Validation + documentation |
| **TOTAL** | 8 tasks | ~31 min | Can be optimized with parallel execution |

---

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| **Neon account quota exceeded** | Low | Check Neon console project limits; contact support if needed |
| **Connection string format wrong** | Medium | Use copy-paste from Neon console; validate format before using |
| **DATABASE_URL not loaded in Python** | Medium | Test import: `python -c "import os; print(os.getenv('DATABASE_URL'))"` |
| **Connection timeout on startup** | Medium | Check network connectivity; verify Neon compute is not suspended |
| **Schema creation fails** | Low | Verify SQLModel models are correctly defined; check database permissions |
| **Secrets leaked to git** | Critical | `.env` in `.gitignore`; double-check with `git status` |
| **Concurrent connections exceed pool** | Low | Monitor connections in Neon console; increase pool_size if needed |

---

## Next Steps (After Completion)

1. ✅ **Phase 2 Completion**: Return to T2.4-T2.6 to finalize backend setup
2. **Phase 3 (Authentication)**: Implement signup/login endpoints (T3.1-T3.9)
3. **Phase 4 (CRUD)**: Implement task management endpoints (T4.1-T4.11)
4. **Phase 5-6**: Task deletion and completion tracking
5. **Phase 7**: Polish and performance optimization

---

## References

- **Neon MCP Tools**: `mcp__Neon__*` functions available in context
- **Neon Console**: https://console.neon.tech/
- **SQLModel Docs**: https://sqlmodel.tiangolo.com/
- **FastAPI Lifespan**: https://fastapi.tiangolo.com/advanced/events/#lifespan-events
- **psycopg3 Docs**: https://www.psycopg.org/psycopg3/
- **Connection String Format**: https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING
