# Quickstart: Neon Database Configuration

**Feature**: 005-neon-database-config | **Time**: ~30 minutes | **Difficulty**: Medium

This guide helps you quickly set up Neon PostgreSQL as the database for AIDO Todo Phase 2.

---

## Prerequisites

- ✅ Neon account at https://console.neon.tech/
- ✅ Phase 2 models defined (`backend/src/models/{user,task}.py`)
- ✅ FastAPI app skeleton (`backend/src/main.py`)
- ✅ `.env.example` template (`backend/.env.example`)

---

## 5-Minute Overview

### What We're Doing
1. **Create** a Neon project named "aido-todo" (PostgreSQL database)
2. **Retrieve** connection credentials in psycopg3 format
3. **Configure** backend with DATABASE_URL environment variable
4. **Verify** database connectivity via health check endpoint

### Why It Matters
- Enables data persistence for User and Task models
- Allows authentication (signup/login) to work
- Supports CRUD operations in Phase 2
- Secure credential management via environment variables

### Expected Result
```bash
$ curl http://localhost:8000/health
{"status": "healthy", "database": "connected"}
```

---

## Quick Start (30 Minutes)

### Phase 1: Neon Project Creation (5 min)

**Step 1.1**: List Existing Projects
```bash
# Check if "aido-todo" project already exists
# Via Neon Console: https://console.neon.tech/

# Or via MCP tool (in implementation):
mcp__Neon__list_projects(params={limit: 10})
```

**Step 1.2**: Create Neon Project
```bash
# Via Neon Console:
1. Click "New Project"
2. Enter name: "aido-todo"
3. Select region: "US East" (default)
4. Click "Create"

# Or via MCP tool (in implementation):
mcp__Neon__create_project(params={name: "aido-todo"})
```

**Step 1.3**: Get Connection String
```bash
# Via Neon Console:
1. Open "aido-todo" project
2. Click "Connection string" (top right)
3. Select "psycopg3" from dropdown
4. Copy the full string

# Example:
postgresql+psycopg://neondb_owner:password123@ep-xyz.us-east-1.neon.tech/neondb?sslmode=require
```

### Phase 2: Backend Configuration (5 min)

**Step 2.1**: Create `.env` File
```bash
cd backend
cp .env.example .env
```

**Step 2.2**: Populate `.env`
```bash
# Edit backend/.env and set:
DATABASE_URL=postgresql+psycopg://[paste-from-step-1.3]
JWT_SECRET=your-secret-key-here-at-least-32-characters
API_HOST=localhost
API_PORT=8000
FRONTEND_URL=http://localhost:3000
```

**Step 2.3**: Verify `.env` is Ignored
```bash
# Make sure .env is in .gitignore
grep "^backend/.env$" .gitignore
# Should return: backend/.env

# Verify not in git
git status | grep ".env"
# Should return: nothing (not staged)
```

### Phase 3: Backend Integration (10 min)

**Step 3.1**: Create Database Session Module
```bash
# Create: backend/src/db/session.py

cat > backend/src/db/session.py << 'EOF'
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
EOF
```

**Step 3.2**: Create Database Package Init
```bash
# Create: backend/src/db/__init__.py

cat > backend/src/db/__init__.py << 'EOF'
"""Database session management for AIDO backend."""

from .session import engine, get_session

__all__ = ["engine", "get_session"]
EOF
```

**Step 3.3**: Update FastAPI App
```bash
# Edit: backend/src/main.py

# Add these imports at the top:
from contextlib import asynccontextmanager
from sqlalchemy import text
from sqlmodel import SQLModel
from backend.src.db.session import engine

# Replace the lifespan function:
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
    SQLModel.metadata.create_all(engine)
    yield
    # Shutdown (optional cleanup)
    pass

app = FastAPI(lifespan=lifespan)

# Update health check endpoint:
@app.get("/health")
def health_check():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail="Database unavailable"
        )
```

### Phase 4: Verification (10 min)

**Step 4.1**: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
# Should include: psycopg[binary], sqlalchemy, sqlmodel, python-dotenv
```

**Step 4.2**: Start FastAPI Server
```bash
cd backend
python -m uvicorn src.main:app --reload

# Expected output:
# Uvicorn running on http://127.0.0.1:8000
# Application startup complete
```

**Step 4.3**: Test Health Check
```bash
# In another terminal:
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","database":"connected"}
```

**Step 4.4**: Verify Tables in Neon
```bash
# Via Neon Console:
1. Open "aido-todo" project
2. Go to "SQL Editor" tab
3. Run: SELECT tablename FROM pg_tables WHERE schemaname='public';

# Expected output:
# user
# task
```

---

## Troubleshooting

### Connection Timeout
```bash
# Problem: "psycopg.OperationalError: connection timeout"
# Solution: Neon compute is suspended; wait 10 seconds and retry

# Test:
curl http://localhost:8000/health
# Try again in 10 seconds
```

### Connection String Format Error
```bash
# Problem: "ArgumentError: Could not parse rfc1738 URL"
# Solution: Ensure format is postgresql+psycopg (not postgresql+psycopg2)

# Check:
echo $DATABASE_URL | grep "psycopg://"
# Should show: postgresql+psycopg://...
```

### Table Not Created
```bash
# Problem: "Table 'user' does not exist"
# Solution: Check SQLModel.metadata.create_all() is called

# Verify in main.py:
grep -n "create_all" backend/src/main.py

# Should see it in lifespan function
```

### Health Check Returns 503
```bash
# Problem: GET /health → 503 Database unavailable
# Solution: Check Neon console for compute status

# 1. Visit: https://console.neon.tech/
# 2. Select project "aido-todo"
# 3. Check compute status (should be green)
# 4. If orange (suspended), click to wake up
# 5. Try health check again
```

---

## Next Steps

### After Successful Verification ✅
1. **Continue Phase 2 Implementation**:
   - T2.4: Database session (✅ just completed)
   - T2.5: Environment config (✅ just completed)
   - T2.6: FastAPI finalization (✅ just completed)

2. **Move to Phase 3 (Authentication)**:
   - Implement signup/login endpoints
   - Create auth schemas and routes
   - Frontend auth UI components

3. **Move to Phase 4 (CRUD Operations)**:
   - Implement task creation endpoint
   - Implement task retrieval endpoints
   - Implement task update endpoint

### Security Checklist
- [ ] `.env` is in `.gitignore` (don't commit secrets)
- [ ] `DATABASE_URL` uses `sslmode=require`
- [ ] No hardcoded connection strings in code
- [ ] `JWT_SECRET` is set to random 32+ char string

---

## Common Tasks

### Reset Database Password
```bash
# Via Neon Console:
1. Project Settings → Roles
2. Find "neondb_owner" role
3. Click "Reset Password"
4. Copy new password
5. Update backend/.env DATABASE_URL with new password

# Via CLI:
neon roles reset-password <project-id> neondb_owner
```

### Check Database Size
```bash
# Via Neon Console:
Project → Settings → Database size (under Overview)

# Or via SQL:
psql "$DATABASE_URL" -c "SELECT pg_size_pretty(pg_database_size(current_database()));"
```

### Delete All Data (Development Only)
```bash
# Via SQL:
psql "$DATABASE_URL" << EOF
DELETE FROM "task";
DELETE FROM "user";
EOF
```

---

## File Checklist

After completing quickstart:

| File | Status | Purpose |
|------|--------|---------|
| `backend/.env` | ✅ Created | Environment variables with DATABASE_URL |
| `backend/src/db/session.py` | ✅ Created | SQLAlchemy engine and session management |
| `backend/src/db/__init__.py` | ✅ Created | Package exports |
| `backend/src/main.py` | ✅ Updated | Lifespan manager, health check endpoint |
| `backend/requirements.txt` | ✅ Has | psycopg3, sqlalchemy, sqlmodel, python-dotenv |

---

## Performance Tips

### For Development
```python
# Small pool is fine for local dev
pool_size=5
max_overflow=10

# Log SQL for debugging
echo=True  # Set in create_engine()
```

### For Production (Future)
```python
# Larger pool for concurrent requests
pool_size=20
max_overflow=30

# Don't log SQL in production
echo=False

# More aggressive connection recycling
pool_recycle=1800
```

---

## Security Reminders

⚠️ **Never do this:**
```python
# ❌ WRONG - Hardcoded connection string
DATABASE_URL = "postgresql://user:password@host/db"

# ❌ WRONG - Commits .env to git
git add backend/.env
git commit -m "Add env file"
```

✅ **Always do this:**
```python
# ✅ RIGHT - Load from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# ✅ RIGHT - Use .env.example as template
cp backend/.env.example backend/.env
# Edit .env locally (never commit)
```

---

## Getting Help

**For Neon issues**:
- Neon Docs: https://neon.tech/docs/
- Neon Console: https://console.neon.tech/
- Check compute status (auto-suspends after 5 min idle)

**For Database issues**:
- SQLAlchemy Docs: https://docs.sqlalchemy.org/
- SQLModel Docs: https://sqlmodel.tiangolo.com/
- PostgreSQL Docs: https://www.postgresql.org/docs/

**For FastAPI issues**:
- FastAPI Docs: https://fastapi.tiangolo.com/
- Check startup logs for errors

---

## Success Criteria

Feature is complete when:
- ✅ Neon project "aido-todo" created
- ✅ Connection string retrieved (psycopg3 format with `sslmode=require`)
- ✅ `backend/.env` populated with DATABASE_URL
- ✅ `backend/src/db/session.py` module created with engine and get_session()
- ✅ FastAPI starts without connection errors
- ✅ `GET /health` returns status 200 with `"database": "connected"`
- ✅ Tables `user` and `task` exist in Neon database
- ✅ `.env` is in `.gitignore` (not committed to git)

---

**Estimated Time**: 30 minutes
**Difficulty**: Medium
**Prerequisite Knowledge**: FastAPI, environment variables, PostgreSQL basics

**Good luck! 🚀**
