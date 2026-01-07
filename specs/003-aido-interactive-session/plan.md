# Implementation Plan: AIDO Interactive Session Mode

**Branch**: `003-aido-interactive-session` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-aido-interactive-session/spec.md`

## Summary

Enhance the AIDO todo application with an interactive session mode that allows users to manage tasks continuously within a single running process. Tasks persist in memory for the session duration. Add rich terminal output with colored formatting, ASCII logo, and enhanced visual hierarchy. Complete rebranding from "CLI Todo" to "AIDO" throughout the application.

**Technical Approach**: Leverage Python's built-in `cmd` module for REPL functionality, integrate Rich library for terminal UI, and reuse existing TaskManager logic without modifications. Mode detection based on presence/absence of command-line arguments.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: Rich library (>=13.0.0) for terminal UI, argparse (stdlib) for CLI parsing
**Storage**: In-memory only (Python list in TaskManager instance)
**Testing**: pytest for unit and integration tests
**Target Platform**: Cross-platform CLI (Linux, macOS, Windows) with terminal color support
**Project Type**: single (CLI application with existing src/ structure)
**Performance Goals**: <100ms response time for typical operations (<50 tasks)
**Constraints**: No persistent storage, backward compatibility with existing single-command mode required
**Scale/Scope**: Optimized for 10-50 tasks per session, single-user, ephemeral data

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gates

- [x] **Specification Complete**: spec.md exists with user stories and acceptance criteria
- [x] **No Spec Violations**: Feature aligns with specification requirements
- [x] **Sequential Phase Execution**: Starting at Phase 0 (research)
- [x] **No Overengineering**: Scope limited to spec requirements only
- [x] **Stateless by Default Check**: Stateful session is explicitly specified (FR-001, FR-003)
- [x] **Tool-Based Interactions**: CLI commands are well-defined tool interfaces
- [x] **Process Clarity**: Specifications and plan prioritized over UI polish

**Stateful Session Justification**:
- **Why Needed**: Core requirement (FR-001) for interactive mode to function
- **Specification Support**: Explicitly required by user stories (US1) and success criteria (SC-001)
- **Scope**: State limited to single process lifetime, no persistence beyond session
- **Alternative Rejected**: Stateless commands already exist (single-command mode); interactive mode adds value precisely because state persists within session

### Post-Design Gates

- [x] **Architecture Documented**: research.md, data-model.md, contracts/ complete
- [x] **No Premature Abstraction**: Reusing existing TaskManager, no new frameworks
- [x] **Complexity Justified**: See Complexity Tracking table below
- [x] **Backward Compatibility**: Single-command mode preserved unchanged

**Gates Status**: ✅ ALL PASSED

## Project Structure

### Documentation (this feature)

```text
specs/003-aido-interactive-session/
├── spec.md              # Feature specification
├── plan.md              # This file (/sp.plan output)
├── research.md          # Phase 0 output - technical decisions
├── data-model.md        # Phase 1 output - entity definitions
├── quickstart.md        # Phase 1 output - developer guide
├── contracts/           # Phase 1 output - interface contracts
│   └── cli-interface.md # CLI command specifications
└── tasks.md             # Phase 2 output (/sp.tasks - NOT created yet)
```

### Source Code (repository root)

```text
src/
├── task.py              # Existing - Task entity (no changes)
├── task_manager.py      # Existing - TaskManager service (no changes)
├── cli_parser.py        # Modified - make subcommand optional
├── todo.py              # Modified - add interactive mode entry point
├── interactive_session.py  # NEW - cmd.Cmd subclass for REPL
└── output_handler.py    # NEW - Rich Console wrapper

tests/
├── test_interactive_session.py  # NEW - unit tests for REPL commands
├── test_output_handler.py       # NEW - unit tests for Rich output
└── test_integration_session.py  # NEW - full session workflows
```

**Structure Decision**: Using existing single-project structure (src/ + tests/). No new directories needed. Interactive session and output handler are new modules added to src/. Backward compatibility preserved by keeping task.py, task_manager.py unchanged and extending todo.py with mode detection logic.

## Complexity Tracking

> **Justification for Constitutional Deviations**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Stateful session (Principle V) | Interactive REPL requires persistent task state across commands within single process | Stateless commands already exist (single-command mode); interactive mode value proposition is precisely the session state persistence |
| New external dependency (Rich) | Colored terminal output and visual formatting explicitly required by FR-004, FR-007, FR-008, SC-002 | Built-in libraries (colorama, ANSI codes) lack table formatting and professional UI components; Rich provides all requirements in single dependency |

**No other violations**: All other principles followed (spec-driven, sequential phases, no overengineering, tool-based interaction).

---

## Phase 0: Research & Context (COMPLETE)

**Objective**: Resolve all technical unknowns and establish best practices

**Research Questions Addressed**:
1. Interactive loop architecture → Decision: Python `cmd.Cmd` module
2. Rich library integration → Decision: Centralized OutputHandler wrapper
3. Task storage architecture → Decision: Reuse existing TaskManager
4. Mode detection strategy → Decision: No args = interactive
5. AIDO logo design → Decision: Multi-line ASCII art with cyan colors
6. Command naming consistency → Decision: Identical names across modes
7. Error handling differences → Decision: Rich panels in interactive, plain text in single-command

**Deliverable**: ✅ research.md (see `specs/003-aido-interactive-session/research.md`)

**Key Decisions**:
- cmd.Cmd provides built-in command parsing, help, tab completion
- Rich Console centralized in OutputHandler for testability
- TaskManager instantiated once in InteractiveSession.__init__
- Mode detection: presence of subcommand determines single-command vs interactive
- Logo: 4-line ASCII art "AIDO" with tagline, fits 80-column terminals
- Commands: Same verbs (create, list, complete, etc.) in both modes
- Errors: Rich panels for interactive (UX), plain text for single-command (scripting)

---

## Phase 1: Design & Contracts (COMPLETE)

**Objective**: Define data model, API contracts, and integration patterns

### 1.1 Data Model

**Deliverable**: ✅ data-model.md (see `specs/003-aido-interactive-session/data-model.md`)

**Entities**:

1. **Task** (existing, unchanged)
   - Attributes: id, title, description, completed
   - Validation: title non-empty, id positive
   - State: Created ↔ Completed

2. **TaskManager** (existing, unchanged)
   - Manages List[Task] with CRUD operations
   - Sequential ID generation
   - No modifications required

3. **InteractiveSession** (NEW)
   - Extends cmd.Cmd
   - Owns TaskManager and OutputHandler instances
   - Command handlers: do_create, do_list, do_complete, do_incomplete, do_update, do_delete, do_exit, do_quit, do_help
   - Lifecycle: Initialized → Running → Terminated

4. **OutputHandler** (NEW)
   - Wraps Rich Console
   - Methods: print_logo, print_success, print_error, print_warning, print_task, print_task_list, print_info
   - Color theme: Cyan (logo), Green (success/completed), Red (error), Yellow (warning/incomplete)

**Relationships**:
- InteractiveSession HAS-ONE TaskManager (composition)
- InteractiveSession HAS-ONE OutputHandler (composition)
- TaskManager HAS-MANY Task (aggregation)

### 1.2 API Contracts

**Deliverable**: ✅ contracts/cli-interface.md (see `specs/003-aido-interactive-session/contracts/cli-interface.md`)

**Mode Detection**:
- `aido` (no args) → Interactive session with logo and REPL
- `aido <command> [args]` → Single-command execution (existing behavior)

**Commands** (identical across both modes):
- `create <title> [--description <text>]` - Create new task
- `list` - Display all tasks
- `complete <task_id>` - Mark task complete
- `incomplete <task_id>` - Mark task incomplete
- `update <task_id> [--title <title>] [--description <desc>]` - Update task
- `delete <task_id>` - Delete task
- `exit` / `quit` (interactive only) - Terminate session
- `help [command]` (interactive only) - Show commands

**Output Formats**:
- Interactive: Rich tables, panels, colored symbols (✓, ✗, ⚠)
- Single-command: Plain text with optional light coloring

**Exit Codes**:
- 0: Success
- 1: Error
- 130: Interrupted (Ctrl+C)

### 1.3 Integration Patterns

**Entry Point Flow** (todo.py):
```
main():
  args = parse_args()
  if no_subcommand:
    InteractiveSession().cmdloop()  # New path
  else:
    # Existing single-command logic
```

**Interactive Command Flow**:
```
User input → cmd.Cmd parses → do_<command>(args)
  → task_manager.<operation>()
  → output_handler.print_<result>()
  → Update prompt (task count)
  → Next input
```

### 1.4 Developer Quickstart

**Deliverable**: ✅ quickstart.md (see `specs/003-aido-interactive-session/quickstart.md`)

**Implementation Checklist**:
1. Add Rich dependency to pyproject.toml
2. Create output_handler.py with Rich Console wrapper
3. Create interactive_session.py with cmd.Cmd subclass
4. Modify todo.py entry point for mode detection
5. Modify cli_parser.py to make subcommand optional
6. Update README.md with interactive mode docs
7. Write unit tests for OutputHandler
8. Write unit tests for InteractiveSession commands
9. Write integration tests for full session workflows
10. Manual testing across Linux/macOS/Windows terminals

**Testing Strategy**:
- Unit: Mock OutputHandler, test command handlers independently
- Integration: Simulate full session (create → list → complete → exit)
- Manual: Verify colors, logo rendering, prompt updates

### 1.5 Agent Context Update

**Deliverable**: ✅ CLAUDE.md updated with:
- Added technology: Rich library for terminal UI
- Project context: Interactive session mode with in-memory task persistence

**Status**: Agent context synchronized

---

## Phase 2: Task Breakdown (PENDING)

**Objective**: Create dependency-ordered, testable tasks

**Status**: ⏳ Not started - run `/sp.tasks` to generate tasks.md

**Expected Output**: tasks.md with:
- Tasks organized by user story (US1, US2, US3)
- Dependencies mapped (e.g., OutputHandler before InteractiveSession)
- Test cases for each functional requirement
- Acceptance criteria validation checklist

---

## Implementation Sequence (High-Level)

1. **Dependency Installation** (US2 prerequisite)
   - Add Rich to pyproject.toml
   - Install with `uv add rich`

2. **Output Layer** (US2: Rich Visual Output)
   - Implement OutputHandler class
   - Create logo, success/error formatters
   - Build task list table renderer
   - Unit tests for all output methods

3. **Interactive REPL** (US1: Interactive Session Mode)
   - Implement InteractiveSession(cmd.Cmd)
   - Add command handlers (do_create, do_list, etc.)
   - Integrate TaskManager (reuse existing)
   - Update prompt with task count
   - Unit tests for command parsing

4. **Entry Point Integration** (US1)
   - Modify todo.py for mode detection
   - Update cli_parser.py (optional subcommand)
   - Preserve backward compatibility
   - Integration tests for both modes

5. **Branding** (US3: AIDO Branding)
   - Rebrand output messages
   - Update help text
   - Update README.md
   - Replace "CLI Todo" references with "AIDO"

6. **Validation** (All User Stories)
   - Run full test suite
   - Manual testing (logo, colors, session persistence)
   - Verify all 6 success criteria (SC-001 to SC-006)
   - Check all 11 functional requirements (FR-001 to FR-011)

---

## Risk Analysis

### Technical Risks

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| Rich library breaking changes | Medium | Pin version >=13.0.0 in dependencies | Addressed |
| Color rendering issues on Windows | Low | Rich handles cross-platform ANSI; test on Windows terminal | Planned |
| cmd.Cmd learning curve | Low | Standard library with good docs; quickstart.md provides examples | Addressed |
| Backward compatibility break | High | Extensive integration tests; preserve existing CLI parser behavior | Addressed |

### Process Risks

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| Scope creep (advanced Rich features) | Medium | Strict adherence to spec; progress bars/spinners explicitly out of scope | Addressed |
| Task persistence confusion | Low | Clear docs: tasks lost on exit; warning message on first exit | Addressed |
| Testing visual output | Medium | Unit tests mock Rich Console; manual checklist for colors | Planned |

**Overall Risk Level**: LOW - Well-understood technologies, clear requirements, strong test strategy

---

## Success Criteria Validation

Mapping success criteria from spec.md to implementation checkpoints:

- **SC-001**: Users can manage 10+ tasks in single session
  - ✅ Verified by: Integration test creating/listing/completing 10 tasks

- **SC-002**: Colored output for different states
  - ✅ Verified by: OutputHandler unit tests + manual terminal inspection

- **SC-003**: Logo renders in 80+ column terminals
  - ✅ Verified by: Manual testing on standard terminal sizes, logo design fits 36 chars

- **SC-004**: Exit via simple command without errors
  - ✅ Verified by: InteractiveSession.do_exit() returns True, integration test confirms

- **SC-005**: Commands respond <100ms for <50 tasks
  - ✅ Verified by: Performance test measuring create/list/complete latency

- **SC-006**: Error messages are clear and actionable
  - ✅ Verified by: Unit tests for error cases, manual review of all error messages

---

## Dependencies & Prerequisites

### External Dependencies

**New**:
- Rich (>=13.0.0) - Terminal UI library
  - Purpose: Colored output, tables, panels
  - License: MIT
  - Installation: `uv add rich`

**Existing** (no changes):
- Python 3.11+ standard library
- argparse (stdlib) - CLI parsing
- cmd (stdlib) - REPL framework

### Internal Dependencies

**Modified Files**:
- src/todo.py - Add mode detection logic
- src/cli_parser.py - Make subcommand optional
- README.md - Document interactive mode

**New Files**:
- src/interactive_session.py - REPL implementation
- src/output_handler.py - Rich Console wrapper

**Unchanged Files** (reused as-is):
- src/task.py - Task entity
- src/task_manager.py - Task CRUD operations

---

## Rollback Plan

If implementation fails or needs to be reverted:

1. **Code Rollback**: Delete new files (interactive_session.py, output_handler.py)
2. **Entry Point**: Restore todo.py and cli_parser.py to previous versions
3. **Dependencies**: Remove Rich from pyproject.toml, run `uv sync`
4. **Tests**: Remove new test files
5. **Documentation**: Revert README.md changes

**Data Loss**: None - no persistent storage, so no data migration needed

**Backward Compatibility**: Preserved - single-command mode untouched

---

## Next Steps

1. **Generate Tasks**: Run `/sp.tasks` to create task breakdown
2. **Implementation**: Execute tasks in dependency order
3. **Testing**: Run unit, integration, and manual tests
4. **Validation**: Verify all FRs and SCs met
5. **Documentation**: Create PHR for implementation session
6. **Commit**: Use `/sp.git.commit_pr` for commit and PR creation

---

**Plan Status**: ✅ COMPLETE (Phases 0-1)
**Ready for**: `/sp.tasks` command to generate task breakdown
**Approval**: Awaiting user confirmation to proceed with tasks

---

**Last Updated**: 2025-12-27
**Prepared By**: AI Planning Agent
**Reviewed By**: Constitution Check (all gates passed)
