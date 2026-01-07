from sqlmodel import Session, select
from typing import Optional, List
from fastapi import HTTPException, status
from ..models.user import User
from ..models.role import Role
from ..models.permission import Permission
from ..models.project import Project
from ..models.task import Task


class RBACService:
    """Role-Based Access Control service for managing permissions and access control."""

    @staticmethod
    def get_user_roles(session: Session, user_id: int) -> List[Role]:
        """
        Get all roles assigned to a user.

        Args:
            session: Database session
            user_id: User ID

        Returns:
            List of Role objects assigned to the user
        """
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return user.roles

    @staticmethod
    def get_user_permissions(session: Session, user_id: int) -> List[Permission]:
        """
        Get all permissions assigned to a user through their roles.

        Args:
            session: Database session
            user_id: User ID

        Returns:
            List of Permission objects assigned to the user
        """
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Get permissions from all roles assigned to the user
        permissions = []
        for role in user.roles:
            permissions.extend(role.permissions)

        return permissions

    @staticmethod
    def check_permission(session: Session, user_id: int, resource: str, action: str) -> bool:
        """
        Check if a user has permission to perform an action on a resource.

        Args:
            session: Database session
            user_id: User ID
            resource: Resource type (e.g., 'user', 'task', 'project')
            action: Action type (e.g., 'read', 'create', 'update', 'delete')

        Returns:
            True if user has permission, False otherwise
        """
        permissions = RBACService.get_user_permissions(session, user_id)

        # Check if any of the user's permissions match the requested resource and action
        for permission in permissions:
            if permission.resource == resource and permission.action == action:
                return True

        return False

    @staticmethod
    def check_resource_access(session: Session, user_id: int, resource_type: str, resource_id: int) -> bool:
        """
        Check if a user has access to a specific resource based on ownership or permissions.

        Args:
            session: Database session
            user_id: User ID
            resource_type: Type of resource ('task', 'project', etc.)
            resource_id: ID of the specific resource

        Returns:
            True if user has access, False otherwise
        """
        if resource_type == 'task':
            # For tasks, check if user is the creator or assignee
            task = session.get(Task, resource_id)
            if not task:
                return False

            return task.created_by == user_id or task.assigned_to == user_id

        elif resource_type == 'project':
            # For projects, check if user is the owner
            project = session.get(Project, resource_id)
            if not project:
                return False

            return project.owner_id == user_id

        # For other resource types, implement specific access logic
        return False

    @staticmethod
    def assign_role_to_user(session: Session, user_id: int, role_id: int) -> bool:
        """
        Assign a role to a user.

        Args:
            session: Database session
            user_id: User ID
            role_id: Role ID to assign

        Returns:
            True if role was assigned, False if assignment failed
        """
        user = session.get(User, user_id)
        role = session.get(Role, role_id)

        if not user or not role:
            return False

        # Check if role is already assigned
        if role in user.roles:
            return True  # Role already assigned

        user.roles.append(role)
        session.add(user)
        session.commit()
        return True

    @staticmethod
    def remove_role_from_user(session: Session, user_id: int, role_id: int) -> bool:
        """
        Remove a role from a user.

        Args:
            session: Database session
            user_id: User ID
            role_id: Role ID to remove

        Returns:
            True if role was removed, False if removal failed
        """
        user = session.get(User, user_id)
        role = session.get(Role, role_id)

        if not user or not role:
            return False

        # Check if role is assigned
        if role not in user.roles:
            return True  # Role not assigned, nothing to remove

        user.roles.remove(role)
        session.add(user)
        session.commit()
        return True

    @staticmethod
    def check_admin_access(session: Session, user_id: int) -> bool:
        """
        Check if a user has admin privileges (has 'admin' role).

        Args:
            session: Database session
            user_id: User ID

        Returns:
            True if user has admin access, False otherwise
        """
        user = session.get(User, user_id)
        if not user:
            return False

        # Check if user has the 'admin' role
        for role in user.roles:
            if role.name == 'admin':
                return True

        return False

    @staticmethod
    def check_user_management_access(session: Session, requesting_user_id: int, target_user_id: int) -> bool:
        """
        Check if a user can manage another user (e.g., deactivate, assign roles).

        Args:
            session: Database session
            requesting_user_id: ID of the user requesting access
            target_user_id: ID of the user being managed

        Returns:
            True if requesting user has management access, False otherwise
        """
        # Admins can manage any user
        if RBACService.check_admin_access(session, requesting_user_id):
            return True

        # Users can manage themselves
        return requesting_user_id == target_user_id

    @staticmethod
    def check_task_management_access(session: Session, user_id: int, task_id: int) -> bool:
        """
        Check if a user can manage a task (update, delete).

        Args:
            session: Database session
            user_id: User ID
            task_id: Task ID

        Returns:
            True if user has management access to the task, False otherwise
        """
        # Admins can manage any task
        if RBACService.check_admin_access(session, user_id):
            return True

        # Regular users can manage tasks they created or are assigned to
        task = session.get(Task, task_id)
        if not task:
            return False

        return task.created_by == user_id or task.assigned_to == user_id

    @staticmethod
    def check_project_management_access(session: Session, user_id: int, project_id: int) -> bool:
        """
        Check if a user can manage a project (update, delete).

        Args:
            session: Database session
            user_id: User ID
            project_id: Project ID

        Returns:
            True if user has management access to the project, False otherwise
        """
        # Admins can manage any project
        if RBACService.check_admin_access(session, user_id):
            return True

        # Regular users can manage projects they own
        project = session.get(Project, project_id)
        if not project:
            return False

        return project.owner_id == user_id