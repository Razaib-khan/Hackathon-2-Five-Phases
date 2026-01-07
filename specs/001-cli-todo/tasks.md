---

description: "Task list for CLI Todo Application implementation"
---

# Tasks: CLI Todo Application

**Input**: Design documents from `/specs/001-cli-todo/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/, quickstart.md

**Tests**: Tests are NOT requested in the feature specification. Tasks include only implementation work.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below use single project structure per plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project directory structure (src/, tests/)
- [x] T002 [P] Create empty src/todo.py file as main CLI entry point
- [x] T003 [P] Create empty src/task.py file for Task model
- [x] T004 [P] Create empty src/task_manager.py file for TaskManager
- [x] T005 [P] Create empty src/cli_parser.py file for argument parsing

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Implement Task model as dataclass in src/task.py with attributes: id (int), title (str), description (str), completed (bool)
- [x] T007 Implement TaskManager class initialization in src/task_manager.py with empty task list and ID counter
- [x] T008 Implement ID generation logic in TaskManager (auto-increment starting from 1, never reuse)
- [x] T009 Implement CLI argument parser setup in src/cli_parser.py using argparse with subcommand structure
- [x] T010 Implement main entry point in src/todo.py to initialize TaskManager and call CLI parser

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and View Tasks (Priority: P1) 🎯 MVP

**Goal**: Enable users to create tasks with title/description and view them in a list

**Independent Test**: Run application, create tasks with `python src/todo.py create "title"`, list with `python src/todo.py list`, verify tasks appear in creation order

### Implementation for User Story 1

- [x] T011 [P] [US1] Implement title validation in TaskManager: strip whitespace, check non-empty, check ≤200 chars (FR-001, FR-011, FR-012)
- [x] T012 [P] [US1] Implement description validation in TaskManager: check ≤1000 chars if provided (FR-002, FR-012)
- [x] T013 [US1] Implement create_task method in src/task_manager.py: validate title/description, assign next ID, create Task, append to list, return success (FR-001, FR-002, FR-003)
- [x] T014 [US1] Implement list_tasks method in src/task_manager.py: return tasks in creation order (FR-004, FR-005)
- [x] T015 [US1] Implement format_task_list helper in src/task_manager.py: format each task as "ID [✓/  ] Title - Description" (clarification: display format)
- [x] T016 [US1] Implement 'create' subcommand in src/cli_parser.py: add title argument (required) and --description option
- [x] T017 [US1] Implement 'list' subcommand in src/cli_parser.py: no arguments needed
- [x] T018 [US1] Wire 'create' command in src/todo.py: call TaskManager.create_task, handle validation errors, print success message
- [x] T019 [US1] Wire 'list' command in src/todo.py: call TaskManager.list_tasks, format output, handle empty list case ("No tasks found")
- [x] T020 [US1] Implement error handling in src/todo.py for 'create' command: catch validation errors, print to stderr, exit code 1 (FR-013)
- [x] T021 [US1] Implement error handling in src/todo.py for 'list' command: handle empty list, exit code 0

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Mark Tasks Complete (Priority: P2)

**Goal**: Enable users to mark tasks as complete or incomplete to track progress

**Independent Test**: Create a task, mark it complete with `python src/todo.py complete <id>`, list tasks to verify status shows [✓], then mark incomplete

### Implementation for User Story 2

- [x] T022 [P] [US2] Implement find_task_by_id method in src/task_manager.py: search list for task with given ID, return task or None
- [x] T023 [US2] Implement mark_complete method in src/task_manager.py: find task by ID, set completed=True, return success or error (FR-006)
- [x] T024 [US2] Implement mark_incomplete method in src/task_manager.py: find task by ID, set completed=False, return success or error (FR-007)
- [x] T025 [P] [US2] Implement 'complete' subcommand in src/cli_parser.py: add id argument (required, positive integer)
- [x] T026 [P] [US2] Implement 'incomplete' subcommand in src/cli_parser.py: add id argument (required, positive integer)
- [x] T027 [US2] Wire 'complete' command in src/todo.py: call TaskManager.mark_complete, handle task not found error, print success message
- [x] T028 [US2] Wire 'incomplete' command in src/todo.py: call TaskManager.mark_incomplete, handle task not found error, print success message
- [x] T029 [US2] Update format_task_list in src/task_manager.py to display [✓] for completed tasks and [ ] for incomplete (clarification: status format)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Update Task Details (Priority: P3)

**Goal**: Enable users to update task title and/or description to correct mistakes or add information

**Independent Test**: Create a task, update title with `python src/todo.py update <id> --title "new"`, list to verify change, then update description

### Implementation for User Story 3

- [x] T030 [US3] Implement update_task method in src/task_manager.py: find task by ID, validate new values if provided, update title and/or description (partial updates allowed per clarification), return success or error (FR-008, FR-009, FR-011, FR-012)
- [x] T031 [US3] Implement 'update' subcommand in src/cli_parser.py: add id argument (required), --title option, --description option (at least one required)
- [x] T032 [US3] Wire 'update' command in src/todo.py: call TaskManager.update_task with provided fields, handle validation errors and task not found, print success message
- [x] T033 [US3] Implement error handling in src/todo.py for 'update' command: handle empty title, title too long, description too long, task not found (FR-013)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Delete Tasks (Priority: P4)

**Goal**: Enable users to delete tasks they no longer need for list organization

**Independent Test**: Create tasks, delete one with `python src/todo.py delete <id>`, list to verify it's removed

### Implementation for User Story 4

- [x] T034 [US4] Implement delete_task method in src/task_manager.py: find task by ID, remove from list, return success or error (FR-010)
- [x] T035 [US4] Implement 'delete' subcommand in src/cli_parser.py: add id argument (required, positive integer)
- [x] T036 [US4] Wire 'delete' command in src/todo.py: call TaskManager.delete_task, handle task not found error, print success message
- [x] T037 [US4] Implement error handling in src/todo.py for 'delete' command: handle task not found, invalid ID format (FR-013)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [x] T038 [P] Add input validation for ID format in src/cli_parser.py: reject negative numbers, non-numeric input with "Invalid task ID" error
- [x] T039 [P] Add whitespace stripping in title/description validation across all commands in src/task_manager.py
- [x] T040 Verify all error messages match spec requirements (FR-013): "Task not found: {id}", "Title is required", "Title too long", "Description too long"
- [x] T041 Add --help support for all commands in src/cli_parser.py using argparse built-in help
- [x] T042 Verify exit codes: 0 for success, 1 for all error conditions across all commands in src/todo.py
- [x] T043 Test complete workflow per quickstart.md: create → list → complete → update → delete → list
- [x] T044 Verify all acceptance scenarios from spec.md User Stories 1-4 (17 total scenarios)
- [x] T045 Verify all functional requirements FR-001 through FR-016 are implemented
- [x] T046 Verify all success criteria SC-001 through SC-006 are met

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Reuses find_task_by_id but otherwise independent
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Reuses find_task_by_id but otherwise independent
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Reuses find_task_by_id but otherwise independent

**Note**: All user stories depend on Foundational phase but are otherwise independent of each other

### Within Each User Story

**User Story 1 (Create and View)**:
- T011, T012 can run in parallel (independent validation functions)
- T013 depends on T011, T012 (uses validation)
- T014, T015 can run after T013
- T016, T017 can run in parallel (independent CLI commands)
- T018-T021 depend on corresponding TaskManager methods and CLI commands

**User Story 2 (Mark Complete)**:
- T022 is foundational for this story (find by ID)
- T023, T024 depend on T022
- T025, T026 can run in parallel (independent CLI commands)
- T027, T028 depend on T023, T024, T025, T026
- T029 can run in parallel with T027, T028 (independent formatting update)

**User Story 3 (Update)**:
- T030 is the core update logic
- T031 is the CLI command
- T032, T033 depend on T030, T031

**User Story 4 (Delete)**:
- T034 is the core delete logic
- T035 is the CLI command
- T036, T037 depend on T034, T035

### Parallel Opportunities

**Within Foundational Phase**:
- T002, T003, T004, T005 (create files) can all run in parallel
- T006, T007 can run in parallel (independent components)
- T009 can run in parallel with T006, T007

**Within User Story 1**:
- T011, T012 (validation functions) can run in parallel
- T016, T017 (CLI commands) can run in parallel

**Within User Story 2**:
- T025, T026 (CLI commands) can run in parallel
- T023, T024 (TaskManager methods) can run in parallel
- T029 (formatting) can run in parallel with T027, T028

**Within User Story 3**:
- All tasks are sequential (update logic is cohesive)

**Within User Story 4**:
- All tasks are sequential (delete logic is cohesive)

**Across User Stories** (once Foundational is complete):
- All user stories (Phase 3, 4, 5, 6) can start in parallel if team capacity allows
- Each story is independently testable

---

## Parallel Example: User Story 1

```bash
# Launch validation tasks in parallel:
Task: "T011 - Implement title validation in TaskManager"
Task: "T012 - Implement description validation in TaskManager"

# After validation complete, launch CLI commands in parallel:
Task: "T016 - Implement 'create' subcommand"
Task: "T017 - Implement 'list' subcommand"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T010) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T011-T021)
4. **STOP and VALIDATE**: Test User Story 1 independently per acceptance scenarios
5. Ready for demo/use as minimal viable todo app

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **MVP Delivered!**
3. Add User Story 2 → Test independently → Progress tracking enabled
4. Add User Story 3 → Test independently → Task editing enabled
5. Add User Story 4 → Test independently → Full CRUD complete
6. Complete Polish phase → Production ready

### Parallel Team Strategy

With multiple developers (after Foundational phase complete):

1. Team completes Setup + Foundational together (T001-T010)
2. Once Foundational is done, split work:
   - Developer A: User Story 1 (T011-T021)
   - Developer B: User Story 2 (T022-T029)
   - Developer C: User Story 3 (T030-T033)
   - Developer D: User Story 4 (T034-T037)
3. Stories complete and integrate independently
4. Team collaborates on Polish phase (T038-T046)

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **No tests included**: Tests not requested in spec; focus is on implementation only
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Count Summary

- **Total Tasks**: 46
- **Setup Phase**: 5 tasks
- **Foundational Phase**: 5 tasks (BLOCKS all user stories)
- **User Story 1 (P1 - MVP)**: 11 tasks
- **User Story 2 (P2)**: 8 tasks
- **User Story 3 (P3)**: 4 tasks
- **User Story 4 (P4)**: 4 tasks
- **Polish Phase**: 9 tasks

**Parallel Opportunities**: 11 tasks marked [P] can run in parallel within their phase

**MVP Scope**: Phases 1-3 (21 tasks total) delivers independently testable todo app
