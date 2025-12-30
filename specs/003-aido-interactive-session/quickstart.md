# AIDO Interactive Session Mode - Quick Start Guide

**Feature**: 003-aido-interactive-session
**Date**: 2025-12-27
**For**: Developers implementing this feature

## Overview

This guide helps developers understand and implement the AIDO Interactive Session Mode feature. It covers architecture, key components, implementation steps, and testing strategy.

## What's Changing

### Before (Current State)

```bash
$ aido create "Buy milk"
Created task #1: Buy milk

$ aido list
No tasks found  # Tasks lost between commands!
```

**Problem**: Every command starts fresh. No session persistence.

### After (New Behavior)

```bash
$ aido  # No arguments = interactive mode
   ___    ____  ____   ____
  / _ |  /  _/ / __ \ / __ \
 / __ | _/ /  / / / // / / /
/_/ |_|/___/ /_/ /_//_/ /_/

 AI-Powered Interactive Task Manager

(aido) create Buy milk
✓ Created task #1: Buy milk

(aido:1 task) list
┌────┬───────────┬─────────────┬─────────┐
│ ID │ Title     │ Description │ Status  │
├────┼───────────┼─────────────┼─────────┤
│ 1  │ Buy milk  │             │ Pending │
└────┴───────────┴─────────────┴─────────┘

(aido:1 task) exit
Goodbye!
```

**Solution**: Interactive REPL with in-session task persistence + rich visual output.

---

## Architecture Overview

### Component Diagram

```
┌────────────────────────────────────────────────────────────┐
│ todo.py (Entry Point)                                      │
│                                                            │
│  if no args:                                              │
│    session = InteractiveSession()  ──────────┐            │
│    session.cmdloop()                         │            │
│  else:                                       │            │
│    # Single-command mode (existing)         │            │
└─────────────────────────────────────────────│─────────────┘
                                               │
                  ┌────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────────┐
│ interactive_session.py                                     │
│                                                            │
│  class InteractiveSession(cmd.Cmd):                       │
│    __init__():                                            │
│      self.task_manager = TaskManager()  ───┐             │
│      self.output_handler = OutputHandler() ┼──┐          │
│                                            │  │          │
│    do_create(args) ────────────────────────┼──┤          │
│    do_list(args)                          │  │          │
│    do_complete(args)                      │  │          │
│    # ... other commands                   │  │          │
└───────────────────────────────────────────│──│───────────┘
                                           │  │
           ┌───────────────────────────────┘  │
           │                                  │
           ▼                                  ▼
┌───────────────────────┐       ┌─────────────────────────┐
│ task_manager.py       │       │ output_handler.py       │
│                       │       │                         │
│ class TaskManager:    │       │ class OutputHandler:    │
│   tasks: List[Task]   │       │   console: Console      │
│   create_task()       │       │   print_logo()          │
│   get_all_tasks()     │       │   print_success()       │
│   complete_task()     │       │   print_error()         │
│   # ...               │       │   print_task_list()     │
└───────────────────────┘       │   # ...                 │
           │                    └─────────────────────────┘
           │                               │
           ▼                               │
    ┌─────────────┐                       │
    │  task.py    │                       │
    │             │                       │
    │ class Task: │              ┌────────▼─────────┐
    │   id        │              │ rich library     │
    │   title     │              │ (external)       │
    │   completed │              │                  │
    └─────────────┘              │ Console, Table,  │
                                 │ Panel, etc.      │
                                 └──────────────────┘
```

### Key Design Decisions (from research.md)

1. **cmd.Cmd for REPL**: Python's built-in command interpreter framework
2. **Rich for output**: Professional terminal UI library
3. **TaskManager reuse**: No changes to existing domain logic
4. **Mode detection**: No args = interactive, args = single-command

---

## Implementation Checklist

### Phase 1: Dependencies

- [ ] Add Rich to pyproject.toml dependencies
- [ ] Run `uv add rich` to install
- [ ] Verify installation: `python -c "import rich; print(rich.__version__)"`

### Phase 2: Output Handler

**File**: `src/output_handler.py`

- [ ] Create OutputHandler class
- [ ] Initialize Rich Console
- [ ] Implement `print_logo()` with AIDO ASCII art
- [ ] Implement `print_success()`, `print_error()`, `print_warning()`
- [ ] Implement `print_task()` and `print_task_list()`
- [ ] Add unit tests for each method

**Key Code Snippet**:
```python
from rich.console import Console
from rich.table import Table

class OutputHandler:
    def __init__(self):
        self.console = Console()

    def print_logo(self):
        logo = """
   ___    ____  ____   ____
  / _ |  /  _/ / __ \ / __ \\
 / __ | _/ /  / / / // / / /
/_/ |_|/___/ /_/ /_//_/ /_/
        """
        self.console.print(logo, style="cyan bold")
        self.console.print("AI-Powered Interactive Task Manager\n")

    def print_task_list(self, tasks):
        table = Table(title="Tasks")
        table.add_column("ID", style="cyan")
        table.add_column("Title", style="white")
        table.add_column("Description", style="dim")
        table.add_column("Status", style="green")

        for task in tasks:
            status = "✓ Done" if task.completed else "Pending"
            style = "green" if task.completed else "yellow"
            table.add_row(
                str(task.id),
                task.title,
                task.description or "",
                status,
                style=style
            )

        self.console.print(table)
```

### Phase 3: Interactive Session

**File**: `src/interactive_session.py`

- [ ] Create InteractiveSession class extending cmd.Cmd
- [ ] Initialize TaskManager and OutputHandler in `__init__`
- [ ] Set `intro` (logo + welcome) and `prompt` attributes
- [ ] Implement `do_create(args)` command
- [ ] Implement `do_list(args)` command
- [ ] Implement `do_complete(args)` command
- [ ] Implement `do_incomplete(args)` command
- [ ] Implement `do_update(args)` command
- [ ] Implement `do_delete(args)` command
- [ ] Implement `do_exit(args)` and `do_quit(args)`
- [ ] Override `do_help(args)` with Rich table
- [ ] Implement `precmd(line)` to update prompt with task count
- [ ] Implement `emptyline()` to do nothing on empty input
- [ ] Add unit tests for each command (mock OutputHandler)

**Key Code Snippet**:
```python
import cmd
from task_manager import TaskManager
from output_handler import OutputHandler

class InteractiveSession(cmd.Cmd):
    intro = None  # Set in __init__ after creating output_handler
    prompt = "(aido) "

    def __init__(self):
        super().__init__()
        self.task_manager = TaskManager()
        self.output_handler = OutputHandler()

        # Display logo on startup
        self.output_handler.print_logo()
        print("Type 'help' for commands or 'exit' to quit.\n")

    def precmd(self, line):
        """Update prompt with task count before each command"""
        task_count = len(self.task_manager.get_all_tasks())
        if task_count == 0:
            self.prompt = "(aido) "
        elif task_count == 1:
            self.prompt = "(aido:1 task) "
        else:
            self.prompt = f"(aido:{task_count} tasks) "
        return line

    def do_create(self, args):
        """Create a new task: create <title> [--description <text>]"""
        # Parse args, call task_manager.create_task()
        # Use output_handler.print_success() or print_error()
        pass

    def do_list(self, args):
        """List all tasks"""
        tasks = self.task_manager.get_all_tasks()
        if not tasks:
            self.output_handler.print_warning("No tasks found")
        else:
            self.output_handler.print_task_list(tasks)

    def do_exit(self, args):
        """Exit the interactive session"""
        task_count = len(self.task_manager.get_all_tasks())
        if task_count > 0:
            msg = f"⚠ Warning: {task_count} task(s) will be lost when you exit."
            self.output_handler.print_warning(msg)
        print("Goodbye!")
        return True  # Terminates cmdloop

    def do_quit(self, args):
        """Alias for exit"""
        return self.do_exit(args)

    def emptyline(self):
        """Do nothing on empty input (overrides default repeat behavior)"""
        pass
```

### Phase 4: Entry Point Modification

**File**: `src/todo.py`

- [ ] Import InteractiveSession
- [ ] Modify main() to detect mode: if no subcommand, launch InteractiveSession
- [ ] Preserve existing single-command behavior
- [ ] Test both modes

**Key Code Snippet**:
```python
from interactive_session import InteractiveSession

def main():
    parser = create_parser()
    args = parser.parse_args()

    # If no subcommand provided, enter interactive mode
    if not hasattr(args, 'command') or args.command is None:
        session = InteractiveSession()
        session.cmdloop()
        return

    # Existing single-command mode logic
    task_manager = TaskManager()

    if args.command == 'create':
        # ... existing code
```

### Phase 5: CLI Parser Update

**File**: `src/cli_parser.py`

- [ ] Make subcommand optional (use `nargs='?'` or modify required)
- [ ] Update help text to mention interactive mode
- [ ] Test `--help` output

**Key Code Snippet**:
```python
def create_parser():
    parser = argparse.ArgumentParser(
        prog='aido',
        description='AIDO - AI-Powered Interactive Task Manager'
    )

    subparsers = parser.add_subparsers(dest='command', required=False)
    # Note: required=False allows 'aido' without subcommand

    # Existing subcommand definitions...
```

### Phase 6: Documentation Update

**File**: `README.md`

- [ ] Add section on interactive mode
- [ ] Update usage examples
- [ ] Document exit behavior (tasks lost)
- [ ] Update quick start instructions

---

## Testing Strategy

### Unit Tests

**test_output_handler.py**:
```python
def test_print_logo():
    handler = OutputHandler()
    # Capture Rich output, verify logo content

def test_print_task_list_empty():
    handler = OutputHandler()
    handler.print_task_list([])
    # Verify "No tasks" message

def test_print_task_list_with_tasks():
    handler = OutputHandler()
    tasks = [Task(1, "Test", "", False)]
    handler.print_task_list(tasks)
    # Verify table rendering
```

**test_interactive_session.py**:
```python
def test_do_create_success():
    session = InteractiveSession()
    session.do_create("Test task --description Test desc")
    assert len(session.task_manager.get_all_tasks()) == 1

def test_do_list_shows_tasks():
    session = InteractiveSession()
    session.task_manager.create_task("Test", "")
    session.do_list("")
    # Verify output contains task

def test_prompt_updates_with_task_count():
    session = InteractiveSession()
    assert session.prompt == "(aido) "

    session.do_create("Test")
    session.precmd("")  # Trigger prompt update
    assert session.prompt == "(aido:1 task) "
```

### Integration Tests

**test_full_session.py**:
```python
def test_full_interactive_workflow():
    # Simulate: create → list → complete → list → exit
    session = InteractiveSession()

    session.do_create("Task 1")
    session.do_create("Task 2")
    tasks = session.task_manager.get_all_tasks()
    assert len(tasks) == 2

    session.do_complete("1")
    task1 = session.task_manager.get_task(1)
    assert task1.completed

    session.do_exit("")
    # Verify graceful exit
```

### Manual Testing Checklist

- [ ] Run `aido` and verify logo displays with colors
- [ ] Create 3 tasks in interactive mode
- [ ] List tasks and verify Rich table formatting
- [ ] Complete a task and verify green checkmark
- [ ] Exit and re-run `aido` - verify tasks are gone
- [ ] Run `aido create "Test"` and verify single-command mode still works
- [ ] Test help command formatting
- [ ] Test error messages (invalid task ID, etc.)
- [ ] Test Ctrl+C handling
- [ ] Test Ctrl+D (EOF) handling

---

## Common Pitfalls

### 1. Forgetting to Override `emptyline()`

**Problem**: Pressing Enter repeats the last command (cmd.Cmd default)

**Solution**:
```python
def emptyline(self):
    pass  # Do nothing instead of repeating
```

### 2. Not Updating Prompt

**Problem**: Task count in prompt doesn't update

**Solution**: Implement `precmd()` to refresh prompt before every command

### 3. Forgetting to Return True in exit

**Problem**: `exit` command doesn't terminate the loop

**Solution**:
```python
def do_exit(self, args):
    print("Goodbye!")
    return True  # Must return True to break cmdloop
```

### 4. Hard-Coding Colors

**Problem**: Colors don't work in non-TTY or break on different terminals

**Solution**: Let Rich handle TTY detection automatically via Console

---

## Performance Considerations

**Expected Performance** (from research.md):

- Logo rendering: ~5ms (one-time at startup)
- Rich Console init: <10ms
- Command parsing: <1ms per command
- Task operations: <1ms for <50 tasks
- **Total per command**: <100ms ✓ (meets SC-005)

**Optimization Not Required**: Linear search on <50 tasks is acceptable

---

## Rollout Plan

### Step 1: Feature Branch Development

- Implement on `003-aido-interactive-session` branch
- All unit tests passing
- Integration tests passing

### Step 2: Manual Testing

- Test on Linux, macOS, Windows terminals
- Verify color rendering
- Test edge cases

### Step 3: Documentation

- Update README.md
- Update CHANGELOG (if exists)
- Create demo GIF/video (optional)

### Step 4: PR and Review

- Create PR to main
- Code review
- Address feedback

### Step 5: Merge and Release

- Merge to main
- Tag release (if applicable)
- Announce new feature

---

## FAQ

**Q: Do tasks persist across sessions?**
A: No. Tasks are lost when you exit interactive mode or complete a single-command. This is by design (FR-003, SC-001).

**Q: Can I use interactive mode in scripts?**
A: Not recommended. Use single-command mode for scripting: `aido create "Task"`, etc.

**Q: What if Rich isn't installed?**
A: Installation will fail. Rich is a required dependency (added to pyproject.toml).

**Q: Can I customize colors?**
A: Not in this phase. Color customization is out of scope (see spec.md "Out of Scope").

**Q: Will single-command mode get Rich output too?**
A: No. Single-command mode stays minimal for script compatibility. Only interactive mode uses Rich tables.

**Q: How do I test the logo without running the full app?**
A: Unit test:
```python
handler = OutputHandler()
handler.print_logo()
```

---

## Next Steps

After implementing this feature:

1. Run `/sp.tasks` to generate task breakdown
2. Execute tasks sequentially
3. Validate against spec.md acceptance criteria
4. Create PHR and ADR (if significant decisions made)
5. Commit and create PR with `/sp.git.commit_pr`

---

**Quick Start Guide Version**: 1.0.0
**Last Updated**: 2025-12-27
**Status**: Ready for Implementation
