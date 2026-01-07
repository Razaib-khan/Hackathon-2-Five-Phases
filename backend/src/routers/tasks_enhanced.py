"""
Enhanced Task CRUD API Endpoints

Advanced Features:
- Multi-criteria filtering (priority[], status[], tag_ids[], date ranges, search)
- Combined filter logic with AND operation
- Version conflict handling (HTTP 409)
- Bulk operations (create/update/delete, max 50)
- Full-text search with ILIKE
- Join tags/subtasks in responses
- Time tracking updates
- Recurrence pattern support

Implements: FR-047 to FR-053, FR-103, FR-104, FR-105, FR-106
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session
from sqlalchemy.orm import joinedload
from sqlalchemy import and_, or_

from ..config.database import get_session
from ..models.task import Task
from ..models.tag import Tag
from ..models.task_tag import TaskTag
from ..models.subtask import Subtask
from ..schemas.task import (
    TaskCreateRequest,
    TaskListResponse,
    TaskResponse,
    TaskUpdateRequest,
    BulkTaskCreateRequest,
    BulkTaskUpdateRequest,
    BulkTaskDeleteRequest,
)
from ..security.jwt import get_current_user, verify_user_access
from ..services.subtask_service import SubtaskService

router = APIRouter()

# Maximum items per user (FR-106)
MAX_TASKS_PER_USER = 10000


@router.get(
    "/users/{user_id}/tasks",
    response_model=TaskListResponse,
    responses={
        200: {"description": "Task list retrieved"},
        401: {"description": "Not authenticated"},
        403: {"description": "Access denied"},
    },
)
async def list_tasks(
    user_id: UUID,
    # Pagination
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),

    # Filters (FR-047, FR-048, FR-049, FR-050)
    priority: Optional[List[str]] = Query(default=None, description="Filter by priority (multi-select)"),
    status: Optional[List[str]] = Query(default=None, description="Filter by status (multi-select)"),
    tag_ids: Optional[List[str]] = Query(default=None, description="Filter by tag IDs (multi-select)"),
    completed: Optional[bool] = Query(default=None, description="Filter by completion status"),
    due_date_start: Optional[datetime] = Query(default=None, description="Filter tasks due after this date"),
    due_date_end: Optional[datetime] = Query(default=None, description="Filter tasks due before this date"),
    search: Optional[str] = Query(default=None, max_length=200, description="Search in title/description (FR-051)"),

    # Sorting
    sort_by: str = Query(default="created_at", description="Sort field"),
    sort_order: str = Query(default="desc", regex="^(asc|desc)$", description="Sort order"),

    # Auth
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> TaskListResponse:
    """
    List tasks with advanced multi-criteria filtering (AND logic - FR-052).

    All filters are combined with AND logic. Tasks must match ALL specified criteria.
    """
    verify_user_access(current_user_id, str(user_id))

    # Build query with eager loading for tags and subtasks
    query = db.query(Task).filter(Task.user_id == user_id)
    query = query.options(
        joinedload(Task.task_tags).joinedload(TaskTag.tag),
        joinedload(Task.subtasks)
    )

    # Apply filters (AND logic - FR-052)
    filters = []

    # Priority filter (multi-select)
    if priority:
        filters.append(Task.priority.in_(priority))

    # Status filter (multi-select)
    if status:
        filters.append(Task.status.in_(status))

    # Completion filter
    if completed is not None:
        filters.append(Task.completed == completed)

    # Due date range filter
    if due_date_start:
        filters.append(Task.due_date >= due_date_start)
    if due_date_end:
        filters.append(Task.due_date <= due_date_end)

    # Tag filter (tasks must have at least one of the specified tags)
    if tag_ids:
        tag_uuids = [UUID(tag_id) for tag_id in tag_ids]
        query = query.join(Task.task_tags).filter(TaskTag.tag_id.in_(tag_uuids))

    # Search filter (FR-051 - max 200 chars)
    if search:
        search_pattern = f"%{search[:200]}%"
        filters.append(
            or_(
                Task.title.ilike(search_pattern),
                Task.description.ilike(search_pattern)
            )
        )

    # Apply all filters
    if filters:
        query = query.filter(and_(*filters))

    # Get total count before pagination
    total = query.count()

    # Apply sorting
    sort_column = getattr(Task, sort_by, Task.created_at)
    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Apply pagination
    offset = (page - 1) * page_size
    tasks = query.offset(offset).limit(page_size).all()

    return TaskListResponse(
        tasks=[TaskResponse.model_validate(task) for task in tasks],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post(
    "/users/{user_id}/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "Task created"},
        401: {"description": "Not authenticated"},
        403: {"description": "Access denied or task limit reached"},
        400: {"description": "Validation error"},
    },
)
async def create_task(
    user_id: UUID,
    request: TaskCreateRequest,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> TaskResponse:
    """
    Create a new task with all fields including tags and recurrence pattern.

    Enforces 10,000 task limit per user (FR-106).
    """
    verify_user_access(current_user_id, str(user_id))

    # Check task limit (FR-106)
    task_count = db.query(Task).filter(Task.user_id == user_id).count()
    if task_count >= MAX_TASKS_PER_USER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Task limit reached. Maximum {MAX_TASKS_PER_USER} tasks per user."
        )

    # Create task with all fields
    task = Task(
        user_id=user_id,
        title=request.title,
        description=request.description,
        priority=request.priority or "none",
        status=request.status or "todo",
        due_date=request.due_date,
        time_spent=request.time_spent or 0,
        custom_order=request.custom_order,
        recurrence_pattern=request.recurrence_pattern,
        version=1,
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    # Add tags if specified (max 10 - validated in schema)
    if request.tag_ids:
        for tag_id in request.tag_ids[:10]:  # Enforce limit
            task_tag = TaskTag(task_id=task.id, tag_id=UUID(tag_id))
            db.add(task_tag)
        db.commit()
        db.refresh(task)

    return TaskResponse.model_validate(task)


@router.get(
    "/users/{user_id}/tasks/{task_id}",
    response_model=TaskResponse,
    responses={
        200: {"description": "Task retrieved"},
        401: {"description": "Not authenticated"},
        403: {"description": "Access denied"},
        404: {"description": "Task not found"},
    },
)
async def get_task(
    user_id: UUID,
    task_id: UUID,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> TaskResponse:
    """Get a single task with tags and subtasks."""
    verify_user_access(current_user_id, str(user_id))

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id,
    ).options(
        joinedload(Task.task_tags).joinedload(TaskTag.tag),
        joinedload(Task.subtasks)
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return TaskResponse.model_validate(task)


@router.patch(
    "/users/{user_id}/tasks/{task_id}",
    response_model=TaskResponse,
    responses={
        200: {"description": "Task updated"},
        401: {"description": "Not authenticated"},
        403: {"description": "Access denied"},
        404: {"description": "Task not found"},
        409: {"description": "Version conflict - task was modified by another action (FR-103)"},
    },
)
async def update_task(
    user_id: UUID,
    task_id: UUID,
    request: TaskUpdateRequest,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> TaskResponse:
    """
    Update a task with optimistic locking (version conflict detection - FR-103).

    If the version in the request doesn't match the current version,
    returns HTTP 409 Conflict.
    """
    verify_user_access(current_user_id, str(user_id))

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id,
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Version conflict check (FR-103)
    if request.version is not None and task.version != request.version:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Version conflict. Expected version {task.version}, got {request.version}. Task was modified by another action.",
        )

    # Update fields
    if request.title is not None:
        task.title = request.title
    if request.description is not None:
        task.description = request.description
    if request.priority is not None:
        task.priority = request.priority
    if request.status is not None:
        task.status = request.status
    if request.due_date is not None:
        task.due_date = request.due_date
    if request.completed is not None:
        # Auto-complete subtasks when parent is completed (FR-040a)
        if request.completed and not task.completed:
            SubtaskService.complete_all_subtasks(db, task_id)
        task.completed = request.completed
    if request.time_spent is not None:
        task.time_spent = request.time_spent
    if request.custom_order is not None:
        task.custom_order = request.custom_order
    if request.recurrence_pattern is not None:
        task.recurrence_pattern = request.recurrence_pattern

    # Update tags if specified
    if request.tag_ids is not None:
        # Remove existing tags
        db.query(TaskTag).filter(TaskTag.task_id == task_id).delete()
        # Add new tags (max 10)
        for tag_id in request.tag_ids[:10]:
            task_tag = TaskTag(task_id=task.id, tag_id=UUID(tag_id))
            db.add(task_tag)

    # Increment version (optimistic locking)
    task.version += 1
    task.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(task)

    return TaskResponse.model_validate(task)


@router.delete(
    "/users/{user_id}/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        204: {"description": "Task deleted"},
        401: {"description": "Not authenticated"},
        403: {"description": "Access denied"},
        404: {"description": "Task not found"},
    },
)
async def delete_task(
    user_id: UUID,
    task_id: UUID,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> None:
    """Delete a task (CASCADE deletes subtasks and tag associations)."""
    verify_user_access(current_user_id, str(user_id))

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id,
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    db.delete(task)
    db.commit()


# Bulk Operations (FR-104, FR-105)

@router.post(
    "/users/{user_id}/tasks/bulk",
    response_model=List[TaskResponse],
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "Tasks created"},
        400: {"description": "Too many tasks (max 50) or validation error"},
        403: {"description": "Task limit exceeded"},
    },
)
async def bulk_create_tasks(
    user_id: UUID,
    request: BulkTaskCreateRequest,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> List[TaskResponse]:
    """
    Bulk create tasks (max 50 per request - FR-104).

    Enforces overall 10,000 task limit per user.
    """
    verify_user_access(current_user_id, str(user_id))

    # Validate bulk limit
    if len(request.tasks) > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 50 tasks per bulk create request"
        )

    # Check task limit
    task_count = db.query(Task).filter(Task.user_id == user_id).count()
    if task_count + len(request.tasks) > MAX_TASKS_PER_USER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Task limit would be exceeded. Maximum {MAX_TASKS_PER_USER} tasks per user."
        )

    created_tasks = []
    for task_data in request.tasks:
        task = Task(
            user_id=user_id,
            title=task_data.title,
            description=task_data.description,
            priority=task_data.priority or "none",
            status=task_data.status or "todo",
            due_date=task_data.due_date,
            time_spent=task_data.time_spent or 0,
            custom_order=task_data.custom_order,
            recurrence_pattern=task_data.recurrence_pattern,
            version=1,
        )
        db.add(task)
        created_tasks.append(task)

    db.commit()

    # Refresh all tasks
    for task in created_tasks:
        db.refresh(task)

    return [TaskResponse.model_validate(task) for task in created_tasks]


@router.patch(
    "/users/{user_id}/tasks/bulk",
    response_model=List[TaskResponse],
    responses={
        200: {"description": "Tasks updated"},
        400: {"description": "Too many tasks (max 50)"},
    },
)
async def bulk_update_tasks(
    user_id: UUID,
    request: BulkTaskUpdateRequest,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> List[TaskResponse]:
    """Bulk update tasks (max 50 per request - FR-104)."""
    verify_user_access(current_user_id, str(user_id))

    if len(request.updates) > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 50 tasks per bulk update request"
        )

    updated_tasks = []
    for update in request.updates:
        task = db.query(Task).filter(
            Task.id == UUID(update.task_id),
            Task.user_id == user_id,
        ).first()

        if task:
            # Apply updates
            for field, value in update.updates.items():
                if hasattr(task, field):
                    setattr(task, field, value)

            task.version += 1
            task.updated_at = datetime.utcnow()
            updated_tasks.append(task)

    db.commit()

    for task in updated_tasks:
        db.refresh(task)

    return [TaskResponse.model_validate(task) for task in updated_tasks]


@router.delete(
    "/users/{user_id}/tasks/bulk",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        204: {"description": "Tasks deleted"},
        400: {"description": "Too many tasks (max 50)"},
    },
)
async def bulk_delete_tasks(
    user_id: UUID,
    request: BulkTaskDeleteRequest,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> None:
    """Bulk delete tasks (max 50 per request - FR-105)."""
    verify_user_access(current_user_id, str(user_id))

    if len(request.task_ids) > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 50 tasks per bulk delete request"
        )

    task_uuids = [UUID(task_id) for task_id in request.task_ids]

    db.query(Task).filter(
        Task.id.in_(task_uuids),
        Task.user_id == user_id,
    ).delete(synchronize_session=False)

    db.commit()
