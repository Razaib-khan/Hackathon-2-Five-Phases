# Task Breakdown: Phase 2 - Web API with Authentication

**Feature**: 004-phase-2-web-api | **Branch**: 004-phase-2-web-api | **Date**: 2025-12-31
**Status**: Ready for Execution | **Phase**: Phase 2 (Task Generation)

---

## Executive Summary

This document breaks the Phase 2 implementation plan into 47 concrete, independently-testable tasks organized into 7 execution phases:

1. **Setup Phase** (4 tasks): Environment, dependencies, project scaffolding
2. **Foundational Phase** (6 tasks): Core database models, JWT middleware, environment config
3. **User Story 1: Authentication** (9 tasks): Signup/login/logout endpoints and frontend auth flow
4. **User Story 2: CRUD Operations** (11 tasks): Task creation, retrieval, update operations
5. **User Story 3: Task Deletion** (5 tasks): Delete endpoint and cleanup
6. **User Story 4: Completion Tracking** (7 tasks): Completion status, filtering, sorting
7. **Polish Phase** (5 tasks): Error handling, UI polish, performance validation

**MVP Scope**: Complete User Stories 1 & 2 (auth + CRUD) = 19 core tasks
**Full Scope**: All 4 user stories (auth + CRUD + delete + completion) = 47 total tasks

---

## Execution Phases & Dependencies

### Task Organization Principles

- **Independent**: Each task has minimal dependencies; can be worked in parallel where possible
- **Verifiable**: Each task includes specific acceptance criteria and test scenarios
- **Minimal Scope**: Tasks avoid combining unrelated responsibilities (e.g., separate API endpoint from UI component)
- **SQLModel First**: Database models created before API routes
- **Backend Before Frontend**: APIs implemented and tested before consuming in frontend
- **Sequential for Shared Concerns**: JWT middleware created before any protected endpoint

### Parallel Execution Opportunities

The task graph allows this parallel execution:

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (Auth & CRUD)
                                         ↓
                              US1 (Auth) + US2 (CRUD) can run in parallel
                                         ↓
                              US3 (Delete) + US4 (Completion) can run in parallel
                                         ↓
                              Phase 7 (Polish)
```

**Recommended Execution**:
- Start Phase 1-2 sequentially (quick foundational work)
- Sprint 1: Phase 3 (Auth) in parallel with Phase 4 (CRUD APIs)
- Sprint 2: Phase 5-6 (Delete/Completion) in parallel
- Sprint 3: Phase 7 (Polish)

---

## Phase 1: Setup (4 tasks)

Environment setup, dependency installation, project scaffolding.

### T1.1: Create backend/ project structure

**Story**: Setup
**Type**: Backend Infrastructure
**Priority**: P0 (blocking)
**Dependencies**: None
**Estimated**: 5 min

**Acceptance Criteria**:
- [ ] Directory `/backend/src/` exists with subdirectories: `models/`, `api/`, `security/`, `db/`
- [ ] File `backend/main.py` exists (FastAPI app initialization)
- [ ] File `backend/requirements.txt` exists with placeholder FastAPI 0.104+ entry
- [ ] File `backend/.env.example` exists with `DATABASE_URL` and `JWT_SECRET` placeholders
- [ ] Folder structure matches plan.md exactly; no Phase 1 directories modified
- [ ] All files are empty/skeleton; no implementation code

**Test Scenario**:
```
$ ls -la backend/src/{models,api,security,db}/
$ grep "fastapi" backend/requirements.txt
```

**Files Created**: `backend/`, `backend/src/`, `backend/main.py`, `backend/requirements.txt`, `backend/.env.example`

---

### T1.2: Create frontend/ project structure

**Story**: Setup
**Type**: Frontend Infrastructure
**Priority**: P0 (blocking)
**Dependencies**: None
**Estimated**: 5 min

**Acceptance Criteria**:
- [ ] Directory `frontend/src/` exists with subdirectories: `app/`, `components/`, `lib/`, `types/`, `styles/`
- [ ] Directory `frontend/src/app/` contains subdirectories: `(auth)/`, `(app)/`
- [ ] File `frontend/package.json` exists with Next.js 16+ entry
- [ ] File `frontend/tsconfig.json` exists
- [ ] File `frontend/.env.local.example` exists with `NEXT_PUBLIC_API_URL` placeholder
- [ ] Folder structure matches plan.md exactly; no Phase 1 directories modified
- [ ] All files are empty/skeleton; no implementation code

**Test Scenario**:
```
$ ls -la frontend/src/{app,components,lib,types,styles}/
$ grep "next" frontend/package.json
```

**Files Created**: `frontend/`, `frontend/src/`, `frontend/package.json`, `frontend/tsconfig.json`, `frontend/.env.local.example`

---

### T1.3: Install backend dependencies

**Story**: Setup
**Type**: Backend Infrastructure
**Priority**: P0 (blocking)
**Dependencies**: T1.1
**Estimated**: 10 min

**Acceptance Criteria**:
- [ ] Python 3.11+ installed locally or in container
- [ ] `pip install -r backend/requirements.txt` succeeds without errors
- [ ] All required packages installed: `fastapi 0.104+`, `sqlmodel 0.0.14+`, `pydantic 2.x`, `pyjwt 2.8+`, `bcrypt 4.x`, `uvicorn 0.24+`, `python-dotenv`
- [ ] Version conflicts resolved (all dependencies compatible with each other)
- [ ] `python -c "import fastapi; print(fastapi.__version__)"` confirms version ≥0.104

**Test Scenario**:
```bash
cd backend
python -m pip install -r requirements.txt
python -c "import fastapi, sqlmodel, pydantic; print('OK')"
```

**Files Modified**: `backend/requirements.txt`

---

### T1.4: Install frontend dependencies

**Story**: Setup
**Type**: Frontend Infrastructure
**Priority**: P0 (blocking)
**Dependencies**: T1.2
**Estimated**: 10 min

**Acceptance Criteria**:
- [ ] Node.js 18+ and npm installed locally
- [ ] `npm install` in frontend/ directory succeeds
- [ ] All required packages installed: `next@16+`, `react@19+`, `typescript@5.x`, `tailwindcss@4+`, `better-auth@1.x`
- [ ] Version conflicts resolved (all dependencies compatible)
- [ ] `npm list next react typescript` confirms expected versions
- [ ] `node_modules/` directory created (not committed)

**Test Scenario**:
```bash
cd frontend
npm install
npm list next react typescript tailwindcss
```

**Files Modified**: `frontend/package.json`, `frontend/package-lock.json` (or `pnpm-lock.yaml`)

---

## Phase 2: Foundational (6 tasks)

Core database models, JWT middleware, environment configuration.

### T2.1: Create SQLModel User model

**Story**: Foundational
**Type**: Backend Database
**Priority**: P0 (blocking for auth)
**Dependencies**: T1.3
**Estimated**: 10 min

**Acceptance Criteria**:
- [ ] File `backend/src/models/user.py` exists
- [ ] `User` SQLModel class defined with fields:
  - `id: Optional[UUID]` (primary key, default=uuid4())
  - `email: str` (unique, indexed)
  - `password_hash: str`
  - `created_at: datetime` (default=datetime.utcnow())
  - `updated_at: datetime` (auto-update on change)
- [ ] `tasks` relationship defined: `List[Task]` with `back_populates="user"` and cascade delete
- [ ] Table name: `users` (lowercase, plural)
- [ ] Model is Pydantic-compatible (can be used in FastAPI responses)
- [ ] No password field (only password_hash stored)

**Test Scenario**:
```python
from backend.src.models.user import User
from uuid import uuid4

user = User(email="test@example.com", password_hash="bcrypt_hash_here")
assert user.email == "test@example.com"
assert user.id is not None  # uuid auto-generated
```

**Files Created**: `backend/src/models/user.py`, `backend/src/models/__init__.py`

---

### T2.2: Create SQLModel Task model

**Story**: Foundational
**Type**: Backend Database
**Priority**: P0 (blocking for all CRUD)
**Dependencies**: T2.1
**Estimated**: 10 min

**Acceptance Criteria**:
- [ ] File `backend/src/models/task.py` exists
- [ ] `Task` SQLModel class defined with fields:
  - `id: Optional[UUID]` (primary key, default=uuid4())
  - `user_id: UUID` (foreign key → users.id)
  - `title: str` (max 200 chars, not null)
  - `description: Optional[str]` (max 1000 chars, nullable)
  - `completed: bool` (default=False)
  - `created_at: datetime` (default=datetime.utcnow())
  - `updated_at: datetime` (auto-update)
- [ ] `user` relationship defined: `User` with `back_populates="tasks"`
- [ ] Indexes created: `(user_id)` and `(user_id, created_at)` for query performance
- [ ] Table name: `tasks` (lowercase, plural)
- [ ] Cascade delete configured on foreign key

**Test Scenario**:
```python
from backend.src.models.task import Task
from uuid import uuid4

user_id = uuid4()
task = Task(user_id=user_id, title="Test Task", completed=False)
assert task.title == "Test Task"
assert task.completed is False
assert task.user_id == user_id
```

**Files Created**: `backend/src/models/task.py`

---

### T2.3: Create JWT verification middleware

**Story**: Foundational
**Type**: Backend Security
**Priority**: P0 (blocking for all protected endpoints)
**Dependencies**: T1.3
**Estimated**: 15 min

**Acceptance Criteria**:
- [ ] File `backend/src/security/jwt.py` exists
- [ ] `get_current_user()` async function defined using FastAPI `Depends()`
- [ ] Extracts JWT from `Authorization: Bearer <token>` header
- [ ] Uses `PyJWT.decode(token, JWT_SECRET, algorithms=["HS256"])` to verify signature
- [ ] Returns `user_id` (from JWT `sub` claim) on valid token
- [ ] Raises `HTTPException(status_code=401)` on:
  - Missing token
  - Invalid signature
  - Expired token
  - Invalid payload format
- [ ] Can be injected into FastAPI route handlers: `async def handler(user_id: str = Depends(get_current_user))`
- [ ] `JWT_SECRET` loaded from environment via `os.getenv("JWT_SECRET")`

**Test Scenario**:
```python
from backend.src.security.jwt import get_current_user
from fastapi import HTTPException

# Valid token test
valid_token = jwt.encode({"sub": "user-123", "exp": time.time() + 3600}, JWT_SECRET, "HS256")
user_id = await get_current_user(valid_token)
assert user_id == "user-123"

# Expired token test
expired_token = jwt.encode({"sub": "user-123", "exp": time.time() - 100}, JWT_SECRET, "HS256")
try:
    await get_current_user(expired_token)
    assert False, "Should raise 401"
except HTTPException as e:
    assert e.status_code == 401
```

**Files Created**: `backend/src/security/__init__.py`, `backend/src/security/jwt.py`

---

### T2.4: Create database session management

**Story**: Foundational
**Type**: Backend Database
**Priority**: P0 (blocking for all database operations)
**Dependencies**: T1.3, T2.1, T2.2
**Estimated**: 10 min

**Acceptance Criteria**:
- [ ] File `backend/src/db/session.py` exists
- [ ] `get_session()` function created that returns SQLAlchemy Session
- [ ] Connection string from `DATABASE_URL` environment variable
- [ ] Connection pooling configured via SQLAlchemy engine
- [ ] Can be injected into FastAPI routes: `async def handler(session: Session = Depends(get_session))`
- [ ] `SQLModel.metadata.create_all(engine)` callable for schema creation
- [ ] Works with Neon PostgreSQL via psycopg3 driver (included in SQLModel deps)
- [ ] Transaction management via context manager pattern

**Test Scenario**:
```python
from backend.src.db.session import get_session, engine
from sqlmodel import SQLModel, select

# Create schema
SQLModel.metadata.create_all(engine)

# Create and query session
with Session(engine) as session:
    user = User(email="test@example.com", password_hash="hash")
    session.add(user)
    session.commit()
    session.refresh(user)
    assert user.id is not None
```

**Files Created**: `backend/src/db/__init__.py`, `backend/src/db/session.py`

---

### T2.5: Create environment configuration

**Story**: Foundational
**Type**: Backend Infrastructure
**Priority**: P0 (blocking for all operations)
**Dependencies**: T1.1, T1.3
**Estimated**: 5 min

**Acceptance Criteria**:
- [ ] File `backend/src/config.py` exists (or environment loading in main.py)
- [ ] Loads `DATABASE_URL` from environment
- [ ] Loads `JWT_SECRET` from environment
- [ ] Loads `API_PORT` with default 8000
- [ ] Validates required variables exist on startup; raises error if missing
- [ ] `python -m dotenv` auto-loads from `.env` file if present
- [ ] `.env` file is in `.gitignore` (never committed)
- [ ] `.env.example` shows required variables as template

**Test Scenario**:
```bash
export DATABASE_URL="postgresql://user:pass@localhost/testdb"
export JWT_SECRET="test_secret_32_chars_minimum_key"
python -c "from backend.src import config; print(config.DATABASE_URL)"
```

**Files Created**: `backend/src/config.py` (or update `backend/main.py`)
**Files Modified**: `.gitignore` (add `.env`)

---

### T2.6: Initialize FastAPI application

**Story**: Foundational
**Type**: Backend Infrastructure
**Priority**: P0 (blocking for all routes)
**Dependencies**: T1.1, T1.3, T2.3, T2.4, T2.5
**Estimated**: 10 min

**Acceptance Criteria**:
- [ ] File `backend/src/main.py` exists (or `backend/main.py`)
- [ ] FastAPI app initialized: `app = FastAPI()`
- [ ] CORS middleware configured for frontend origin (localhost:3000 for dev, frontend domain for prod)
- [ ] Startup event creates database schema: `SQLModel.metadata.create_all(engine)`
- [ ] Health check endpoint `GET /health` returns `{"status": "ok"}`
- [ ] Loads config and validates environment variables
- [ ] `uvicorn.run(app, host="0.0.0.0", port=8000)` callable for local development
- [ ] Can be started with: `python -m uvicorn backend.src.main:app --reload`

**Test Scenario**:
```bash
export DATABASE_URL="postgresql://..."
export JWT_SECRET="secret"
python -m uvicorn backend.src.main:app --reload &
sleep 2
curl http://localhost:8000/health  # Should return {"status":"ok"}
```

**Files Modified**: `backend/src/main.py`

---

## Phase 3: User Story 1 - Authentication (9 tasks)

Signup, login, logout endpoints and frontend auth integration.

### T3.1: Create password hashing utilities

**Story**: US1 Authentication
**Type**: Backend Security
**Priority**: P1 (required for signup/login)
**Dependencies**: T1.3
**Estimated**: 10 min

**Acceptance Criteria**:
- [ ] File `backend/src/security/password.py` exists
- [ ] `hash_password(password: str) -> str` function using bcrypt 4.x
- [ ] `verify_password(password: str, hash: str) -> bool` function
- [ ] Minimum password requirements enforced before hashing:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one digit
- [ ] `PasswordValidationError` raised with message if requirements not met
- [ ] Uses bcrypt with cost factor 12 (slow enough for security, fast for testing)

**Test Scenario**:
```python
from backend.src.security.password import hash_password, verify_password

# Valid password
hash = hash_password("SecurePass123")
assert verify_password("SecurePass123", hash)
assert not verify_password("WrongPass123", hash)

# Invalid password
try:
    hash_password("weak")  # Too short
    assert False, "Should raise PasswordValidationError"
except PasswordValidationError:
    pass
```

**Files Created**: `backend/src/security/password.py`

---

### T3.2: Create Pydantic schemas for auth endpoints

**Story**: US1 Authentication
**Type**: Backend API
**Priority**: P1 (required for endpoint contracts)
**Dependencies**: T2.1
**Estimated**: 10 min

**Acceptance Criteria**:
- [ ] File `backend/src/schemas/auth.py` exists
- [ ] `SignupRequest` schema with fields: `email: str`, `password: str`
- [ ] `LoginRequest` schema with fields: `email: str`, `password: str`
- [ ] `TokenResponse` schema with fields: `user: UserPublic`, `token: str`
- [ ] `UserPublic` schema with fields: `id: UUID`, `email: str` (no password_hash)
- [ ] Email validation (format check via Pydantic)
- [ ] Password validation (via Pydantic; length ≥8)
- [ ] All schemas use Pydantic v2 syntax

**Test Scenario**:
```python
from backend.src.schemas.auth import SignupRequest

# Valid request
req = SignupRequest(email="user@example.com", password="SecurePass123")
assert req.email == "user@example.com"

# Invalid email
try:
    SignupRequest(email="invalid-email", password="SecurePass123")
    assert False, "Should raise validation error"
except Exception:
    pass
```

**Files Created**: `backend/src/schemas/__init__.py`, `backend/src/schemas/auth.py`

---

### T3.3: Implement POST /auth/signup endpoint

**Story**: US1 Authentication
**Type**: Backend API
**Priority**: P1 (core auth feature)
**Dependencies**: T2.1, T2.4, T3.1, T3.2, T2.3
**Estimated**: 15 min

**Acceptance Criteria**:
- [ ] Route handler in `backend/src/api/auth.py`: `POST /auth/signup`
- [ ] Accepts `SignupRequest` body (email, password)
- [ ] Validates email format (Pydantic)
- [ ] Validates password strength (≥8 chars, uppercase, lowercase, digit)
- [ ] Returns 400 Bad Request if:
  - Email already registered (check database)
  - Password invalid
  - Email invalid format
- [ ] On success:
  - Hash password using bcrypt
  - Create User record in database
  - Generate JWT token with `user_id` in `sub` claim
  - Return 200 OK with `TokenResponse` (user + token)
- [ ] JWT token includes: `sub` (user_id), `exp` (current + 1 hour), `email`
- [ ] Uses `get_session()` dependency to access database

**Test Scenario**:
```bash
# Test signup success
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","password":"SecurePass123"}'
# Should return 200 OK with {"user":{"id":"...","email":"..."},"token":"..."}

# Test duplicate email
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","password":"SecurePass123"}'
# Should return 400 Bad Request with error message
```

**Files Created**: `backend/src/api/__init__.py`, `backend/src/api/auth.py`

---

### T3.4: Implement POST /auth/login endpoint

**Story**: US1 Authentication
**Type**: Backend API
**Priority**: P1 (core auth feature)
**Dependencies**: T2.1, T2.4, T3.1, T3.2, T2.3
**Estimated**: 15 min

**Acceptance Criteria**:
- [ ] Route handler: `POST /auth/login`
- [ ] Accepts `LoginRequest` body (email, password)
- [ ] Queries User by email (case-insensitive)
- [ ] Returns 401 Unauthorized if:
  - User not found
  - Password doesn't match hash
- [ ] On success:
  - Generate JWT token with `user_id` in `sub` claim
  - Return 200 OK with `TokenResponse` (user + token)
- [ ] JWT token includes: `sub` (user_id), `exp` (current + 1 hour), `email`
- [ ] Uses `verify_password()` to check password against stored hash

**Test Scenario**:
```bash
# Test login success (after signup)
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","password":"SecurePass123"}'
# Should return 200 OK with token

# Test invalid password
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","password":"WrongPassword"}'
# Should return 401 Unauthorized
```

**Files Modified**: `backend/src/api/auth.py`

---

### T3.5: Implement POST /auth/logout endpoint

**Story**: US1 Authentication
**Type**: Backend API
**Priority**: P1 (session management)
**Dependencies**: T2.3
**Estimated**: 5 min

**Acceptance Criteria**:
- [ ] Route handler: `POST /auth/logout`
- [ ] Requires JWT authentication (`Depends(get_current_user)`)
- [ ] Returns 200 OK with message: `{"message": "Logged out successfully"}`
- [ ] Note: In JWT-only architecture, logout is client-side (delete token). This endpoint is a placeholder for future token blacklist (Phase 3+).
- [ ] Always succeeds (idempotent)

**Test Scenario**:
```bash
curl -X POST http://localhost:8000/auth/logout \
  -H "Authorization: Bearer <valid_jwt_token>"
# Should return 200 OK with message
```

**Files Modified**: `backend/src/api/auth.py`

---

### T3.6: Create Better Auth frontend client configuration

**Story**: US1 Authentication
**Type**: Frontend Auth
**Priority**: P1 (required for signup/login UI)
**Dependencies**: T1.4
**Estimated**: 15 min

**Acceptance Criteria**:
- [ ] File `frontend/src/lib/auth.ts` exists
- [ ] Exports `betterAuthClient` initialized with:
  - `baseURL`: Backend API URL from environment (`NEXT_PUBLIC_API_URL`)
  - Email/password provider configured
- [ ] Exports `useAuth()` hook for components to access session/token
- [ ] Token automatically included in all API requests via header middleware
- [ ] Handles token storage (localStorage or HttpOnly cookie per Better Auth defaults)
- [ ] Exports `signUp(email, password)` function
- [ ] Exports `signIn(email, password)` function
- [ ] Exports `signOut()` function
- [ ] TypeScript types exported for `User` and `Session`

**Test Scenario**:
```typescript
import { useAuth } from '@/lib/auth';

// In component:
const { session, isPending, signUp, signIn, signOut } = useAuth();
// Should work without errors (mocked initially)
```

**Files Created**: `frontend/src/lib/auth.ts`, `frontend/src/types/auth.ts`

---

### T3.7: Create authentication API client wrapper

**Story**: US1 Authentication
**Type**: Frontend API
**Priority**: P1 (JWT header injection)
**Dependencies**: T1.4, T3.6
**Estimated**: 10 min

**Acceptance Criteria**:
- [ ] File `frontend/src/lib/api.ts` exists
- [ ] Exports `apiClient` wrapper around fetch or axios
- [ ] Automatically adds `Authorization: Bearer <token>` header to all requests
- [ ] Retrieves token from Better Auth session
- [ ] Handles 401 responses (expired token) by refreshing or redirecting to login
- [ ] Exports typed fetch functions: `getJSON()`, `postJSON()`, `putJSON()`, `deleteJSON()`, `patchJSON()`
- [ ] All functions accept URL and optional body, return typed response or error
- [ ] Base URL from `NEXT_PUBLIC_API_URL` environment

**Test Scenario**:
```typescript
import { apiClient } from '@/lib/api';

// Would make request with JWT header automatically:
const tasks = await apiClient.getJSON('/api/user-123/tasks');
```

**Files Created**: `frontend/src/lib/api.ts`

---

### T3.8: Create signup page (Next.js)

**Story**: US1 Authentication
**Type**: Frontend UI
**Priority**: P1 (user-facing signup)
**Dependencies**: T1.4, T3.6, T3.7
**Estimated**: 20 min

**Acceptance Criteria**:
- [ ] File `frontend/src/app/(auth)/signup/page.tsx` exists
- [ ] Form with fields: email (input[type=email]), password (input[type=password])
- [ ] Form validation on submit:
  - Email format check
  - Password strength check (≥8 chars, upper, lower, digit)
  - Display validation errors to user
- [ ] On submit:
  - Call `signUp(email, password)` via Better Auth
  - Show loading state during request
  - On success: redirect to `/app/tasks` (authenticated page)
  - On error: display error message (e.g., "Email already registered")
- [ ] Link to login page: "Already have an account? Log in"
- [ ] Uses TailwindCSS for styling
- [ ] Responsive design (mobile + desktop)
- [ ] Smooth animations/transitions for form states (TailwindCSS transition-*, group-*)

**Test Scenario**:
```typescript
// Page renders with form fields
<form>
  <input type="email" ... />
  <input type="password" ... />
  <button>Sign Up</button>
</form>
// When form submitted, calls Better Auth signUp
```

**Files Created**: `frontend/src/app/(auth)/signup/page.tsx`, `frontend/src/app/(auth)/layout.tsx`

---

### T3.9: Create login page (Next.js)

**Story**: US1 Authentication
**Type**: Frontend UI
**Priority**: P1 (user-facing login)
**Dependencies**: T1.4, T3.6, T3.7, T3.8
**Estimated**: 20 min

**Acceptance Criteria**:
- [ ] File `frontend/src/app/(auth)/login/page.tsx` exists
- [ ] Form with fields: email (input[type=email]), password (input[type=password])
- [ ] Form validation on submit:
  - Email format check
  - Password presence check
  - Display validation errors
- [ ] On submit:
  - Call `signIn(email, password)` via Better Auth
  - Show loading state during request
  - On success: redirect to `/app/tasks`
  - On error: display "Invalid email or password"
- [ ] Link to signup page: "Don't have an account? Sign up"
- [ ] Uses TailwindCSS for styling
- [ ] Responsive design
- [ ] Smooth animations/transitions
- [ ] Layout group `(auth)` shared with signup for consistent styling

**Test Scenario**:
```typescript
// Page renders with login form
// When form submitted, calls Better Auth signIn
// Redirects to /app/tasks on success
```

**Files Created**: `frontend/src/app/(auth)/login/page.tsx`

---

## Phase 4: User Story 2 - CRUD Operations (11 tasks)

Task creation, retrieval, and update operations.

### T4.1: Create Pydantic task schemas

**Story**: US2 CRUD
**Type**: Backend API
**Priority**: P1 (required for endpoint contracts)
**Dependencies**: T2.2
**Estimated**: 10 min

**Acceptance Criteria**:
- [ ] File `backend/src/schemas/task.py` exists
- [ ] `TaskCreate` schema: `title: str` (required), `description: Optional[str]` (optional)
- [ ] `TaskUpdate` schema: `title: Optional[str]`, `description: Optional[str]` (both optional, at least one required)
- [ ] `TaskResponse` schema: full Task with all fields (id, user_id, title, description, completed, created_at, updated_at)
- [ ] Validation rules:
  - title: non-empty string, max 200 chars
  - description: max 1000 chars if provided
  - All fields present in response
- [ ] Schemas use Pydantic v2

**Test Scenario**:
```python
from backend.src.schemas.task import TaskCreate

# Valid
create = TaskCreate(title="Buy milk", description="2L whole milk")

# Invalid (empty title)
try:
    TaskCreate(title="")
    assert False
except Exception:
    pass
```

**Files Modified**: `backend/src/schemas/task.py`

---

### T4.2: Implement GET /api/{user_id}/tasks endpoint

**Story**: US2 CRUD
**Type**: Backend API
**Priority**: P1 (core CRUD)
**Dependencies**: T2.1, T2.2, T2.4, T3.2, T4.1, T2.3
**Estimated**: 15 min

**Acceptance Criteria**:
- [ ] Route handler: `GET /api/{user_id}/tasks`
- [ ] Requires JWT authentication
- [ ] Enforces user isolation: JWT.sub must equal user_id, else return 403 Forbidden
- [ ] Queries all Task records where task.user_id == user_id
- [ ] Returns 200 OK with JSON array of `TaskResponse` objects
- [ ] Empty list `[]` if no tasks exist
- [ ] Orders by created_at descending (newest first)
- [ ] Uses SQLModel query: `select(Task).where(Task.user_id == user_id)`

**Test Scenario**:
```bash
# Create a task first (via POST)
# Then query:
curl -X GET http://localhost:8000/api/user-123/tasks \
  -H "Authorization: Bearer <jwt_token>"
# Should return [{"id":"...","title":"...","completed":false,...}]

# Try accessing other user's tasks:
curl -X GET http://localhost:8000/api/other-user-id/tasks \
  -H "Authorization: Bearer <jwt_token>"
# Should return 403 Forbidden
```

**Files Created**: `backend/src/api/tasks.py`

---

### T4.3: Implement POST /api/{user_id}/tasks endpoint

**Story**: US2 CRUD
**Type**: Backend API
**Priority**: P1 (core CRUD - create)
**Dependencies**: T2.1, T2.2, T2.4, T4.1, T3.2, T2.3
**Estimated**: 15 min

**Acceptance Criteria**:
- [ ] Route handler: `POST /api/{user_id}/tasks`
- [ ] Requires JWT authentication
- [ ] Enforces user isolation: 403 if JWT.sub != user_id
- [ ] Accepts `TaskCreate` request body
- [ ] Validates request:
  - title not empty, max 200 chars → 400 if invalid
  - description not provided or max 1000 chars → 400 if invalid
- [ ] Creates Task record:
  - Sets user_id from path parameter
  - Sets completed = false
  - Auto-generates id (UUID) and timestamps
- [ ] Returns 201 Created with `TaskResponse` body
- [ ] Task persists in database

**Test Scenario**:
```bash
curl -X POST http://localhost:8000/api/user-123/tasks \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","description":"Milk, eggs, bread"}'
# Should return 201 Created with task details

# Test invalid request (empty title):
curl -X POST http://localhost:8000/api/user-123/tasks \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":""}'
# Should return 400 Bad Request
```

**Files Modified**: `backend/src/api/tasks.py`

---

### T4.4: Implement GET /api/{user_id}/tasks/{id} endpoint

**Story**: US2 CRUD
**Type**: Backend API
**Priority**: P1 (core CRUD - read single)
**Dependencies**: T2.1, T2.2, T2.4, T4.1, T3.2, T2.3
**Estimated**: 15 min

**Acceptance Criteria**:
- [ ] Route handler: `GET /api/{user_id}/tasks/{id}`
- [ ] Requires JWT authentication
- [ ] Enforces user isolation: 403 if JWT.sub != user_id
- [ ] Queries task by id and user_id
- [ ] Returns 200 OK with `TaskResponse` if found
- [ ] Returns 404 Not Found if:
  - Task id doesn't exist
  - Task exists but belongs to different user
- [ ] Uses SQLModel query: `select(Task).where((Task.id == id) & (Task.user_id == user_id))`

**Test Scenario**:
```bash
# Assuming task-id-123 created for user-123
curl -X GET http://localhost:8000/api/user-123/tasks/task-id-123 \
  -H "Authorization: Bearer <jwt_token>"
# Should return 200 OK with task details

# Try accessing non-existent task:
curl -X GET http://localhost:8000/api/user-123/tasks/nonexistent \
  -H "Authorization: Bearer <jwt_token>"
# Should return 404 Not Found
```

**Files Modified**: `backend/src/api/tasks.py`

---

### T4.5: Implement PUT /api/{user_id}/tasks/{id} endpoint

**Story**: US2 CRUD
**Type**: Backend API
**Priority**: P1 (core CRUD - update)
**Dependencies**: T2.1, T2.2, T2.4, T4.1, T3.2, T2.3
**Estimated**: 15 min

**Acceptance Criteria**:
- [ ] Route handler: `PUT /api/{user_id}/tasks/{id}`
- [ ] Requires JWT authentication
- [ ] Enforces user isolation: 403 if JWT.sub != user_id
- [ ] Accepts `TaskUpdate` request body (at least one field required)
- [ ] Validates:
  - At least one field (title or description) provided → 400 if neither
  - title: non-empty, max 200 if provided
  - description: max 1000 if provided
- [ ] Finds task by id and user_id
- [ ] Returns 404 if not found or belongs to different user
- [ ] Updates provided fields (partial update):
  - Only update title if provided (not null)
  - Only update description if provided
  - Always update updated_at timestamp
- [ ] Returns 200 OK with updated `TaskResponse`

**Test Scenario**:
```bash
curl -X PUT http://localhost:8000/api/user-123/tasks/task-id-123 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated title"}'
# Should return 200 OK with updated task

# Test partial update (description only):
curl -X PUT http://localhost:8000/api/user-123/tasks/task-id-123 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated description"}'
# Title should remain unchanged, description updated
```

**Files Modified**: `backend/src/api/tasks.py`

---

### T4.6: Register task routes in FastAPI app

**Story**: US2 CRUD
**Type**: Backend Infrastructure
**Priority**: P1 (required for endpoints to be available)
**Dependencies**: T2.6, T4.2, T4.3, T4.4, T4.5
**Estimated**: 5 min

**Acceptance Criteria**:
- [ ] File `backend/src/main.py` imports task routes
- [ ] All task endpoints registered with FastAPI app:
  - GET /api/{user_id}/tasks
  - POST /api/{user_id}/tasks
  - GET /api/{user_id}/tasks/{id}
  - PUT /api/{user_id}/tasks/{id}
- [ ] All auth endpoints already registered (from phase 3)
- [ ] `uvicorn` shows all routes in debug output

**Test Scenario**:
```bash
python -m uvicorn backend.src.main:app --reload
# Output should show all registered routes
curl http://localhost:8000/docs  # Swagger UI shows all endpoints
```

**Files Modified**: `backend/src/main.py`, `backend/src/api/auth.py`

---

### T4.7: Create TaskList component (frontend)

**Story**: US2 CRUD
**Type**: Frontend UI
**Priority**: P1 (core UI for task display)
**Dependencies**: T1.4, T3.7, T4.1
**Estimated**: 25 min

**Acceptance Criteria**:
- [ ] File `frontend/src/components/TaskList.tsx` exists
- [ ] Component accepts `tasks: Task[]` prop
- [ ] Renders task list as cards/rows with:
  - Task title (prominent)
  - Task description (if present)
  - Completion status (checkbox or badge)
  - Created/updated timestamp
  - Edit and delete buttons
- [ ] Uses TailwindCSS for styling
- [ ] Smooth animations for:
  - List item entrance (fade in, slide)
  - Hover state (background color change, subtle shadow)
  - Status change (completion toggle animation)
- [ ] Responsive design (mobile: single column, desktop: flexible)
- [ ] Empty state message when no tasks
- [ ] Click handlers for edit/delete/toggle (passed as props)

**Test Scenario**:
```typescript
<TaskList
  tasks={[
    {id: '1', title: 'Task 1', completed: false, ...},
    {id: '2', title: 'Task 2', completed: true, ...}
  ]}
  onEdit={(taskId) => {...}}
  onDelete={(taskId) => {...}}
  onToggle={(taskId) => {...}}
/>
```

**Files Created**: `frontend/src/components/TaskList.tsx`

---

### T4.8: Create TaskForm component (frontend)

**Story**: US2 CRUD
**Type**: Frontend UI
**Priority**: P1 (core UI for task creation/editing)
**Dependencies**: T1.4, T3.7
**Estimated**: 20 min

**Acceptance Criteria**:
- [ ] File `frontend/src/components/TaskForm.tsx` exists
- [ ] Form with fields:
  - title (required, text input, max 200 chars indicator)
  - description (optional, textarea, max 1000 chars indicator)
- [ ] Accepts optional `initialTask?: Task` prop (for edit mode)
  - If provided, form is pre-filled
  - Submit button text: "Update Task"
  - If not provided, form is empty
  - Submit button text: "Create Task"
- [ ] Validation on submit:
  - title not empty
  - title max 200 chars
  - description max 1000 if provided
  - Display error messages
- [ ] Shows loading state during submission
- [ ] On success:
  - Reset form if create mode
  - Call optional `onSuccess` callback
  - Show toast/notification
- [ ] On error:
  - Display error message
- [ ] Uses TailwindCSS
- [ ] Smooth animations for field focus, validation states

**Test Scenario**:
```typescript
// Create mode
<TaskForm onSuccess={(task) => {...}} />

// Edit mode
<TaskForm initialTask={existingTask} onSuccess={(task) => {...}} />
```

**Files Created**: `frontend/src/components/TaskForm.tsx`

---

### T4.9: Create tasks dashboard page (frontend)

**Story**: US2 CRUD
**Type**: Frontend UI
**Priority**: P1 (main authenticated page)
**Dependencies**: T1.4, T3.6, T3.7, T4.7, T4.8
**Estimated**: 25 min

**Acceptance Criteria**:
- [ ] File `frontend/src/app/(app)/tasks/page.tsx` exists
- [ ] Route accessible only when authenticated
- [ ] On load:
  - Fetch all tasks via `GET /api/{user_id}/tasks`
  - Show loading state while fetching
  - Handle errors with user message
- [ ] Display:
  - Header: "My Tasks" + logout button
  - Create task button (opens form or modal)
  - TaskList component with all tasks
  - Summary: count of completed/total tasks
- [ ] Interactions:
  - Create: TaskForm → POST → refresh list
  - Edit: TaskForm (pre-filled) → PUT → refresh
  - Delete: DELETE → refresh
  - Toggle completion: PATCH → refresh (handled in next story)
- [ ] Uses TailwindCSS
- [ ] Responsive layout
- [ ] Smooth animations on list updates

**Test Scenario**:
```typescript
// Authenticated user navigates to /app/tasks
// Page fetches and displays all tasks
// Click "Create" opens form
// Submit form creates task, list updates
```

**Files Created**: `frontend/src/app/(app)/layout.tsx`, `frontend/src/app/(app)/tasks/page.tsx`

---

### T4.10: Implement Header component with navigation

**Story**: US2 CRUD
**Type**: Frontend UI
**Priority**: P1 (navigation)
**Dependencies**: T1.4, T3.6
**Estimated**: 15 min

**Acceptance Criteria**:
- [ ] File `frontend/src/components/Header.tsx` exists
- [ ] Displays:
  - App logo/title ("AIDO Todo")
  - Current user email
  - Logout button
  - Navigation menu (if multi-page)
- [ ] Responsive design (mobile: hamburger menu, desktop: horizontal)
- [ ] Uses TailwindCSS
- [ ] Smooth animations (menu toggle, logout confirmation)
- [ ] Logout functionality:
  - Call `signOut()` via Better Auth
  - Redirect to /auth/login
  - Clear token from storage

**Test Scenario**:
```typescript
<Header />
// Renders with user email and logout button
// Click logout → calls signOut() → redirects to login
```

**Files Created**: `frontend/src/components/Header.tsx`

---

### T4.11: Integrate Header into app layout

**Story**: US2 CRUD
**Type**: Frontend Infrastructure
**Priority**: P1 (layout structure)
**Dependencies**: T4.10, T4.9
**Estimated**: 5 min

**Acceptance Criteria**:
- [ ] File `frontend/src/app/(app)/layout.tsx` includes Header component
- [ ] Header appears at top of all authenticated pages
- [ ] Main content below header
- [ ] Layout consistent across all app pages
- [ ] Responsive layout works on mobile/tablet/desktop

**Test Scenario**:
```typescript
// Layout renders Header + page content
// All authenticated pages use this layout
```

**Files Modified**: `frontend/src/app/(app)/layout.tsx`

---

## Phase 5: User Story 3 - Task Deletion (5 tasks)

Delete endpoint and cleanup operations.

### T5.1: Implement DELETE /api/{user_id}/tasks/{id} endpoint

**Story**: US3 Delete
**Type**: Backend API
**Priority**: P2 (important CRUD operation)
**Dependencies**: T2.1, T2.2, T2.4, T3.2, T2.3
**Estimated**: 10 min

**Acceptance Criteria**:
- [ ] Route handler: `DELETE /api/{user_id}/tasks/{id}`
- [ ] Requires JWT authentication
- [ ] Enforces user isolation: 403 if JWT.sub != user_id
- [ ] Finds and deletes task by id and user_id
- [ ] Returns 204 No Content on success (no response body)
- [ ] Returns 404 Not Found if:
  - Task id doesn't exist
  - Task belongs to different user
- [ ] Database constraint (cascade delete) removes task when user deleted

**Test Scenario**:
```bash
curl -X DELETE http://localhost:8000/api/user-123/tasks/task-id-123 \
  -H "Authorization: Bearer <jwt_token>"
# Should return 204 No Content

# Verify deleted:
curl -X GET http://localhost:8000/api/user-123/tasks/task-id-123 \
  -H "Authorization: Bearer <jwt_token>"
# Should return 404 Not Found
```

**Files Modified**: `backend/src/api/tasks.py`

---

### T5.2: Add delete confirmation to TaskList (frontend)

**Story**: US3 Delete
**Type**: Frontend UI
**Priority**: P2 (user experience)
**Dependencies**: T4.7
**Estimated**: 10 min

**Acceptance Criteria**:
- [ ] Update `frontend/src/components/TaskList.tsx`
- [ ] Delete button shows confirmation dialog before deleting:
  - "Are you sure you want to delete this task?"
  - Options: Cancel, Delete
- [ ] On Delete confirmation:
  - Show loading state
  - Call `DELETE /api/{user_id}/tasks/{id}`
  - Refresh task list on success
  - Show error message on failure
- [ ] Uses TailwindCSS for modal styling
- [ ] Smooth animations for modal entrance/exit

**Test Scenario**:
```typescript
// Click delete button → confirmation dialog
// Click Delete in dialog → calls API → list updates
// Click Cancel → dialog closes
```

**Files Modified**: `frontend/src/components/TaskList.tsx`

---

### T5.3: Handle deletion errors gracefully (frontend)

**Story**: US3 Delete
**Type**: Frontend UI
**Priority**: P2 (error handling)
**Dependencies**: T5.1, T5.2
**Estimated**: 10 min

**Acceptance Criteria**:
- [ ] Update task deletion error handling
- [ ] Display user-friendly error messages:
  - 404: "Task not found (may have been deleted)"
  - 403: "You don't have permission to delete this task"
  - 401: "Your session expired, please log in again"
  - Network error: "Failed to delete task, please try again"
- [ ] Error messages shown in toast/alert component
- [ ] Auto-dismiss after 5 seconds or manual close button
- [ ] Error doesn't break the UI; list remains usable

**Test Scenario**:
```typescript
// Simulate delete failure
// Error message displays
// User can retry or continue using app
```

**Files Created/Modified**: `frontend/src/components/` (toast/alert component), task list error handling

---

### T5.4: Test task deletion workflow (end-to-end)

**Story**: US3 Delete
**Type**: Testing
**Priority**: P2 (acceptance testing)
**Dependencies**: T5.1, T5.2, T5.3
**Estimated**: 15 min

**Acceptance Criteria**:
- [ ] Manual E2E test:
  1. Sign up new user
  2. Create 3 tasks
  3. Delete task #2
  4. Verify task #2 no longer appears in list
  5. Verify tasks #1 and #3 still present
  6. Refresh page → tasks persist in database
  7. Try deleting again → 404 error handled gracefully
- [ ] All test steps pass without errors
- [ ] API returns correct status codes (200 for fetch, 204 for delete, 404 on re-delete)

**Test Scenario**:
```bash
# E2E test sequence
curl -X POST /auth/signup ...  # User A
curl -X POST /api/user/tasks -d '{"title":"Task 1"}' ...
curl -X POST /api/user/tasks -d '{"title":"Task 2"}' ...
curl -X POST /api/user/tasks -d '{"title":"Task 3"}' ...
curl -X DELETE /api/user/tasks/task-2-id ...  # 204
curl -X GET /api/user/tasks ...  # Should have 2 tasks
```

**Files**: No files created; manual test report

---

### T5.5: Add cascade delete constraint to database schema

**Story**: US3 Delete
**Type**: Backend Database
**Priority**: P2 (data integrity)
**Dependencies**: T2.1, T2.2
**Estimated**: 5 min

**Acceptance Criteria**:
- [ ] Verify SQLModel Task model has cascade delete on user_id foreign key
- [ ] When a User is deleted, all their Tasks are automatically deleted
- [ ] Database constraint enforces this (ON DELETE CASCADE)
- [ ] Test: Delete user → tasks removed from database
- [ ] No orphaned tasks in database

**Test Scenario**:
```python
from backend.src.db.session import engine
from sqlmodel import Session, delete

# Delete user
session.delete(user)
session.commit()

# Verify tasks deleted
remaining_tasks = session.exec(select(Task).where(Task.user_id == user.id)).all()
assert len(remaining_tasks) == 0
```

**Files Modified**: `backend/src/models/task.py` (verify cascade delete is set)

---

## Phase 6: User Story 4 - Completion Tracking (7 tasks)

Completion status, filtering, sorting, and search.

### T6.1: Implement PATCH /api/{user_id}/tasks/{id}/complete endpoint

**Story**: US4 Completion
**Type**: Backend API
**Priority**: P2 (task lifecycle)
**Dependencies**: T2.1, T2.2, T2.4, T3.2, T2.3
**Estimated**: 10 min

**Acceptance Criteria**:
- [ ] Route handler: `PATCH /api/{user_id}/tasks/{id}/complete`
- [ ] Requires JWT authentication
- [ ] Enforces user isolation: 403 if JWT.sub != user_id
- [ ] Accepts request body: `{"completed": boolean}`
- [ ] Finds task by id and user_id
- [ ] Returns 404 if not found or belongs to different user
- [ ] Updates task.completed to requested value
- [ ] Updates updated_at timestamp
- [ ] Returns 200 OK with updated `TaskResponse`

**Test Scenario**:
```bash
# Mark as complete
curl -X PATCH http://localhost:8000/api/user-123/tasks/task-id/complete \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
# Should return 200 OK with completed: true

# Mark as incomplete
curl -X PATCH http://localhost:8000/api/user-123/tasks/task-id/complete \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"completed":false}'
# Should return 200 OK with completed: false
```

**Files Modified**: `backend/src/api/tasks.py`

---

### T6.2: Add completion toggle button to TaskList (frontend)

**Story**: US4 Completion
**Type**: Frontend UI
**Priority**: P2 (user-facing feature)
**Dependencies**: T4.7
**Estimated**: 15 min

**Acceptance Criteria**:
- [ ] Update `frontend/src/components/TaskList.tsx`
- [ ] Add checkbox or toggle button to each task:
  - Checked state = completed: true
  - Unchecked state = completed: false
- [ ] Visual distinction for completed tasks:
  - Title: strikethrough or faded
  - Background: subtle color change
  - Checkmark icon
- [ ] Click toggle:
  - Call `PATCH /api/{user_id}/tasks/{id}/complete`
  - Update local state optimistically
  - Refresh from server on response
- [ ] Shows loading state during request
- [ ] Error handling: revert toggle if request fails
- [ ] Smooth animation when toggling

**Test Scenario**:
```typescript
// Click checkbox → immediate visual feedback
// API called in background
// List reflects new state
```

**Files Modified**: `frontend/src/components/TaskList.tsx`

---

### T6.3: Add task filtering by status (frontend)

**Story**: US4 Completion
**Type**: Frontend UI
**Priority**: P2 (task management)
**Dependencies**: T4.9, T4.7
**Estimated**: 15 min

**Acceptance Criteria**:
- [ ] Update `frontend/src/app/(app)/tasks/page.tsx`
- [ ] Add filter buttons/dropdown with options:
  - "All Tasks" (all, regardless of completion)
  - "Completed" (where completed = true)
  - "Incomplete" (where completed = false)
- [ ] Default filter: "All Tasks"
- [ ] Filter applied client-side (filter fetched data, not new API call)
- [ ] Smooth transition when switching filters
- [ ] Active filter highlighted/styled
- [ ] Task count reflects current filter

**Test Scenario**:
```typescript
// Page shows 5 tasks total
// Click "Completed" → shows 2 completed tasks
// Click "Incomplete" → shows 3 incomplete tasks
// Click "All Tasks" → shows 5 tasks
```

**Files Modified**: `frontend/src/app/(app)/tasks/page.tsx`

---

### T6.4: Add task sorting by date/status (frontend)

**Story**: US4 Completion
**Type**: Frontend UI
**Priority**: P2 (task management)
**Dependencies**: T4.7, T4.9
**Estimated**: 15 min

**Acceptance Criteria**:
- [ ] Update `frontend/src/components/TaskList.tsx` and tasks page
- [ ] Add sort options:
  - "Newest First" (created_at descending) - DEFAULT
  - "Oldest First" (created_at ascending)
  - "Completed First" (completed: true first)
  - "Incomplete First" (completed: false first)
- [ ] Sort applied client-side
- [ ] Can combine with filter (e.g., "Incomplete tasks, oldest first")
- [ ] Smooth transition when changing sort
- [ ] Current sort option indicated/highlighted

**Test Scenario**:
```typescript
// Create tasks at different times
// Sort "Newest First" → shows newest at top
// Sort "Oldest First" → shows oldest at top
// Sort "Completed First" → shows completed first
```

**Files Modified**: `frontend/src/components/TaskList.tsx`, `frontend/src/app/(app)/tasks/page.tsx`

---

### T6.5: Add task search by title/description (frontend)

**Story**: US4 Completion
**Type**: Frontend UI
**Priority**: P2 (task discovery)
**Dependencies**: T4.7, T4.9
**Estimated**: 15 min

**Acceptance Criteria**:
- [ ] Create or update `frontend/src/components/SearchBar.tsx`
- [ ] Search input field with placeholder "Search tasks..."
- [ ] Real-time search (filter as user types):
  - Search text compared against title and description (case-insensitive)
  - Match if text appears anywhere in title or description
  - Empty search shows all tasks
- [ ] Smooth animation on match (highlight or visual feedback)
- [ ] Clear button (X) to reset search
- [ ] Works in combination with filter and sort
- [ ] Fast performance (debounced if needed)

**Test Scenario**:
```typescript
// Search field in task page
// Type "milk" → shows only tasks with "milk" in title/description
// Type "grocer" → shows tasks with "grocer"
// Clear search → all tasks shown again
```

**Files Created/Modified**: `frontend/src/components/SearchBar.tsx`, `frontend/src/app/(app)/tasks/page.tsx`

---

### T6.6: Add completion count summary (frontend)

**Story**: US4 Completion
**Type**: Frontend UI
**Priority**: P2 (progress tracking)
**Dependencies**: T4.9, T6.2
**Estimated**: 10 min

**Acceptance Criteria**:
- [ ] Update `frontend/src/app/(app)/tasks/page.tsx`
- [ ] Display summary at top of task list:
  - "X of Y tasks completed"
  - Progress bar showing completed/total (visual percentage)
- [ ] Summary updates when task completion status changes
- [ ] Visual styling:
  - Progress bar color: green when >50% done, yellow when 25-50%, red when <25%
  - Smooth animation when progress changes
- [ ] Shows 0 of 0 if no tasks
- [ ] Clear, accessible text

**Test Scenario**:
```typescript
// 3 tasks total, 1 completed
// Summary shows "1 of 3 tasks completed"
// Progress bar at ~33%
// Mark second task complete
// Summary shows "2 of 3 tasks completed"
// Progress bar at ~66%, color changes
```

**Files Modified**: `frontend/src/app/(app)/tasks/page.tsx`

---

### T6.7: Test completion tracking workflow (end-to-end)

**Story**: US4 Completion
**Type**: Testing
**Priority**: P2 (acceptance testing)
**Dependencies**: T6.1, T6.2, T6.3, T6.4, T6.5, T6.6
**Estimated**: 20 min

**Acceptance Criteria**:
- [ ] Manual E2E test:
  1. Sign up new user
  2. Create 5 tasks
  3. Mark tasks #1, #3, #5 as complete
  4. Filter "Completed" → shows tasks #1, #3, #5
  5. Filter "Incomplete" → shows tasks #2, #4
  6. Sort "Completed First" → completed tasks at top
  7. Search "grocery" → shows only matching tasks
  8. Verify summary: "3 of 5 tasks completed"
  9. Mark all tasks complete → summary shows "5 of 5"
  10. Refresh page → state persists
- [ ] All interactions work smoothly
- [ ] No console errors
- [ ] API calls correct (PATCH to completion endpoint)

**Test Scenario**:
```bash
# E2E workflow
# Sign up, create 5 tasks
# Toggle completion on 3 tasks
# Filter and sort combinations
# Verify summary updates
# Refresh page → state persists
```

**Files**: No files created; manual test report

---

## Phase 7: Polish (5 tasks)

Error handling, UI refinement, performance validation, and final checks.

### T7.1: Implement comprehensive error handling (frontend)

**Story**: Polish
**Type**: Frontend Error Handling
**Priority**: P1 (user experience)
**Dependencies**: T4.9, T5.2, T6.1
**Estimated**: 20 min

**Acceptance Criteria**:
- [ ] Create or update `frontend/src/components/Toast.tsx` (notification component)
- [ ] Error toast shows for all API failures:
  - 400 Bad Request: "Invalid input. Please check your entries."
  - 401 Unauthorized: "Your session expired. Please log in again." → redirect to login
  - 403 Forbidden: "You don't have permission to perform this action."
  - 404 Not Found: "Task not found. It may have been deleted."
  - 500 Internal Server Error: "Server error. Please try again later."
  - Network error: "No connection. Please check your internet."
- [ ] Success toast for:
  - Task created
  - Task updated
  - Task deleted
  - Task completion toggled
- [ ] Toast auto-dismisses after 5 seconds or manual close
- [ ] Multiple toasts stack (max 3 visible)
- [ ] Smooth animations (fade in/out)
- [ ] Accessible (ARIA roles, keyboard dismissible)

**Test Scenario**:
```typescript
// Simulate 401 error
// Toast shows "Your session expired. Please log in again."
// Click toast or wait 5s → toast disappears
// On redirect to login → user can re-authenticate
```

**Files Created/Modified**: `frontend/src/components/Toast.tsx`, error handling throughout frontend

---

### T7.2: Add loading states and spinners (frontend)

**Story**: Polish
**Type**: Frontend UI
**Priority**: P2 (user feedback)
**Dependencies**: T4.9, T5.2, T6.2
**Estimated**: 15 min

**Acceptance Criteria**:
- [ ] Add loading indicators for:
  - Page load (fetching tasks)
  - Creating task (form submission)
  - Updating task (form submission)
  - Deleting task (confirmation → deletion)
  - Toggling completion (checkbox)
  - Filter/sort/search changes
- [ ] Loading state shows:
  - Spinner/skeleton components (TailwindCSS animate-spin or skeleton)
  - Disabled buttons during request
  - Clear loading text for accessibility
- [ ] Removes loading state on success or error
- [ ] No false loading states (requests complete)
- [ ] Smooth animation transitions

**Test Scenario**:
```typescript
// Click "Create Task" → spinner shows
// Form submission → spinner on button
// Response returns → spinner removed
```

**Files Modified**: `frontend/src/components/`, task pages

---

### T7.3: Implement form validation and feedback (frontend)

**Story**: Polish
**Type**: Frontend UI
**Priority**: P2 (user guidance)
**Dependencies**: T4.8, T4.9
**Estimated**: 15 min

**Acceptance Criteria**:
- [ ] Update `frontend/src/components/TaskForm.tsx`
- [ ] Real-time validation feedback:
  - Title field: shows "required" error if empty on blur
  - Title field: shows length indicator (e.g., "180/200 characters")
  - Description field: shows length indicator (e.g., "450/1000 characters")
- [ ] Error states styled (red border, error text)
- [ ] Success states styled (green border or checkmark)
- [ ] Validation prevents form submission if invalid
- [ ] Error messages clear and actionable:
  - "Title is required"
  - "Title must be at most 200 characters"
  - "Description must be at most 1000 characters"
- [ ] Smooth animation on validation state changes

**Test Scenario**:
```typescript
// Type in title field → character counter updates
// Try submitting empty form → error shows
// Enter 250 chars → error "too long" shows
// Fix errors → error disappears
```

**Files Modified**: `frontend/src/components/TaskForm.tsx`

---

### T7.4: Verify authentication flow and security (backend)

**Story**: Polish
**Type**: Backend Security Testing
**Priority**: P1 (security)
**Dependencies**: T3.1, T3.3, T3.4, T3.5, T2.3
**Estimated**: 20 min

**Acceptance Criteria**:
- [ ] Manual security tests:
  1. **Signup with weak password** (e.g., "weak") → 400 Bad Request
  2. **Signup with duplicate email** → 400 Bad Request
  3. **Login with wrong password** → 401 Unauthorized
  4. **Access protected endpoint without token** → 401 Unauthorized
  5. **Access protected endpoint with invalid/expired token** → 401 Unauthorized
  6. **Access another user's tasks (403 test)**:
     - User A signs up, creates tasks
     - User B signs up, obtains their JWT
     - User B tries `GET /api/{UserA_ID}/tasks` with User B's JWT
     - Should return 403 Forbidden
  7. **Password not stored in plaintext**: Verify database stores password_hash (bcrypt)
  8. **JWT_SECRET not exposed**: Verify not hardcoded in code
  9. **CORS configured**: Frontend can call backend
  10. **Token expiration**: Create token with 1-second expiry, wait, try to use → 401
- [ ] All tests pass

**Test Scenario**:
```bash
# Test weak password
curl -X POST /auth/signup -d '{"email":"user@example.com","password":"weak"}'
# Should return 400

# Test duplicate email
# (signup twice with same email)
# Second signup should return 400

# Test 403 Forbidden
# User B JWT for User A's tasks
curl -X GET /api/{UserA_ID}/tasks \
  -H "Authorization: Bearer {UserB_JWT}"
# Should return 403
```

**Files**: No files created; test results documented

---

### T7.5: Performance validation and optimization

**Story**: Polish
**Type**: Testing & Optimization
**Priority**: P2 (performance)
**Dependencies**: All tasks
**Estimated**: 20 min

**Acceptance Criteria**:
- [ ] Performance benchmarks:
  1. **API latency**:
     - GET /api/{user_id}/tasks: p95 < 500ms
     - POST /api/{user_id}/tasks: p95 < 500ms
     - All other endpoints: p95 < 500ms
  2. **Frontend performance**:
     - Page load time: < 3 seconds
     - Task list render: < 1 second
     - Search/filter/sort: instant (< 100ms)
     - Animations: smooth 60 fps
  3. **Concurrent users**:
     - System handles 100 concurrent authenticated users without degradation
     - No database connection pool exhaustion
  4. **Database optimization**:
     - Task list queries use indexes (user_id, created_at)
     - No N+1 queries (verify SQLModel eager loading if needed)
- [ ] Measurement tools: curl for timing, Chrome DevTools for frontend, ab/wrk for load testing
- [ ] All benchmarks met

**Test Scenario**:
```bash
# Measure API latency
time curl -X GET http://localhost:8000/api/user-123/tasks \
  -H "Authorization: Bearer <jwt_token>"

# Load test (100 concurrent)
ab -n 1000 -c 100 -H "Authorization: Bearer <jwt_token>" \
  http://localhost:8000/api/user-123/tasks

# Chrome DevTools: check frontend load time and animations
```

**Files**: No files created; performance report documented

---

## Task Checklist Format Validation

All tasks follow format:
```
- [ ] [TaskID] [Priority] [Story] Description with explicit acceptance criteria
       Dependencies listed
       Estimated time provided
       Test scenario included
       Files created/modified specified
```

Example: `T1.1: Create backend/ project structure`
- ✅ Task ID (T1.1)
- ✅ Priority (P0)
- ✅ Story (Setup)
- ✅ Explicit acceptance criteria (✓ checks)
- ✅ Dependencies (None)
- ✅ Estimated time (5 min)
- ✅ Test scenario provided
- ✅ Files specified

---

## Parallel Execution Opportunities

### Sprint 1: Foundation + Auth
- **Phase 1**: T1.1-T1.4 sequential (setup)
- **Phase 2**: T2.1-T2.6 sequential (foundational)
- **Phase 3**: T3.1-T3.9 (can parallelize T3.1-T3.2 backend setup with T3.6-T3.7 frontend auth)

### Sprint 2: API & UI
- **Phase 4**: T4.1-T4.11 (can parallelize backend T4.2-T4.5 with frontend T4.7-T4.11)
- **Phase 5**: T5.1-T5.5 (can parallelize with Phase 6)
- **Phase 6**: T6.1-T6.7 (can parallelize with Phase 5)

### Sprint 3: Polish
- **Phase 7**: T7.1-T7.5 sequential (integration & validation)

**Ideal Team Allocation**:
- Backend Developer: Phases 1-2, 3.1-3.5, 4.1-4.6, 5.1, 5.5, 6.1, 7.4
- Frontend Developer: Phases 1-2, 3.6-3.9, 4.7-4.11, 5.2-5.3, 6.2-6.6, 7.1-7.3
- QA/DevOps: 7.5, end-to-end testing (4-4, 5-4, 6-7)

---

## MVP Scope Definition

**Minimum Viable Product** (19 core tasks = ~2-3 days):

### Phase 1: Setup (4 tasks)
- T1.1-T1.4: Environment & dependencies

### Phase 2: Foundational (6 tasks)
- T2.1-T2.6: Models, middleware, config

### Phase 3: Authentication (9 tasks)
- T3.1-T3.9: Signup, login, logout, auth UI

### Phase 4 (Partial): CRUD Create & Read (6 tasks)
- T4.1: Schemas
- T4.2: GET /api/{user_id}/tasks
- T4.3: POST /api/{user_id}/tasks
- T4.4: GET /api/{user_id}/tasks/{id}
- T4.7: TaskList component
- T4.8: TaskForm component
- T4.9: Dashboard page

**MVP Deliverables**:
- ✅ Users can sign up, login, logout
- ✅ Users can create tasks
- ✅ Users can view all tasks
- ✅ Users can view single task
- ✅ Frontend UI with auth flow + task display
- ❌ Update/delete/completion tracking (Phase 4+)
- ❌ Filtering/sorting/search (Phase 6)

**Full Scope** (47 tasks = ~1 week):
- Adds T4.5-T4.11 (update + navigation)
- Adds Phase 5 (delete)
- Adds Phase 6 (completion tracking)
- Adds Phase 7 (polish)

---

## Next Steps

1. **Review & Approve** this tasks.md
2. **Select Execution Path**:
   - MVP only: Execute Phases 1-3, then 4.1-4.9 (19 tasks)
   - Full scope: Execute all 47 tasks in order
3. **Allocate Team**:
   - 1 backend dev + 1 frontend dev + 1 QA (recommended)
   - Or single developer executing sequentially
4. **Execute Tasks**:
   - Start Phase 1 (sequential setup)
   - Parallelize Phases 4-6 for speed
   - Polish Phase 7 at end
5. **Track Progress**:
   - Mark tasks complete as work finishes
   - Update PHR/ADR if new decisions emerge
   - Create GitHub issues from this tasks.md if desired

---

## Files & Artifacts

**Total Files to Create**: ~35 files (backend + frontend + tests)

**Backend Structure**:
- `backend/` (root)
- `backend/src/models/{user.py, task.py}`
- `backend/src/api/{auth.py, tasks.py}`
- `backend/src/security/{jwt.py, password.py}`
- `backend/src/schemas/{auth.py, task.py}`
- `backend/src/db/session.py`
- `backend/src/main.py`
- `backend/requirements.txt`, `.env.example`, `.gitignore`

**Frontend Structure**:
- `frontend/` (root)
- `frontend/src/app/(auth)/{signup,login}/page.tsx`
- `frontend/src/app/(app)/{layout.tsx, tasks/page.tsx}`
- `frontend/src/components/{Header.tsx, TaskForm.tsx, TaskList.tsx, SearchBar.tsx, Toast.tsx}`
- `frontend/src/lib/{auth.ts, api.ts}`
- `frontend/src/types/auth.ts`
- `frontend/package.json`, `tsconfig.json`, `next.config.js`, `.env.local.example`, `.gitignore`

---

## Testing Strategy

- **Backend**: Manual curl/postman tests for each endpoint (deferred to Phase 3)
- **Frontend**: Manual browser tests + visual regression checks
- **E2E**: Full signup → login → CRUD → logout workflow
- **Performance**: Load testing (100 concurrent users, p95 <500ms latency)
- **Security**: JWT expiration, user isolation (403 tests), password hashing verification

---

**Task Generation Complete** ✅

This tasks.md file provides:
- ✅ 47 concrete, independently-testable tasks
- ✅ Organized into 7 execution phases
- ✅ Mapped to 4 user stories (P1 & P2)
- ✅ Clear acceptance criteria for each task
- ✅ Estimated times and dependencies
- ✅ Test scenarios for validation
- ✅ Parallel execution opportunities identified
- ✅ MVP scope definition (19 core tasks)
- ✅ File structure explicitly specified
- ✅ No unrelated responsibilities combined
- ✅ SQLModel ORM emphasized throughout
- ✅ Context7-validated best practices followed
- ✅ Latest stable versions enforced

Ready for execution! 🚀
