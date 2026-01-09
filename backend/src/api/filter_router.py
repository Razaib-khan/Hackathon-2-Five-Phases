from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import schemas
from ..config.database import get_db
from ..services.task_filter_service import TaskFilterService
from ..services.auth_service import get_current_user
from uuid import UUID


router = APIRouter(
    prefix="/filters",
    tags=["filters"]
)


@router.post("/saved", response_model=schemas.TaskFilterResponse)
def create_saved_filter(
    filter_data: schemas.TaskFilterCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Create a new saved filter
    """
    try:
        db_filter = TaskFilterService.create_saved_filter(db, filter_data, str(current_user.id))
        return db_filter
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating filter: {str(e)}"
        )


@router.get("/saved/{filter_id}", response_model=schemas.TaskFilterResponse)
def get_saved_filter(
    filter_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get a specific saved filter by ID
    """
    db_filter = TaskFilterService.get_saved_filter(db, filter_id, str(current_user.id))
    if not db_filter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved filter not found"
        )

    return db_filter


@router.get("/saved", response_model=List[schemas.TaskFilterResponse])
def get_saved_filters(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get all saved filters for the current user
    """
    filters = TaskFilterService.get_saved_filters(db, str(current_user.id), skip, limit)
    return filters


@router.put("/saved/{filter_id}", response_model=schemas.TaskFilterResponse)
def update_saved_filter(
    filter_id: str,
    filter_data: schemas.TaskFilterUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update a saved filter
    """
    db_filter = TaskFilterService.get_saved_filter(db, filter_id, str(current_user.id))
    if not db_filter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved filter not found"
        )

    updated_filter = TaskFilterService.update_saved_filter(db, filter_id, filter_data, str(current_user.id))
    return updated_filter


@router.delete("/saved/{filter_id}")
def delete_saved_filter(
    filter_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Delete a saved filter
    """
    success = TaskFilterService.delete_saved_filter(db, filter_id, str(current_user.id))
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved filter not found"
        )

    return {"message": "Saved filter deleted successfully"}


@router.get("/saved/default", response_model=Optional[schemas.TaskFilterResponse])
def get_default_filter(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get the default filter for the current user
    """
    default_filter = TaskFilterService.get_default_filter(db, str(current_user.id))
    return default_filter


@router.post("/apply", response_model=List[schemas.TaskResponse])
def apply_filter(
    request: schemas.TaskFilterApplyRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Apply a filter configuration to get tasks
    """
    try:
        if request.filter_id:
            # Apply a saved filter
            tasks = TaskFilterService.apply_saved_filter(
                db,
                request.filter_id,
                str(current_user.id),
                request.offset or 0,
                request.limit or 100
            )
        elif request.filter_config:
            # Apply a direct filter configuration
            if request.search_query:
                # Use search and filter combination
                tasks = TaskFilterService.search_and_filter_tasks(
                    db,
                    request.search_query,
                    request.filter_config,
                    str(current_user.id),
                    request.offset or 0,
                    request.limit or 100
                )
            else:
                tasks = TaskFilterService.apply_filter_config(
                    db,
                    request.filter_config,
                    str(current_user.id),
                    request.offset or 0,
                    request.limit or 100
                )
        else:
            # No filter specified, return all user's tasks
            from ..services.task_service import TaskService
            tasks = TaskService.get_all_user_tasks(
                db,
                str(current_user.id),
                request.offset or 0,
                request.limit or 100
            )

        return tasks
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error applying filter: {str(e)}"
        )


@router.post("/search-and-filter", response_model=List[schemas.TaskResponse])
def search_and_filter_tasks(
    request: schemas.TaskFilterApplyRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Search and filter tasks combined
    """
    try:
        if request.search_query:
            tasks = TaskFilterService.search_and_filter_tasks(
                db,
                request.search_query,
                request.filter_config,
                str(current_user.id),
                request.offset or 0,
                request.limit or 100
            )
        else:
            # Just apply the filter config without search
            if request.filter_config:
                tasks = TaskFilterService.apply_filter_config(
                    db,
                    request.filter_config,
                    str(current_user.id),
                    request.offset or 0,
                    request.limit or 100
                )
            else:
                # No filter or search, return all user tasks
                from ..services.task_service import TaskService
                tasks = TaskService.get_all_user_tasks(
                    db,
                    str(current_user.id),
                    request.offset or 0,
                    request.limit or 100
                )

        return tasks
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error applying search and filter: {str(e)}"
        )


@router.post("/count", response_model=int)
def get_filtered_task_count(
    request: schemas.TaskFilterApplyRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get the count of tasks matching a filter configuration
    """
    try:
        if request.filter_config:
            count = TaskFilterService.get_filtered_task_count(
                db,
                request.filter_config,
                str(current_user.id)
            )
        else:
            # If no filter config is provided, return total count for user
            from ..services.task_service import TaskService
            count = len(TaskService.get_all_user_tasks(db, str(current_user.id), 0, 999999))  # Large limit to get all

        return count
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error getting filtered task count: {str(e)}"
        )