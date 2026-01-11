# Quickstart Guide: CLI Todo Application

**Feature**: 001-cli-todo
**Date**: 2025-12-26
**For**: Developers implementing and testing the CLI todo application

## Prerequisites

- Python 3.11 or higher
- Terminal/command prompt

## Setup

1. **Verify Python version**:
   ```bash
   python --version
   # Expected: Python 3.11.x or higher
   ```

2. **Navigate to project root**:
   ```bash
   cd /path/to/project
   ```

3. **Project structure should be**:
   ```
   src/
   ├── todo.py
   ├── task.py
   ├── task_manager.py
   └── cli_parser.py
   tests/
   └── (test files)
   ```

## Basic Usage

### Create a Task

```bash
# Simple task
python src/todo.py create "Buy groceries"
# Output: Created task #1: Buy groceries

# Task with description
python src/todo.py create "Finish report" --description "Q4 summary for review"
# Output: Created task #2: Finish report
```

### List All Tasks

```bash
python src/todo.py list
```

**Example output**:
```
ID  Status  Title            Description
1   [ ]     Buy groceries
2   [ ]     Finish report    Q4 summary for review
```

### Mark Task Complete

```bash
python src/todo.py complete 1
# Output: Marked task #1 as complete

python src/todo.py list
```

**Output** shows completed status:
```
ID  Status  Title            Description
1   [✓]     Buy groceries
2   [ ]     Finish report    Q4 summary for review
```

### Update a Task

```bash
# Update title only
python src/todo.py update 1 --title "Buy groceries and coffee"
# Output: Updated task #1

# Update description only
python src/todo.py update 2 --description "Q4 financial summary"
# Output: Updated task #2

# Update both
python src/todo.py update 1 --title "Shopping" --description "Weekly supplies"
# Output: Updated task #1
```

### Delete a Task

```bash
python src/todo.py delete 1
# Output: Deleted task #1

python src/todo.py list
```

**Output** shows task removed:
```
ID  Status  Title            Description
2   [ ]     Finish report    Q4 financial summary
```

### Mark Task Incomplete

```bash
python src/todo.py incomplete 2
# Output: Marked task #2 as incomplete
```

## Complete Workflow Example

```bash
# Start fresh
python src/todo.py list
# Output: No tasks found

# Create multiple tasks
python src/todo.py create "Buy groceries"
python src/todo.py create "Walk the dog"
python src/todo.py create "Finish report" -d "Q4 summary"

# View all tasks
python src/todo.py list
# Output:
# ID  Status  Title            Description
# 1   [ ]     Buy groceries
# 2   [ ]     Walk the dog
# 3   [ ]     Finish report    Q4 summary

# Complete first task
python src/todo.py complete 1

# Update third task
python src/todo.py update 3 --title "Complete Q4 report"

# View updated list
python src/todo.py list
# Output:
# ID  Status  Title               Description
# 1   [✓]     Buy groceries
# 2   [ ]     Walk the dog
# 3   [ ]     Complete Q4 report  Q4 summary

# Delete completed task
python src/todo.py delete 1

# Final list
python src/todo.py list
# Output:
# ID  Status  Title               Description
# 2   [ ]     Walk the dog
# 3   [ ]     Complete Q4 report  Q4 summary
```

## Common Errors and Solutions

### Error: "Title is required"

**Cause**: Empty title provided or title is only whitespace

**Solution**:
```bash
# ❌ Wrong
python src/todo.py create ""
python src/todo.py create "   "

# ✓ Correct
python src/todo.py create "Valid title"
```

### Error: "Title too long (maximum 200 characters)"

**Cause**: Title exceeds 200 character limit

**Solution**: Shorten the title or move extra detail to description:
```bash
# ❌ Wrong
python src/todo.py create "A very long title that exceeds the maximum allowed length of two hundred characters..."

# ✓ Correct
python src/todo.py create "Long task" --description "Additional details here..."
```

### Error: "Task not found: X"

**Cause**: Task with ID X doesn't exist (never created or already deleted)

**Solution**: Use `list` command to see available task IDs:
```bash
python src/todo.py list
python src/todo.py update 3 --title "Updated title"  # Use valid ID
```

### Error: "Description too long (maximum 1000 characters)"

**Cause**: Description exceeds 1000 character limit

**Solution**: Shorten the description to fit within limit

## Testing

### Manual Testing Checklist

Test all acceptance scenarios from spec.md:

- [ ] Create task with title only
- [ ] Create task with title and description
- [ ] List tasks shows all created tasks in order
- [ ] Create task with empty title fails with error
- [ ] List when no tasks shows "No tasks found"
- [ ] Mark incomplete task as complete
- [ ] Mark complete task as incomplete
- [ ] Mark non-existent task fails with error
- [ ] List distinguishes complete vs incomplete tasks
- [ ] Update task title only (description unchanged)
- [ ] Update task description only (title unchanged)
- [ ] Update task both title and description
- [ ] Update non-existent task fails with error
- [ ] Update task with empty title fails with error
- [ ] Delete existing task removes it from list
- [ ] Delete non-existent task fails with error
- [ ] List after deletion shows remaining tasks

### Unit Testing (if pytest configured)

```bash
# Run all tests
pytest tests/

# Run specific test file
pytest tests/test_task.py

# Run with coverage
pytest --cov=src tests/
```

## Data Persistence Note

**IMPORTANT**: All data is stored in memory only. When the application exits, all tasks are lost. This is expected behavior per Phase 1 specification (FR-016).

```bash
# Create tasks
python src/todo.py create "Task 1"
python src/todo.py create "Task 2"
python src/todo.py list
# Output: Shows 2 tasks

# Exit and re-run
python src/todo.py list
# Output: No tasks found
```

Each invocation starts with an empty task list.

## Help

View available commands:
```bash
python src/todo.py --help
```

View command-specific help:
```bash
python src/todo.py create --help
python src/todo.py update --help
```

## Next Steps

- Implement source files per `plan.md` structure
- Write unit tests per `tests/` directory
- Validate against all functional requirements (FR-001 through FR-016)
- Test all acceptance scenarios from spec.md
- Verify success criteria (SC-001 through SC-006)
