from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


class TaskPriority(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TaskPriority
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    is_public: Optional[bool] = False


class TaskCreate(TaskBase):
    title: str  # Required field
    priority: TaskPriority  # Required field


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    is_public: Optional[bool] = None


class TaskResponse(TaskBase):
    id: uuid.UUID
    created_by: str
    status: TaskStatus
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TaskTagBase(BaseModel):
    name: str
    color: Optional[str] = None


class TaskTagCreate(TaskTagBase):
    pass


class TaskTagResponse(TaskTagBase):
    id: uuid.UUID
    created_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TaskTagAssociationResponse(BaseModel):
    id: uuid.UUID
    task_id: uuid.UUID
    tag_id: uuid.UUID
    assigned_at: datetime

    class Config:
        from_attributes = True