"""
Analytics/Dashboard Response Schemas

Implements:
- PriorityDistribution: Task count by priority level
- CompletionTrend: Daily completion statistics
- CategoryBreakdown: Task count by tag/category
- DashboardAnalytics: Complete dashboard statistics
"""

from datetime import date
from typing import Dict, List

from pydantic import BaseModel, Field


class PriorityDistribution(BaseModel):
    """Task count distribution by priority level."""

    high: int = Field(..., description="High priority task count", examples=[5])
    medium: int = Field(..., description="Medium priority task count", examples=[12])
    low: int = Field(..., description="Low priority task count", examples=[8])
    none: int = Field(..., description="No priority task count", examples=[3])


class CompletionTrendDataPoint(BaseModel):
    """Single day completion statistics."""

    date: date = Field(..., description="Date", examples=["2026-01-03"])
    completed: int = Field(..., description="Tasks completed on this date", examples=[7])
    created: int = Field(..., description="Tasks created on this date", examples=[5])


class CategoryBreakdown(BaseModel):
    """Task count by tag/category."""

    tag_name: str = Field(..., description="Tag name", examples=["Work"])
    tag_color: str = Field(..., description="Tag color", examples=["#FF5733"])
    task_count: int = Field(..., description="Number of tasks with this tag", examples=[15])
    completed_count: int = Field(..., description="Completed tasks with this tag", examples=[8])


class DashboardAnalytics(BaseModel):
    """
    Complete dashboard analytics response.

    Provides:
    - Priority distribution: Task counts by priority level
    - Completion trend: Daily completion statistics (last 30 days)
    - Category breakdown: Task counts by tag
    - Summary statistics: Total, completed, overdue counts
    """

    # Summary statistics
    total_tasks: int = Field(..., description="Total active tasks", examples=[28])
    completed_tasks: int = Field(..., description="Completed tasks", examples=[15])
    overdue_tasks: int = Field(..., description="Overdue tasks", examples=[3])
    due_today: int = Field(..., description="Tasks due today", examples=[2])

    # Priority distribution
    priority_distribution: PriorityDistribution = Field(
        ...,
        description="Task count by priority level",
    )

    # Completion trend (last 30 days)
    completion_trend: List[CompletionTrendDataPoint] = Field(
        ...,
        description="Daily completion statistics for last 30 days",
        max_length=30,
    )

    # Category breakdown
    category_breakdown: List[CategoryBreakdown] = Field(
        ...,
        description="Task counts by tag/category",
    )

    # Time tracking statistics
    total_time_spent: int = Field(
        ...,
        description="Total minutes tracked across all tasks",
        examples=[1250],
    )
    average_completion_time: int = Field(
        ...,
        description="Average minutes to complete a task",
        examples=[45],
    )
