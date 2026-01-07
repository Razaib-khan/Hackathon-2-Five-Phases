"""
Export API Router

Provides data export functionality:
- GET /api/export/tasks/json: Export tasks as JSON
- GET /api/export/tasks/csv: Export tasks as CSV
- Includes all task fields, tags, and subtasks
- Streaming responses for large datasets
"""

import csv
import io
import json
from typing import Annotated, List
from datetime import datetime

from fastapi import APIRouter, Depends, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload

from ..db.session import get_session
from ..security.jwt import get_current_user
from ..models.user import User
from ..models.task import Task
from ..models.tag import Tag
from ..models.task_tag import TaskTag
from ..models.subtask import Subtask


router = APIRouter(prefix="/export", tags=["export"])


def serialize_task_for_export(task: Task) -> dict:
    """
    Serialize task with all related data for export.

    Args:
        task: Task instance with loaded relationships

    Returns:
        Dictionary with task data
    """
    # Get tags
    tags = []
    if hasattr(task, 'task_tags'):
        for task_tag in task.task_tags:
            if hasattr(task_tag, 'tag') and task_tag.tag:
                tags.append({
                    'id': str(task_tag.tag.id),
                    'name': task_tag.tag.name,
                    'color': task_tag.tag.color,
                })

    # Get subtasks
    subtasks = []
    if hasattr(task, 'subtasks'):
        for subtask in task.subtasks:
            subtasks.append({
                'id': str(subtask.id),
                'title': subtask.title,
                'completed': subtask.completed,
                'order': subtask.order,
            })

    return {
        'id': str(task.id),
        'title': task.title,
        'description': task.description,
        'completed': task.completed,
        'priority': task.priority,
        'status': task.status,
        'due_date': task.due_date.isoformat() if task.due_date else None,
        'time_spent': task.time_spent,
        'custom_order': task.custom_order,
        'recurrence_pattern': task.recurrence_pattern,
        'version': task.version,
        'created_at': task.created_at.isoformat() if task.created_at else None,
        'updated_at': task.updated_at.isoformat() if task.updated_at else None,
        'tags': tags,
        'subtasks': subtasks,
    }


@router.get("/tasks/json")
async def export_tasks_json(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    include_completed: bool = Query(default=True, description="Include completed tasks"),
) -> Response:
    """
    Export all user tasks as JSON.

    **Query Parameters**:
    - include_completed: Whether to include completed tasks (default: true)

    **Returns**:
    - JSON file download with all tasks, tags, and subtasks
    """
    # Build query with eager loading
    query = session.query(Task).filter(Task.user_id == current_user.id)
    query = query.options(
        joinedload(Task.task_tags).joinedload(TaskTag.tag),
        joinedload(Task.subtasks)
    )

    # Filter completed if needed
    if not include_completed:
        query = query.filter(Task.completed == False)

    # Order by created date
    query = query.order_by(Task.created_at.desc())

    tasks = query.all()

    # Serialize tasks
    export_data = {
        'export_date': datetime.utcnow().isoformat(),
        'user_id': str(current_user.id),
        'total_tasks': len(tasks),
        'tasks': [serialize_task_for_export(task) for task in tasks]
    }

    # Convert to JSON
    json_str = json.dumps(export_data, indent=2, ensure_ascii=False)

    # Create response
    filename = f"aido_tasks_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"

    return Response(
        content=json_str,
        media_type="application/json",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@router.get("/tasks/csv")
async def export_tasks_csv(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    include_completed: bool = Query(default=True, description="Include completed tasks"),
) -> StreamingResponse:
    """
    Export all user tasks as CSV.

    **Query Parameters**:
    - include_completed: Whether to include completed tasks (default: true)

    **Returns**:
    - CSV file download with task data

    **CSV Columns**:
    - ID, Title, Description, Completed, Priority, Status
    - Due Date, Time Spent (minutes), Tags, Subtasks Count
    - Created At, Updated At
    """
    # Build query with eager loading
    query = session.query(Task).filter(Task.user_id == current_user.id)
    query = query.options(
        joinedload(Task.task_tags).joinedload(TaskTag.tag),
        joinedload(Task.subtasks)
    )

    # Filter completed if needed
    if not include_completed:
        query = query.filter(Task.completed == False)

    # Order by created date
    query = query.order_by(Task.created_at.desc())

    tasks = query.all()

    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow([
        'ID',
        'Title',
        'Description',
        'Completed',
        'Priority',
        'Status',
        'Due Date',
        'Time Spent (min)',
        'Custom Order',
        'Tags',
        'Subtasks Total',
        'Subtasks Completed',
        'Created At',
        'Updated At',
    ])

    # Write tasks
    for task in tasks:
        # Get tag names
        tag_names = []
        if hasattr(task, 'task_tags'):
            for task_tag in task.task_tags:
                if hasattr(task_tag, 'tag') and task_tag.tag:
                    tag_names.append(task_tag.tag.name)

        # Count subtasks
        total_subtasks = 0
        completed_subtasks = 0
        if hasattr(task, 'subtasks'):
            total_subtasks = len(task.subtasks)
            completed_subtasks = sum(1 for st in task.subtasks if st.completed)

        writer.writerow([
            str(task.id),
            task.title,
            task.description or '',
            'Yes' if task.completed else 'No',
            task.priority,
            task.status,
            task.due_date.isoformat() if task.due_date else '',
            task.time_spent,
            task.custom_order if task.custom_order is not None else '',
            ', '.join(tag_names),
            total_subtasks,
            completed_subtasks,
            task.created_at.isoformat() if task.created_at else '',
            task.updated_at.isoformat() if task.updated_at else '',
        ])

    # Get CSV content
    csv_content = output.getvalue()
    output.close()

    # Create filename
    filename = f"aido_tasks_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

    # Return as streaming response
    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
