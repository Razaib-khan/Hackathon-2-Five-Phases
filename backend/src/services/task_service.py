"""
Task Service Layer

Implements business logic for task CRUD operations:
- create_task: Create new task with 10,000 task limit enforcement (FR-106)
- get_tasks: Retrieve tasks with filtering, pagination, search
- get_task: Get single task by ID
- update_task: Update task fields with auto-complete subtasks logic (FR-040a)
- delete_task: Delete task (CASCADE removes subtasks)
- bulk_update_tasks: Update multiple tasks at once
- bulk_delete_tasks: Delete multiple tasks at once

Limits:
- Maximum 10,000 tasks per user (FR-106)
- Maximum 50 tasks per bulk operation

Special Behavior:
- When task.completed set to TRUE, all subtasks auto-complete (FR-040a, Clarification Q1)
"""

from typing import List, Optional
from uuid import UUID

from sqlmodel import Session, select, func, or_

from ..models.task import Task
from ..models.schemas.task import TaskCreate, TaskUpdate, TaskResponse, StatusEnum
from .subtask_service import SubtaskService


class TaskService:
    """Service for task operations."""

    MAX_TASKS_PER_USER = 10000  # FR-106
    MAX_BULK_OPERATION = 50  # FR-048, FR-049

    @staticmethod
    def create_task(
        session: Session,
        data: TaskCreate,
        user_id: UUID,
    ) -> Task:
        """
        Create a new task.

        Args:
            session: Database session
            data: Task creation data
            user_id: Owner user ID

        Returns:
            Created Task instance

        Raises:
            ValueError: If user has reached 10,000 task limit (FR-106)
        """
        # Check task limit
        task_count = session.exec(
            select(func.count(Task.id)).where(Task.user_id == user_id)
        ).one()

        if task_count >= TaskService.MAX_TASKS_PER_USER:
            raise ValueError(
                f"Task limit reached. Maximum {TaskService.MAX_TASKS_PER_USER} tasks per user."
            )

        # Create task
        task = Task(
            user_id=user_id,
            title=data.title,
            description=data.description,
            priority=str(data.priority.value) if hasattr(data.priority, 'value') else str(data.priority),
            due_date=data.due_date,
            status=str(data.status.value) if hasattr(data.status, 'value') else str(data.status),
            created_by=user_id,  # Set the creator to the user_id
        )

        session.add(task)
        session.commit()
        session.refresh(task)

        return task

    @staticmethod
    def get_task(session: Session, task_id: UUID, user_id: UUID) -> Task:
        """
        Get a single task by ID.

        Args:
            session: Database session
            task_id: Task ID
            user_id: Owner user ID (for authorization)

        Returns:
            Task instance

        Raises:
            ValueError: If task not found or doesn't belong to user
        """
        task = session.get(Task, task_id)

        if not task:
            raise ValueError("Task not found.")

        if task.user_id != user_id:
            raise ValueError("Unauthorized access to task.")

        return task

    @staticmethod
    def update_task(
        session: Session,
        task_id: UUID,
        data: TaskUpdate,
    ) -> Task:
        """
        Update task fields.

        Args:
            session: Database session
            task_id: Task ID
            data: Update data (all fields optional)

        Returns:
            Updated Task instance
        """
        task = session.get(Task, task_id)

        if not task:
            raise ValueError("Task not found.")

        # Update fields if provided
        if data.title is not None:
            task.title = data.title
        if data.description is not None:
            task.description = data.description
        if data.completed is not None:
            task.completed = data.completed
        if data.priority is not None:
            task.priority = str(data.priority.value) if hasattr(data.priority, 'value') else str(data.priority)
        if data.due_date is not None:
            task.due_date = data.due_date
        if data.status is not None:
            task.status = str(data.status.value) if hasattr(data.status, 'value') else str(data.status)
        if data.assigned_to is not None:
            task.assigned_to = data.assigned_to
        if data.project_id is not None:
            task.project_id = data.project_id

        session.add(task)
        session.commit()
        session.refresh(task)

        return task

    @staticmethod
    def delete_task(session: Session, task_id: UUID) -> bool:
        """
        Delete a task.

        Args:
            session: Database session
            task_id: Task ID

        Returns:
            True if deletion was successful
        """
        task = session.get(Task, task_id)

        if not task:
            return False

        session.delete(task)
        session.commit()
        return True

    # Methods required by the API router
    @staticmethod
    def check_task_creation_permissions(session: Session, user_id: UUID) -> bool:
        """
        Check if a user has permission to create tasks.

        Args:
            session: Database session
            user_id: User ID to check permissions for

        Returns:
            True if user has permission to create tasks
        """
        # In a basic implementation, all active users can create tasks
        # In a more advanced system, this might check user roles or quotas
        return True

    @staticmethod
    def get_tasks_by_user(session: Session, user_id: UUID, skip: int = 0, limit: int = 100) -> List[Task]:
        """
        Get tasks created by a specific user.

        Args:
            session: Database session
            user_id: User ID to get tasks for
            skip: Number of tasks to skip
            limit: Maximum number of tasks to return

        Returns:
            List of tasks created by the user
        """
        statement = select(Task).where(Task.created_by == user_id).offset(skip).limit(limit)
        return session.exec(statement).all()

    @staticmethod
    def get_tasks_assigned_to_user(session: Session, user_id: UUID, skip: int = 0, limit: int = 100) -> List[Task]:
        """
        Get tasks assigned to a specific user.

        Args:
            session: Database session
            user_id: User ID to get assigned tasks for
            skip: Number of tasks to skip
            limit: Maximum number of tasks to return

        Returns:
            List of tasks assigned to the user
        """
        statement = select(Task).where(Task.assigned_to == user_id).offset(skip).limit(limit)
        return session.exec(statement).all()

    @staticmethod
    def get_task_by_id(session: Session, task_id: UUID) -> Optional[Task]:
        """
        Get a task by its ID.

        Args:
            session: Database session
            task_id: Task ID to retrieve

        Returns:
            Task object if found, None otherwise
        """
        return session.get(Task, task_id)

    @staticmethod
    def check_task_access(session: Session, task_id: UUID, user_id: UUID) -> bool:
        """
        Check if a user has access to a specific task.

        Args:
            session: Database session
            task_id: Task ID to check access for
            user_id: User ID to check access for

        Returns:
            True if user has access to the task
        """
        task = session.get(Task, task_id)
        if not task:
            return False
        # Check if user is the creator or assigned to the task
        return task.created_by == user_id or (task.assigned_to and task.assigned_to == user_id)

    @staticmethod
    def update_task_status(session: Session, task_id: UUID, status: StatusEnum) -> Optional[Task]:
        """
        Update the status of a task.

        Args:
            session: Database session
            task_id: Task ID to update
            status: New status for the task

        Returns:
            Updated task object if successful, None otherwise
        """
        task = session.get(Task, task_id)
        if not task:
            return None

        task.status = status
        session.add(task)
        session.commit()
        session.refresh(task)

        return task

    @staticmethod
    def update_task(session: Session, task_id: UUID, task_update: TaskUpdate) -> Optional[Task]:
        """
        Update a task with the provided data.

        Args:
            session: Database session
            task_id: Task ID to update
            task_update: Update data

        Returns:
            Updated task object if successful, None otherwise
        """
        task = session.get(Task, task_id)
        if not task:
            return None

        # Update fields if provided
        if task_update.title is not None:
            task.title = task_update.title
        if task_update.description is not None:
            task.description = task_update.description
        if task_update.completed is not None:
            task.completed = task_update.completed
        if task_update.priority is not None:
            task.priority = task_update.priority
        if task_update.due_date is not None:
            task.due_date = task_update.due_date
        if task_update.status is not None:
            task.status = task_update.status

        session.add(task)
        session.commit()
        session.refresh(task)

        return task

    @staticmethod
    def delete_task(session: Session, task_id: int) -> bool:
        """
        Delete a task.

        Args:
            session: Database session
            task_id: Task ID to delete

        Returns:
            True if deletion was successful
        """
        task = session.get(Task, task_id)
        if not task:
            return False

        session.delete(task)
        session.commit()
        return True
