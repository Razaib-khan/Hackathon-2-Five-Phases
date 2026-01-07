from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Dict, Any
from ..config.database import get_session
from ..models.user import User
from ..services.dashboard_service import DashboardService
from ..services.rbac_service import RBACService
from ..utils.auth import get_current_user_from_token
from ..config.settings import settings


router = APIRouter()


@router.get("/dashboard/stats", summary="Get dashboard statistics")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Get dashboard statistics with access control.

    Returns:
        Dashboard statistics including user counts, task counts, and project counts.
    """
    # Check if user has permission to access dashboard stats
    has_permission = RBACService.check_permission(session, current_user.id, 'dashboard', 'read')
    if not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access dashboard statistics"
        )

    try:
        stats = DashboardService.get_dashboard_statistics(session, current_user.id)
        return {
            "status": "success",
            "message": "Dashboard statistics retrieved successfully",
            "data": stats
        }
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )


@router.get("/dashboard/tasks", summary="Get dashboard task overview")
async def get_dashboard_tasks(
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Get dashboard task overview with access control.

    Returns:
        Dashboard task information including user's tasks, assigned tasks, and overdue tasks.
    """
    # Check if user has permission to access dashboard tasks
    has_permission = RBACService.check_permission(session, current_user.id, 'dashboard', 'read')
    if not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access dashboard tasks"
        )

    try:
        tasks_info = DashboardService.get_dashboard_tasks(session, current_user.id)
        return {
            "status": "success",
            "message": "Dashboard tasks retrieved successfully",
            "data": tasks_info
        }
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )


@router.get("/dashboard/projects", summary="Get dashboard project overview")
async def get_dashboard_projects(
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Get dashboard project overview with access control.

    Returns:
        Dashboard project information including user's projects and active projects.
    """
    # Check if user has permission to access dashboard projects
    has_permission = RBACService.check_permission(session, current_user.id, 'dashboard', 'read')
    if not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access dashboard projects"
        )

    try:
        projects_info = DashboardService.get_dashboard_projects(session, current_user.id)
        return {
            "status": "success",
            "message": "Dashboard projects retrieved successfully",
            "data": projects_info
        }
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )


@router.get("/dashboard/activity", summary="Get user activity statistics")
async def get_user_activity(
    current_user: User = Depends(get_current_user_from_token),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Get user activity statistics with access control.

    Returns:
        User activity statistics including recent task creation and completion data.
    """
    # Check if user has permission to access dashboard activity
    has_permission = RBACService.check_permission(session, current_user.id, 'dashboard', 'read')
    if not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access dashboard activity"
        )

    try:
        activity_stats = DashboardService.get_user_activity_stats(session, current_user.id)
        return {
            "status": "success",
            "message": "User activity statistics retrieved successfully",
            "data": activity_stats
        }
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )