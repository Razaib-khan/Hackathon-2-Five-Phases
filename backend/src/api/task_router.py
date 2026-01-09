from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import schemas
from ..config.database import get_db
from ..services.task_service import TaskService
from ..services.auth_service import get_current_user
from datetime import datetime


router = APIRouter(
    prefix="/tasks",
    tags=["tasks"]
)


@router.post("/", response_model=schemas.TaskResponse)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Create a new task
    """
    try:
        db_task = TaskService.create_task(db, task, str(current_user.id))
        return db_task
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating task: {str(e)}"
        )


@router.get("/{task_id}", response_model=schemas.TaskResponse)
def get_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get a specific task by ID
    """
    db_task = TaskService.get_task_by_id(db, task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Check if user has permission to view the task (creator or assigned)
    if db_task.created_by != str(current_user.id) and db_task.assigned_to != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this task"
        )

    return db_task


@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: str,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update a specific task
    """
    db_task = TaskService.get_task_by_id(db, task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Check if user has permission to update the task (creator or assigned)
    if db_task.created_by != str(current_user.id) and db_task.assigned_to != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this task"
        )

    updated_task = TaskService.update_task(db, task_id, task_update)
    return updated_task


@router.delete("/{task_id}")
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Delete a specific task
    """
    db_task = TaskService.get_task_by_id(db, task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Only the creator can delete the task
    if db_task.created_by != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this task"
        )

    success = TaskService.delete_task(db, task_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return {"message": "Task deleted successfully"}


@router.get("/", response_model=List[schemas.TaskResponse])
def get_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    priority: Optional[schemas.TaskPriority] = None,
    status: Optional[schemas.TaskStatus] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get tasks for the current user (created or assigned) with optimized filtering
    """
    # Use the optimized filtering method from TaskService
    tasks = TaskService.get_filtered_tasks(
        db, str(current_user.id), priority, status, search, skip, limit
    )

    return tasks


@router.post("/{task_id}/complete")
def complete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Mark a task as completed
    """
    db_task = TaskService.get_task_by_id(db, task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Check if user has permission to complete the task (creator or assigned)
    if db_task.created_by != str(current_user.id) and db_task.assigned_to != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to complete this task"
        )

    completed_task = TaskService.complete_task(db, task_id)
    if not completed_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return {"message": "Task completed successfully", "task": completed_task}


@router.post("/{task_id}/assign")
def assign_task(
    task_id: str,
    assignee_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Assign a task to a user
    """
    db_task = TaskService.get_task_by_id(db, task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Only the creator can assign the task
    if db_task.created_by != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to assign this task"
        )

    assigned_task = TaskService.assign_task(db, task_id, assignee_id)
    return {"message": "Task assigned successfully", "task": assigned_task}


@router.patch("/{task_id}/status")
def update_task_status(
    task_id: str,
    status: schemas.TaskStatus,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update the status of a task
    """
    db_task = TaskService.get_task_by_id(db, task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Check if user has permission to update the task status (creator or assigned)
    if db_task.created_by != str(current_user.id) and db_task.assigned_to != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update task status"
        )

    updated_task = TaskService.update_task_status(db, task_id, status)
    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return {"message": f"Task status updated to {status.value}", "task": updated_task}


@router.get("/stats", response_model=dict)
def get_task_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get task statistics for the current user
    """
    stats = TaskService.get_task_statistics(db, str(current_user.id))
    return stats


@router.get("/overdue", response_model=List[schemas.TaskResponse])
def get_overdue_tasks(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get overdue tasks for the current user
    """
    overdue_tasks = TaskService.get_overdue_tasks(db, str(current_user.id))
    return overdue_tasks