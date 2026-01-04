"""
Subtask Service Layer

Implements business logic for subtask CRUD operations:
- create_subtask: Create new subtask with 50 subtask limit enforcement (FR-106)
- get_subtask: Get single subtask by ID
- update_subtask: Update subtask title, completed status, order
- delete_subtask: Delete subtask

Limits:
- Maximum 50 subtasks per task (FR-106)

Special Behavior:
- When parent task.completed = TRUE, all subtasks auto-complete (handled in task_service)
"""

from uuid import UUID

from sqlmodel import Session, select, func

from ..models.subtask import Subtask
from ..models.task import Task
from ..schemas.subtask import SubtaskCreateRequest, SubtaskUpdateRequest


class SubtaskService:
    """Service for subtask operations."""

    MAX_SUBTASKS_PER_TASK = 50  # FR-106

    @staticmethod
    def create_subtask(
        session: Session,
        task_id: UUID,
        user_id: UUID,
        data: SubtaskCreateRequest,
    ) -> Subtask:
        """
        Create a new subtask.

        Args:
            session: Database session
            task_id: Parent task UUID
            user_id: Owner user UUID (for authorization)
            data: Subtask creation data

        Returns:
            Created Subtask instance

        Raises:
            ValueError: If parent task not found or doesn't belong to user
            ValueError: If task has reached 50 subtask limit (FR-106)
        """
        # Verify task exists and belongs to user
        task = session.get(Task, task_id)
        if not task:
            raise ValueError("Task not found.")
        if task.user_id != user_id:
            raise ValueError("Unauthorized access to task.")

        # Check subtask limit
        subtask_count = session.exec(
            select(func.count(Subtask.id)).where(Subtask.task_id == task_id)
        ).one()

        if subtask_count >= SubtaskService.MAX_SUBTASKS_PER_TASK:
            raise ValueError(
                f"Subtask limit reached. Maximum {SubtaskService.MAX_SUBTASKS_PER_TASK} subtasks per task."
            )

        # Create subtask
        subtask = Subtask(
            task_id=task_id,
            title=data.title,
            order_index=data.order_index,
        )

        session.add(subtask)
        session.commit()
        session.refresh(subtask)

        return subtask

    @staticmethod
    def get_subtask(session: Session, subtask_id: UUID, user_id: UUID) -> Subtask:
        """
        Get a single subtask by ID.

        Args:
            session: Database session
            subtask_id: Subtask UUID
            user_id: Owner user UUID (for authorization via parent task)

        Returns:
            Subtask instance

        Raises:
            ValueError: If subtask not found or parent task doesn't belong to user
        """
        subtask = session.get(Subtask, subtask_id)

        if not subtask:
            raise ValueError("Subtask not found.")

        # Load parent task to check authorization
        task = session.get(Task, subtask.task_id)
        if not task or task.user_id != user_id:
            raise ValueError("Unauthorized access to subtask.")

        return subtask

    @staticmethod
    def update_subtask(
        session: Session,
        subtask_id: UUID,
        user_id: UUID,
        data: SubtaskUpdateRequest,
    ) -> Subtask:
        """
        Update subtask title, completed status, and/or order.

        Args:
            session: Database session
            subtask_id: Subtask UUID
            user_id: Owner user UUID (for authorization)
            data: Update data (all fields optional)

        Returns:
            Updated Subtask instance

        Raises:
            ValueError: If subtask not found or doesn't belong to user
        """
        subtask = SubtaskService.get_subtask(session, subtask_id, user_id)

        # Update fields if provided
        if data.title is not None:
            subtask.title = data.title
        if data.completed is not None:
            subtask.completed = data.completed
        if data.order_index is not None:
            subtask.order_index = data.order_index

        session.add(subtask)
        session.commit()
        session.refresh(subtask)

        return subtask

    @staticmethod
    def delete_subtask(session: Session, subtask_id: UUID, user_id: UUID) -> None:
        """
        Delete a subtask.

        Args:
            session: Database session
            subtask_id: Subtask UUID
            user_id: Owner user UUID (for authorization)

        Raises:
            ValueError: If subtask not found or doesn't belong to user
        """
        subtask = SubtaskService.get_subtask(session, subtask_id, user_id)

        session.delete(subtask)
        session.commit()

    @staticmethod
    def complete_all_subtasks(session: Session, task_id: UUID) -> None:
        """
        Mark all subtasks of a task as completed.

        Called when parent task.completed is set to TRUE (FR-040a, Clarification Q1).

        Args:
            session: Database session
            task_id: Parent task UUID
        """
        subtasks = session.exec(
            select(Subtask).where(Subtask.task_id == task_id)
        ).all()

        for subtask in subtasks:
            subtask.completed = True
            session.add(subtask)

        session.commit()
