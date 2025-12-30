# Research & Reference: Neon Database Configuration

**Feature**: 005-neon-database-config | **Date**: 2025-12-31

This document provides technical research, code examples, and reference materials for implementing Neon database configuration in Phase 2 Web API.

---

## 1. Neon Overview

### What is Neon?

**Neon** is a serverless PostgreSQL database platform that provides:
- Instant PostgreSQL databases without managing infrastructure
- Auto-scaling compute (scales up/down based on demand)
- Auto-suspend feature (pauses when idle to reduce costs)
- Branching (create test databases from production snapshots)
- Secure credentials and connection pooling
- Web console for database management

**Official Documentation**: https://neon.tech/docs/

### Why Neon for AIDO Todo?

| Factor | Benefit |
|--------|---------|
| **Setup Speed** | Database ready in <1 minute (no manual provisioning) |
| **Cost** | Auto-suspend reduces dev/test costs; serverless pricing |
| **Scalability** | Auto-scales compute; no capacity planning needed |
| **Developer Experience** | Web console, CLI, MCP integration; easy credential management |
| **Security** | Built-in SSL/TLS, role-based access control, audit logs |
| **PostgreSQL Compatibility** | 100% PostgreSQL (v15+); all tools work (psycopg, SQLAlchemy, etc.) |

---

## 2. Connection String Reference

### Neon Connection String Format

Neon provides connection strings in multiple formats. We use **psycopg3** format for modern Python:

#### Format Structure
```
postgresql+psycopg://[user]:[password]@[host]/[database]?sslmode=require
```

#### Components

| Component | Example | Notes |
|-----------|---------|-------|
| **Protocol** | `postgresql+psycopg` | psycopg3 dialect (not psycopg2) |
| **User** | `neondb_owner` | Database owner role; can be changed in console |
| **Password** | `AbC123xYz...` | Auto-generated; reset in Neon console |
| **Host** | `ep-xyz.us-east-1.neon.tech` | Neon compute endpoint; region-specific |
| **Database** | `neondb` | Default database; create custom if needed |
| **SSL Mode** | `sslmode=require` | **Required** for security |

#### Example
```
postgresql+psycopg://neondb_owner:Z8kL9pQ2mN5x@ep-empty-paper-123456.us-east-1.neon.tech/neondb?sslmode=require
```

### How to Retrieve Connection String

**Via Neon Console**:
1. Log in to https://console.neon.tech/
2. Select project "aido-todo"
3. Click "Connection string" (top right)
4. Select "psycopg3" from dropdown
5. Copy the entire string
6. Paste into `backend/.env` as DATABASE_URL

**Via Neon CLI**:
```bash
neon projects list              # List projects
neon projects get <project-id>  # Show project details
neon connection-string <project-id>  # Get connection string
```

**Via MCP Tools** (programmatic):
```python
# This is what we use in T5.4
mcp__Neon__get_connection_string(params={
    projectId: "project_abc123",
    branchId: "br_xyz789"
})
# Returns: postgresql+psycopg://user:password@host/db?sslmode=require
```

---

## 3. SQLAlchemy Engine Configuration

### Basic Engine Setup

```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

# Connection string from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Create engine with psycopg3
engine = create_engine(
    DATABASE_URL,
    # Logging & Debugging
    echo=False,  # Set to True to log all SQL queries

    # Connection Pool Settings
    poolclass=QueuePool,  # Default; manages connections
    pool_size=5,          # Number of persistent connections
    max_overflow=10,      # Allow up to 15 total connections
    pool_pre_ping=True,   # Test connection before using
    pool_recycle=3600,    # Recycle connections after 1 hour

    # Timeout Settings
    connect_args={
        "timeout": 10,    # Connection timeout (seconds)
        "application_name": "aido-todo"  # Identify in Neon logs
    }
)
```

### Pool Size Explanation

```
Total Available Connections = pool_size + max_overflow = 5 + 10 = 15

Behavior:
- Requests 1-5: Use persistent pool connections (fast)
- Requests 6-15: Create temporary connections (slower, cleaned up after use)
- Request 16+: Wait for connection to become available (blocks)
```

### Production vs Development

**Development** (current Phase 2):
```python
pool_size=5
max_overflow=10
pool_pre_ping=True
connect_args={"timeout": 10}
```

**Production** (future):
```python
pool_size=20
max_overflow=30
pool_pre_ping=True
pool_recycle=1800  # More aggressive recycling
connect_args={
    "timeout": 10,
    "application_name": "aido-todo-prod"
}
```

---

## 4. FastAPI Integration Patterns

### Lifespan Manager (FastAPI 0.93+)

The `lifespan` context manager runs code on app startup and shutdown:

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlmodel import SQLModel
from backend.src.db.session import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ===== STARTUP =====
    # Create database tables if they don't exist
    print("Creating database tables...")
    SQLModel.metadata.create_all(engine)
    print("Database ready!")

    yield  # App runs here

    # ===== SHUTDOWN =====
    # Optional: cleanup
    print("Shutting down...")
    # engine.dispose()  # Close all connections

app = FastAPI(lifespan=lifespan)
```

### Session Dependency

FastAPI dependency injection pattern for database sessions:

```python
from typing import Generator
from fastapi import Depends
from sqlalchemy.orm import Session as SQLAlchemySession
from backend.src.db.session import engine

def get_session() -> Generator:
    """
    Provides a database session to route handlers.
    Automatically closes after request completes.
    """
    with SQLAlchemySession(engine) as session:
        yield session

# Usage in route:
@app.get("/tasks")
def list_tasks(session: SQLAlchemySession = Depends(get_session)):
    tasks = session.exec(select(Task)).all()
    return tasks
```

### Health Check Endpoint

Simple database connectivity check:

```python
from sqlalchemy import text
from fastapi import HTTPException

@app.get("/health")
def health_check(session: SQLAlchemySession = Depends(get_session)):
    """Check if app and database are healthy."""
    try:
        # Simple query to verify database is responding
        session.exec(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Database unavailable: {str(e)}"
        )
```

---

## 5. SQLModel Schema Auto-Creation

### How SQLModel.metadata.create_all() Works

```python
from sqlmodel import SQLModel

# This creates all tables that are defined as SQLModel subclasses
# It's idempotent: safe to call multiple times
SQLModel.metadata.create_all(engine)
```

### Tables Created from Models

**User Model** → `user` table:
```sql
CREATE TABLE IF NOT EXISTS "user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_user_email ON "user" (email);
```

**Task Model** → `task` table:
```sql
CREATE TABLE IF NOT EXISTS "task" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_task_user_id ON "task" (user_id);
CREATE INDEX ix_tasks_user_id_created_at ON "task" (user_id, created_at);
```

### Idempotency

`create_all()` is idempotent because it uses `CREATE TABLE IF NOT EXISTS`:
- First run: Creates all tables
- Second run: Checks if tables exist, skips creation if they do
- Safe to call on every startup (recommended for fastAPI lifespan)

---

## 6. Environment Variable Setup

### .env File Format

```bash
# DATABASE_URL - Full connection string to Neon
# Format: postgresql+psycopg://user:password@host/database?sslmode=require
DATABASE_URL=postgresql+psycopg://neondb_owner:password123@ep-xyz.us-east-1.neon.tech/neondb?sslmode=require

# JWT_SECRET - Used to sign and verify JWT tokens
# Min 32 chars; should be cryptographically random
JWT_SECRET=your-super-secret-key-that-is-very-long-and-random-at-least-32-characters

# API Configuration
API_HOST=localhost
API_PORT=8000
FRONTEND_URL=http://localhost:3000

# Optional: Enable SQL logging for debugging
# SQLALCHEMY_ECHO=False
```

### Loading Environment Variables in Python

```python
import os
from dotenv import load_dotenv

# Load .env file (from backend root)
load_dotenv()

# Access variables
DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET = os.getenv("JWT_SECRET")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")
```

### .env vs .env.example

| File | Committed | Contains | Purpose |
|------|-----------|----------|---------|
| `.env` | ❌ NO (in .gitignore) | Real secrets | Development/production credentials |
| `.env.example` | ✅ YES | Template | Template for new developers |

**Workflow**:
1. Clone repo (gets `.env.example`)
2. Copy: `cp backend/.env.example backend/.env`
3. Edit: `nano backend/.env` (fill in real DATABASE_URL)
4. Never commit `.env` (it's in `.gitignore`)

---

## 7. Neon MCP Tools Reference

### Available Tools

**list_projects** - List all Neon projects
```python
mcp__Neon__list_projects(params={
    "limit": 10,
    "search": "aido"  # Optional filter
})
# Returns: [{id, name, organization_id, created_at}, ...]
```

**create_project** - Create new Neon project
```python
mcp__Neon__create_project(params={
    "name": "aido-todo",
    "org_id": "org_abc123"  # Optional
})
# Returns: {id, name, default_branch_id, default_compute_id}
```

**describe_project** - Get project details
```python
mcp__Neon__describe_project(params={
    "projectId": "project_abc123"
})
# Returns: {id, name, default_branch, databases, computes}
```

**get_connection_string** - Retrieve connection string
```python
mcp__Neon__get_connection_string(params={
    "projectId": "project_abc123",
    "branchId": "br_xyz789",  # Optional; uses default if omitted
    "databaseName": "neondb",  # Optional
    "roleName": "neondb_owner"  # Optional
})
# Returns: postgresql+psycopg://user:password@host/database?sslmode=require
```

**run_sql** - Execute SQL query in Neon
```python
mcp__Neon__run_sql(params={
    "projectId": "project_abc123",
    "sql": "SELECT 1"
})
# Returns: {rows: [[1]]}
```

---

## 8. Security Best Practices

### 1. SSL/TLS Connection

**Always use `sslmode=require`**:
```
❌ postgresql://user:password@host/db
✅ postgresql://user:password@host/db?sslmode=require
```

- `require`: Connection fails if SSL not available (safest)
- `prefer`: Use SSL if available, fall back to plaintext
- `disable`: No SSL (never use in production)

### 2. Credential Rotation

If password is exposed:

**Via Neon Console**:
1. Open https://console.neon.tech/
2. Select project → Settings → Roles
3. Find role (e.g., `neondb_owner`)
4. Click "Reset Password"
5. New password generated; copy and update `.env`

**Via CLI**:
```bash
neon roles reset-password <project-id> <role-name>
```

### 3. Role-Based Access Control

Neon roles (users) have permissions:
- `Owner`: Full permissions (used by default)
- `Viewer`: Read-only access (for monitoring)
- Custom roles: Define specific permissions

For AIDO Todo, `neondb_owner` is sufficient (can create tables, insert/select/update/delete).

### 4. Prevent Secret Leaks

**In Code**:
```python
# ❌ NEVER DO THIS
DATABASE_URL = "postgresql://user:password@host/db"

# ✅ ALWAYS DO THIS
DATABASE_URL = os.getenv("DATABASE_URL")
```

**In Git**:
```bash
# Add to .gitignore
echo "backend/.env" >> .gitignore
echo "frontend/.env.local" >> .gitignore
git add .gitignore
git commit -m "chore: add environment files to gitignore"
```

**In Logs**:
```python
# ❌ BAD: Logs connection string
print(f"Connecting to {DATABASE_URL}")

# ✅ GOOD: Logs only relevant info
print(f"Connecting to {DATABASE_URL.split('@')[1]}")  # Shows host only
```

---

## 9. Troubleshooting Guide

### Issue: Connection Timeout

**Symptom**: `psycopg.OperationalError: connection timeout`

**Causes**:
- Network connectivity issue
- Neon compute is suspended (takes 5-10 seconds to wake up)
- Credentials wrong

**Solutions**:
```bash
# 1. Check internet connectivity
ping ep-xyz.us-east-1.neon.tech

# 2. Wait for compute to wake (Neon auto-suspends after 5 min idle)
# Try again in 10 seconds

# 3. Verify connection string format
echo $DATABASE_URL | grep "psycopg://"

# 4. Test with psql
psql "$DATABASE_URL"
```

### Issue: Connection String Format Error

**Symptom**: `ArgumentError: Could not parse rfc1738 URL`

**Causes**:
- Using psycopg2 format instead of psycopg3
- Special characters in password not URL-encoded
- Missing protocol

**Solutions**:
```python
# ❌ WRONG
"postgresql://user:password@host/db"  # Missing dialect

# ✅ CORRECT
"postgresql+psycopg://user:password@host/db?sslmode=require"

# If password has special chars (e.g., @):
import urllib.parse
password = urllib.parse.quote("pass@word", safe='')
```

### Issue: Table Not Created

**Symptom**: `Table "user" does not exist`

**Causes**:
- SQLModel.metadata.create_all() not called
- SQLModel models not imported
- Database permissions insufficient

**Solutions**:
```python
# 1. Verify create_all is called in lifespan
@asynccontextmanager
async def lifespan(app):
    SQLModel.metadata.create_all(engine)  # Must be here
    yield

# 2. Verify models are imported
from backend.src.models.user import User
from backend.src.models.task import Task

# 3. Check permissions in Neon console
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

### Issue: Health Check Returns 503

**Symptom**: `GET /health → {"status": 503, "detail": "Database unavailable"}`

**Causes**:
- Database connection failed
- Compute endpoint down
- Credentials wrong

**Solutions**:
```bash
# 1. Test connection with psql
psql "$DATABASE_URL"

# 2. Check Neon console status
# Visit https://console.neon.tech/
# Look for compute status (should be green)

# 3. Check error logs
# FastAPI startup logs will show error:
# "psycopg.OperationalError: ..."
```

---

## 10. Performance Tuning

### Query Performance

Monitor slow queries in Neon console:
```sql
-- Check active connections
SELECT * FROM pg_stat_activity;

-- View slow query log
SELECT query, mean_exec_time FROM pg_stat_statements
ORDER BY mean_exec_time DESC LIMIT 10;
```

### Connection Pool Tuning

If app encounters connection timeout:
```python
# Increase pool for high concurrency
engine = create_engine(
    DATABASE_URL,
    pool_size=20,      # Increase from 5
    max_overflow=40    # Increase from 10
)
```

Monitor connections:
```python
# Check active connections
print(engine.pool.checkedout())  # Active connections
print(engine.pool.size())        # Pool size
```

### Cost Optimization

Neon charges based on:
- **Compute time** (running database)
- **Storage** (data size)
- **Data transfer** (outbound traffic)

**To reduce costs**:
1. **Auto-suspend**: Enabled by default (pauses compute after 5 min idle)
2. **Delete unused branches**: Each branch has compute
3. **Delete old backups**: Neon keeps backups (use retentions policy)
4. **Connection pooling**: Reuse connections (don't open new ones repeatedly)

---

## 11. Testing & Validation

### Unit Test Example

```python
import pytest
from sqlalchemy import create_engine
from sqlmodel import SQLModel, Session

@pytest.fixture
def test_db():
    """Create test database for isolated testing."""
    # Use SQLite for fast tests
    engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(engine)
    yield engine

def test_user_creation(test_db):
    """Test that User table can store data."""
    with Session(test_db) as session:
        user = User(email="test@example.com", password_hash="hashed")
        session.add(user)
        session.commit()

        result = session.query(User).filter_by(email="test@example.com").first()
        assert result is not None
        assert result.email == "test@example.com"
```

### Integration Test Example

```python
def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.json()["database"] == "connected"
```

---

## 12. Documentation & Runbooks

### Common Tasks Runbook

#### Reset Neon Password
```bash
# Via CLI
neon roles reset-password <project-id> neondb_owner

# Via Console
1. console.neon.tech
2. Project → Settings → Roles
3. neondb_owner → Reset Password
4. Update backend/.env with new password
```

#### List Database Tables
```bash
# Via psql
psql "$DATABASE_URL" -c "SELECT tablename FROM pg_tables WHERE schemaname='public';"

# Via Neon console SQL editor
SELECT tablename FROM pg_tables WHERE schemaname='public';
```

#### Check Database Size
```bash
# Via SQL
SELECT pg_size_pretty(pg_database_size(current_database()));

# Via Neon console
Settings → Database size (under Overview)
```

---

## References & Links

- **Neon Official Docs**: https://neon.tech/docs/
- **Neon Connection Strings**: https://neon.tech/docs/connect/connection-strings/
- **SQLAlchemy Engines**: https://docs.sqlalchemy.org/en/20/core/engines.html
- **psycopg3 Documentation**: https://www.psycopg.org/psycopg3/docs/
- **SQLModel Documentation**: https://sqlmodel.tiangolo.com/
- **FastAPI Lifespan Events**: https://fastapi.tiangolo.com/advanced/events/
- **PostgreSQL Connection Strings**: https://www.postgresql.org/docs/current/libpq-connect.html

---

**Last Updated**: 2025-12-31
**Maintained By**: AIDO Development Team
