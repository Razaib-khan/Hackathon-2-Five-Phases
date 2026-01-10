---
description: "Task list for AIDO full-stack todo application implementation"
---

# Tasks: AIDO - Full-Stack Todo Application

**Input**: Design documents from `/specs/001-fullstack-todo-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume web app structure - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend project structure with FastAPI in backend/src/
- [X] T002 Create frontend project structure with Next.js in frontend/src/
- [X] T003 [P] Initialize Python project with uv in backend/
- [X] T004 [P] Initialize TypeScript project with Next.js 16.1.1 in frontend/
- [X] T005 [P] Configure linting and formatting tools for both backend and frontend

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Setup database schema and migrations framework using Neon Serverless PostgreSQL in backend/src/database/
- [X] T007 [P] Implement authentication framework with Better Auth in backend/src/auth/
- [X] T008 [P] Setup API routing and middleware structure in backend/src/api/
- [X] T009 Create base models/entities that all stories depend on in backend/src/models/
- [X] T010 Configure error handling and logging infrastructure in backend/src/utils/
- [X] T011 Setup environment configuration management in backend/src/config/
- [X] T012 [P] Setup email service integration for password reset in backend/src/services/email_service.py
- [X] T013 Configure CORS and security middleware for frontend/backend integration

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration and Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable new users to register for an account, sign in, and securely manage their login credentials

**Independent Test**: Can be fully tested by registering a new user account and successfully signing in, delivering the core capability to access the application.

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T014 [P] [US1] Contract test for /auth/register endpoint in backend/tests/contract/test_auth_contract.py
- [ ] T015 [P] [US1] Contract test for /auth/login endpoint in backend/tests/contract/test_auth_contract.py
- [ ] T016 [P] [US1] Integration test for user registration flow in backend/tests/integration/test_auth_flow.py

### Implementation for User Story 1

- [ ] T017 [P] [US1] Create User model in backend/src/models/user.py
- [ ] T018 [P] [US1] Create Session model in backend/src/models/session.py
- [X] T019 [US1] Implement UserService in backend/src/services/auth_service.py
- [X] T020 [US1] Implement Auth router endpoints in backend/src/api/auth_router.py
- [X] T021 [US1] Create User registration UI component in frontend/src/components/auth/RegisterForm.tsx
- [X] T022 [US1] Create User login UI component in frontend/src/components/auth/LoginForm.tsx
- [X] T023 [US1] Implement auth API service in frontend/src/lib/api.ts
- [X] T024 [US1] Add validation and error handling for auth forms
- [X] T025 [US1] Add authentication state management in frontend/src/hooks/useAuth.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Personal Task Management (Priority: P1)

**Goal**: Enable authenticated users to create, view, update, and delete their personal tasks with priority levels

**Independent Test**: Can be fully tested by creating, viewing, updating, and deleting tasks as an authenticated user, delivering the primary value proposition of the application.

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T026 [P] [US2] Contract test for /tasks endpoints in backend/tests/contract/test_tasks_contract.py
- [ ] T027 [P] [US2] Integration test for task management flow in backend/tests/integration/test_tasks_flow.py

### Implementation for User Story 2

- [X] T028 [P] [US2] Create Task model in backend/src/models/task.py
- [X] T029 [US2] Implement TaskService in backend/src/services/task_service.py
- [X] T030 [US2] Implement Tasks router endpoints in backend/src/api/task_router.py
- [X] T031 [US2] Create Task CRUD UI components in frontend/src/components/tasks/
- [X] T032 [US2] Implement task API integration in frontend/src/lib/api.ts
- [X] T033 [US2] Add priority filtering and sorting in frontend
- [X] T034 [US2] Add user isolation logic in backend services to ensure only own tasks are accessible
- [X] T035 [US2] Implement frontend dashboard with task management features

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Password Reset (Priority: P2)

**Goal**: Enable returning users who forgot their password to securely reset their password via email

**Independent Test**: Can be fully tested by initiating password reset, receiving reset instructions, and successfully changing the password.

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T036 [P] [US3] Contract test for /auth/forgot-password endpoint in backend/tests/contract/test_password_reset_contract.py
- [ ] T037 [P] [US3] Contract test for /auth/reset-password endpoint in backend/tests/contract/test_password_reset_contract.py
- [ ] T038 [P] [US3] Integration test for password reset flow in backend/tests/integration/test_password_reset_flow.py

### Implementation for User Story 3

- [X] T039 [P] [US3] Create PasswordResetToken model in backend/src/models/password_reset_token.py
- [X] T040 [US3] Extend UserService with password reset functionality in backend/src/services/auth_service.py
- [X] T041 [US3] Implement password reset endpoints in backend/src/api/auth_router.py
- [X] T042 [US3] Create Forgot Password UI component in frontend/src/components/auth/ForgotPasswordForm.tsx
- [X] T043 [US3] Create Reset Password UI component in frontend/src/components/auth/ResetPasswordForm.tsx
- [X] T044 [US3] Add password reset email sending logic in backend/src/services/email_service.py
- [X] T045 [US3] Implement 10-minute token expiration validation in backend
- [X] T046 [US3] Add token usage tracking (single-use) in backend

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T047 [P] Documentation updates in docs/README.md
- [X] T048 Code cleanup and refactoring based on all completed stories
- [X] T049 [P] Add comprehensive unit tests in backend/tests/unit/ and frontend/tests/
- [X] T050 Add security hardening measures across all endpoints
- [X] T051 Run quickstart.md validation to ensure smooth setup process
- [X] T052 Implement 7-day session timeout functionality
- [X] T053 Add permanent task deletion (no recovery option) as specified
- [X] T054 Add comprehensive error handling and validation across all endpoints
- [X] T055 Add logging for user actions and system events

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on User Story 1 for authentication
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on User Story 1 for user system

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for /auth/register endpoint in backend/tests/contract/test_auth_contract.py"
Task: "Contract test for /auth/login endpoint in backend/tests/contract/test_auth_contract.py"

# Launch all models for User Story 1 together:
Task: "Create User model in backend/src/models/user.py"
Task: "Create Session model in backend/src/models/session.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence