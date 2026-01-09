from functools import wraps
from fastapi import Depends, HTTPException, status
from typing import List, Union

from ..config.auth import get_current_user
from ..models.user import User, UserRole


def require_role(required_role: Union[UserRole, List[UserRole]]):
    """
    Middleware to check if the current user has the required role(s).
    Can accept a single role or a list of roles.
    """
    def role_checker(current_user: User = Depends(get_current_user)):
        if isinstance(required_role, list):
            # Check if user's role is in the required roles list
            if current_user.role not in required_role:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions"
                )
        else:
            # Check if user's role matches the required role
            if current_user.role != required_role:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions"
                )

        return current_user

    return role_checker


def require_any_role(*roles: UserRole):
    """
    Middleware to check if the current user has any of the specified roles.
    Usage: @require_any_role(UserRole.ADMIN, UserRole.ORGANIZER)
    """
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user

    return role_checker


def require_permission(permission: str):
    """
    Middleware to check if the current user has a specific permission.
    This is a simplified version - in a real app, you'd have a more complex permissions system.
    """
    def permission_checker(current_user: User = Depends(get_current_user)):
        # Define permissions mapping based on roles
        role_permissions = {
            UserRole.PARTICIPANT: [
                "view_own_profile",
                "edit_own_profile",
                "view_hackathons",
                "join_hackathons",
                "create_teams",
                "submit_projects",
                "view_notifications"
            ],
            UserRole.JUDGE: [
                "view_own_profile",
                "edit_own_profile",
                "view_hackathons",
                "view_submissions",
                "evaluate_submissions",
                "view_notifications"
            ],
            UserRole.ADMIN: [
                "view_own_profile",
                "edit_own_profile",
                "view_hackathons",
                "manage_hackathons",
                "manage_users",
                "send_notifications",
                "view_reports",
                "view_all_submissions",
                "view_all_teams",
                "view_all_participants"
            ]
        }

        user_permissions = role_permissions.get(current_user.role, [])

        if permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )

        return current_user

    return permission_checker


def is_admin(current_user: User = Depends(get_current_user)):
    """
    Convenience function to check if user is admin
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def is_authorized_for_hackathon(hackathon_id: str, current_user: User = Depends(get_current_user)):
    """
    Check if user is authorized to access hackathon resources.
    A user can access a hackathon if they are:
    - An admin
    - The creator of the hackathon
    - A participant in the hackathon
    - A judge for the hackathon
    """
    from sqlalchemy.orm import Session
    from ..config.database import get_db
    from ..models.hackathon import Hackathon, HackathonParticipant

    # Create a temporary session - in practice, you'd inject this differently
    db: Session = next(get_db())

    try:
        # Get hackathon to check creator
        hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()

        if not hackathon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hackathon not found"
            )

        # Admins can access any hackathon
        if current_user.role == UserRole.ADMIN:
            return current_user

        # Creator can access their hackathon
        if str(hackathon.created_by) == str(current_user.id):
            return current_user

        # Check if user is a participant or judge in this hackathon
        participant = db.query(HackathonParticipant).filter(
            HackathonParticipant.hackathon_id == hackathon_id,
            HackathonParticipant.user_id == current_user.id
        ).first()

        if participant and participant.role in ["participant", "judge", "mentor"]:
            return current_user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this hackathon"
        )
    finally:
        db.close()