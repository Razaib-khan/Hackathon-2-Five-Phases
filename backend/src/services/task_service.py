from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime
from ..models.task import Task, TaskTag, TaskTagAssociation, TaskPriority, TaskStatus
from ..schemas.task import TaskCreate, TaskUpdate


class TaskService:
    @staticmethod
    def create_task(db: Session, task_data: TaskCreate, user_id: str) -> Task:
        """
        Create a new task
        """
        db_task = Task(
            title=task_data.title,
            description=task_data.description,
            priority=task_data.priority,
            status=TaskStatus.PENDING,
            created_by=user_id,
            assigned_to=task_data.assigned_to,
            due_date=task_data.due_date,
            is_public=task_data.is_public
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task

    @staticmethod
    def get_task_by_id(db: Session, task_id: str) -> Optional[Task]:
        """
        Get a task by its ID
        """
        return db.query(Task).filter(Task.id == task_id).first()

    @staticmethod
    def get_tasks_by_user(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[Task]:
        """
        Get tasks created by a specific user
        """
        return db.query(Task).filter(Task.created_by == user_id).offset(skip).limit(limit).all()

    @staticmethod
    def get_assigned_tasks(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[Task]:
        """
        Get tasks assigned to a specific user
        """
        return db.query(Task).filter(Task.assigned_to == user_id).offset(skip).limit(limit).all()

    @staticmethod
    def update_task(db: Session, task_id: str, task_data: TaskUpdate) -> Optional[Task]:
        """
        Update a task
        """
        db_task = db.query(Task).filter(Task.id == task_id).first()
        if db_task:
            for field, value in task_data.dict(exclude_unset=True).items():
                setattr(db_task, field, value)
            # Update the updated_at timestamp
            db_task.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(db_task)
        return db_task

    @staticmethod
    def delete_task(db: Session, task_id: str) -> bool:
        """
        Delete a task
        """
        db_task = db.query(Task).filter(Task.id == task_id).first()
        if db_task:
            db.delete(db_task)
            db.commit()
            return True
        return False

    @staticmethod
    def get_tasks_by_priority(db: Session, user_id: str, priority: TaskPriority, skip: int = 0, limit: int = 100) -> List[Task]:
        """
        Get tasks by priority for a specific user
        """
        return db.query(Task).filter(
            and_(
                or_(Task.created_by == user_id, Task.assigned_to == user_id),
                Task.priority == priority
            )
        ).offset(skip).limit(limit).all()

    @staticmethod
    def get_tasks_by_priority_and_status(db: Session, user_id: str, priority: TaskPriority, status: TaskStatus, skip: int = 0, limit: int = 100) -> List[Task]:
        """
        Get tasks by priority and status for a specific user
        """
        return db.query(Task).filter(
            and_(
                or_(Task.created_by == user_id, Task.assigned_to == user_id),
                Task.priority == priority,
                Task.status == status
            )
        ).offset(skip).limit(limit).all()

    @staticmethod
    def get_filtered_tasks(db: Session, user_id: str, priority: Optional[TaskPriority] = None,
                          status: Optional[TaskStatus] = None, search: Optional[str] = None,
                          skip: int = 0, limit: int = 100) -> List[Task]:
        """
        Get tasks with optimized filtering by priority, status, and search term
        """
        query = db.query(Task).filter(or_(Task.created_by == user_id, Task.assigned_to == user_id))

        if priority:
            query = query.filter(Task.priority == priority)

        if status:
            query = query.filter(Task.status == status)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Task.title.ilike(search_term),
                    Task.description.isnot(None) & Task.description.ilike(search_term)
                )
            )

        # Order by priority (critical first) and then by creation date (newest first)
        from sqlalchemy import case
        priority_order = case(
            [(Task.priority == TaskPriority.CRITICAL, 0),
             (Task.priority == TaskPriority.HIGH, 1),
             (Task.priority == TaskPriority.MEDIUM, 2),
             (Task.priority == TaskPriority.LOW, 3)],
            else_=4
        )

        return query.order_by(priority_order, Task.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_tasks_by_status(db: Session, status: TaskStatus, skip: int = 0, limit: int = 100) -> List[Task]:
        """
        Get tasks by status
        """
        return db.query(Task).filter(Task.status == status).offset(skip).limit(limit).all()

    @staticmethod
    def search_tasks(db: Session, query: str, user_id: str, skip: int = 0, limit: int = 100) -> List[Task]:
        """
        Search tasks by title or description for a specific user
        """
        return db.query(Task).filter(
            and_(
                or_(
                    Task.title.contains(query),
                    Task.description.contains(query)
                ),
                or_(Task.created_by == user_id, Task.assigned_to == user_id)
            )
        ).offset(skip).limit(limit).all()

    @staticmethod
    def complete_task(db: Session, task_id: str) -> Optional[Task]:
        """
        Mark a task as completed
        """
        db_task = db.query(Task).filter(Task.id == task_id).first()
        if db_task:
            db_task.status = TaskStatus.COMPLETED
            db_task.completed_at = datetime.utcnow()
            db.commit()
            db.refresh(db_task)
        return db_task

    @staticmethod
    def assign_task(db: Session, task_id: str, assignee_id: str) -> Optional[Task]:
        """
        Assign a task to a user
        """
        db_task = db.query(Task).filter(Task.id == task_id).first()
        if db_task:
            db_task.assigned_to = assignee_id
            db.commit()
            db.refresh(db_task)
        return db_task

    @staticmethod
    def get_all_user_tasks(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[Task]:
        """
        Get all tasks related to a user (either created by or assigned to the user)
        """
        return db.query(Task).filter(
            or_(Task.created_by == user_id, Task.assigned_to == user_id)
        ).offset(skip).limit(limit).all()

    @staticmethod
    def get_task_statistics(db: Session, user_id: str) -> dict:
        """
        Get task statistics for a user
        """
        total_tasks = db.query(Task).filter(
            or_(Task.created_by == user_id, Task.assigned_to == user_id)
        ).count()

        completed_tasks = db.query(Task).filter(
            and_(
                or_(Task.created_by == user_id, Task.assigned_to == user_id),
                Task.status == TaskStatus.COMPLETED
            )
        ).count()

        pending_tasks = db.query(Task).filter(
            and_(
                or_(Task.created_by == user_id, Task.assigned_to == user_id),
                Task.status == TaskStatus.PENDING
            )
        ).count()

        in_progress_tasks = db.query(Task).filter(
            and_(
                or_(Task.created_by == user_id, Task.assigned_to == user_id),
                Task.status == TaskStatus.IN_PROGRESS
            )
        ).count()

        critical_tasks = db.query(Task).filter(
            and_(
                or_(Task.created_by == user_id, Task.assigned_to == user_id),
                Task.priority == TaskPriority.CRITICAL
            )
        ).count()

        return {
            "total": total_tasks,
            "completed": completed_tasks,
            "pending": pending_tasks,
            "in_progress": in_progress_tasks,
            "critical": critical_tasks
        }

    @staticmethod
    def update_task_status(db: Session, task_id: str, status: TaskStatus) -> Optional[Task]:
        """
        Update the status of a task
        """
        db_task = db.query(Task).filter(Task.id == task_id).first()
        if db_task:
            db_task.status = status
            if status == TaskStatus.COMPLETED:
                db_task.completed_at = datetime.utcnow()
            elif status != TaskStatus.COMPLETED:
                db_task.completed_at = None  # Reset completion time if status changes from completed
            db.commit()
            db.refresh(db_task)
        return db_task

    @staticmethod
    def get_overdue_tasks(db: Session, user_id: str) -> List[Task]:
        """
        Get overdue tasks for a user
        """
        from sqlalchemy import and_, or_, func
        return db.query(Task).filter(
            and_(
                or_(Task.created_by == user_id, Task.assigned_to == user_id),
                Task.due_date < datetime.utcnow(),
                Task.status != TaskStatus.COMPLETED
            )
        ).all()

