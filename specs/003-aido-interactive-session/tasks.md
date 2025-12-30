# Task Breakdown: AIDO Interactive Session Mode

**Feature**: 003-aido-interactive-session
**Branch**: `003-aido-interactive-session`
**Created**: 2025-12-27

## Overview

This document breaks down the AIDO Interactive Session Mode feature into executable tasks organized by user story. Each user story can be implemented and tested independently, enabling incremental delivery.

**Total Tasks**: 26
**MVP Scope**: Phase 3 (User Story 1) - 6 tasks
**Full Feature**: Phases 1-6 - 26 tasks

## Implementation Strategy

**Incremental Delivery Approach**:
1. **Phase 1-2** (Setup & Foundation): 6 tasks - Prepare project for new functionality
2. **Phase 3** (US1 - MVP): 6 tasks - Core interactive mode (delivers immediate value)
3. **Phase 4** (US2): 7 tasks - Visual enhancements (builds on MVP)
4. **Phase 5** (US3): 4 tasks - Branding (independent polish)
5. **Phase 6** (Polish): 3 tasks - Cross-cutting improvements

**Parallel Execution**: Tasks marked with [P] can run in parallel with other [P] tasks in the same phase.

---

## Phase 1: Setup & Dependencies

**Goal**: Install dependencies and prepare project structure

**Tasks**:

- [x] T001 Add Rich library to pyproject.toml dependencies array (version >=13.0.0)
- [x] T002 Run `uv add rich` to install Rich library and update uv.lock
- [x] T003 Verify Rich installation with `python -c "import rich; print(rich.__version__)"`
- [x] T004 Create tests/ directory if it doesn't exist
- [x] T005 [P] Create empty src/output_handler.py file with module docstring
- [x] T006 [P] Create empty src/interactive_session.py file with module docstring

**Completion Criteria**:
- Rich library installed and importable
- Project structure ready for new modules
- All subsequent tasks can proceed

---

## Phase 2: Foundational Components

**Goal**: Build reusable OutputHandler that all user stories depend on

**Independent Test**: OutputHandler can print colored text and format messages without errors

**Tasks**:

- [x] T007 Implement OutputHandler class init with Rich Console in src/output_handler.py
- [x] T008 [P] [US2] Implement print_success() method in src/output_handler.py (green text with ✓)
- [x] T009 [P] [US2] Implement print_error() method in src/output_handler.py (red text with ✗)
- [x] T010 [P] [US2] Implement print_warning() method in src/output_handler.py (yellow text with ⚠)
- [x] T011 [P] [US2] Implement print_info() method in src/output_handler.py (default color)
- [x] T012 [US2] Implement print_task_list() method in src/output_handler.py (Rich table with colored status)

**Completion Criteria**:
- OutputHandler can format all message types
- Colors render correctly in terminal
- Ready for use by InteractiveSession

---

## Phase 3: User Story 1 - Interactive Session Mode (Priority P1) 🎯 MVP

**Story Goal**: Users can manage tasks within a single interactive session

**Independent Test**: Launch interactive mode, create 3 tasks, list them, complete one, verify all persist in session

**Acceptance Scenarios**:
1. User launches AIDO → sees welcome and prompt
2. User creates task → task stored and available for subsequent commands
3. User lists tasks → all session tasks displayed
4. User completes/updates task → changes persist within session
5. User types exit/quit → session ends gracefully

**Tasks**:

- [x] T013 [US1] Create InteractiveSession class extending cmd.Cmd in src/interactive_session.py with __init__, prompt, and intro attributes
- [x] T014 [US1] Implement do_create() command handler in src/interactive_session.py with argument parsing
- [x] T015 [US1] Implement do_list() command handler in src/interactive_session.py
- [x] T016 [P] [US1] Implement do_complete() command handler in src/interactive_session.py
- [x] T017 [P] [US1] Implement do_incomplete() command handler in src/interactive_session.py
- [x] T018 [P] [US1] Implement do_update() command handler in src/interactive_session.py
- [x] T019 [P] [US1] Implement do_delete() command handler in src/interactive_session.py
- [x] T020 [US1] Implement do_exit() and do_quit() command handlers in src/interactive_session.py (return True to terminate)
- [x] T021 [US1] Implement precmd() method in src/interactive_session.py to update prompt with task count
- [x] T022 [US1] Implement emptyline() method in src/interactive_session.py (do nothing override)
- [x] T023 [US1] Modify src/cli_parser.py to make subcommand optional (required=False in add_subparsers)
- [x] T024 [US1] Modify src/todo.py main() to detect mode: if no subcommand, launch InteractiveSession().cmdloop()

**Completion Criteria** (SC-001):
- ✅ Users can create, list, update, complete 10+ tasks in single session
- ✅ Tasks persist across commands within session
- ✅ Exit/quit terminates session without errors

**Parallel Execution Example**:
```bash
# After T015 completes, run T016, T017, T018, T019 in parallel:
Task T016: Implement do_complete()   # File: src/interactive_session.py (method 1)
Task T017: Implement do_incomplete() # File: src/interactive_session.py (method 2)
Task T018: Implement do_update()     # File: src/interactive_session.py (method 3)
Task T019: Implement do_delete()     # File: src/interactive_session.py (method 4)
# Different methods, no conflicts
```

---

## Phase 4: User Story 2 - Rich Visual Output (Priority P2)

**Story Goal**: Colorful, visually organized output for task status and feedback

**Independent Test**: Run any command and verify colored output matches spec (green=success/completed, yellow=incomplete, red=errors)

**Acceptance Scenarios**:
1. List tasks → completed tasks green, incomplete yellow
2. Create task → success message with colored formatting
3. View task details → IDs, titles, descriptions visually distinguished
4. Error occurs → red formatted error message

**Tasks**:

- [x] T025 [US2] Implement print_logo() method in src/output_handler.py with AIDO ASCII art (cyan color)
- [x] T026 [US2] Update InteractiveSession.__init__() in src/interactive_session.py to call output_handler.print_logo() on startup
- [x] T027 [US2] Update do_create() in src/interactive_session.py to use output_handler.print_success() for confirmations
- [x] T028 [P] [US2] Update do_complete/incomplete() in src/interactive_session.py to use output_handler.print_success()
- [x] T029 [P] [US2] Update do_update/delete() in src/interactive_session.py to use output_handler.print_success()
- [x] T030 [US2] Update all error handling in src/interactive_session.py to use output_handler.print_error()
- [x] T031 [US2] Update do_list() in src/interactive_session.py to use output_handler.print_task_list() with Rich table

**Completion Criteria** (SC-002, SC-005):
- ✅ All output uses colored formatting for different states
- ✅ Commands respond in <100ms for typical operations

**Parallel Execution Example**:
```bash
# After T027 completes, run T028 and T029 in parallel:
Task T028: Update complete/incomplete handlers  # Different command methods
Task T029: Update update/delete handlers        # Different command methods
```

---

## Phase 5: User Story 3 - AIDO Branding (Priority P3)

**Story Goal**: Display AIDO brand identity and rebrand all references

**Independent Test**: Launch app, verify logo displays with colors, check all help text says "AIDO" not "CLI Todo"

**Acceptance Scenarios**:
1. Launch AIDO → logo displayed prominently
2. View logo → uses colored ASCII art
3. View help → references AIDO as application name

**Tasks**:

- [x] T032 [US3] Implement do_help() override in src/interactive_session.py with Rich table formatting
- [x] T033 [P] [US3] Update all output messages in src/interactive_session.py to use "AIDO" instead of "CLI Todo"
- [x] T034 [P] [US3] Update src/cli_parser.py description to "AIDO - AI-Powered Interactive Task Manager"
- [x] T035 [US3] Update README.md with interactive mode documentation, examples, and AIDO branding

**Completion Criteria** (SC-003):
- ✅ AIDO logo displays on launch in 80+ column terminals
- ✅ All references use "AIDO" consistently

**Parallel Execution Example**:
```bash
# Run T033 and T034 in parallel:
Task T033: Rebrand interactive session messages # File: src/interactive_session.py
Task T034: Rebrand CLI parser description      # File: src/cli_parser.py
```

---

## Phase 6: Polish & Validation

**Goal**: Ensure backward compatibility, edge cases, and success criteria met

**Tasks**:

- [x] T036 Verify backward compatibility: test single-command mode (`aido create "Test"`) still works unchanged
- [x] T037 Test edge cases: invalid task IDs, empty titles, long titles (>100 chars), many tasks (50+)
- [x] T038 Validate all success criteria (SC-001 through SC-006) met with manual testing checklist

**Completion Criteria**:
- ✅ All 6 success criteria verified
- ✅ All 11 functional requirements implemented
- ✅ Backward compatibility preserved

---

## Dependencies & Execution Order

### User Story Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (OutputHandler - Foundation)
    ↓
Phase 3 (US1 - Interactive Session) ← MVP DELIVERABLE
    ↓
Phase 4 (US2 - Visual Output) ← Enhances US1
    ↓
Phase 5 (US3 - Branding) ← Independent polish
    ↓
Phase 6 (Validation)
```

### Critical Path

1. **T001-T006**: Setup (must complete before everything)
2. **T007-T012**: OutputHandler (blocking for US1, US2)
3. **T013-T024**: Interactive Session core (US1 - MVP)
4. **T025-T031**: Visual enhancements (US2 - builds on US1)
5. **T032-T035**: Branding (US3 - independent)
6. **T036-T038**: Validation (final)

### Parallel Opportunities

**Within Phase 3 (US1)**:
- T016, T017, T018, T019 can run in parallel (different command methods)

**Within Phase 4 (US2)**:
- T008, T009, T010, T011 can run in parallel (different OutputHandler methods)
- T028, T029 can run in parallel (different command method updates)

**Within Phase 5 (US3)**:
- T033, T034 can run in parallel (different files)

---

## Task Checklist Summary

**Phase 1 - Setup**: 6 tasks
**Phase 2 - Foundation**: 6 tasks (OutputHandler)
**Phase 3 - US1 (MVP)**: 12 tasks (Interactive Session)
**Phase 4 - US2**: 7 tasks (Visual Output)
**Phase 5 - US3**: 4 tasks (Branding)
**Phase 6 - Polish**: 3 tasks (Validation)

**Total**: 38 tasks
**Parallelizable**: 11 tasks marked with [P]

---

## Success Criteria Mapping

| Criterion | Verified By | Tasks |
|-----------|-------------|-------|
| SC-001: 10+ tasks in session | T038 manual test | T013-T024 |
| SC-002: Colored output | T038 manual test | T008-T012, T025-T031 |
| SC-003: Logo in 80+ cols | T038 manual test | T025-T026 |
| SC-004: Exit without errors | T038 manual test | T020 |
| SC-005: <100ms response | T038 manual test | All implementation tasks |
| SC-006: Clear error messages | T038 manual test | T030 |

---

## Implementation Notes

### File Modification Summary

**New Files**:
- src/output_handler.py (T005, T007-T012, T025)
- src/interactive_session.py (T006, T013-T024, T026-T034)

**Modified Files**:
- src/cli_parser.py (T023, T034)
- src/todo.py (T024)
- README.md (T035)
- pyproject.toml (T001)

**Unchanged Files** (reused as-is):
- src/task.py
- src/task_manager.py

### Testing Strategy

Tests are not generated as tasks (not requested in spec), but manual validation ensures:
- Each user story independently testable
- Acceptance scenarios verifiable
- Success criteria measurable
- Edge cases handled

---

**Task Breakdown Complete**: 2025-12-27
**Ready for**: `/sp.implement` to execute tasks
**MVP Path**: Phases 1-3 (24 tasks) deliver core interactive session functionality
