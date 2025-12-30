# Feature Specification: Neon Database Configuration

**Feature Branch**: `005-neon-database-config`
**Created**: 2025-12-31
**Status**: Draft
**Input**: User request: "Use the Neon MCP Server to complete the Neon configuration as the database service for Phase 2 Web API"

## Overview

This feature specification covers provisioning and configuring a Neon PostgreSQL database as the primary data store for the AIDO Todo application (Phase 2). The feature includes:

- Creating a Neon project and database
- Establishing secure credentials and connection strings
- Configuring environment variables for backend and frontend
- Verifying database connectivity with SQLModel
- Setting up automated schema initialization via FastAPI lifespan

## Success Criteria

- ✅ Neon project created in Neon Console
- ✅ PostgreSQL database provisioned with secure credentials
- ✅ Connection string verified and stored in environment
- ✅ SQLModel models sync with database schema on startup
- ✅ Backend can connect via SQLAlchemy engine with psycopg3 driver
- ✅ Health check endpoint confirms database connectivity
- ✅ `.env` files populated with Neon credentials
- ✅ No hardcoded secrets in codebase

## Assumptions

- **Neon organization exists**: User has Neon account and organization access
- **Single database**: One Neon project hosts all AIDO Todo tables (users, tasks)
- **Compute endpoint**: Use default compute (auto-suspend enabled for cost optimization)
- **Connection pooling**: SQLModel engine uses psycopg3 with default pool settings
- **Schema auto-creation**: FastAPI lifespan creates tables on startup via SQLModel.metadata.create_all()
- **No migrations framework**: Initial schema created via SQLModel; future migrations handled separately
- **Passwordless auth optional**: Feature supports both password auth and Neon GitHub OAuth (if user has it enabled)

## User Scenarios & Testing

### User Story 1 - Neon Project Creation & Verification (Priority: P0)

As a developer, I want to create a Neon project and verify connectivity so that the backend can store and retrieve data.

**Why this priority**: Database access is a blocking dependency for all Phase 2 features. Without this, authentication, CRUD operations, and task management cannot function.

**Acceptance Scenarios**:

1. **Given** no Neon project exists, **When** I create a project named "aido-todo", **Then** a PostgreSQL database is provisioned and accessible
2. **Given** a Neon project, **When** I query the connection details, **Then** I receive a valid psycopg3 connection string
3. **Given** a valid connection string, **When** the FastAPI backend starts, **Then** it initializes the database schema (users, tasks tables)
4. **Given** initialized schema, **When** I query the health check endpoint, **Then** it confirms database is reachable
5. **Given** valid credentials, **When** I execute a test query (SELECT 1), **Then** it succeeds within <100ms
6. **Given** Neon credentials, **When** I populate .env files in backend/ and frontend/, **Then** the backend loads DATABASE_URL without errors

### User Story 2 - Environment Configuration (Priority: P1)

As a developer, I want environment variables properly configured so that both local development and deployed instances connect to Neon without hardcoding secrets.

**Acceptance Scenarios**:

1. **Given** Neon connection details, **When** I create `backend/.env` from `.env.example`, **Then** DATABASE_URL is set to Neon connection string
2. **Given** DATABASE_URL in .env, **When** FastAPI starts, **Then** it loads via python-dotenv without errors
3. **Given** multiple developers, **When** they clone the repo, **Then** `.env.example` provides all required variables (no missing keys)
4. **Given** production deployment, **When** environment variables are set via CI/CD secrets, **Then** the app connects to Neon without modification

## Integration Points

### Backend Integration

- **File**: `backend/src/db/session.py` (to be created in T2.4)
  - Imports `DATABASE_URL` from environment
  - Creates SQLAlchemy engine with psycopg3 dialect: `postgresql+psycopg://...`
  - Configures connection pooling and timeout
  - Exports `get_session()` dependency for FastAPI routes

- **File**: `backend/src/main.py` (already created in T1.4)
  - Loads `DATABASE_URL` via `os.getenv()`
  - Creates engine and metadata on startup
  - Calls `SQLModel.metadata.create_all(engine)` in lifespan manager
  - Health check endpoint queries database: `SELECT 1`

- **Dependencies**: psycopg[binary]>=3.1, sqlalchemy>=2.0, sqlmodel>=0.0.14

### Frontend Integration

- **Environment**: `frontend/.env.local`
  - No direct database access (frontend is stateless)
  - Communicates via backend API only
  - `NEXT_PUBLIC_API_URL` points to FastAPI backend

### Environment Files

**backend/.env.example** (already created in T1.4):
```
DATABASE_URL=postgresql+psycopg://[user]:[password]@[host]/[database]?sslmode=require
JWT_SECRET=your-secret-key-here
API_HOST=localhost
API_PORT=8000
FRONTEND_URL=http://localhost:3000
```

**backend/.env** (to be created):
- Copy from `.env.example`
- Replace `DATABASE_URL` with actual Neon connection string
- Replace `JWT_SECRET` with actual secret (at least 32 chars, random)

**frontend/.env.local.example** (already created in T1.5):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
JWT_SECRET=your-secret-key-here
```

## Non-Functional Requirements

### Performance
- Database connection pool size: 5-10 connections (for development)
- Connection timeout: 10 seconds (to avoid hanging on network issues)
- Query timeout: 30 seconds (prevent long-running queries)
- Health check query (<SELECT 1>) completes within 100ms

### Reliability
- Automatic connection pool recycling on errors
- Health check endpoint available at `GET /health` for monitoring
- Connection string includes `sslmode=require` for encrypted connections

### Security
- **No hardcoded secrets**: All credentials in `.env` (not committed to git)
- **Environment-based config**: DATABASE_URL loaded from environment variables
- **TLS encryption**: Neon connections use SSL/TLS by default (`sslmode=require`)
- **Role-based access**: Neon database user has minimal required permissions (create tables, insert, select, update, delete)
- **.env.example only**: Template file committed; actual `.env` excluded via `.gitignore`

### Cost
- **Serverless compute**: Neon auto-scales and auto-suspends (reduces cost for dev/test)
- **Branch deletion**: Remove test branches to avoid unnecessary costs
- **Connection pooling**: SQLAlchemy pooling reduces Neon compute connections

## Data Model Alignment

This feature configures the database storage layer for Phase 2 models:

**User Model** (already defined in `backend/src/models/user.py`):
- Table: `user` (auto-created by SQLModel)
- Columns: id (UUID PK), email (unique, indexed), password_hash, created_at, updated_at
- Relationships: One-to-many with Task (cascade delete)

**Task Model** (already defined in `backend/src/models/task.py`):
- Table: `task` (auto-created by SQLModel)
- Columns: id (UUID PK), user_id (FK), title, description, completed, created_at, updated_at
- Indexes: (user_id), (user_id, created_at)

## Implementation Scope

### In Scope
- ✅ Create Neon project via Neon console or MCP
- ✅ Retrieve connection credentials (psycopg3 format)
- ✅ Populate `backend/.env` with DATABASE_URL
- ✅ Test database connectivity from FastAPI
- ✅ Verify schema auto-creation on startup
- ✅ Document connection string format and security notes

### Out of Scope
- ❌ Database migrations framework (future; handle schema updates manually for now)
- ❌ Read replicas or high-availability setup (beyond Phase 2 scope)
- ❌ Backup/restore procedures (Neon manages this)
- ❌ Data seeding (separate feature if needed)
- ❌ Multi-region setup (Phase 3+)

## Risk Analysis

| Risk | Severity | Mitigation |
|------|----------|-----------|
| **Database not reachable** | High | Add health check endpoint; test connectivity before deploying frontend |
| **Connection string format wrong** | Medium | Provide exact psycopg3 format example; validate in startup code |
| **Schema conflicts** | Low | SQLModel create_all() handles idempotency; no manual DDL needed |
| **Cost overruns** | Low | Neon serverless auto-scales; dev instances auto-suspend after 5 mins idle |
| **Secrets leaked in git** | Critical | `.env` is in `.gitignore`; use `.env.example` as template |

## Validation Checklist

- [ ] Neon project created and named "aido-todo"
- [ ] Connection string retrieved in psycopg3 format
- [ ] `backend/.env` populated with DATABASE_URL
- [ ] FastAPI backend starts without connection errors
- [ ] `SELECT 1` query executes successfully
- [ ] Health check endpoint (`GET /health`) returns 200 OK
- [ ] SQLModel tables (user, task) exist in database (verify via Neon console)
- [ ] `.env` excluded from git (in .gitignore)
- [ ] `.env.example` has all required keys (DATABASE_URL, JWT_SECRET, etc.)
- [ ] Documentation includes connection string format and setup instructions

## Dependencies

### External Services
- **Neon**: Serverless PostgreSQL platform (https://console.neon.tech/)
- **MCP Tool**: `mcp__Neon__*` suite for programmatic project and database management

### Internal Dependencies
- Phase 2 models (User, Task) must be defined before schema creation
- FastAPI app initialization (main.py) must have lifespan manager
- python-dotenv must be installed for environment variable loading

### Technology Stack
- PostgreSQL 15+ (Neon default)
- psycopg3 driver (psycopg[binary]>=3.1)
- SQLModel (for ORM and schema auto-creation)
- SQLAlchemy 2.0+ (for engine and session management)

## Acceptance Gate

Feature is **DONE** when:

1. Neon project exists and is accessible
2. Connection string is valid and tested
3. `backend/.env` is populated with real DATABASE_URL
4. FastAPI starts and creates schema automatically
5. Health check endpoint confirms database reachability
6. All validation checklist items are checked
7. Zero hardcoded secrets in codebase
8. Documentation is complete and clear

## References

- Phase 2 Specification: `specs/004-phase-2-web-api/spec.md`
- Phase 2 Tasks: `specs/004-phase-2-web-api/tasks.md`
- SQLModel Documentation: https://sqlmodel.tiangolo.com/
- Neon Documentation: https://neon.tech/docs/
- PostgreSQL Connection Strings: https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING
