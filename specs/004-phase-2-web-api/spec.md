# Feature Specification: Phase 2 - Web API with Authentication

**Feature Branch**: `004-phase-2-web-api`
**Created**: 2025-12-31
**Status**: Draft
**Input**: User description: "Specify Phase 2 of the AIDO Todo application. Phase 2 extends AIDO to web architecture using frontend/ + backend/ with Next.js 16+, FastAPI, SQLModel ORM, Neon PostgreSQL, and Better Auth for JWT-based authentication."

## Assumptions

This specification makes the following reasonable assumptions based on Phase 1 context and user requirements:

- **Single-tenant per user**: Each authenticated user can only access their own tasks (strict user isolation)
- **Database schema**: Tasks include id, user_id, title, description, completed, created_at, updated_at; Users table manages authentication state
- **Stateless backend**: All requests validated via JWT; no session storage required
- **Error responses**: Standard HTTP status codes (400, 401, 403, 404, 500) with JSON error bodies
- **Pagination**: Not required for initial implementation; assume reasonable list sizes
- **Task limits**: No hard limit on tasks per user (reasonable soft limits via database)
- **Time zones**: UTC timestamps; frontend handles user timezone display
- **Concurrency**: Optimistic locking not required; last-write-wins for concurrent updates

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Authentication & Session Management (Priority: P1)

As a user, I want to sign up with email/password and securely log in so that only I can access my tasks.

**Why this priority**: Authentication is the foundation for user isolation and data security. Without this, the system cannot enforce per-user data access. This is the critical dependency for all other features.

**Independent Test**: Can be fully tested by: (1) signing up with email/password via frontend, (2) logging in and receiving a valid JWT token, (3) using the token to access protected API endpoints, (4) logging out and verifying the token is invalidated. Delivers core security and user identity functionality.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user, **When** they submit signup with email "user@example.com" and password "SecurePass123!", **Then** an account is created and they receive a JWT token
2. **Given** a registered user, **When** they log in with correct email and password, **Then** they receive a valid JWT token that includes their user_id
3. **Given** a registered user with valid JWT, **When** they include the token in request headers, **Then** the API authenticates them and allows access to protected endpoints
4. **Given** a user with an invalid or expired JWT, **When** they attempt to access protected endpoints, **Then** they receive a 401 Unauthorized response
5. **Given** an authenticated user, **When** they attempt to access another user's tasks (different user_id in path), **Then** they receive a 403 Forbidden response
6. **Given** a user who logs out, **When** they attempt to use their old JWT token, **Then** the API rejects the token with 401 Unauthorized

---

### User Story 2 - Create, Read, Update Tasks (Priority: P1)

As an authenticated user, I want to create tasks with title and description, view my tasks, and update them so that I can manage my todo list.

**Why this priority**: This is the core MVP value. Combined with P1 authentication, users can create and manage their own tasks. The CRUD operations form the essential task management workflow.

**Independent Test**: Can be fully tested by: (1) creating a task via POST /api/{user_id}/tasks, (2) retrieving it via GET /api/{user_id}/tasks and GET /api/{user_id}/tasks/{id}, (3) updating it via PUT /api/{user_id}/tasks/{id}, (4) verifying changes persist. Delivers immediate task management value.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they POST to /api/{user_id}/tasks with title "Buy groceries", **Then** a task is created with 201 Created response and includes id, title, completed (false), created_at, updated_at
2. **Given** an authenticated user, **When** they POST with title "Buy groceries" and description "Milk, eggs, bread", **Then** both fields are stored and returned
3. **Given** a user with 3 tasks, **When** they GET /api/{user_id}/tasks, **Then** all 3 tasks are returned as JSON array with full details
4. **Given** a user with task id=5, **When** they GET /api/{user_id}/tasks/5, **Then** the task details are returned as a single JSON object
5. **Given** a user with task id=5, **When** they PUT with updated title "Buy groceries and cook", **Then** the task is updated and returns 200 OK with updated data
6. **Given** a user with task id=5, **When** they PUT with description only (not changing title), **Then** title remains unchanged and description is updated
7. **Given** a user attempting to access another user's task, **When** they GET /api/{user_id}/tasks/{id} with mismatched user_id, **Then** they receive 403 Forbidden

---

### User Story 3 - Delete Tasks (Priority: P2)

As an authenticated user, I want to delete tasks I no longer need so that my list stays organized.

**Why this priority**: Essential CRUD operation but less critical than create/read/update. Users can work around deletion by ignoring old tasks, but deletion is needed for list cleanliness and data management.

**Independent Test**: Can be fully tested by creating a task, deleting it via DELETE /api/{user_id}/tasks/{id}, and verifying it no longer appears in GET /api/{user_id}/tasks. Delivers list cleanup value.

**Acceptance Scenarios**:

1. **Given** a user with task id=5, **When** they DELETE /api/{user_id}/tasks/5, **Then** the task is deleted and returns 204 No Content
2. **Given** a user with task id=5, **When** they GET /api/{user_id}/tasks/5 after deletion, **Then** they receive 404 Not Found
3. **Given** a user attempting to delete another user's task, **When** they DELETE with mismatched user_id, **Then** they receive 403 Forbidden
4. **Given** a user, **When** they DELETE a non-existent task id=999, **Then** they receive 404 Not Found

---

### User Story 4 - Task Completion Tracking (Priority: P2)

As an authenticated user, I want to mark tasks as complete or incomplete so that I can track my progress.

**Why this priority**: Important for task lifecycle management. Depends on task creation (P1) but can be implemented independently once tasks exist.

**Independent Test**: Can be fully tested by creating a task, marking it complete via PATCH /api/{user_id}/tasks/{id}/complete, verifying status in GET requests, then unmarking it. Delivers progress tracking value.

**Acceptance Scenarios**:

1. **Given** a user with incomplete task id=5, **When** they PATCH /api/{user_id}/tasks/5/complete with completed=true, **Then** the task is marked complete and returns 200 OK
2. **Given** a user with complete task id=5, **When** they PATCH /api/{user_id}/tasks/5/complete with completed=false, **Then** the task is marked incomplete
3. **Given** a user, **When** they GET /api/{user_id}/tasks, **Then** completed status is clearly visible for each task (boolean field)
4. **Given** a user attempting to update another user's task, **When** they PATCH with mismatched user_id, **Then** they receive 403 Forbidden

---

### Edge Cases

- What happens when a user tries to create a task with an empty title? → Return 400 Bad Request with error message
- What happens when a user provides an invalid JWT? → Return 401 Unauthorized
- What happens when JWT expires during a request? → Return 401 Unauthorized with error indicating token expiration
- What happens when a user tries to access a task that doesn't exist? → Return 404 Not Found
- What happens when multiple requests update the same task concurrently? → Last-write-wins; no conflict resolution required
- What happens when a request body is malformed JSON? → Return 400 Bad Request
- What happens if the database is temporarily unavailable? → Return 500 Internal Server Error with generic message
- What happens when user_id in JWT doesn't match user_id in request path? → Return 403 Forbidden

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & Authorization

- **FR-001**: System MUST allow users to sign up with email and password via Better Auth integration
- **FR-002**: System MUST validate email format and password strength (minimum 8 characters, at least one uppercase, one lowercase, one number)
- **FR-003**: System MUST issue JWT tokens to authenticated users that include user_id, email, and token expiration
- **FR-004**: System MUST verify JWT tokens on all protected API endpoints and reject invalid/expired tokens with 401 status
- **FR-005**: System MUST enforce user isolation: users can only access tasks associated with their user_id (403 Forbidden if mismatched)
- **FR-006**: System MUST allow users to log out, invalidating their session

#### Task Management API

- **FR-007**: System MUST support GET /api/{user_id}/tasks to retrieve all tasks for authenticated user (200 OK, returns JSON array)
- **FR-008**: System MUST support POST /api/{user_id}/tasks to create a new task with required title and optional description (201 Created, returns created task with id, timestamps)
- **FR-009**: System MUST support GET /api/{user_id}/tasks/{id} to retrieve a single task (200 OK or 404 Not Found)
- **FR-010**: System MUST support PUT /api/{user_id}/tasks/{id} to fully or partially update a task's title and/or description (200 OK, returns updated task)
- **FR-011**: System MUST support DELETE /api/{user_id}/tasks/{id} to delete a task (204 No Content)
- **FR-012**: System MUST support PATCH /api/{user_id}/tasks/{id}/complete to toggle task completion status (200 OK, returns updated task)

#### Data Management

- **FR-013**: System MUST persist all task data in Neon PostgreSQL database
- **FR-014**: System MUST use SQLModel ORM to map tasks to database schema with User ↔ Task relationships
- **FR-015**: System MUST store tasks with fields: id (UUID), user_id (UUID), title (string, max 200), description (string, max 1000, nullable), completed (boolean), created_at (timestamp), updated_at (timestamp)
- **FR-016**: System MUST enforce database constraints: user_id references Users table (foreign key), title is NOT NULL, completed defaults to false

#### Frontend UI/UX

- **FR-017**: System MUST provide responsive UI in Next.js that works on desktop, tablet, and mobile browsers
- **FR-018**: System MUST implement smooth animations and transitions for task operations (create, update, delete, toggle completion)
- **FR-019**: System MUST implement task filtering (by status: all, completed, incomplete)
- **FR-020**: System MUST implement task sorting (by creation date, due date, or completion status)
- **FR-021**: System MUST implement search functionality to filter tasks by title/description text
- **FR-022**: System MUST use a consistent, modern color palette throughout the application
- **FR-023**: System MUST provide visual feedback for task status (checkmarks for completed, clear visual distinction)
- **FR-024**: System MUST provide clear error messages to users (auth failures, validation errors, network failures)

#### Error Handling & Validation

- **FR-025**: System MUST validate request bodies and return 400 Bad Request with specific error messages for invalid input
- **FR-026**: System MUST return 401 Unauthorized for missing or invalid JWT tokens
- **FR-027**: System MUST return 403 Forbidden when user attempts to access another user's data
- **FR-028**: System MUST return 404 Not Found for non-existent resources
- **FR-029**: System MUST return 500 Internal Server Error with generic message for unexpected server errors (never leak implementation details)
- **FR-030**: System MUST handle database errors gracefully and return appropriate HTTP status codes

### Key Entities

- **User**: Represents an authenticated application user with id (UUID), email (string, unique), password_hash (string), created_at (timestamp)
- **Task**: Represents a todo item with id (UUID), user_id (foreign key to User), title (string), description (string, nullable), completed (boolean), created_at (timestamp), updated_at (timestamp)
- **JWT Token**: Contains user_id, email, issued_at, expires_at; verified by FastAPI middleware on protected routes

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the full signup → login → create task → view task → update task → mark complete workflow in under 5 minutes using the web UI
- **SC-002**: API responds to all requests in under 500ms (p95 latency) under normal load
- **SC-003**: System handles 100 concurrent authenticated users without performance degradation
- **SC-004**: 100% of API endpoints enforce user isolation (no unauthorized cross-user access)
- **SC-005**: All task data persists correctly across server restarts and database reconnections
- **SC-006**: Frontend renders without layout shifts or janky animations on Chrome, Firefox, and Safari (desktop and mobile)
- **SC-007**: Users successfully complete basic CRUD operations (create, read, update, delete) on first attempt 95% of the time without requiring help documentation

### Definition of Done

- All user stories (P1 & P2) have passing acceptance tests
- API endpoints documented with request/response examples
- Database schema created and migrations tested
- Frontend components render correctly on desktop and mobile
- Authentication flow tested end-to-end (signup, login, token use, logout)
- User isolation verified: no user can access another user's tasks
- Error cases tested: invalid input, missing auth, expired tokens, non-existent resources
- Code follows project constitution standards for quality and security

## API Endpoint Specifications

### Request/Response Formats

All API responses use JSON with consistent error format:

**Error Response**:
```json
{
  "error": "Error description",
  "status": 400,
  "timestamp": "2025-12-31T12:00:00Z"
}
```

### GET /api/{user_id}/tasks

**Authentication**: Required (JWT)
**Authorization**: user_id in JWT must match user_id in path

**Response** (200 OK):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2025-12-31T10:00:00Z",
    "updated_at": "2025-12-31T10:00:00Z"
  }
]
```

**Error Cases**:
- 401 Unauthorized: Missing or invalid JWT
- 403 Forbidden: user_id mismatch

---

### POST /api/{user_id}/tasks

**Authentication**: Required (JWT)
**Authorization**: user_id in JWT must match user_id in path

**Request Body**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2025-12-31T10:00:00Z",
  "updated_at": "2025-12-31T10:00:00Z"
}
```

**Error Cases**:
- 400 Bad Request: Missing title, title empty, description exceeds 1000 chars
- 401 Unauthorized: Missing or invalid JWT
- 403 Forbidden: user_id mismatch

---

### GET /api/{user_id}/tasks/{id}

**Authentication**: Required (JWT)
**Authorization**: user_id in JWT must match user_id in path

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2025-12-31T10:00:00Z",
  "updated_at": "2025-12-31T10:00:00Z"
}
```

**Error Cases**:
- 401 Unauthorized: Missing or invalid JWT
- 403 Forbidden: user_id mismatch or task belongs to different user
- 404 Not Found: Task id doesn't exist

---

### PUT /api/{user_id}/tasks/{id}

**Authentication**: Required (JWT)
**Authorization**: user_id in JWT must match user_id in path

**Request Body** (at least one field required):
```json
{
  "title": "Updated title",
  "description": "Updated description"
}
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Updated title",
  "description": "Updated description",
  "completed": false,
  "created_at": "2025-12-31T10:00:00Z",
  "updated_at": "2025-12-31T10:05:00Z"
}
```

**Error Cases**:
- 400 Bad Request: Both title and description missing, title empty if provided
- 401 Unauthorized: Missing or invalid JWT
- 403 Forbidden: user_id mismatch or task belongs to different user
- 404 Not Found: Task id doesn't exist

---

### DELETE /api/{user_id}/tasks/{id}

**Authentication**: Required (JWT)
**Authorization**: user_id in JWT must match user_id in path

**Response** (204 No Content): Empty body

**Error Cases**:
- 401 Unauthorized: Missing or invalid JWT
- 403 Forbidden: user_id mismatch or task belongs to different user
- 404 Not Found: Task id doesn't exist

---

### PATCH /api/{user_id}/tasks/{id}/complete

**Authentication**: Required (JWT)
**Authorization**: user_id in JWT must match user_id in path

**Request Body**:
```json
{
  "completed": true
}
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "created_at": "2025-12-31T10:00:00Z",
  "updated_at": "2025-12-31T10:05:00Z"
}
```

**Error Cases**:
- 401 Unauthorized: Missing or invalid JWT
- 403 Forbidden: user_id mismatch or task belongs to different user
- 404 Not Found: Task id doesn't exist

---

### POST /auth/signup

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Cases**:
- 400 Bad Request: Invalid email format, weak password, email already registered

---

### POST /auth/login

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Cases**:
- 400 Bad Request: Missing email or password
- 401 Unauthorized: Invalid email or password

---

### POST /auth/logout

**Authentication**: Required (JWT)

**Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

## Database Schema (SQLModel)

### User Model

```
Table: users
- id: UUID, primary key, default=uuid4()
- email: String, unique, not null, indexed
- password_hash: String, not null
- created_at: DateTime, default=datetime.utcnow(), not null
- updated_at: DateTime, default=datetime.utcnow(), onupdate=datetime.utcnow(), not null

Relationships:
- tasks: List[Task] (one-to-many, cascade delete)
```

### Task Model

```
Table: tasks
- id: UUID, primary key, default=uuid4()
- user_id: UUID, foreign key → users.id, not null, indexed
- title: String(200), not null
- description: String(1000), nullable
- completed: Boolean, default=False, not null
- created_at: DateTime, default=datetime.utcnow(), not null, indexed
- updated_at: DateTime, default=datetime.utcnow(), onupdate=datetime.utcnow(), not null

Relationships:
- user: User (many-to-one)

Indexes:
- (user_id, created_at) for efficient task list queries
```

## Technology Stack & Versions

**Frontend**:
- Next.js: 16+ with App Router
- Better Auth: Latest stable (v1.x)
- React: 19+ (bundled with Next.js 16)
- TailwindCSS: 4+ for styling
- TypeScript: 5.x

**Backend**:
- FastAPI: 0.104+
- SQLModel: 0.0.14+
- Pydantic: 2.x
- Python: 3.11+
- uvicorn: 0.24+
- PyJWT: 2.8+ for JWT handling
- bcrypt: 4.x for password hashing

**Database**:
- Neon Serverless PostgreSQL: Latest (postgres 15+)

## Acceptance Criteria Checklist

- [ ] All 4 user stories (P1 & P2) are fully implementable from this spec
- [ ] API endpoint contracts are unambiguous and include all required fields
- [ ] Database schema is normalized and supports all use cases
- [ ] Authentication model (JWT + Better Auth) is clearly defined
- [ ] User isolation enforcement is explicit for every endpoint
- [ ] Error cases are documented for each endpoint
- [ ] Success criteria are measurable and technology-agnostic
- [ ] No implementation details (specific libraries, patterns) leak into requirements
