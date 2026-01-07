"""
Task CRUD API Endpoints

Implements:
- GET /api/users/{user_id}/tasks: List user's tasks with pagination
- POST /api/users/{user_id}/tasks: Create new task
- GET /api/users/{user_id}/tasks/{task_id}: Get single task
- PUT /api/users/{user_id}/tasks/{task_id}: Update task
- DELETE /api/users/{user_id}/tasks/{task_id}: Delete task
- PATCH /api/users/{user_id}/tasks/{task_id}/complete: Toggle completion

Security:
- All endpoints require JWT authentication
- User isolation: JWT.sub must match path user_id (403 Forbidden)
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from ..config.database import get_session
from ..models.task import Task
from ..schemas.task import (
    TaskCreateRequest,
    TaskListResponse,
    TaskResponse,
    TaskUpdateRequest,
)
from ..security.jwt import get_current_user, verify_user_access

router = APIRouter()


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
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    completed: Optional[bool] = Query(default=None, description="Filter by completion status"),
    search: Optional[str] = Query(default=None, max_length=100, description="Search in title/description"),
    sort_by: str = Query(default="created_at", description="Sort field"),
    sort_order: str = Query(default="desc", regex="^(asc|desc)$", description="Sort order"),
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> TaskListResponse:
    """
    List tasks for a user with pagination, filtering, and sorting.

    Args:
        user_id: Target user's UUID (must match JWT)
        page: Page number (1-indexed)
        page_size: Number of items per page
        completed: Optional filter by completion status
        search: Optional search in title/description
        sort_by: Field to sort by (created_at, title, completed)
        sort_order: Sort direction (asc/desc)
        current_user_id: Authenticated user ID from JWT
        db: Database session

    Returns:
        Paginated task list
    """
    # Verify user access (JWT.sub must match path user_id)
    verify_user_access(current_user_id, str(user_id))

    # Build query
    query = db.query(Task).filter(Task.user_id == user_id)

    # Apply completion filter
    if completed is not None:
        query = query.filter(Task.completed == completed)

    # Apply search filter
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Task.title.ilike(search_pattern)) |
            (Task.description.ilike(search_pattern))
        )

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
        403: {"description": "Access denied"},
    },
)
async def create_task(
    user_id: UUID,
    request: TaskCreateRequest,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> TaskResponse:
    """
    Create a new task for a user.

    Args:
        user_id: Target user's UUID (must match JWT)
        request: Task creation data
        current_user_id: Authenticated user ID from JWT
        db: Database session

    Returns:
        Created task
    """
    verify_user_access(current_user_id, str(user_id))

    task = Task(
        user_id=user_id,
        title=request.title,
        description=request.description,
    )

    db.add(task)
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
    """
    Get a single task by ID.

    Args:
        user_id: Target user's UUID (must match JWT)
        task_id: Task UUID
        current_user_id: Authenticated user ID from JWT
        db: Database session

    Returns:
        Task data

    Raises:
        HTTPException 404: Task not found
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

    return TaskResponse.model_validate(task)


@router.put(
    "/users/{user_id}/tasks/{task_id}",
    response_model=TaskResponse,
    responses={
        200: {"description": "Task updated"},
        401: {"description": "Not authenticated"},
        403: {"description": "Access denied"},
        404: {"description": "Task not found"},
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
    Update a task.

    Only provided fields are updated.

    Args:
        user_id: Target user's UUID (must match JWT)
        task_id: Task UUID
        request: Update data
        current_user_id: Authenticated user ID from JWT
        db: Database session

    Returns:
        Updated task
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

    # Update only provided fields
    if request.title is not None:
        task.title = request.title
    if request.description is not None:
        task.description = request.description
    if request.completed is not None:
        task.completed = request.completed

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
    """
    Delete a task.

    Args:
        user_id: Target user's UUID (must match JWT)
        task_id: Task UUID
        current_user_id: Authenticated user ID from JWT
        db: Database session
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

    db.delete(task)
    db.commit()


@router.patch(
    "/users/{user_id}/tasks/{task_id}/complete",
    response_model=TaskResponse,
    responses={
        200: {"description": "Completion status toggled"},
        401: {"description": "Not authenticated"},
        403: {"description": "Access denied"},
        404: {"description": "Task not found"},
    },
)
async def toggle_task_completion(
    user_id: UUID,
    task_id: UUID,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> TaskResponse:
    """
    Toggle task completion status.

    Flips the completed field from true to false or vice versa.

    Args:
        user_id: Target user's UUID (must match JWT)
        task_id: Task UUID
        current_user_id: Authenticated user ID from JWT
        db: Database session

    Returns:
        Updated task with new completion status
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

    task.completed = not task.completed
    task.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(task)

    return TaskResponse.model_validate(task)
