# Feature Specification: CLI Todo Application

**Feature Branch**: `001-cli-todo`
**Created**: 2025-12-26
**Status**: Draft
**Input**: User description: "Specify Phase 1 of the Hackathon II project.

Scope:
- Command-line Todo application
- Single user
- In-memory task storage only

Required features:
- Create a task (title required, description optional)
- List all tasks
- Update a task
- Delete a task
- Mark task as complete or incomplete

Include:
- Clear acceptance criteria for each feature
- Expected inputs and outputs
- Error cases (invalid task ID, empty title)
- Explicit exclusions:
  - no authentication
  - no database
  - no web interface
  - no AI features"

## Clarifications

### Session 2025-12-26

- Q: When listing tasks, in what order should they be displayed? → A: By creation order (oldest first)
- Q: What are the maximum character lengths for title and description? → A: Title: 200 chars, Description: 1000 chars
- Q: Can users update only the title, only the description, or must they provide both? → A: Allow partial updates (title only, description only, or both)
- Q: How should completion status be visually indicated in the task list? → A: Text labels ([✓] Complete / [ ] Incomplete)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and View Tasks (Priority: P1)

As a user, I want to create tasks with a title and view them in a list so that I can track what needs to be done.

**Why this priority**: This is the core MVP functionality. Without the ability to create and view tasks, no other features have value. This story alone delivers a usable (though minimal) todo application.

**Independent Test**: Can be fully tested by running the application, creating one or more tasks with titles, and viewing the list to confirm tasks appear correctly. Delivers immediate value by allowing basic task tracking.

**Acceptance Scenarios**:

1. **Given** the application is running, **When** I create a task with title "Buy groceries", **Then** the task is created with a unique ID and marked as incomplete
2. **Given** the application is running, **When** I create a task with title "Buy groceries" and description "Milk, eggs, bread", **Then** the task is created with both title and description stored
3. **Given** I have created 3 tasks, **When** I list all tasks, **Then** I see all 3 tasks displayed in creation order (oldest first) with their ID, title, status, and description (if provided)
4. **Given** the application is running, **When** I attempt to create a task with an empty title, **Then** I receive an error message "Title is required" and no task is created
5. **Given** no tasks exist, **When** I list all tasks, **Then** I see a message "No tasks found" or an empty list

---

### User Story 2 - Mark Tasks Complete (Priority: P2)

As a user, I want to mark tasks as complete or incomplete so that I can track my progress.

**Why this priority**: Once users can create and view tasks, the next most valuable feature is tracking completion status. This is essential for a todo app but depends on tasks existing first.

**Independent Test**: Can be tested by creating a task, marking it complete, listing tasks to verify the status changed, then marking it incomplete again. Delivers value by enabling progress tracking.

**Acceptance Scenarios**:

1. **Given** a task with ID 1 exists and is incomplete, **When** I mark task 1 as complete, **Then** the task status changes to complete
2. **Given** a task with ID 1 exists and is complete, **When** I mark task 1 as incomplete, **Then** the task status changes to incomplete
3. **Given** I attempt to mark task ID 999 as complete, **When** task 999 does not exist, **Then** I receive an error message "Task not found: 999"
4. **Given** I have 5 tasks (2 complete, 3 incomplete), **When** I list all tasks, **Then** I can clearly distinguish which tasks are complete ([✓]) vs incomplete ([ ])

---

### User Story 3 - Update Task Details (Priority: P3)

As a user, I want to update a task's title or description so that I can correct mistakes or add information.

**Why this priority**: Updating tasks is useful but not critical for basic functionality. Users can work around this by deleting and recreating tasks if needed. This enhances usability but isn't essential for MVP.

**Independent Test**: Can be tested by creating a task, updating its title and/or description, and verifying the changes persist when listing tasks. Delivers value by allowing task refinement without deletion.

**Acceptance Scenarios**:

1. **Given** a task with ID 1 exists with title "Buy milk", **When** I update task 1 title to "Buy groceries", **Then** the task title changes and description remains unchanged
2. **Given** a task with ID 1 exists with no description, **When** I update task 1 description to "Milk, eggs, bread", **Then** the description is added and title remains unchanged
3. **Given** a task with ID 1 exists, **When** I update both title and description, **Then** both fields are updated
4. **Given** I attempt to update task ID 999, **When** task 999 does not exist, **Then** I receive an error message "Task not found: 999"
5. **Given** I attempt to update task 1 title to empty string, **When** title is required, **Then** I receive an error message "Title is required" and task remains unchanged

---

### User Story 4 - Delete Tasks (Priority: P4)

As a user, I want to delete tasks I no longer need so that my task list stays organized.

**Why this priority**: Deletion is the lowest priority core feature. While useful for list maintenance, users can simply ignore unwanted tasks. This is a convenience feature that completes the CRUD operations.

**Independent Test**: Can be tested by creating tasks, deleting one, and verifying it no longer appears in the list. Delivers value by enabling list cleanup.

**Acceptance Scenarios**:

1. **Given** a task with ID 1 exists, **When** I delete task 1, **Then** the task is removed and no longer appears in the task list
2. **Given** I attempt to delete task ID 999, **When** task 999 does not exist, **Then** I receive an error message "Task not found: 999"
3. **Given** I have 5 tasks and delete task 3, **When** I list all tasks, **Then** I see 4 tasks and task 3 is not present

---

### Edge Cases

- What happens when a user attempts to create a task with only whitespace as the title? (Should be treated as empty and rejected)
- What happens when a task ID is provided in an invalid format (e.g., negative number, non-numeric)? (Should return clear error message)
- What happens when a user attempts to update or delete using an ID that previously existed but was deleted? (Should return "Task not found")
- What happens when the application is restarted? (All tasks are lost since storage is in-memory only - this is expected behavior)
- What happens when a user provides very long input for title or description? (Should be accepted up to 200 characters for title and 1000 characters for description; input exceeding these limits should be rejected with an error message)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create a new task with a required title (non-empty, non-whitespace-only string)
- **FR-002**: System MUST allow users to optionally provide a description when creating a task
- **FR-003**: System MUST assign a unique identifier to each task upon creation
- **FR-004**: System MUST store all tasks in memory during the application session
- **FR-005**: System MUST allow users to list all tasks showing ID, title, description, and completion status (displayed as [✓] for complete or [ ] for incomplete) in creation order (oldest first)
- **FR-006**: System MUST allow users to mark any task as complete
- **FR-007**: System MUST allow users to mark any complete task as incomplete
- **FR-008**: System MUST allow users to update the title of an existing task (partial update allowed; description remains unchanged if not provided)
- **FR-009**: System MUST allow users to update the description of an existing task (partial update allowed; title remains unchanged if not provided)
- **FR-010**: System MUST allow users to delete an existing task by ID
- **FR-011**: System MUST validate that task title is not empty when creating or updating
- **FR-012**: System MUST validate that title does not exceed 200 characters and description does not exceed 1000 characters
- **FR-013**: System MUST return clear error messages when operations fail (e.g., "Task not found", "Title is required", "Title too long")
- **FR-014**: System MUST operate as a command-line interface (no graphical interface)
- **FR-015**: System MUST support a single user (no multi-user support or authentication)
- **FR-016**: System MUST NOT persist data between application sessions (in-memory only)

### Key Entities

- **Task**: Represents a single todo item with the following attributes:
  - Unique identifier (assigned by system)
  - Title (required, non-empty string, maximum 200 characters)
  - Description (optional, can be empty or absent, maximum 1000 characters)
  - Completion status (complete or incomplete, defaults to incomplete)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new task and see it in the list within 5 seconds
- **SC-002**: Users can perform all CRUD operations (create, read, update, delete) on tasks without errors
- **SC-003**: 100% of invalid operations (empty title, non-existent ID) return clear, actionable error messages
- **SC-004**: Users can distinguish between complete and incomplete tasks when viewing the list
- **SC-005**: Task list updates immediately after any operation (create, update, delete, mark complete)
- **SC-006**: Users can successfully complete the full workflow (create task → mark complete → update → delete) without confusion

## Assumptions

- **Assumption 1**: Command-line interface will accept commands via standard input or command-line arguments (specific interface design will be determined in planning phase)
- **Assumption 2**: Task IDs will be numeric and auto-incrementing (implementation detail determined in planning)
- **Assumption 3**: Error messages will be written to standard error stream or clearly marked in output
- **Assumption 4**: "In-memory storage" means data is lost when application terminates - no file system persistence
- **Assumption 5**: Single user means no concurrent access concerns or user identification needed

## Explicit Exclusions

The following features are explicitly OUT OF SCOPE for Phase 1:

- User authentication or authorization
- Database or file system persistence
- Web interface (browser-based UI)
- AI features or intelligent task suggestions
- Task categories, tags, or organization features
- Task priorities or due dates
- Task search or filtering
- Multi-user support or collaboration features
- Task history or audit trail
- Undo/redo functionality
- Import/export capabilities
