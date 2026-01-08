from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from ..config.database import get_session
from ..models.user import User
from ..models.task import Task
from ..models.schemas.task import TaskCreate, TaskUpdate, TaskResponse, StatusEnum
from ..services.task_service import TaskService
from ..utils.auth import get_current_user_from_token
from ..utils.task_validation import validate_task_creation_data, validate_task_update_data


router = APIRouter()


@router.post("/tasks/", response_model=TaskResponse, summary="Create a new task")
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> TaskResponse:
    """
    Create a new task. According to requirements, only title and priority are required.

    Args:
        task_data: Task creation data (only title and priority required)
        current_user: Authenticated user (creator)
        session: Database session

    Returns:
        TaskResponse object with the created task's information
    """
    # Validate task creation data
    is_valid, error_msg = validate_task_creation_data(task_data)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )

    # Check if user has permission to create tasks
    has_permission = TaskService.check_task_creation_permissions(session, current_user.id)
    if not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create tasks"
        )

    task = TaskService.create_task(session, task_data, current_user.id)
    return TaskResponse.model_validate(task)


@router.get("/tasks/", response_model=List[TaskResponse], summary="List user's tasks")
async def list_tasks(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> List[TaskResponse]:
    """
    List tasks created by or assigned to the current user with pagination.

    Args:
        skip: Number of tasks to skip
        limit: Maximum number of tasks to return
        current_user: Authenticated user
        session: Database session

    Returns:
        List of TaskResponse objects
    """
    # Get tasks created by the user
    created_tasks = TaskService.get_tasks_by_user(session, current_user.id, skip=skip, limit=limit//2)

    # Get tasks assigned to the user
    assigned_tasks = TaskService.get_tasks_assigned_to_user(session, current_user.id, skip=skip, limit=limit//2)

    # Combine both lists, removing duplicates
    all_tasks = list(set(created_tasks + assigned_tasks))

    return [TaskResponse.model_validate(task) for task in all_tasks]


@router.get("/tasks/{task_id}", response_model=TaskResponse, summary="Get specific task")
async def get_task(
    task_id: str,
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> TaskResponse:
    """
    Get information about a specific task.

    Args:
        task_id: ID of the task to retrieve
        current_user: Authenticated user
        session: Database session

    Returns:
        TaskResponse object with the task's information
    """
    from uuid import UUID
    try:
        task_uuid = UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )

    task = TaskService.get_task_by_id(session, task_uuid)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Check if the user has access to the task
    has_access = TaskService.check_task_access(session, task_uuid, current_user.id)
    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this task"
        )

    return TaskResponse.model_validate(task)


@router.put("/tasks/{task_id}", response_model=TaskResponse, summary="Update a task")
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> TaskResponse:
    """
    Update a task.

    Args:
        task_id: ID of the task to update
        task_update: Task update data
        current_user: Authenticated user
        session: Database session

    Returns:
        TaskResponse object with the updated task's information
    """
    from uuid import UUID
    try:
        task_uuid = UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )

    # Validate task update data
    is_valid, error_msg = validate_task_update_data(task_update)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )

    # Check if the task exists
    task = TaskService.get_task_by_id(session, task_uuid)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Check if the user has permission to update the task
    has_permission = TaskService.check_task_access(session, task_uuid, current_user.id)
    if not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this task"
        )

    updated_task = TaskService.update_task(session, task_uuid, task_update)
    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return TaskResponse.model_validate(updated_task)


@router.delete("/tasks/{task_id}", summary="Delete a task")
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> dict:
    """
    Delete a task.

    Args:
        task_id: ID of the task to delete
        current_user: Authenticated user
        session: Database session

    Returns:
        Success message
    """
    from uuid import UUID
    try:
        task_uuid = UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )

    # Check if the task exists
    task = TaskService.get_task_by_id(session, task_uuid)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Check if the user has permission to delete the task
    # Only the creator can delete a task
    if task.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this task"
        )

    deleted = TaskService.delete_task(session, task_uuid)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return {"message": "Task deleted successfully"}


@router.patch("/tasks/{task_id}/status", response_model=TaskResponse, summary="Update task status")
async def update_task_status(
    task_id: str,
    status: StatusEnum,
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> TaskResponse:
    """
    Update the status of a task.

    Args:
        task_id: ID of the task to update
        status: New status for the task
        current_user: Authenticated user
        session: Database session

    Returns:
        TaskResponse object with the updated task's information
    """
    from uuid import UUID
    try:
        task_uuid = UUID(task_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )

    # Check if the task exists
    task = TaskService.get_task_by_id(session, task_uuid)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Check if the user has permission to update the task
    has_permission = TaskService.check_task_access(session, task_uuid, current_user.id)
    if not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this task"
        )

    updated_task = TaskService.update_task_status(session, task_uuid, status)
    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return TaskResponse.model_validate(updated_task)