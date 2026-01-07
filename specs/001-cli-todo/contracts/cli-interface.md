# CLI Interface Contract

**Feature**: 001-cli-todo
**Date**: 2025-12-26
**Type**: Command-Line Interface

## Command Structure

All commands follow the pattern:
```
python todo.py <command> [arguments] [options]
```

## Commands

### 1. Create Task

**Command**: `create`

**Synopsis**:
```bash
python todo.py create <title> [--description <description>]
```

**Arguments**:
- `<title>` (required): Task title (1-200 characters)

**Options**:
- `--description <text>` or `-d <text>`: Optional task description (0-1000 characters)

**Success Output**:
```
Created task #{id}: {title}
```

**Error Outputs**:
- Title empty: `Error: Title is required`
- Title too long: `Error: Title too long (maximum 200 characters)`
- Description too long: `Error: Description too long (maximum 1000 characters)`

**Exit Codes**:
- 0: Success
- 1: Validation error

**Examples**:
```bash
# Create task with title only
python todo.py create "Buy groceries"
# Output: Created task #1: Buy groceries

# Create task with description
python todo.py create "Buy groceries" --description "Milk, eggs, bread"
# Output: Created task #2: Buy groceries
```

---

### 2. List Tasks

**Command**: `list`

**Synopsis**:
```bash
python todo.py list
```

**Arguments**: None

**Options**: None

**Success Output** (when tasks exist):
```
ID  Status  Title                Description
1   [ ]     Buy groceries        Milk, eggs, bread
2   [✓]     Walk the dog
3   [ ]     Finish report        Q4 summary
```

**Success Output** (when no tasks):
```
No tasks found
```

**Exit Codes**:
- 0: Success (even if list is empty)

**Formatting Rules** (FR-005 clarifications):
- Tasks displayed in creation order (oldest first)
- Status: `[✓]` for complete, `[ ]` for incomplete
- Columns: ID, Status, Title, Description (if present)
- Empty description displayed as blank

**Examples**:
```bash
python todo.py list
```

---

### 3. Update Task

**Command**: `update`

**Synopsis**:
```bash
python todo.py update <id> [--title <new_title>] [--description <new_description>]
```

**Arguments**:
- `<id>` (required): Task ID (positive integer)

**Options** (at least one required):
- `--title <text>` or `-t <text>`: New title (1-200 characters)
- `--description <text>` or `-d <text>`: New description (0-1000 characters)

**Behavior** (Clarification: partial updates allowed):
- If only `--title` provided: Update title, keep existing description
- If only `--description` provided: Update description, keep existing title
- If both provided: Update both fields

**Success Output**:
```
Updated task #{id}
```

**Error Outputs**:
- Task not found: `Error: Task not found: {id}`
- Title empty: `Error: Title is required`
- Title too long: `Error: Title too long (maximum 200 characters)`
- Description too long: `Error: Description too long (maximum 1000 characters)`
- Invalid ID format: `Error: Invalid task ID`
- No fields provided: `Error: Must specify --title and/or --description`

**Exit Codes**:
- 0: Success
- 1: Validation or not found error

**Examples**:
```bash
# Update title only
python todo.py update 1 --title "Buy groceries and supplies"
# Output: Updated task #1

# Update description only
python todo.py update 1 --description "Milk, eggs, bread, coffee"
# Output: Updated task #1

# Update both
python todo.py update 1 --title "Shopping" --description "Weekly groceries"
# Output: Updated task #1
```

---

### 4. Delete Task

**Command**: `delete`

**Synopsis**:
```bash
python todo.py delete <id>
```

**Arguments**:
- `<id>` (required): Task ID (positive integer)

**Options**: None

**Success Output**:
```
Deleted task #{id}
```

**Error Outputs**:
- Task not found: `Error: Task not found: {id}`
- Invalid ID format: `Error: Invalid task ID`

**Exit Codes**:
- 0: Success
- 1: Not found or invalid ID error

**Examples**:
```bash
python todo.py delete 3
# Output: Deleted task #3
```

---

### 5. Mark Task Complete/Incomplete

**Command**: `complete` / `incomplete`

**Synopsis**:
```bash
python todo.py complete <id>
python todo.py incomplete <id>
```

**Arguments**:
- `<id>` (required): Task ID (positive integer)

**Options**: None

**Success Output**:
```
Marked task #{id} as complete
Marked task #{id} as incomplete
```

**Error Outputs**:
- Task not found: `Error: Task not found: {id}`
- Invalid ID format: `Error: Invalid task ID`

**Exit Codes**:
- 0: Success
- 1: Not found or invalid ID error

**Examples**:
```bash
python todo.py complete 1
# Output: Marked task #1 as complete

python todo.py incomplete 1
# Output: Marked task #1 as incomplete
```

---

## Global Options

**Help**:
```bash
python todo.py --help
python todo.py <command> --help
```

**Version** (if implemented):
```bash
python todo.py --version
```

## Error Handling

**Standard Error Stream**:
- All error messages written to stderr
- Error messages prefixed with "Error: "
- Exit code 1 for all error conditions
- Exit code 0 only for successful operations

**Input Validation Order**:
1. Command syntax (argparse handles)
2. ID format validation (positive integer)
3. ID existence check
4. Field validation (empty, length limits)

## Edge Cases

1. **Whitespace-only title**: Treated as empty, rejected with "Title is required"
2. **Non-numeric ID**: Rejected with "Invalid task ID"
3. **Negative ID**: Rejected with "Invalid task ID"
4. **Deleted task ID**: Returns "Task not found: {id}"
5. **Very long input**: Title/description truncated at validation, error returned
6. **Special characters**: Handled by shell quoting, no special escaping needed
7. **Unicode characters**: Supported (UTF-8 encoding)

## Success Criteria Alignment

- **SC-001**: Operations complete within 5 seconds ✓
- **SC-002**: All CRUD operations function without errors ✓
- **SC-003**: 100% error message coverage ✓
- **SC-004**: Status distinction via [✓] / [ ] ✓
- **SC-005**: Immediate updates (in-memory) ✓
- **SC-006**: Full workflow supported ✓
