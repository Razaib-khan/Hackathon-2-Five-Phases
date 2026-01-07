from typing import Optional
from datetime import datetime
from ..models.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from ..models.task import Task


def validate_task_creation_data(task_data: TaskCreate) -> tuple[bool, Optional[str]]:
    """
    Validate task creation data according to requirements.

    Args:
        task_data: Task creation data to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    # According to the requirements, only title and priority are required for task creation
    if not task_data.title or len(task_data.title.strip()) == 0:
        return False, "Title is required for task creation"

    if len(task_data.title.strip()) > 200:
        return False, "Title must be 200 characters or less"

    # Validate priority if provided
    if hasattr(task_data, 'priority') and task_data.priority:
        valid_priorities = ['low', 'medium', 'high', 'urgent']
        if str(task_data.priority) not in valid_priorities:
            return False, f"Priority must be one of: {', '.join(valid_priorities)}"

    # Validate status if provided
    if hasattr(task_data, 'status') and task_data.status:
        valid_statuses = ['todo', 'in_progress', 'done', 'blocked']
        if str(task_data.status) not in valid_statuses:
            return False, f"Status must be one of: {', '.join(valid_statuses)}"

    # Validate due date if provided
    if task_data.due_date:
        if task_data.due_date < datetime.utcnow():
            return False, "Due date cannot be in the past"

    return True, None


def validate_task_update_data(task_update: TaskUpdate) -> tuple[bool, Optional[str]]:
    """
    Validate task update data.

    Args:
        task_update: Task update data to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    # Validate title if provided
    if task_update.title is not None:
        if len(task_update.title.strip()) == 0:
            return False, "Title cannot be empty"
        if len(task_update.title.strip()) > 200:
            return False, "Title must be 200 characters or less"

    # Validate priority if provided
    if task_update.priority is not None:
        valid_priorities = ['low', 'medium', 'high', 'urgent']
        if task_update.priority not in valid_priorities:
            return False, f"Priority must be one of: {', '.join(valid_priorities)}"

    # Validate status if provided
    if task_update.status is not None:
        valid_statuses = ['todo', 'in_progress', 'done', 'blocked']
        if task_update.status not in valid_statuses:
            return False, f"Status must be one of: {', '.join(valid_statuses)}"

    # Validate due date if provided
    if task_update.due_date:
        if task_update.due_date < datetime.utcnow():
            return False, "Due date cannot be in the past"

    return True, None


def validate_task_priority(priority: str) -> tuple[bool, Optional[str]]:
    """
    Validate task priority value.

    Args:
        priority: Priority value to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    valid_priorities = ['low', 'medium', 'high', 'urgent']
    if priority not in valid_priorities:
        return False, f"Priority must be one of: {', '.join(valid_priorities)}"
    return True, None


def validate_task_status(status: str) -> tuple[bool, Optional[str]]:
    """
    Validate task status value.

    Args:
        status: Status value to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    valid_statuses = ['todo', 'in_progress', 'done', 'blocked']
    if status not in valid_statuses:
        return False, f"Status must be one of: {', '.join(valid_statuses)}"
    return True, None


def validate_task_title(title: str) -> tuple[bool, Optional[str]]:
    """
    Validate task title.

    Args:
        title: Title to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not title or len(title.strip()) == 0:
        return False, "Title is required"
    if len(title.strip()) > 200:
        return False, "Title must be 200 characters or less"
    return True, None


def check_task_ownership(task: Task, user_id: int) -> bool:
    """
    Check if a user owns a task (either created it or is assigned to it).

    Args:
        task: Task object to check
        user_id: User ID to check ownership for

    Returns:
        True if user owns the task, False otherwise
    """
    return task.created_by == user_id or (task.assigned_to and task.assigned_to == user_id)


def check_task_edit_permission(task: Task, user_id: int) -> bool:
    """
    Check if a user has permission to edit a task.

    Args:
        task: Task object to check
        user_id: User ID to check permission for

    Returns:
        True if user has edit permission, False otherwise
    """
    # For now, anyone who owns the task (created or assigned) can edit it
    # In a more complex system, this could involve role-based permissions
    return check_task_ownership(task, user_id)


def check_task_delete_permission(task: Task, user_id: int) -> bool:
    """
    Check if a user has permission to delete a task.

    Args:
        task: Task object to check
        user_id: User ID to check permission for

    Returns:
        True if user has delete permission, False otherwise
    """
    # For now, only the creator can delete the task
    # In a more complex system, this could involve role-based permissions
    return task.created_by == user_id


def is_task_overdue(task: Task) -> bool:
    """
    Check if a task is overdue.

    Args:
        task: Task object to check

    Returns:
        True if task is overdue, False otherwise
    """
    if not task.due_date:
        return False
    return task.due_date < datetime.utcnow()


def can_change_task_status(current_status: str, new_status: str) -> bool:
    """
    Check if a task status transition is valid.

    Args:
        current_status: Current status of the task
        new_status: New status to transition to

    Returns:
        True if transition is valid, False otherwise
    """
    # Define valid state transitions
    valid_transitions = {
        'todo': ['in_progress', 'blocked'],
        'in_progress': ['done', 'blocked', 'todo'],
        'done': ['in_progress', 'todo'],
        'blocked': ['todo', 'in_progress']
    }

    return new_status in valid_transitions.get(current_status, [])


def validate_task_assignment(task: Task, assignee_id: Optional[int]) -> tuple[bool, Optional[str]]:
    """
    Validate task assignment to a user.

    Args:
        task: Task object to assign
        assignee_id: ID of the user to assign to

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not assignee_id:
        return True, None

    # In a real implementation, you would check if the assignee exists and is valid
    # For now, we just validate that the ID is positive
    if assignee_id <= 0:
        return False, "Invalid assignee ID"

    return True, None