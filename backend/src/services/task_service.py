from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from ..models.task import Task, TaskBase, PriorityEnum
from ..models.user import User
from ..utils.errors import TaskNotFoundException
from ..utils.logging import app_logger


class TaskService:
    @staticmethod
    def create_task(
        session: Session,
        user_id: UUID,
        title: str,
        description: Optional[str] = None,
        priority: PriorityEnum = PriorityEnum.MEDIUM
    ) -> Task:
        """Create a new task for a user"""
        app_logger.info(f"Creating task for user ID: {user_id}")

        task = Task(
            title=title,
            description=description,
            priority=priority,
            user_id=user_id
        )

        session.add(task)
        session.commit()
        session.refresh(task)

        app_logger.info(f"Task created successfully with ID: {task.id} for user ID: {user_id}")

        return task

    @staticmethod
    def get_task_by_id(session: Session, task_id: UUID, user_id: UUID) -> Optional[Task]:
        """Get a specific task by ID for a user"""
        return session.exec(
            select(Task).where(Task.id == task_id).where(Task.user_id == user_id)
        ).first()

    @staticmethod
    def get_tasks_by_user(session: Session, user_id: UUID) -> List[Task]:
        """Get all tasks for a user"""
        return session.exec(
            select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
        ).all()

    @staticmethod
    def update_task(
        session: Session,
        task_id: UUID,
        user_id: UUID,
        title: Optional[str] = None,
        description: Optional[str] = None,
        priority: Optional[str] = None,
        completed: Optional[bool] = None
    ) -> Optional[Task]:
        """Update a task for a user"""
        task = session.exec(
            select(Task).where(Task.id == task_id).where(Task.user_id == user_id)
        ).first()

        if not task:
            return None

        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        if priority is not None:
            task.priority = PriorityEnum(priority)
        if completed is not None:
            task.completed = completed
            if completed and task.completed_at is None:
                task.completed_at = datetime.utcnow()
            elif not completed:
                task.completed_at = None

        task.updated_at = datetime.utcnow()

        session.add(task)
        session.commit()
        session.refresh(task)

        return task

    @staticmethod
    def delete_task(session: Session, task_id: UUID, user_id: UUID) -> bool:
        """Delete a task for a user"""
        app_logger.info(f"Deleting task ID: {task_id} for user ID: {user_id}")

        task = session.exec(
            select(Task).where(Task.id == task_id).where(Task.user_id == user_id)
        ).first()

        if not task:
            app_logger.warning(f"Attempt to delete non-existent task ID: {task_id} for user ID: {user_id}")
            return False

        session.delete(task)
        session.commit()

        app_logger.info(f"Task ID: {task_id} successfully deleted for user ID: {user_id}")

        return True

    @staticmethod
    def get_tasks_by_priority(session: Session, user_id: UUID, priority: PriorityEnum) -> List[Task]:
        """Get all tasks for a user with a specific priority"""
        return session.exec(
            select(Task).where(Task.user_id == user_id).where(Task.priority == priority)
        ).all()

    @staticmethod
    def get_completed_tasks(session: Session, user_id: UUID) -> List[Task]:
        """Get all completed tasks for a user"""
        return session.exec(
            select(Task).where(Task.user_id == user_id).where(Task.completed == True)
        ).all()

    @staticmethod
    def get_pending_tasks(session: Session, user_id: UUID) -> List[Task]:
        """Get all pending tasks for a user"""
        return session.exec(
            select(Task).where(Task.user_id == user_id).where(Task.completed == False)
        ).all()