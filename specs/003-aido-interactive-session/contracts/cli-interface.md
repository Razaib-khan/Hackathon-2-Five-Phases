# CLI Interface Contract: AIDO Interactive Session Mode

**Feature**: 003-aido-interactive-session
**Date**: 2025-12-27
**Type**: Command-Line Interface Specification

## Overview

This document defines the command-line interface contract for AIDO, including both single-command mode (existing) and interactive session mode (new).

## Mode Detection

### Single-Command Mode (Existing Behavior)

**Invocation**: `aido <command> [arguments]`

**Behavior**:
- Execute command once
- Print result to stdout
- Exit with code 0 (success) or 1 (error)
- Tasks not persisted (lost after execution)

**Examples**:
```bash
$ aido create "Buy groceries"
Created task #1: Buy groceries

$ aido list
No tasks found

$ aido --help
usage: aido [-h] {create,list,complete,incomplete,update,delete} ...
AIDO - AI-Powered Interactive Task Manager
...
```

---

### Interactive Session Mode (New Feature)

**Invocation**: `aido` (no arguments)

**Behavior**:
- Display AIDO logo and welcome message
- Enter REPL loop with prompt
- Accept commands until `exit` or `quit`
- Tasks persist for session duration
- Ctrl+D or Ctrl+C gracefully exits

**Example Session**:
```bash
$ aido
   ___    ____  ____   ____
  / _ |  /  _/ / __ \ / __ \
 / __ | _/ /  / / / // / / /
/_/ |_|/___/ /_/ /_//_/ /_/

 AI-Powered Interactive Task Manager

Type 'help' for commands or 'exit' to quit.

(aido) create Buy groceries --description "Milk, eggs, bread"
✓ Created task #1: Buy groceries

(aido:1 task) list
┌────┬─────────────────┬──────────────────────┬───────────┐
│ ID │ Title           │ Description          │ Status    │
├────┼─────────────────┼──────────────────────┼───────────┤
│ 1  │ Buy groceries   │ Milk, eggs, bread    │ Pending   │
└────┴─────────────────┴──────────────────────┴───────────┘

(aido:1 task) complete 1
✓ Marked task #1 as complete

(aido:1 task) list
┌────┬─────────────────┬──────────────────────┬───────────┐
│ ID │ Title           │ Description          │ Status    │
├────┼─────────────────┼──────────────────────┼───────────┤
│ 1  │ Buy groceries   │ Milk, eggs, bread    │ ✓ Done    │
└────┴─────────────────┴──────────────────────┴───────────┘

(aido:1 task) exit
Goodbye!

$ aido list
No tasks found
```

---

## Command Reference

All commands work identically in both modes (arguments and behavior are the same).

### create

**Purpose**: Create a new task

**Syntax**:
```
create <title> [--description <text>]
```

**Arguments**:
- `<title>` (required): Task title (quoted if contains spaces)
- `--description <text>` (optional): Detailed description

**Examples**:
```bash
# Single-command mode
$ aido create "Write report"
Created task #1: Write report

$ aido create "Call dentist" --description "Schedule cleaning appointment"
Created task #1: Call dentist

# Interactive mode
(aido) create Buy milk
✓ Created task #1: Buy milk

(aido:1 task) create "Finish project" --description "Complete phase 2"
✓ Created task #2: Finish project
```

**Success Output** (Interactive):
```
✓ Created task #<id>: <title>
```

**Success Output** (Single-command):
```
Created task #<id>: <title>
```

**Error Cases**:
- Empty title → "Error: Task title cannot be empty"
- Invalid arguments → "Error: Invalid arguments. Usage: create <title> [--description <text>]"

---

### list

**Purpose**: Display all tasks

**Syntax**:
```
list
```

**Arguments**: None

**Examples**:
```bash
# Single-command mode
$ aido list
No tasks found

# Interactive mode with tasks
(aido:2 tasks) list
┌────┬─────────────────┬──────────────────────┬───────────┐
│ ID │ Title           │ Description          │ Status    │
├────┼─────────────────┼──────────────────────┼───────────┤
│ 1  │ Buy milk        │                      │ Pending   │
│ 2  │ Finish project  │ Complete phase 2     │ ✓ Done    │
└────┴─────────────────┴──────────────────────┴───────────┘
```

**Success Output** (Interactive):
- Rich table with colored status (Pending=yellow, Done=green)

**Success Output** (Single-command):
- Plain text list or "No tasks found"

**Error Cases**: None (empty list is valid)

---

### complete

**Purpose**: Mark a task as completed

**Syntax**:
```
complete <task_id>
```

**Arguments**:
- `<task_id>` (required): Integer task ID

**Examples**:
```bash
# Single-command mode
$ aido complete 1
Marked task #1 as complete

# Interactive mode
(aido:2 tasks) complete 1
✓ Marked task #1 as complete
```

**Success Output** (Interactive):
```
✓ Marked task #<id> as complete
```

**Success Output** (Single-command):
```
Marked task #<id> as complete
```

**Error Cases**:
- Task ID not found → "Error: Task #<id> not found"
- Invalid ID format → "Error: Invalid task ID. Must be a positive integer"

---

### incomplete

**Purpose**: Mark a completed task as incomplete

**Syntax**:
```
incomplete <task_id>
```

**Arguments**:
- `<task_id>` (required): Integer task ID

**Examples**:
```bash
# Single-command mode
$ aido incomplete 1
Marked task #1 as incomplete

# Interactive mode
(aido:1 task) incomplete 1
✓ Marked task #1 as incomplete
```

**Success Output** (Interactive):
```
✓ Marked task #<id> as incomplete
```

**Success Output** (Single-command):
```
Marked task #<id> as incomplete
```

**Error Cases**:
- Task ID not found → "Error: Task #<id> not found"
- Invalid ID format → "Error: Invalid task ID. Must be a positive integer"

---

### update

**Purpose**: Update task title and/or description

**Syntax**:
```
update <task_id> [--title <new_title>] [--description <new_description>]
```

**Arguments**:
- `<task_id>` (required): Integer task ID
- `--title <new_title>` (optional): New task title
- `--description <new_description>` (optional): New description

**Examples**:
```bash
# Single-command mode
$ aido update 1 --title "Buy groceries and coffee"
Updated task #1

# Interactive mode
(aido:1 task) update 1 --title "New title" --description "New description"
✓ Updated task #1
```

**Success Output** (Interactive):
```
✓ Updated task #<id>
```

**Success Output** (Single-command):
```
Updated task #<id>
```

**Error Cases**:
- Task ID not found → "Error: Task #<id> not found"
- No title or description provided → "Error: Must provide --title or --description"
- Invalid ID format → "Error: Invalid task ID. Must be a positive integer"

---

### delete

**Purpose**: Delete a task permanently

**Syntax**:
```
delete <task_id>
```

**Arguments**:
- `<task_id>` (required): Integer task ID

**Examples**:
```bash
# Single-command mode
$ aido delete 1
Deleted task #1

# Interactive mode
(aido:2 tasks) delete 1
✓ Deleted task #1
```

**Success Output** (Interactive):
```
✓ Deleted task #<id>
```

**Success Output** (Single-command):
```
Deleted task #<id>
```

**Error Cases**:
- Task ID not found → "Error: Task #<id> not found"
- Invalid ID format → "Error: Invalid task ID. Must be a positive integer"

---

### exit / quit (Interactive Mode Only)

**Purpose**: Terminate interactive session

**Syntax**:
```
exit
quit
```

**Arguments**: None

**Examples**:
```bash
(aido:3 tasks) exit
⚠ Warning: 3 tasks will be lost when you exit.
Are you sure? (yes/no): yes
Goodbye!
```

**Behavior**:
- If tasks exist: Show warning and confirm
- If no tasks: Exit immediately with "Goodbye!"
- Confirmation required only on first exit attempt
- Typing "exit" again after warning exits without re-prompting

**Error Cases**: None (always succeeds)

---

### help (Interactive Mode)

**Purpose**: Display available commands and usage

**Syntax**:
```
help [command]
```

**Arguments**:
- `[command]` (optional): Specific command to get help for

**Examples**:
```bash
(aido) help
Available Commands:
┌────────────┬─────────────────────────────────────────┐
│ Command    │ Description                             │
├────────────┼─────────────────────────────────────────┤
│ create     │ Create a new task                       │
│ list       │ List all tasks                          │
│ complete   │ Mark a task as complete                 │
│ incomplete │ Mark a task as incomplete               │
│ update     │ Update a task's title or description    │
│ delete     │ Delete a task permanently               │
│ exit       │ Exit the interactive session            │
│ quit       │ Exit the interactive session            │
│ help       │ Show this help message                  │
└────────────┴─────────────────────────────────────────┘

Type 'help <command>' for detailed usage.

(aido) help create
create <title> [--description <text>]

Create a new task with the specified title and optional description.

Examples:
  create "Buy groceries"
  create "Call dentist" --description "Schedule cleaning"
```

---

## Interactive Session Prompts

### Prompt Format

**Default Prompt**:
```
(aido)
```

**With Tasks**:
```
(aido:1 task)
(aido:5 tasks)
```

**Prompt Updates**:
- Prompt is refreshed before every command input
- Task count reflects current state
- Singular "task" vs plural "tasks" based on count

---

## Exit Codes

**Success**: 0
- Command executed successfully
- Interactive session exited normally

**Error**: 1
- Command failed (invalid arguments, task not found, etc.)
- Parse error

**Interrupted**: 130 (Ctrl+C)
- User interrupted with Ctrl+C (handled gracefully in interactive mode)

---

## Color Scheme

### Interactive Mode

- **Logo**: Cyan ASCII art
- **Success messages**: Green with ✓ symbol
- **Error messages**: Red with ✗ symbol or panel
- **Warnings**: Yellow with ⚠ symbol
- **Completed tasks**: Green text
- **Incomplete tasks**: Yellow text
- **Prompts**: Default terminal color
- **Tables**: Rich formatted with headers

### Single-Command Mode

- **Minimal colors**: Optional light coloring
- **Primarily plain text**: For script compatibility
- **Errors**: Red text (if TTY detected)

---

## Backward Compatibility

**Guaranteed**:
- All existing single-command invocations continue working
- Same command names and arguments
- Same output format (single-command mode)
- Same exit codes

**New Behavior**:
- `aido` (no args) enters interactive mode (previously showed help)
- Rich formatting in interactive mode (new feature)

**Migration Path**:
- Users accustomed to `aido` showing help should use `aido --help`
- No breaking changes to scripted usage (`aido create`, etc.)

---

## Testing Contract

**Unit Tests Must Verify**:
- Mode detection (args vs no args)
- All command parsers handle valid and invalid input
- Error messages match documented format
- Exit codes match specification

**Integration Tests Must Verify**:
- Full interactive session workflow
- Task persistence within session
- Task loss between sessions
- Backward compatibility with single-command mode

**Manual Tests Must Verify**:
- Logo renders correctly in various terminals
- Colors display appropriately
- Prompt updates reflect task count
- Help text is clear and accurate

---

**Contract Version**: 1.0.0
**Status**: Approved for Implementation
**Last Updated**: 2025-12-27
