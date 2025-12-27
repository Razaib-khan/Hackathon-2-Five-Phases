# Data Model: CLI Todo Application

**Feature**: 001-cli-todo
**Date**: 2025-12-26
**Phase**: Phase 1 - Design

## Entity: Task

Represents a single todo item in the application.

### Attributes

| Attribute | Type | Required | Constraints | Default | Description |
|-----------|------|----------|-------------|---------|-------------|
| id | int | Yes | Positive integer, unique | Auto-assigned | Unique identifier for the task |
| title | str | Yes | 1-200 characters, non-whitespace | None | Task title/summary |
| description | str | No | 0-1000 characters | Empty string | Optional detailed description |
| completed | bool | Yes | true/false | false | Completion status |

### Validation Rules

1. **Title Validation** (FR-001, FR-011, FR-012):
   - MUST NOT be None
   - MUST NOT be empty string after stripping whitespace
   - MUST NOT exceed 200 characters
   - Error: "Title is required" (if empty)
   - Error: "Title too long" (if > 200 chars)

2. **Description Validation** (FR-002, FR-012):
   - MAY be None or empty string
   - MUST NOT exceed 1000 characters
   - Error: "Description too long" (if > 1000 chars)

3. **ID Assignment** (FR-003):
   - Auto-assigned on creation
   - Sequential integers starting from 1
   - Never reused (even after deletion)

4. **Completion Status** (FR-006, FR-007):
   - Defaults to false (incomplete) on creation
   - Can toggle between true/false
   - No other states allowed

### State Transitions

```
[Created] ---(default)---> [Incomplete]
    |
    v
[Incomplete] <---(toggle)---> [Complete]
```

No other states or transitions allowed.

### Relationships

None - Task is a standalone entity with no foreign keys or associations.

## Data Structure: TaskManager

Container for managing the collection of tasks.

### Storage

- **Type**: Python list
- **Contents**: Task objects
- **Ordering**: Insertion order preserved (creation order per FR-005)

### Operations

| Operation | Method | Complexity | Notes |
|-----------|--------|------------|-------|
| Create | Append to list | O(1) | Auto-assign next ID |
| Read (single) | Linear search by ID | O(n) | Return None if not found |
| Read (all) | Iterate list | O(n) | Return in creation order |
| Update | Find + modify | O(n) | Partial updates allowed (FR-008, FR-009) |
| Delete | Find + remove | O(n) | Preserve order of remaining tasks |
| Mark complete | Find + modify | O(n) | Toggle completed field |

### ID Management

- **ID Counter**: Track highest ID assigned (or use len(tasks) + deleted_count)
- **Uniqueness**: IDs never reused, even after deletion
- **Starting Value**: 1 (first task gets ID=1)

### Edge Cases

1. **Empty List** (Edge case from spec):
   - List operation returns empty list
   - Display message: "No tasks found"

2. **ID Not Found** (FR-013):
   - Update/Delete/Complete operations return error
   - Error message: "Task not found: {id}"

3. **Deleted ID Reuse** (Edge case from spec):
   - Attempting to reference deleted task ID returns "Task not found"
   - ID counter continues incrementing

## Data Flow

### Create Flow
```
User input (title, description)
    ↓
Validate title (not empty, ≤200 chars)
    ↓
Validate description (≤1000 chars if provided)
    ↓
Create Task(id=next_id, title, description, completed=false)
    ↓
Append to tasks list
    ↓
Return success
```

### Update Flow
```
User input (id, new_title?, new_description?)
    ↓
Find task by ID
    ↓ (if found)
Validate new values (if provided)
    ↓
Update specified fields only (partial update)
    ↓
Return success

    ↓ (if not found)
Return "Task not found: {id}"
```

### List Flow
```
Request to list all tasks
    ↓
Iterate tasks list (in creation order)
    ↓
For each task: format as "ID [✓/  ] Title - Description"
    ↓
Return formatted list (or "No tasks found" if empty)
```

## Constraints

- **No Persistence**: Data exists only in memory during application runtime
- **Single User**: No user ID or ownership tracking needed
- **No Concurrency**: No locking or synchronization needed
- **Maximum Scale**: Support up to 1000 tasks (performance goal)

## Immutability

Tasks are **mutable** to support update operations (FR-008, FR-009). Task objects can be modified in place after creation.

## Serialization

None - in-memory only, no serialization to disk or network required.
