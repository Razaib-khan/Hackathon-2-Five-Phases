# Data Model: AIDO Interactive Session Mode

**Feature**: 003-aido-interactive-session
**Date**: 2025-12-27
**Status**: Complete

## Overview

This document defines the data structures and relationships for the AIDO interactive session mode. The existing Task and TaskManager entities remain unchanged; new entities support session management and rich output.

## Existing Entities (No Changes)

### Task

**Purpose**: Represents a single todo item

**Attributes**:
- `id`: int - Unique identifier within session
- `title`: str - Task name/description
- `description`: str - Optional detailed description
- `completed`: bool - Completion status

**Validation Rules**:
- `title` must not be empty
- `id` must be positive integer
- `completed` defaults to False

**State Transitions**:
```
[Created] --complete()--> [Completed]
[Completed] --incomplete()--> [Created]
```

**No modifications required**: Existing implementation satisfies all requirements

---

### TaskManager

**Purpose**: Manages collection of tasks with CRUD operations

**Attributes**:
- `tasks`: List[Task] - In-memory storage of all tasks
- `next_id`: int - Counter for generating unique task IDs

**Methods**:
- `create_task(title, description) -> Task`
- `get_all_tasks() -> List[Task]`
- `get_task(id) -> Task | None`
- `update_task(id, title, description) -> Task | None`
- `delete_task(id) -> bool`
- `complete_task(id) -> Task | None`
- `incomplete_task(id) -> Task | None`

**Validation Rules**:
- Task IDs are sequential starting from 1
- Duplicate IDs not allowed (enforced by counter)
- Operations on non-existent IDs return None/False

**No modifications required**: Existing implementation satisfies all requirements

---

## New Entities

### InteractiveSession

**Purpose**: Manages the REPL loop and command dispatch for interactive mode

**Attributes**:
- `task_manager`: TaskManager - Session-scoped task storage
- `output_handler`: OutputHandler - Handles all terminal output with Rich
- `prompt`: str - Command prompt display string (includes task count)
- `intro`: str - Welcome message with logo (displayed on startup)

**Methods**:
- `do_create(args)` - Handle create command in interactive mode
- `do_list(args)` - Handle list command
- `do_complete(args)` - Handle complete command
- `do_incomplete(args)` - Handle incomplete command
- `do_update(args)` - Handle update command
- `do_delete(args)` - Handle delete command
- `do_exit(args)` - Gracefully terminate session
- `do_quit(args)` - Alias for exit
- `do_help(args)` - Display available commands (Rich formatted)
- `precmd(line)` - Update prompt with current task count
- `emptyline()` - Handle empty input (do nothing)

**Lifecycle**:
```
[Initialized] --cmdloop()--> [Running] --exit/quit--> [Terminated]
```

**Validation Rules**:
- All commands must parse arguments correctly
- Invalid commands display help message
- Session maintains state until explicitly exited

**Relationships**:
- Has-one TaskManager (composition, owned by session)
- Has-one OutputHandler (composition, owned by session)

---

### OutputHandler

**Purpose**: Centralizes all terminal output with Rich formatting

**Attributes**:
- `console`: rich.console.Console - Rich console instance
- `theme`: ColorTheme - Color configuration for different output types

**Methods**:
- `print_logo()` - Display AIDO ASCII art logo with colors
- `print_success(message)` - Green formatted success message
- `print_error(message)` - Red formatted error message (optionally with panel)
- `print_warning(message)` - Yellow formatted warning
- `print_task(task)` - Format and display single task
- `print_task_list(tasks)` - Display tasks in Rich table
- `print_info(message)` - Default color informational message

**Color Theme**:
- Logo: Cyan
- Success: Green
- Error: Red
- Warning: Yellow
- Completed task: Green
- Incomplete task: Yellow
- Info/Default: White

**Validation Rules**:
- Console must detect TTY support (graceful fallback to no-color)
- All output goes through this handler (no direct print statements)

**Relationships**:
- Used-by InteractiveSession (dependency injection)
- Used-by CLI main (for single-command mode with simpler output)

---

## Entity Relationship Diagram

```
┌─────────────────────┐
│ InteractiveSession  │
│                     │
│ - task_manager      │───────┐
│ - output_handler    │───┐   │
│ - prompt            │   │   │
│ - intro             │   │   │
└─────────────────────┘   │   │
                          │   │
                          │   │ (composition)
                          │   │
                          │   └──> ┌──────────────┐
                          │        │ TaskManager  │
                          │        │              │
                          │        │ - tasks[]    │───────┐
                          │        │ - next_id    │       │
                          │        └──────────────┘       │
                          │                               │
                          │ (composition)                 │ (aggregation)
                          │                               │
                          └──> ┌──────────────┐           │
                               │OutputHandler │           │
                               │              │           │
                               │ - console    │           ▼
                               │ - theme      │      ┌─────────┐
                               └──────────────┘      │  Task   │
                                                     │         │
                                                     │ - id    │
                                                     │ - title │
                                                     │ - desc  │
                                                     │ - done  │
                                                     └─────────┘
```

## Data Flow

### Interactive Mode Session Flow

```
1. User launches AIDO (no args)
   └─> Create InteractiveSession
       ├─> Create TaskManager (empty)
       ├─> Create OutputHandler (with Rich Console)
       └─> Display logo and prompt

2. User enters command (e.g., "create Buy milk")
   └─> InteractiveSession.do_create("Buy milk")
       ├─> Parse arguments
       ├─> Call task_manager.create_task(...)
       ├─> Get Task object back
       └─> output_handler.print_success("Created task #1: Buy milk")

3. User enters "list"
   └─> InteractiveSession.do_list("")
       ├─> Call task_manager.get_all_tasks()
       ├─> Get List[Task]
       └─> output_handler.print_task_list(tasks)

4. User enters "exit"
   └─> InteractiveSession.do_exit("")
       ├─> Check if tasks exist
       ├─> output_handler.print_warning("Tasks will be lost") (if any)
       └─> Return True (terminates cmdloop)
```

### Single-Command Mode Flow (Existing, Unchanged)

```
1. User runs `aido create "Buy milk"`
   └─> Create TaskManager (empty)
   └─> Call task_manager.create_task(...)
   └─> Print "Created task #1: Buy milk" (plain or lightly colored)
   └─> Exit

(TaskManager destroyed, tasks lost)
```

## Storage Considerations

**In-Memory Only**: All data structures exist only in process memory

**Persistence**: None - tasks are lost when:
- Interactive session exits
- Single-command execution completes
- Process crashes or is killed

**Scalability**: Optimized for <50 tasks (per spec). Linear search and list operations are acceptable.

**Concurrency**: Not applicable - single-threaded, single-user

## Migration Notes

**Backward Compatibility**:
- Task and TaskManager classes remain unchanged
- Existing single-command CLI continues working
- No data migration needed (no persistence)

**New Dependencies**:
- Rich library (external PyPI package)
- Python 3.11 standard library: `cmd` module

**File Changes**:
- New: `src/interactive_session.py` (InteractiveSession class)
- New: `src/output_handler.py` (OutputHandler class)
- Modified: `src/todo.py` (add interactive mode entry point)
- Modified: `src/cli_parser.py` (make subcommand optional)

## Validation & Testing

**Unit Tests Required**:
- InteractiveSession command handlers (mock OutputHandler)
- OutputHandler formatting methods (capture Rich output)
- Edge cases: empty input, invalid IDs, long titles

**Integration Tests Required**:
- Full session workflow (create → list → complete → delete → exit)
- Mode detection (args vs no args)
- Task persistence within session
- Task loss between sessions

**Manual Tests Required**:
- Logo rendering in actual terminal
- Color output verification
- Help command formatting
- Error message clarity

---

**Data Model Complete**: 2025-12-27
**Dependencies**: Task (existing), TaskManager (existing), Rich (new external)
**Status**: Ready for implementation
