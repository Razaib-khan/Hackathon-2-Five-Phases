from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from ..models.task import Task, TaskBase, PriorityEnum
from ..models.user import User
from ..database.database import get_session
from ..auth.auth_handler import auth_handler
from ..services.task_service import TaskService
from ..utils.errors import TaskNotFoundException
from pydantic import BaseModel
import uuid


class TaskCreateRequest(BaseModel):
    title: str
    description: str = None
    priority: PriorityEnum = PriorityEnum.MEDIUM


class TaskUpdateRequest(BaseModel):
    title: str = None
    description: str = None
    priority: PriorityEnum = None
    completed: bool = None


task_router = APIRouter()


@task_router.get("/", response_model=List[Task])
def get_tasks(current_user: User = Depends(auth_handler.get_current_user), session: Session = Depends(get_session)):
    tasks = TaskService.get_tasks_by_user(session=session, user_id=current_user.id)
    return tasks


@task_router.post("/", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(
    task_request: TaskCreateRequest,
    current_user: User = Depends(auth_handler.get_current_user),
    session: Session = Depends(get_session)
):
    task = TaskService.create_task(
        session=session,
        user_id=current_user.id,
        title=task_request.title,
        description=task_request.description,
        priority=task_request.priority
    )
    return task


@task_router.get("/{task_id}", response_model=Task)
def get_task(
    task_id: uuid.UUID,
    current_user: User = Depends(auth_handler.get_current_user),
    session: Session = Depends(get_session)
):
    task = TaskService.get_task_by_id(session=session, task_id=task_id, user_id=current_user.id)

    if not task:
        raise TaskNotFoundException()

    return task


@task_router.put("/{task_id}", response_model=Task)
def update_task(
    task_id: uuid.UUID,
    task_request: TaskUpdateRequest,
    current_user: User = Depends(auth_handler.get_current_user),
    session: Session = Depends(get_session)
):
    updated_task = TaskService.update_task(
        session=session,
        task_id=task_id,
        user_id=current_user.id,
        title=task_request.title,
        description=task_request.description,
        priority=task_request.priority.value if task_request.priority else None,
        completed=task_request.completed
    )

    if not updated_task:
        raise TaskNotFoundException()

    return updated_task


@task_router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: uuid.UUID,
    current_user: User = Depends(auth_handler.get_current_user),
    session: Session = Depends(get_session)
):
    success = TaskService.delete_task(session=session, task_id=task_id, user_id=current_user.id)

    if not success:
        raise TaskNotFoundException()

    return