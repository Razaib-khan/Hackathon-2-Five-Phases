"""
Tags API Router

Implements tag CRUD endpoints:
- GET /tags: List all user tags
- POST /tags: Create new tag
- PATCH /tags/{tag_id}: Update tag name/color
- DELETE /tags/{tag_id}: Delete tag

All endpoints require authentication.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db.session import get_session
from ..security.jwt import get_current_user
from ..models.user import User
from ..schemas.tag import (
    TagCreateRequest,
    TagListResponse,
    TagResponse,
    TagUpdateRequest,
)
from ..services.tag_service import TagService

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=TagListResponse)
def get_tags(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> TagListResponse:
    """
    Get all tags for the authenticated user.

    Returns tags ordered by name.

    **Implements**: FR-016
    """
    tags = TagService.get_tags(session, current_user.id)

    return TagListResponse(
        tags=[TagResponse.model_validate(tag) for tag in tags],
        total=len(tags),
    )


@router.post("", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(
    data: TagCreateRequest,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> TagResponse:
    """
    Create a new tag.

    Enforces 100 tag limit per user (FR-106).

    **Implements**: FR-016

    **Raises**:
    - 403 Forbidden: If user has reached 100 tag limit
    - 409 Conflict: If tag name already exists for user
    """
    try:
        tag = TagService.create_tag(session, current_user.id, data)
        return TagResponse.model_validate(tag)
    except ValueError as e:
        error_msg = str(e)
        if "limit reached" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=error_msg,
            )
        elif "already exists" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=error_msg,
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg,
            )


@router.patch("/{tag_id}", response_model=TagResponse)
def update_tag(
    tag_id: UUID,
    data: TagUpdateRequest,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> TagResponse:
    """
    Update tag name and/or color.

    All fields are optional. Only provided fields are updated.

    **Implements**: FR-020

    **Raises**:
    - 404 Not Found: If tag doesn't exist or doesn't belong to user
    - 409 Conflict: If new name conflicts with existing tag
    """
    try:
        tag = TagService.update_tag(session, tag_id, current_user.id, data)
        return TagResponse.model_validate(tag)
    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg.lower() or "unauthorized" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag not found.",
            )
        elif "already exists" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=error_msg,
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg,
            )


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    tag_id: UUID,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    """
    Delete a tag.

    CASCADE DELETE: All task-tag associations are automatically removed.

    **Implements**: FR-021

    **Raises**:
    - 404 Not Found: If tag doesn't exist or doesn't belong to user
    """
    try:
        TagService.delete_tag(session, tag_id, current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found.",
        )
