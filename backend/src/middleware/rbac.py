from fastapi import HTTPException, status, Request
from typing import Optional, Callable, List
import logging
from ..models.user import User
from ..services.rbac_service import RBACService
from ..config.database import get_session


logger = logging.getLogger(__name__)


class RBACMiddleware:
    """Role-Based Access Control middleware to enforce permissions."""

    def __init__(self):
        pass

    async def check_permissions(
        self,
        request: Request,
        user: User,
        resource: str,
        action: str,
        resource_id: Optional[int] = None
    ) -> bool:
        """
        Check if a user has permission to perform an action on a resource.

        Args:
            request: FastAPI request object
            user: Authenticated user object
            resource: Resource type (e.g., 'user', 'task', 'project')
            action: Action type (e.g., 'read', 'create', 'update', 'delete')
            resource_id: Optional resource ID for specific resource access checks

        Returns:
            True if user has permission, False otherwise
        """
        try:
            with next(get_session()) as session:
                # First check general permissions
                has_general_permission = RBACService.check_permission(
                    session, user.id, resource, action
                )

                if not has_general_permission:
                    # For specific resources, check ownership or special access
                    if resource_id is not None:
                        has_resource_access = RBACService.check_resource_access(
                            session, user.id, resource, resource_id
                        )
                        return has_resource_access

                    return False

                return True

        except Exception as e:
            logger.error(f"Error checking permissions: {e}")
            return False

    def require_permission(self, resource: str, action: str):
        """
        Decorator factory to create permission checking decorators.

        Args:
            resource: Resource type (e.g., 'user', 'task', 'project')
            action: Action type (e.g., 'read', 'create', 'update', 'delete')

        Returns:
            Permission checking decorator
        """
        def permission_checker(user: User, resource_id: Optional[int] = None):
            with next(get_session()) as session:
                # Check general permissions
                has_permission = RBACService.check_permission(
                    session, user.id, resource, action
                )

                if not has_permission and resource_id is not None:
                    # Check specific resource access (ownership, etc.)
                    has_resource_access = RBACService.check_resource_access(
                        session, user.id, resource, resource_id
                    )
                    if not has_resource_access:
                        raise HTTPException(
                            status_code=status.HTTP_403_FORBIDDEN,
                            detail=f"You don't have permission to {action} {resource}"
                        )
                elif not has_permission:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"You don't have permission to {action} {resource}"
                    )

        return permission_checker

    async def check_admin_access(self, request: Request, user: User) -> bool:
        """
        Check if a user has admin access.

        Args:
            request: FastAPI request object
            user: Authenticated user object

        Returns:
            True if user has admin access, False otherwise
        """
        try:
            with next(get_session()) as session:
                return RBACService.check_admin_access(session, user.id)
        except Exception as e:
            logger.error(f"Error checking admin access: {e}")
            return False

    async def check_user_management_access(
        self,
        request: Request,
        current_user: User,
        target_user_id: int
    ) -> bool:
        """
        Check if a user can manage another user.

        Args:
            request: FastAPI request object
            current_user: User performing the action
            target_user_id: ID of the user being managed

        Returns:
            True if current user has management access, False otherwise
        """
        try:
            with next(get_session()) as session:
                return RBACService.check_user_management_access(
                    session, current_user.id, target_user_id
                )
        except Exception as e:
            logger.error(f"Error checking user management access: {e}")
            return False

    async def check_task_management_access(
        self,
        request: Request,
        current_user: User,
        task_id: int
    ) -> bool:
        """
        Check if a user can manage a task.

        Args:
            request: FastAPI request object
            current_user: User performing the action
            task_id: ID of the task being managed

        Returns:
            True if current user has management access, False otherwise
        """
        try:
            with next(get_session()) as session:
                return RBACService.check_task_management_access(
                    session, current_user.id, task_id
                )
        except Exception as e:
            logger.error(f"Error checking task management access: {e}")
            return False

    async def check_project_management_access(
        self,
        request: Request,
        current_user: User,
        project_id: int
    ) -> bool:
        """
        Check if a user can manage a project.

        Args:
            request: FastAPI request object
            current_user: User performing the action
            project_id: ID of the project being managed

        Returns:
            True if current user has management access, False otherwise
        """
        try:
            with next(get_session()) as session:
                return RBACService.check_project_management_access(
                    session, current_user.id, project_id
                )
        except Exception as e:
            logger.error(f"Error checking project management access: {e}")
            return False