from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from ..config.database import get_session
from ..models.user import User
from ..models.schemas.user import UserResponse, UserUpdate
from ..services.user_service import UserService
from ..utils.auth import get_current_user_from_token


router = APIRouter()


@router.get("/users/me", response_model=UserResponse, summary="Get current user info")
async def get_current_user(
    current_user: User = Depends(get_current_user_from_token)
) -> UserResponse:
    """
    Get information about the currently authenticated user.

    Args:
        current_user: Authenticated user

    Returns:
        UserResponse object with current user's information
    """
    return UserResponse.from_orm(current_user)


@router.put("/users/me", response_model=UserResponse, summary="Update current user")
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> UserResponse:
    """
    Update information for the currently authenticated user.

    Args:
        user_update: User update data
        current_user: Authenticated user
        session: Database session

    Returns:
        UserResponse object with updated user's information
    """
    updated_user = UserService.update_user(session, current_user.id, user_update)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return UserResponse.from_orm(updated_user)


@router.get("/users/{user_id}", response_model=UserResponse, summary="Get specific user")
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> UserResponse:
    """
    Get information about a specific user.

    Args:
        user_id: ID of the user to retrieve
        current_user: Authenticated user
        session: Database session

    Returns:
        UserResponse object with the user's information
    """
    # In a real implementation, you might want to check permissions
    # to see if the current user can view the other user's information
    user = UserService.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return UserResponse.from_orm(user)


@router.get("/users/", response_model=List[UserResponse], summary="List users")
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> List[UserResponse]:
    """
    List users with pagination.

    Args:
        skip: Number of users to skip
        limit: Maximum number of users to return
        current_user: Authenticated user
        session: Database session

    Returns:
        List of UserResponse objects
    """
    # In a real implementation, you might want to check permissions
    # to see if the current user can list other users
    users = UserService.get_users(session, skip=skip, limit=limit)
    return [UserResponse.from_orm(user) for user in users]


@router.delete("/users/me", summary="Deactivate current user account")
async def deactivate_current_user(
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> dict:
    """
    Deactivate the current user's account.

    Args:
        current_user: Authenticated user
        session: Database session

    Returns:
        Success message
    """
    deactivated_user = UserService.deactivate_user(session, current_user.id)
    if not deactivated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {"message": "User account deactivated successfully"}


@router.post("/users/me/activate", response_model=UserResponse, summary="Activate current user account")
async def activate_current_user(
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> UserResponse:
    """
    Activate the current user's account.

    Args:
        current_user: Authenticated user
        session: Database session

    Returns:
        UserResponse object with activated user's information
    """
    activated_user = UserService.activate_user(session, current_user.id)
    if not activated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return UserResponse.from_orm(activated_user)


@router.post("/users/me/verify", response_model=UserResponse, summary="Verify current user account")
async def verify_current_user(
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> UserResponse:
    """
    Verify the current user's email account.

    Args:
        current_user: Authenticated user
        session: Database session

    Returns:
        UserResponse object with verified user's information
    """
    verified_user = UserService.verify_user(session, current_user.id)
    if not verified_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return UserResponse.from_orm(verified_user)