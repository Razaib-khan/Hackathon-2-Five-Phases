from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from ..models.task import Task, TaskPriority, TaskStatus
from ..schemas.task import TaskResponse


class PriorityService:
    @staticmethod
    def get_tasks_by_priority(
        db: Session,
        user_id: str,
        priority: TaskPriority,
        skip: int = 0,
        limit: int = 100
    ) -> List[Task]:
        """
        Get tasks filtered by priority for a specific user
        """
        return db.query(Task).filter(
            and_(
                or_(Task.created_by == user_id, Task.assigned_to == user_id),
                Task.priority == priority
            )
        ).offset(skip).limit(limit).all()

    @staticmethod
    def get_tasks_by_priority_and_status(
        db: Session,
        user_id: str,
        priority: TaskPriority,
        status: TaskStatus,
        skip: int = 0,
        limit: int = 100
    ) -> List[Task]:
        """
        Get tasks filtered by both priority and status for a specific user
        """
        return db.query(Task).filter(
            and_(
                or_(Task.created_by == user_id, Task.assigned_to == user_id),
                Task.priority == priority,
                Task.status == status
            )
        ).offset(skip).limit(limit).all()

    @staticmethod
    def get_priority_statistics(db: Session, user_id: str) -> dict:
        """
        Get priority-based task statistics for a user
        """
        from sqlalchemy import func

        # Count tasks by priority
        priority_counts = {}
        for priority in TaskPriority:
            count = db.query(Task).filter(
                and_(
                    or_(Task.created_by == user_id, Task.assigned_to == user_id),
                    Task.priority == priority
                )
            ).count()
            priority_counts[priority.value] = count

        # Count completed tasks by priority
        completed_by_priority = {}
        for priority in TaskPriority:
            count = db.query(Task).filter(
                and_(
                    or_(Task.created_by == user_id, Task.assigned_to == user_id),
                    Task.priority == priority,
                    Task.status == TaskStatus.COMPLETED
                )
            ).count()
            completed_by_priority[priority.value] = count

        # Count overdue tasks by priority
        overdue_by_priority = {}
        for priority in TaskPriority:
            count = db.query(Task).filter(
                and_(
                    or_(Task.created_by == user_id, Task.assigned_to == user_id),
                    Task.priority == priority,
                    Task.due_date < func.current_timestamp(),
                    Task.status != TaskStatus.COMPLETED
                )
            ).count()
            overdue_by_priority[priority.value] = count

        return {
            "by_priority": priority_counts,
            "completed_by_priority": completed_by_priority,
            "overdue_by_priority": overdue_by_priority
        }

    @staticmethod
    def get_tasks_sorted_by_priority(
        db: Session,
        user_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Task]:
        """
        Get tasks sorted by priority (critical first, then high, medium, low)
        """
        priority_order = {
            TaskPriority.CRITICAL: 0,
            TaskPriority.HIGH: 1,
            TaskPriority.MEDIUM: 2,
            TaskPriority.LOW: 3
        }

        # SQLAlchemy doesn't support custom sort orders easily, so we'll use a case expression
        from sqlalchemy import case

        priority_case = case(
            [(Task.priority == TaskPriority.CRITICAL, 0),
             (Task.priority == TaskPriority.HIGH, 1),
             (Task.priority == TaskPriority.MEDIUM, 2),
             (Task.priority == TaskPriority.LOW, 3)],
            else_=4
        )

        return db.query(Task).filter(
            or_(Task.created_by == user_id, Task.assigned_to == user_id)
        ).order_by(priority_case, Task.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def update_task_priority(db: Session, task_id: str, new_priority: TaskPriority) -> Task:
        """
        Update the priority of a specific task
        """
        db_task = db.query(Task).filter(Task.id == task_id).first()
        if db_task:
            old_priority = db_task.priority
            db_task.priority = new_priority
            db.commit()
            db.refresh(db_task)

            # Optionally, you could return information about the change for notification purposes
            return db_task
        return None