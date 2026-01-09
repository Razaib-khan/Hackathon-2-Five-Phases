from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import schemas
from ..config.database import get_db
from ..services.priority_service import PriorityService
from ..services.task_service import TaskService
from ..services.auth_service import get_current_user


router = APIRouter(
    prefix="/priority",
    tags=["priority"]
)


@router.get("/tasks/{priority}", response_model=List[schemas.TaskResponse])
def get_tasks_by_priority(
    priority: schemas.TaskPriority,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get tasks filtered by priority for the current user
    """
    tasks = PriorityService.get_tasks_by_priority(
        db, str(current_user.id), priority, skip, limit
    )
    return tasks


@router.get("/tasks/{priority}/{status}", response_model=List[schemas.TaskResponse])
def get_tasks_by_priority_and_status(
    priority: schemas.TaskPriority,
    status: schemas.TaskStatus,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get tasks filtered by both priority and status for the current user
    """
    tasks = PriorityService.get_tasks_by_priority_and_status(
        db, str(current_user.id), priority, status, skip, limit
    )
    return tasks


@router.get("/statistics", response_model=dict)
def get_priority_statistics(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get priority-based task statistics for the current user
    """
    stats = PriorityService.get_priority_statistics(db, str(current_user.id))
    return stats


@router.get("/sorted", response_model=List[schemas.TaskResponse])
def get_tasks_sorted_by_priority(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get tasks sorted by priority (critical first, then high, medium, low)
    """
    tasks = PriorityService.get_tasks_sorted_by_priority(
        db, str(current_user.id), skip, limit
    )
    return tasks


@router.patch("/tasks/{task_id}/priority")
def update_task_priority(
    task_id: str,
    priority: schemas.TaskPriority,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update the priority of a specific task
    """
    # First check if the user has permission to update the task
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

    updated_task = PriorityService.update_task_priority(db, task_id, priority)
    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return {
        "message": f"Task priority updated to {priority.value}",
        "task": updated_task
    }


@router.get("/overview", response_model=dict)
def get_priority_overview(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get a comprehensive overview of tasks by priority
    """
    overview = {}

    for priority in schemas.TaskPriority:
        # Get count of tasks for each status within this priority
        status_counts = {}
        for status in schemas.TaskStatus:
            count = len(PriorityService.get_tasks_by_priority_and_status(
                db, str(current_user.id), priority, status, 0, 1000  # Large limit to get all
            ))
            status_counts[status.value] = count

        overview[priority.value] = status_counts

    return {
        "overview": overview,
        "summary": PriorityService.get_priority_statistics(db, str(current_user.id))
    }