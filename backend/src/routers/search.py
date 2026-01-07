"""
Full-Text Search API Router

Provides PostgreSQL full-text search using tsvector:
- GET /api/search/tasks: Search tasks with ranking
- Uses PostgreSQL ts_rank for relevance scoring
- Supports result highlighting
- Fast GIN index queries
"""

from typing import Annotated, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from sqlalchemy.orm import joinedload
from sqlalchemy import func, text

from ..config.database import get_session
from ..security.jwt import get_current_user
from ..models.user import User
from ..models.task import Task
from ..models.task_tag import TaskTag
from ..schemas.task import TaskResponse


router = APIRouter(prefix="/search", tags=["search"])


class SearchResult:
    """Search result with ranking and highlighting."""

    def __init__(self, task: Task, rank: float, headline: str):
        self.task = task
        self.rank = rank
        self.headline = headline


@router.get("/tasks", response_model=List[TaskResponse])
async def search_tasks(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    q: str = Query(..., min_length=1, max_length=200, description="Search query"),
    limit: int = Query(default=50, le=100, description="Maximum results"),
) -> List[TaskResponse]:
    """
    Full-text search tasks using PostgreSQL tsvector.

    **Features**:
    - PostgreSQL ts_rank relevance scoring
    - Searches title (weight A) and description (weight B)
    - Fast GIN index queries
    - Result highlighting with ts_headline

    **Query Parameters**:
    - q: Search query (1-200 characters)
    - limit: Maximum results (default: 50, max: 100)

    **Returns**:
    - List of tasks ranked by relevance
    """
    # Create tsquery from search string
    # Use plainto_tsquery for user-friendly queries (handles spaces, etc.)
    search_query = func.plainto_tsquery('english', q)

    # Build query with full-text search
    query = session.query(Task).filter(
        Task.user_id == current_user.id,
        Task.search_vector.op('@@')(search_query)  # Full-text match
    )

    # Add eager loading
    query = query.options(
        joinedload(Task.task_tags).joinedload(TaskTag.tag),
        joinedload(Task.subtasks)
    )

    # Order by relevance (ts_rank)
    query = query.order_by(
        func.ts_rank(Task.search_vector, search_query).desc(),
        Task.created_at.desc()
    )

    # Limit results
    query = query.limit(limit)

    # Execute query
    tasks = query.all()

    return tasks


@router.get("/tasks/highlighted", response_model=List[dict])
async def search_tasks_with_highlighting(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    q: str = Query(..., min_length=1, max_length=200, description="Search query"),
    limit: int = Query(default=50, le=100, description="Maximum results"),
) -> List[dict]:
    """
    Full-text search with result highlighting.

    **Features**:
    - All features from /search/tasks
    - PLUS: Highlighted search results using ts_headline
    - Shows matching snippets with <mark> tags

    **Query Parameters**:
    - q: Search query (1-200 characters)
    - limit: Maximum results (default: 50, max: 100)

    **Returns**:
    - List of tasks with highlighted snippets
    - snippet: Text with <mark>query</mark> highlighting
    - rank: Relevance score (0-1)
    """
    # Create tsquery
    search_query = func.plainto_tsquery('english', q)

    # Build query with headline generation
    query = session.query(
        Task,
        func.ts_rank(Task.search_vector, search_query).label('rank'),
        func.ts_headline(
            'english',
            func.concat(
                func.coalesce(Task.title, ''),
                ' ',
                func.coalesce(Task.description, '')
            ),
            search_query,
            'StartSel=<mark>, StopSel=</mark>, MaxWords=50, MinWords=25'
        ).label('headline')
    ).filter(
        Task.user_id == current_user.id,
        Task.search_vector.op('@@')(search_query)
    )

    # Add eager loading
    query = query.options(
        joinedload(Task.task_tags).joinedload(TaskTag.tag),
        joinedload(Task.subtasks)
    )

    # Order by relevance
    query = query.order_by(text('rank DESC'), Task.created_at.desc())

    # Limit results
    query = query.limit(limit)

    # Execute query
    results = query.all()

    # Format response
    response = []
    for task, rank, headline in results:
        # Serialize task
        task_dict = {
            'id': str(task.id),
            'title': task.title,
            'description': task.description,
            'completed': task.completed,
            'priority': task.priority,
            'status': task.status,
            'due_date': task.due_date.isoformat() if task.due_date else None,
            'time_spent': task.time_spent,
            'custom_order': task.custom_order,
            'created_at': task.created_at.isoformat() if task.created_at else None,
            'updated_at': task.updated_at.isoformat() if task.updated_at else None,
            'tags': [
                {
                    'id': str(tt.tag.id),
                    'name': tt.tag.name,
                    'color': tt.tag.color,
                }
                for tt in task.task_tags if tt.tag
            ] if hasattr(task, 'task_tags') else [],
            'subtask_count': len(task.subtasks) if hasattr(task, 'subtasks') else 0,
            'completed_subtask_count': sum(
                1 for st in task.subtasks if st.completed
            ) if hasattr(task, 'subtasks') else 0,
            # Search-specific fields
            'rank': float(rank),
            'snippet': headline,
        }
        response.append(task_dict)

    return response
