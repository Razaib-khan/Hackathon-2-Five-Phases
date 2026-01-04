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
from ..schemas.task import TaskCreateRequest, TaskUpdateRequest
from .subtask_service import SubtaskService


class TaskService:
    """Service for task operations."""

    MAX_TASKS_PER_USER = 10000  # FR-106
    MAX_BULK_OPERATION = 50  # FR-048, FR-049

    @staticmethod
    def create_task(
        session: Session,
        user_id: UUID,
        data: TaskCreateRequest,
    ) -> Task:
        """
        Create a new task.

        Args:
            session: Database session
            user_id: Owner user UUID
            data: Task creation data

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
            priority=data.priority,
            due_date=data.due_date,
            status=data.status,
            recurrence_pattern=data.recurrence_pattern,
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
            task_id: Task UUID
            user_id: Owner user UUID (for authorization)

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
        user_id: UUID,
        data: TaskUpdateRequest,
    ) -> Task:
        """
        Update task fields.

        Special Behavior (FR-040a, Clarification Q1):
        When task.completed is set to TRUE, automatically marks all subtasks as completed.

        Args:
            session: Database session
            task_id: Task UUID
            user_id: Owner user UUID (for authorization)
            data: Update data (all fields optional)

        Returns:
            Updated Task instance

        Raises:
            ValueError: If task not found or doesn't belong to user
            ValueError: If version mismatch (optimistic locking conflict)
        """
        task = TaskService.get_task(session, task_id, user_id)

        # Optimistic locking check (FR-103)
        if data.version is not None and task.version != data.version:
            raise ValueError("Version conflict. Task was modified by another request.")

        # Track if completed status is changing to TRUE
        completing_task = False
        if data.completed is not None and data.completed and not task.completed:
            completing_task = True

        # Update fields if provided
        if data.title is not None:
            task.title = data.title
        if data.description is not None:
            task.description = data.description
        if data.completed is not None:
            task.completed = data.completed
        if data.priority is not None:
            task.priority = data.priority
        if data.due_date is not None:
            task.due_date = data.due_date
        if data.status is not None:
            task.status = data.status
        if data.time_spent is not None:
            task.time_spent = data.time_spent
        if data.custom_order is not None:
            task.custom_order = data.custom_order
        if data.recurrence_pattern is not None:
            task.recurrence_pattern = data.recurrence_pattern

        # Increment version for optimistic locking
        task.version += 1

        session.add(task)
        session.commit()

        # Auto-complete subtasks when parent task is completed (FR-040a)
        if completing_task:
            SubtaskService.complete_all_subtasks(session, task_id)

        session.refresh(task)
        return task

    @staticmethod
    def delete_task(session: Session, task_id: UUID, user_id: UUID) -> None:
        """
        Delete a task.

        CASCADE DELETE: All subtasks and task_tags are automatically deleted.

        Args:
            session: Database session
            task_id: Task UUID
            user_id: Owner user UUID (for authorization)

        Raises:
            ValueError: If task not found or doesn't belong to user
        """
        task = TaskService.get_task(session, task_id, user_id)

        session.delete(task)
        session.commit()
