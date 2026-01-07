"""
Analytics Service Layer

Implements business logic for dashboard analytics and streak tracking:
- get_dashboard_analytics: Calculate task statistics and trends
- get_streak: Calculate completion streak

Analytics Calculations (FR-067 to FR-071):
- total_tasks: Active task count
- completed_tasks: Completed task count
- overdue_tasks: Tasks past due_date
- due_today: Tasks due today
- priority_distribution: Count by priority level
- completion_trend: Daily completion stats (last 30 days)
- category_breakdown: Count by tag/category
- total_time_spent: Sum of all task time_spent
- average_completion_time: Average time for completed tasks

Streak Tracking (FR-070):
- current_streak: Consecutive days with completions (ending today)
- longest_streak: Maximum consecutive days ever
- last_completion_date: Most recent completion
"""

from datetime import datetime, date, timedelta
from typing import Dict, List
from uuid import UUID

from sqlmodel import Session, select, func

from ..models.task import Task
from ..models.tag import Tag
from ..models.task_tag import TaskTag
from ..schemas.analytics import (
    DashboardAnalytics,
    PriorityDistribution,
    CompletionTrendDataPoint,
    CategoryBreakdown,
)


class AnalyticsService:
    """Service for analytics and statistics calculations."""

    @staticmethod
    def get_dashboard_analytics(
        session: Session,
        user_id: UUID,
        period: str = "all",
    ) -> DashboardAnalytics:
        """
        Calculate dashboard analytics for a user.

        Args:
            session: Database session
            user_id: Owner user UUID
            period: Time period (week/month/year/all)

        Returns:
            DashboardAnalytics with all statistics
        """
        now = datetime.utcnow()
        today = date.today()

        # Calculate period start date
        period_start = None
        if period == "week":
            period_start = now - timedelta(days=7)
        elif period == "month":
            period_start = now - timedelta(days=30)
        elif period == "year":
            period_start = now - timedelta(days=365)

        # Base query for user tasks
        base_query = select(Task).where(Task.user_id == user_id)

        # Apply period filter if needed
        if period_start:
            base_query = base_query.where(Task.created_at >= period_start)

        all_tasks = session.exec(base_query).all()

        # Summary statistics
        total_tasks = len([t for t in all_tasks if not t.completed])
        completed_tasks = len([t for t in all_tasks if t.completed])

        # Overdue tasks (not completed and past due_date)
        overdue_tasks = len([
            t for t in all_tasks
            if not t.completed and t.due_date and t.due_date.date() < today
        ])

        # Due today
        due_today = len([
            t for t in all_tasks
            if not t.completed and t.due_date and t.due_date.date() == today
        ])

        # Priority distribution (active tasks only)
        active_tasks = [t for t in all_tasks if not t.completed]
        priority_dist = PriorityDistribution(
            high=len([t for t in active_tasks if t.priority == "high"]),
            medium=len([t for t in active_tasks if t.priority == "medium"]),
            low=len([t for t in active_tasks if t.priority == "low"]),
            none=len([t for t in active_tasks if t.priority == "none"]),
        )

        # Completion trend (last 30 days)
        completion_trend = AnalyticsService._calculate_completion_trend(
            session, user_id, days=30
        )

        # Category breakdown
        category_breakdown = AnalyticsService._calculate_category_breakdown(
            session, user_id
        )

        # Time tracking statistics
        total_time_spent = sum(t.time_spent for t in all_tasks)
        completed_with_time = [t for t in all_tasks if t.completed and t.time_spent > 0]
        average_completion_time = (
            sum(t.time_spent for t in completed_with_time) // len(completed_with_time)
            if completed_with_time
            else 0
        )

        return DashboardAnalytics(
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
            overdue_tasks=overdue_tasks,
            due_today=due_today,
            priority_distribution=priority_dist,
            completion_trend=completion_trend,
            category_breakdown=category_breakdown,
            total_time_spent=total_time_spent,
            average_completion_time=average_completion_time,
        )

    @staticmethod
    def _calculate_completion_trend(
        session: Session,
        user_id: UUID,
        days: int = 30,
    ) -> List[CompletionTrendDataPoint]:
        """
        Calculate daily completion and creation counts for the last N days.

        Args:
            session: Database session
            user_id: Owner user UUID
            days: Number of days to analyze

        Returns:
            List of CompletionTrendDataPoint (oldest to newest)
        """
        today = date.today()
        start_date = today - timedelta(days=days - 1)

        # Get all tasks updated in the period (for completions)
        completed_tasks = session.exec(
            select(Task).where(
                Task.user_id == user_id,
                Task.completed == True,
                Task.updated_at >= datetime.combine(start_date, datetime.min.time()),
            )
        ).all()

        # Get all tasks created in the period
        created_tasks = session.exec(
            select(Task).where(
                Task.user_id == user_id,
                Task.created_at >= datetime.combine(start_date, datetime.min.time()),
            )
        ).all()

        # Group by date
        trend_data = []
        for i in range(days):
            current_date = start_date + timedelta(days=i)

            # Count completions on this date (based on updated_at)
            completions = len([
                t for t in completed_tasks
                if t.updated_at.date() == current_date
            ])

            # Count creations on this date
            creations = len([
                t for t in created_tasks
                if t.created_at.date() == current_date
            ])

            trend_data.append(
                CompletionTrendDataPoint(
                    date=current_date,
                    completed=completions,
                    created=creations,
                )
            )

        return trend_data

    @staticmethod
    def _calculate_category_breakdown(
        session: Session,
        user_id: UUID,
    ) -> List[CategoryBreakdown]:
        """
        Calculate task counts by tag/category.

        Args:
            session: Database session
            user_id: Owner user UUID

        Returns:
            List of CategoryBreakdown sorted by task count (descending)
        """
        # Get all user tags with task counts
        tags = session.exec(
            select(Tag).where(Tag.user_id == user_id)
        ).all()

        breakdown = []
        for tag in tags:
            # Count tasks with this tag
            task_tag_count = session.exec(
                select(func.count(TaskTag.task_id))
                .select_from(TaskTag)
                .join(Task, Task.id == TaskTag.task_id)
                .where(
                    TaskTag.tag_id == tag.id,
                    Task.user_id == user_id,
                )
            ).one()

            # Count completed tasks with this tag
            completed_count = session.exec(
                select(func.count(TaskTag.task_id))
                .select_from(TaskTag)
                .join(Task, Task.id == TaskTag.task_id)
                .where(
                    TaskTag.tag_id == tag.id,
                    Task.user_id == user_id,
                    Task.completed == True,
                )
            ).one()

            if task_tag_count > 0:
                breakdown.append(
                    CategoryBreakdown(
                        tag_name=tag.name,
                        tag_color=tag.color,
                        task_count=task_tag_count,
                        completed_count=completed_count,
                    )
                )

        # Sort by task count (descending)
        breakdown.sort(key=lambda x: x.task_count, reverse=True)

        return breakdown

    @staticmethod
    def get_streak(session: Session, user_id: UUID) -> Dict[str, any]:
        """
        Calculate completion streak statistics.

        Args:
            session: Database session
            user_id: Owner user UUID

        Returns:
            Dict with current_streak, longest_streak, last_completion_date
        """
        # Get all completed tasks ordered by update date (descending)
        completed_tasks = session.exec(
            select(Task)
            .where(Task.user_id == user_id, Task.completed == True)
            .order_by(Task.updated_at.desc())
        ).all()

        if not completed_tasks:
            return {
                "current_streak": 0,
                "longest_streak": 0,
                "last_completion_date": None,
            }

        # Extract unique completion dates
        completion_dates = sorted(
            set(t.updated_at.date() for t in completed_tasks),
            reverse=True,
        )

        # Calculate current streak
        current_streak = 0
        today = date.today()

        # Start checking from today or yesterday
        check_date = today if today in completion_dates else today - timedelta(days=1)

        for d in completion_dates:
            if d == check_date:
                current_streak += 1
                check_date -= timedelta(days=1)
            elif d < check_date:
                break

        # Calculate longest streak
        longest_streak = 0
        temp_streak = 1
        prev_date = completion_dates[0]

        for i in range(1, len(completion_dates)):
            if completion_dates[i] == prev_date - timedelta(days=1):
                temp_streak += 1
            else:
                longest_streak = max(longest_streak, temp_streak)
                temp_streak = 1

            prev_date = completion_dates[i]

        longest_streak = max(longest_streak, temp_streak)

        return {
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "last_completion_date": completion_dates[0] if completion_dates else None,
        }
