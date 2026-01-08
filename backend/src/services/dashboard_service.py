from sqlmodel import Session, select
from typing import Dict, Any, List
from datetime import datetime, timedelta
from uuid import UUID
from ..models.user import User
from ..models.task import Task
from ..models.project import Project
from ..services.rbac_service import RBACService


class DashboardService:
    """Service class for handling dashboard-related operations and statistics."""

    @staticmethod
    def get_dashboard_statistics(session: Session, user_id: UUID) -> Dict[str, Any]:
        """
        Get dashboard statistics for a user.

        Args:
            session: Database session
            user_id: User ID

        Returns:
            Dictionary with dashboard statistics
        """
        # Check if user has dashboard access
        if not RBACService.check_permission(session, user_id, 'dashboard', 'read'):
            raise PermissionError("User does not have permission to access dashboard statistics")

        # Get total users count (only if user has admin access)
        if RBACService.check_admin_access(session, user_id):
            total_users = session.exec(select(User)).count()
        else:
            total_users = 0  # Regular users can't see total user count

        # Get user's tasks count
        user_tasks_count = session.exec(
            select(Task).where(Task.created_by == user_id)
        ).count()

        # Get user's assigned tasks count
        user_assigned_tasks_count = session.exec(
            select(Task).where(Task.assigned_to == user_id)
        ).count()

        # Get user's projects count
        user_projects_count = session.exec(
            select(Project).where(Project.owner_id == user_id)
        ).count()

        # Get user's completed tasks today
        today_start = datetime.combine(datetime.today().date(), datetime.min.time())
        today_end = datetime.combine(datetime.today().date(), datetime.max.time())

        completed_today = session.exec(
            select(Task)
            .where(Task.created_by == user_id)
            .where(Task.updated_at >= today_start)
            .where(Task.updated_at <= today_end)
        ).count()

        # Get user's overdue tasks
        overdue_tasks = session.exec(
            select(Task)
            .where(Task.created_by == user_id)
            .where(Task.due_date < datetime.utcnow())
            .where(Task.status != 'done')
        ).count()

        return {
            "total_users": total_users,
            "my_tasks": user_tasks_count,
            "tasks_assigned_to_me": user_assigned_tasks_count,
            "my_projects": user_projects_count,
            "tasks_completed_today": completed_today,
            "overdue_tasks": overdue_tasks,
            "active_projects": user_projects_count  # For now, all user's projects are considered active
        }

    @staticmethod
    def get_dashboard_tasks(session: Session, user_id: UUID) -> Dict[str, List[Task]]:
        """
        Get dashboard task information for a user.

        Args:
            session: Database session
            user_id: User ID

        Returns:
            Dictionary with different types of tasks
        """
        # Check if user has dashboard access
        if not RBACService.check_permission(session, user_id, 'dashboard', 'read'):
            raise PermissionError("User does not have permission to access dashboard tasks")

        # Get user's own tasks
        my_tasks = session.exec(
            select(Task).where(Task.created_by == user_id)
        ).all()

        # Get tasks assigned to user
        tasks_assigned_to_me = session.exec(
            select(Task).where(Task.assigned_to == user_id)
        ).all()

        # Get overdue tasks
        overdue_tasks = session.exec(
            select(Task)
            .where(Task.created_by == user_id)
            .where(Task.due_date < datetime.utcnow())
            .where(Task.status != 'done')
        ).all()

        # Get tasks due this week
        week_start = datetime.utcnow()
        week_end = week_start + timedelta(days=7)

        tasks_due_this_week = session.exec(
            select(Task)
            .where(Task.created_by == user_id)
            .where(Task.due_date >= week_start)
            .where(Task.due_date <= week_end)
        ).all()

        return {
            "my_tasks": my_tasks,
            "tasks_assigned_to_me": tasks_assigned_to_me,
            "overdue_tasks": overdue_tasks,
            "tasks_due_this_week": tasks_due_this_week
        }

    @staticmethod
    def get_dashboard_projects(session: Session, user_id: UUID) -> Dict[str, List[Project]]:
        """
        Get dashboard project information for a user.

        Args:
            session: Database session
            user_id: User ID

        Returns:
            Dictionary with different types of projects
        """
        # Check if user has dashboard access
        if not RBACService.check_permission(session, user_id, 'dashboard', 'read'):
            raise PermissionError("User does not have permission to access dashboard projects")

        # Get user's own projects
        my_projects = session.exec(
            select(Project).where(Project.owner_id == user_id)
        ).all()

        # Get active projects
        active_projects = session.exec(
            select(Project).where(Project.owner_id == user_id).where(Project.is_active == True)
        ).all()

        # Get inactive projects
        inactive_projects = session.exec(
            select(Project).where(Project.owner_id == user_id).where(Project.is_active == False)
        ).all()

        return {
            "my_projects": my_projects,
            "active_projects": active_projects,
            "inactive_projects": inactive_projects
        }

    @staticmethod
    def get_user_activity_stats(session: Session, user_id: UUID) -> Dict[str, Any]:
        """
        Get user activity statistics.

        Args:
            session: Database session
            user_id: User ID

        Returns:
            Dictionary with user activity statistics
        """
        # Check if user has dashboard access
        if not RBACService.check_permission(session, user_id, 'dashboard', 'read'):
            raise PermissionError("User does not have permission to access dashboard statistics")

        # Get user's task creation statistics for the last 7 days
        seven_days_ago = datetime.utcnow() - timedelta(days=7)

        recent_tasks = session.exec(
            select(Task)
            .where(Task.created_by == user_id)
            .where(Task.created_at >= seven_days_ago)
        ).all()

        # Group tasks by day
        daily_task_counts = {}
        for task in recent_tasks:
            day = task.created_at.date()
            if day in daily_task_counts:
                daily_task_counts[day] += 1
            else:
                daily_task_counts[day] = 1

        # Get user's completion statistics
        completed_tasks = session.exec(
            select(Task)
            .where(Task.created_by == user_id)
            .where(Task.status == 'done')
            .where(Task.updated_at >= seven_days_ago)
        ).count()

        return {
            "recent_task_counts": daily_task_counts,
            "completed_tasks_last_7_days": completed_tasks,
            "total_tasks_created": len(recent_tasks)
        }

    @staticmethod
    def check_dashboard_access(session: Session, user_id: UUID) -> bool:
        """
        Check if a user has access to the dashboard.

        Args:
            session: Database session
            user_id: User ID

        Returns:
            True if user has dashboard access, False otherwise
        """
        return RBACService.check_permission(session, user_id, 'dashboard', 'read')