from sqlmodel import SQLModel, Field
from typing import Optional
import uuid
from datetime import datetime
from enum import Enum


class PriorityEnum(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    priority: PriorityEnum = Field(default=PriorityEnum.MEDIUM)
    user_id: uuid.UUID = Field(foreign_key="user.id")


class Task(TaskBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed: bool = Field(default=False)
    completed_at: Optional[datetime] = Field(default=None)