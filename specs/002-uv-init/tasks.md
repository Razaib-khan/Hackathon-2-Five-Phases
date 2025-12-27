---
description: "Task list for UV Package Manager Initialization"
---

# Tasks: UV Package Manager Initialization

**Input**: Design documents from `/specs/002-uv-init/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, quickstart.md

**Tests**: Tests are NOT requested in the feature specification. Tasks include only implementation work.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: Configuration files at repository root
- Paths shown below use single project structure per plan.md

## Phase 1: User Story 1 - Project Configuration (Priority: P1) 🎯 MVP

**Goal**: Set up UV as the package manager with proper configuration files and virtual environment support

**Independent Test**: Run configuration file creation tasks, then execute `uv sync` to verify virtual environment creation and `uv add requests` to verify dependency management works

### Implementation for User Story 1

- [ ] T001 [US1] Create pyproject.toml file at repository root with PEP 621 metadata (name: "hackathon-ii-todo", version: "0.1.0", requires-python: ">=3.11", empty dependencies array) per research.md configuration design (FR-001, FR-005, FR-006)
- [ ] T002 [US1] Create .python-version file at repository root containing "3.11" to specify Python version requirement per plan.md design (FR-002)
- [ ] T003 [US1] Update .gitignore file at repository root to add UV-specific patterns: .venv/, uv.lock, __pypackages__/ per research.md .gitignore patterns (FR-007)
- [ ] T004 [US1] Run `uv sync` to create .venv/ virtual environment and verify it's created successfully in project root (FR-003)
- [ ] T005 [US1] Verify `uv add --help` command works to confirm dependency management is functional (FR-005)
- [ ] T006 [US1] Verify configuration by checking pyproject.toml exists, .python-version exists, and .venv/ directory exists

**Checkpoint**: At this point, User Story 1 should be fully functional - UV is configured and ready for use

---

## Phase 2: User Story 2 - Existing Code Integration (Priority: P2)

**Goal**: Ensure existing CLI Todo application code remains functional after UV initialization

**Independent Test**: Run existing `python3 src/todo.py --help` and verify it works, then run via `uv run python src/todo.py --help` and verify identical behavior

### Implementation for User Story 2

- [ ] T007 [US2] Verify existing src/ directory structure is unchanged - no modifications to task.py, task_manager.py, cli_parser.py, todo.py (FR-004, SC-005)
- [ ] T008 [US2] Test direct Python execution by running `python3 src/todo.py --help` and verify it displays help without errors (FR-008)
- [ ] T009 [US2] Test direct Python execution by running `python3 src/todo.py create "Test task" --description "Verify functionality"` and `python3 src/todo.py list` to verify CRUD operations work (FR-008, SC-002)
- [ ] T010 [US2] Test UV-managed execution by running `uv run python src/todo.py --help` and verify identical output to direct execution (FR-008)
- [ ] T011 [US2] Test UV-managed execution by running `uv run python src/todo.py create "Test task UV" --description "Via UV"` and `uv run python src/todo.py list` to verify CRUD operations work (FR-008, SC-002)
- [ ] T012 [US2] Verify pyproject.toml dependencies array is empty (no unnecessary dependencies added) (FR-004)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - UV is configured and existing code is unaffected

---

## Phase 3: User Story 3 - Development Workflow Documentation (Priority: P3)

**Goal**: Provide clear documentation on how to use UV for common development tasks

**Independent Test**: Follow the documented workflow steps in README.md to install dependencies, run the application, and add a dependency

### Implementation for User Story 3

- [ ] T013 [P] [US3] Create or update README.md at repository root to include UV setup instructions: link to quickstart.md and brief overview of UV usage (FR-009)
- [ ] T014 [P] [US3] Verify quickstart.md exists in specs/002-uv-init/ directory with complete UV workflow documentation (already created in planning phase, just verify) (FR-009, SC-006)
- [ ] T015 [US3] Add section to README.md documenting how to run the application: both `python3 src/todo.py <command>` and `uv run python src/todo.py <command>` methods (FR-009)
- [ ] T016 [US3] Add section to README.md documenting how to add dependencies: `uv add <package>` command and explain it updates pyproject.toml (FR-009, SC-006)
- [ ] T017 [US3] Add section to README.md documenting initial setup for new developers: clone, `uv sync`, run application (FR-009, SC-004)
- [ ] T018 [US3] Add troubleshooting section to README.md covering: UV not installed, Python version mismatch, virtual environment issues (FR-009)
- [ ] T019 [US3] Verify documentation completeness by following all documented steps as if new developer and confirming they work (SC-006)

**Checkpoint**: All user stories should now be independently functional - UV configured, existing code working, documentation complete

---

## Phase 4: Validation & Polish

**Purpose**: Final validation that all requirements and success criteria are met

- [ ] T020 [P] Verify all functional requirements FR-001 through FR-009 are implemented
- [ ] T021 [P] Verify pyproject.toml structure matches research.md configuration design (name, version, requires-python >=3.11, dependencies[], hatchling build backend)
- [ ] T022 [P] Verify .python-version contains "3.11"
- [ ] T023 [P] Verify .gitignore contains UV patterns: .venv/, uv.lock, __pypackages__/
- [ ] T024 Test complete workflow per quickstart.md: `uv sync` → run application → add dependency (if desired) → verify
- [ ] T025 Verify success criteria SC-001 through SC-006: initialization speed, zero code changes, dependency operations speed, setup time, documentation clarity
- [ ] T026 Run git status to confirm src/ files are unchanged and only new files are pyproject.toml, .python-version, .gitignore updates, README.md updates

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Story 1 (Phase 1)**: No dependencies - can start immediately (MVP)
- **User Story 2 (Phase 2)**: Depends on User Story 1 completion (need UV configured first)
- **User Story 3 (Phase 3)**: Depends on User Story 1 completion (need UV working to document)
- **Validation (Phase 4)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - MVP)**: Independent - creates UV configuration from scratch
- **User Story 2 (P2)**: Depends on US1 - needs UV configured to test integration
- **User Story 3 (P3)**: Depends on US1 - needs UV working to document workflows

### Within Each User Story

**User Story 1 (Project Configuration)**:
- T001, T002, T003 can run in parallel (different files)
- T004 depends on T001, T002 (needs pyproject.toml and .python-version)
- T005, T006 depend on T004 (needs .venv created)

**User Story 2 (Existing Code Integration)**:
- T007 can run first (just verification, no dependencies)
- T008, T009, T010, T011, T012 can run in parallel (independent tests)

**User Story 3 (Development Workflow Documentation)**:
- T013, T014 can run in parallel (different documentation concerns)
- T015, T016, T017, T018 depend on T013 (need README.md to exist)
- T019 depends on all previous documentation tasks

**Validation (Phase 4)**:
- T020, T021, T022, T023 can run in parallel (independent checks)
- T024, T025, T026 should run sequentially after T020-T023

### Parallel Opportunities

**Within User Story 1**:
- T001, T002, T003 (create different files)

**Within User Story 2**:
- T008, T009, T010, T011, T012 (independent test executions)

**Within User Story 3**:
- T013, T014 (different documentation files)

**Within Validation**:
- T020, T021, T022, T023 (independent verification checks)

---

## Parallel Example: User Story 1

```bash
# Launch file creation tasks in parallel:
Task: "T001 - Create pyproject.toml"
Task: "T002 - Create .python-version"
Task: "T003 - Update .gitignore"

# After files created, run sequentially:
Task: "T004 - Run uv sync to create venv"
Task: "T005 - Verify uv add works"
Task: "T006 - Verify configuration"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: User Story 1 (T001-T006)
2. **STOP and VALIDATE**: Run `uv sync`, verify .venv created, test `uv add --help`
3. Ready for use as minimal viable UV setup

### Incremental Delivery

1. Add User Story 1 → Test independently → **MVP Delivered! (UV configured)**
2. Add User Story 2 → Test independently → Code integration verified
3. Add User Story 3 → Test independently → Documentation complete
4. Complete Validation phase → Production ready

### Parallel Team Strategy

With multiple developers (recommended):

1. Developer A: User Story 1 (T001-T006) - **MUST COMPLETE FIRST (blocking)**
2. Once US1 done, split work:
   - Developer B: User Story 2 (T007-T012)
   - Developer C: User Story 3 (T013-T019)
3. Team collaborates on Validation phase (T020-T026)

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each user story completion
- Stop at any checkpoint to validate story independently
- **No tests included**: Tests not requested in spec; focus is on configuration and documentation only
- **No code modifications**: FR-004 and SC-005 enforce zero changes to src/ files
- Avoid: modifying existing source code, adding unnecessary dependencies, custom UV configurations

---

## Task Count Summary

- **Total Tasks**: 26
- **User Story 1 (P1 - MVP)**: 6 tasks
- **User Story 2 (P2)**: 6 tasks
- **User Story 3 (P3)**: 7 tasks
- **Validation Phase**: 7 tasks

**Parallel Opportunities**: 9 tasks can run in parallel within their phases

**MVP Scope**: User Story 1 (6 tasks) delivers independently testable UV configuration
