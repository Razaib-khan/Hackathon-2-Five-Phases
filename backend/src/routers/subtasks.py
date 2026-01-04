"""
Subtasks API Router

Implements subtask CRUD endpoints:
- POST /tasks/{task_id}/subtasks: Create subtask
- PATCH /subtasks/{subtask_id}: Update subtask
- DELETE /subtasks/{subtask_id}: Delete subtask

All endpoints require authentication.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db.session import get_session
from ..security.jwt import get_current_user
from ..models.user import User
from ..schemas.subtask import (
    SubtaskCreateRequest,
    SubtaskResponse,
    SubtaskUpdateRequest,
)
from ..services.subtask_service import SubtaskService

router = APIRouter(tags=["subtasks"])


@router.post(
    "/tasks/{task_id}/subtasks",
    response_model=SubtaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_subtask(
    task_id: UUID,
    data: SubtaskCreateRequest,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> SubtaskResponse:
    """
    Create a new subtask for a task.

    Enforces 50 subtask limit per task (FR-106).

    **Implements**: FR-039

    **Raises**:
    - 404 Not Found: If parent task doesn't exist or doesn't belong to user
    - 403 Forbidden: If task has reached 50 subtask limit
    """
    try:
        subtask = SubtaskService.create_subtask(
            session, task_id, current_user.id, data
        )
        return SubtaskResponse.model_validate(subtask)
    except ValueError as e:
        error_msg = str(e)
        if "limit reached" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=error_msg,
            )
        elif "not found" in error_msg.lower() or "unauthorized" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found.",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg,
            )


@router.patch("/subtasks/{subtask_id}", response_model=SubtaskResponse)
def update_subtask(
    subtask_id: UUID,
    data: SubtaskUpdateRequest,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> SubtaskResponse:
    """
    Update subtask title, completed status, and/or order.

    All fields are optional. Only provided fields are updated.

    **Implements**: FR-040

    **Raises**:
    - 404 Not Found: If subtask doesn't exist or parent task doesn't belong to user
    """
    try:
        subtask = SubtaskService.update_subtask(
            session, subtask_id, current_user.id, data
        )
        return SubtaskResponse.model_validate(subtask)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtask not found.",
        )


@router.delete("/subtasks/{subtask_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subtask(
    subtask_id: UUID,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    """
    Delete a subtask.

    **Raises**:
    - 404 Not Found: If subtask doesn't exist or parent task doesn't belong to user
    """
    try:
        SubtaskService.delete_subtask(session, subtask_id, current_user.id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtask not found.",
        )
