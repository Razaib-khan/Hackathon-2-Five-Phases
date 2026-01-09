from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime
from uuid import UUID
from ..models.task import Task, TaskTagAssociation, TaskPriority, TaskStatus
from ..models.task_filter import TaskFilter
from ..schemas.task_filter import TaskFilterCreate, TaskFilterUpdate, TaskFilterResponse, TaskFilterConfig


class TaskFilterService:
    @staticmethod
    def create_saved_filter(db: Session, filter_data: TaskFilterCreate, user_id: str) -> TaskFilter:
        """
        Create a new saved filter for a user
        """
        # If setting this as default, unset other defaults for the user
        if filter_data.is_default:
            db.query(TaskFilter).filter(
                and_(
                    TaskFilter.user_id == user_id,
                    TaskFilter.is_default == True
                )
            ).update({"is_default": False})

        db_filter = TaskFilter(
            name=filter_data.name,
            filter_config=filter_data.filter_config.model_dump(),
            is_default=filter_data.is_default,
            user_id=user_id
        )
        db.add(db_filter)
        db.commit()
        db.refresh(db_filter)
        return db_filter

    @staticmethod
    def get_saved_filter(db: Session, filter_id: str, user_id: str) -> Optional[TaskFilter]:
        """
        Get a specific saved filter by ID for a user
        """
        return db.query(TaskFilter).filter(
            and_(
                TaskFilter.id == filter_id,
                TaskFilter.user_id == user_id
            )
        ).first()

    @staticmethod
    def get_saved_filters(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[TaskFilter]:
        """
        Get all saved filters for a user
        """
        return db.query(TaskFilter).filter(TaskFilter.user_id == user_id).offset(skip).limit(limit).all()

    @staticmethod
    def update_saved_filter(db: Session, filter_id: str, filter_data: TaskFilterUpdate, user_id: str) -> Optional[TaskFilter]:
        """
        Update a saved filter
        """
        db_filter = db.query(TaskFilter).filter(
            and_(
                TaskFilter.id == filter_id,
                TaskFilter.user_id == user_id
            )
        ).first()

        if db_filter:
            update_data = filter_data.model_dump(exclude_unset=True)

            # Handle is_default logic
            if "is_default" in update_data and update_data["is_default"]:
                # Unset other defaults for the user
                db.query(TaskFilter).filter(
                    and_(
                        TaskFilter.user_id == user_id,
                        TaskFilter.is_default == True
                    )
                ).update({"is_default": False})

            for field, value in update_data.items():
                if field == "filter_config" and value:
                    setattr(db_filter, field, value.model_dump())
                else:
                    setattr(db_filter, field, value)

            db.commit()
            db.refresh(db_filter)

        return db_filter

    @staticmethod
    def delete_saved_filter(db: Session, filter_id: str, user_id: str) -> bool:
        """
        Delete a saved filter
        """
        db_filter = db.query(TaskFilter).filter(
            and_(
                TaskFilter.id == filter_id,
                TaskFilter.user_id == user_id
            )
        ).first()

        if db_filter:
            db.delete(db_filter)
            db.commit()
            return True
        return False

    @staticmethod
    def get_default_filter(db: Session, user_id: str) -> Optional[TaskFilter]:
        """
        Get the default filter for a user
        """
        return db.query(TaskFilter).filter(
            and_(
                TaskFilter.user_id == user_id,
                TaskFilter.is_default == True
            )
        ).first()

    @staticmethod
    def apply_filter_config(db: Session, filter_config: TaskFilterConfig, user_id: str, skip: int = 0, limit: int = 100) -> List[Task]:
        """
        Apply a filter configuration to get tasks
        """
        query = db.query(Task).filter(
            or_(Task.created_by == user_id, Task.assigned_to == user_id)
        )

        # Apply title contains filter
        if filter_config.title_contains:
            query = query.filter(Task.title.contains(filter_config.title_contains))

        # Apply description contains filter
        if filter_config.description_contains:
            query = query.filter(Task.description.contains(filter_config.description_contains))

        # Apply statuses filter
        if filter_config.statuses:
            query = query.filter(Task.status.in_(filter_config.statuses))

        # Apply priorities filter
        if filter_config.priorities:
            query = query.filter(Task.priority.in_(filter_config.priorities))

        # Apply assigned to me filter
        if filter_config.assigned_to_me is not None:
            if filter_config.assigned_to_me:
                query = query.filter(Task.assigned_to == user_id)
            else:
                query = query.filter(Task.assigned_to != user_id)

        # Apply created by me filter
        if filter_config.created_by_me is not None:
            if filter_config.created_by_me:
                query = query.filter(Task.created_by == user_id)
            else:
                query = query.filter(Task.created_by != user_id)

        # Apply due date range filter
        if filter_config.due_date_from:
            query = query.filter(Task.due_date >= filter_config.due_date_from)
        if filter_config.due_date_to:
            query = query.filter(Task.due_date <= filter_config.due_date_to)

        # Apply completed date range filter
        if filter_config.completed_from:
            query = query.filter(Task.completed_at >= filter_config.completed_from)
        if filter_config.completed_to:
            query = query.filter(Task.completed_at <= filter_config.completed_to)

        # Apply tags filter
        if filter_config.tags:
            # Join with task tags and filter by tag IDs
            query = query.join(TaskTagAssociation).filter(
                TaskTagAssociation.tag_id.in_(filter_config.tags)
            )

        # Apply public filter
        if filter_config.is_public is not None:
            query = query.filter(Task.is_public == filter_config.is_public)

        # Apply sorting
        sort_field = getattr(Task, filter_config.sort_field, Task.created_at)
        if filter_config.sort_order == "asc":
            query = query.order_by(sort_field.asc())
        else:
            query = query.order_by(sort_field.desc())

        # Apply pagination
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def apply_saved_filter(db: Session, filter_id: str, user_id: str, skip: int = 0, limit: int = 100) -> List[Task]:
        """
        Apply a saved filter by ID
        """
        saved_filter = TaskFilterService.get_saved_filter(db, filter_id, user_id)
        if not saved_filter:
            return []

        filter_config = TaskFilterConfig(**saved_filter.filter_config)
        return TaskFilterService.apply_filter_config(db, filter_config, user_id, skip, limit)

    @staticmethod
    def search_and_filter_tasks(db: Session, search_query: str, filter_config: Optional[TaskFilterConfig], user_id: str, skip: int = 0, limit: int = 100) -> List[Task]:
        """
        Search and filter tasks combined
        """
        query = db.query(Task).filter(
            or_(Task.created_by == user_id, Task.assigned_to == user_id)
        )

        # Apply search query
        if search_query:
            query = query.filter(
                or_(
                    Task.title.contains(search_query),
                    Task.description.contains(search_query)
                )
            )

        # Apply filter configuration if provided
        if filter_config:
            # Apply title contains filter
            if filter_config.title_contains:
                query = query.filter(Task.title.contains(filter_config.title_contains))

            # Apply description contains filter
            if filter_config.description_contains:
                query = query.filter(Task.description.contains(filter_config.description_contains))

            # Apply statuses filter
            if filter_config.statuses:
                query = query.filter(Task.status.in_(filter_config.statuses))

            # Apply priorities filter
            if filter_config.priorities:
                query = query.filter(Task.priority.in_(filter_config.priorities))

            # Apply assigned to me filter
            if filter_config.assigned_to_me is not None:
                if filter_config.assigned_to_me:
                    query = query.filter(Task.assigned_to == user_id)
                else:
                    query = query.filter(Task.assigned_to != user_id)

            # Apply created by me filter
            if filter_config.created_by_me is not None:
                if filter_config.created_by_me:
                    query = query.filter(Task.created_by == user_id)
                else:
                    query = query.filter(Task.created_by != user_id)

            # Apply due date range filter
            if filter_config.due_date_from:
                query = query.filter(Task.due_date >= filter_config.due_date_from)
            if filter_config.due_date_to:
                query = query.filter(Task.due_date <= filter_config.due_date_to)

            # Apply completed date range filter
            if filter_config.completed_from:
                query = query.filter(Task.completed_at >= filter_config.completed_from)
            if filter_config.completed_to:
                query = query.filter(Task.completed_at <= filter_config.completed_to)

            # Apply tags filter
            if filter_config.tags:
                query = query.join(TaskTagAssociation).filter(
                    TaskTagAssociation.tag_id.in_(filter_config.tags)
                )

            # Apply public filter
            if filter_config.is_public is not None:
                query = query.filter(Task.is_public == filter_config.is_public)

        # Apply sorting
        if filter_config and filter_config.sort_field:
            sort_field = getattr(Task, filter_config.sort_field, Task.created_at)
            if filter_config.sort_order == "asc":
                query = query.order_by(sort_field.asc())
            else:
                query = query.order_by(sort_field.desc())
        else:
            # Default sorting
            query = query.order_by(Task.created_at.desc())

        # Apply pagination
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_filtered_task_count(db: Session, filter_config: TaskFilterConfig, user_id: str) -> int:
        """
        Get the count of tasks matching a filter configuration
        """
        query = db.query(func.count(Task.id)).filter(
            or_(Task.created_by == user_id, Task.assigned_to == user_id)
        )

        # Apply title contains filter
        if filter_config.title_contains:
            query = query.filter(Task.title.contains(filter_config.title_contains))

        # Apply description contains filter
        if filter_config.description_contains:
            query = query.filter(Task.description.contains(filter_config.description_contains))

        # Apply statuses filter
        if filter_config.statuses:
            query = query.filter(Task.status.in_(filter_config.statuses))

        # Apply priorities filter
        if filter_config.priorities:
            query = query.filter(Task.priority.in_(filter_config.priorities))

        # Apply assigned to me filter
        if filter_config.assigned_to_me is not None:
            if filter_config.assigned_to_me:
                query = query.filter(Task.assigned_to == user_id)
            else:
                query = query.filter(Task.assigned_to != user_id)

        # Apply created by me filter
        if filter_config.created_by_me is not None:
            if filter_config.created_by_me:
                query = query.filter(Task.created_by == user_id)
            else:
                query = query.filter(Task.created_by != user_id)

        # Apply due date range filter
        if filter_config.due_date_from:
            query = query.filter(Task.due_date >= filter_config.due_date_from)
        if filter_config.due_date_to:
            query = query.filter(Task.due_date <= filter_config.due_date_to)

        # Apply completed date range filter
        if filter_config.completed_from:
            query = query.filter(Task.completed_at >= filter_config.completed_from)
        if filter_config.completed_to:
            query = query.filter(Task.completed_at <= filter_config.completed_to)

        # Apply tags filter
        if filter_config.tags:
            query = query.join(TaskTagAssociation).filter(
                TaskTagAssociation.tag_id.in_(filter_config.tags)
            )

        # Apply public filter
        if filter_config.is_public is not None:
            query = query.filter(Task.is_public == filter_config.is_public)

        return query.scalar()