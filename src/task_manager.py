"""TaskManager for CLI Todo Application - CRUD operations."""

from task import Task


class TaskManager:
    """Manages the collection of tasks with CRUD operations.

    Tasks are stored in memory during the application session.
    IDs are auto-incremented starting from 1 and never reused.
    """

    def __init__(self):
        """Initialize TaskManager with empty task list and ID counter."""
        self._tasks: list[Task] = []
        self._next_id: int = 1

    def _get_next_id(self) -> int:
        """Generate the next unique task ID.

        IDs start from 1 and auto-increment.
        IDs are never reused, even after deletion.
        """
        task_id = self._next_id
        self._next_id += 1
        return task_id

    def _validate_title(self, title: str) -> tuple[bool, str]:
        """Validate task title.

        Args:
            title: The title to validate.

        Returns:
            Tuple of (is_valid, error_message). Error message is empty if valid.
        """
        stripped = title.strip()
        if not stripped:
            return False, "Title is required"
        if len(stripped) > 200:
            return False, "Title too long (maximum 200 characters)"
        return True, ""

    def _validate_description(self, description: str) -> tuple[bool, str]:
        """Validate task description.

        Args:
            description: The description to validate.

        Returns:
            Tuple of (is_valid, error_message). Error message is empty if valid.
        """
        if len(description) > 1000:
            return False, "Description too long (maximum 1000 characters)"
        return True, ""

    def create_task(self, title: str, description: str = "") -> tuple[bool, str | int]:
        """Create a new task with the given title and description.

        Args:
            title: Task title (required, 1-200 characters).
            description: Task description (optional, 0-1000 characters).

        Returns:
            Tuple of (success, result). If success, result is the task ID.
            If failure, result is the error message.
        """
        # Validate title
        valid, error = self._validate_title(title)
        if not valid:
            return False, error

        # Validate description
        valid, error = self._validate_description(description)
        if not valid:
            return False, error

        # Create task
        task_id = self._get_next_id()
        task = Task(
            id=task_id,
            title=title.strip(),
            description=description.strip() if description else ""
        )
        self._tasks.append(task)
        return True, task_id

    def list_tasks(self) -> list[Task]:
        """Return all tasks in creation order.

        Returns:
            List of tasks ordered by creation (oldest first).
        """
        return list(self._tasks)

    def format_task_list(self) -> str:
        """Format task list for display.

        Returns:
            Formatted string with all tasks, or "No tasks found" if empty.
        """
        if not self._tasks:
            return "No tasks found"

        lines = []
        for task in self._tasks:
            status = "[✓]" if task.completed else "[ ]"
            if task.description:
                line = f"{task.id}   {status}     {task.title}        {task.description}"
            else:
                line = f"{task.id}   {status}     {task.title}"
            lines.append(line)

        header = "ID  Status  Title                Description"
        return header + "\n" + "\n".join(lines)

    def find_task_by_id(self, task_id: int) -> Task | None:
        """Find a task by its ID.

        Args:
            task_id: The ID of the task to find.

        Returns:
            The task if found, None otherwise.
        """
        for task in self._tasks:
            if task.id == task_id:
                return task
        return None

    def mark_complete(self, task_id: int) -> tuple[bool, str]:
        """Mark a task as complete.

        Args:
            task_id: The ID of the task to mark complete.

        Returns:
            Tuple of (success, message). Message is error if not successful.
        """
        task = self.find_task_by_id(task_id)
        if task is None:
            return False, f"Task not found: {task_id}"
        task.completed = True
        return True, ""

    def mark_incomplete(self, task_id: int) -> tuple[bool, str]:
        """Mark a task as incomplete.

        Args:
            task_id: The ID of the task to mark incomplete.

        Returns:
            Tuple of (success, message). Message is error if not successful.
        """
        task = self.find_task_by_id(task_id)
        if task is None:
            return False, f"Task not found: {task_id}"
        task.completed = False
        return True, ""

    def update_task(
        self, task_id: int, title: str | None = None, description: str | None = None
    ) -> tuple[bool, str]:
        """Update a task's title and/or description.

        Args:
            task_id: The ID of the task to update.
            title: New title (optional). If provided, must be 1-200 characters.
            description: New description (optional). If provided, must be 0-1000 characters.

        Returns:
            Tuple of (success, message). Message is error if not successful.
        """
        # Find the task
        task = self.find_task_by_id(task_id)
        if task is None:
            return False, f"Task not found: {task_id}"

        # Validate title if provided
        if title is not None:
            valid, error = self._validate_title(title)
            if not valid:
                return False, error

        # Validate description if provided
        if description is not None:
            valid, error = self._validate_description(description)
            if not valid:
                return False, error

        # Apply updates
        if title is not None:
            task.title = title.strip()
        if description is not None:
            task.description = description.strip()

        return True, ""

    def delete_task(self, task_id: int) -> tuple[bool, str]:
        """Delete a task by its ID.

        Args:
            task_id: The ID of the task to delete.

        Returns:
            Tuple of (success, message). Message is error if not successful.
        """
        task = self.find_task_by_id(task_id)
        if task is None:
            return False, f"Task not found: {task_id}"
        self._tasks.remove(task)
        return True, ""
