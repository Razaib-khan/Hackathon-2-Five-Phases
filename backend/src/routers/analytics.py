"""
Analytics API Router

Implements analytics and statistics endpoints:
- GET /analytics/dashboard: Dashboard statistics with period filter
- GET /analytics/streak: Completion streak tracking

All endpoints require authentication.
"""

from typing import Annotated, Dict, Any

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from ..config.database import get_session
from ..security.jwt import get_current_user
from ..models.user import User
from ..schemas.analytics import DashboardAnalytics
from ..services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=DashboardAnalytics)
def get_dashboard_analytics(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    period: str = Query(
        default="all",
        regex="^(week|month|year|all)$",
        description="Time period for statistics",
    ),
) -> DashboardAnalytics:
    """
    Get dashboard analytics and statistics.

    **Implements**: FR-067 to FR-071

    **Query Parameters**:
    - period: week/month/year/all (default: all)

    **Returns**:
    - total_tasks: Active task count
    - completed_tasks: Completed task count
    - overdue_tasks: Tasks past due date
    - due_today: Tasks due today
    - priority_distribution: Count by priority (high/medium/low/none)
    - completion_trend: Daily completion stats (last 30 days)
    - category_breakdown: Count by tag/category
    - total_time_spent: Sum of all time tracked (minutes)
    - average_completion_time: Average time per completed task (minutes)
    """
    analytics = AnalyticsService.get_dashboard_analytics(
        session, current_user.id, period
    )
    return analytics


@router.get("/streak")
def get_streak(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Dict[str, Any]:
    """
    Get completion streak statistics.

    **Implements**: FR-070

    **Returns**:
    - current_streak: Consecutive days with completions (ending today or yesterday)
    - longest_streak: Maximum consecutive days ever
    - last_completion_date: Most recent completion date

    **Streak Calculation**:
    - Counts consecutive days with at least one task completed
    - Current streak includes today if tasks completed today, otherwise yesterday
    - Breaks if a day has zero completions
    """
    streak_data = AnalyticsService.get_streak(session, current_user.id)
    return streak_data
