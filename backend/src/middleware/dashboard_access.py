from fastapi import HTTPException, status, Request
from typing import Optional
import logging
from ..models.user import User
from ..services.rbac_service import RBACService
from ..config.database import get_session


logger = logging.getLogger(__name__)


class DashboardAccessMiddleware:
    """Middleware to enforce dashboard access control."""

    def __init__(self):
        pass

    async def check_dashboard_access(self, request: Request, user: User) -> bool:
        """
        Check if a user has access to dashboard functionality.

        Args:
            request: FastAPI request object
            user: Authenticated user object

        Returns:
            True if user has dashboard access, False otherwise
        """
        try:
            with next(get_session()) as session:
                # Check if user has permission to access dashboard
                has_dashboard_permission = RBACService.check_permission(
                    session, user.id, 'dashboard', 'read'
                )

                if not has_dashboard_permission:
                    logger.warning(f"User {user.username} attempted to access dashboard without permission")
                    return False

                # Additional checks could be added here, such as:
                # - Account verification status
                # - Subscription status
                # - Specific role requirements

                # Check if user account is active
                if not user.is_active:
                    logger.warning(f"Inactive user {user.username} attempted to access dashboard")
                    return False

                return True

        except Exception as e:
            logger.error(f"Error checking dashboard access for user {user.username}: {e}")
            return False

    async def check_dashboard_resource_access(
        self,
        request: Request,
        user: User,
        resource_type: str,
        resource_id: Optional[int] = None
    ) -> bool:
        """
        Check if a user has access to specific dashboard resources.

        Args:
            request: FastAPI request object
            user: Authenticated user object
            resource_type: Type of resource ('stats', 'tasks', 'projects', etc.)
            resource_id: Optional ID of specific resource

        Returns:
            True if user has access to the resource, False otherwise
        """
        try:
            with next(get_session()) as session:
                # First check general dashboard access
                if not await self.check_dashboard_access(request, user):
                    return False

                # Check specific resource permissions
                has_resource_permission = RBACService.check_permission(
                    session, user.id, resource_type, 'read'
                )

                if not has_resource_permission and resource_id is not None:
                    # For specific resources, check ownership or other access controls
                    has_resource_access = RBACService.check_resource_access(
                        session, user.id, resource_type, resource_id
                    )
                    return has_resource_access

                return has_resource_permission

        except Exception as e:
            logger.error(f"Error checking dashboard resource access for user {user.username}: {e}")
            return False

    async def check_dashboard_write_access(self, request: Request, user: User) -> bool:
        """
        Check if a user has write access to dashboard functionality.

        Args:
            request: FastAPI request object
            user: Authenticated user object

        Returns:
            True if user has dashboard write access, False otherwise
        """
        try:
            with next(get_session()) as session:
                # Check if user has permission to write to dashboard
                has_write_permission = RBACService.check_permission(
                    session, user.id, 'dashboard', 'write'
                )

                if not has_write_permission:
                    logger.warning(f"User {user.username} attempted to write to dashboard without permission")
                    return False

                # Additional checks could be added here

                return True

        except Exception as e:
            logger.error(f"Error checking dashboard write access for user {user.username}: {e}")
            return False

    async def enforce_dashboard_access(self, request: Request, user: User):
        """
        Enforce dashboard access - raises HTTPException if access is denied.

        Args:
            request: FastAPI request object
            user: Authenticated user object

        Raises:
            HTTPException: If user doesn't have dashboard access
        """
        has_access = await self.check_dashboard_access(request, user)

        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access the dashboard"
            )