from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from sqlalchemy import DateTime, func
from uuid import UUID, uuid4
from .base import Base


class Project(Base, table=True):
    """Project model representing a collection of tasks with metadata and access controls."""
    __tablename__ = "projects"

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(nullable=False, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    owner_id: UUID = Field(foreign_key="users.id")
    is_active: bool = Field(default=True)

    # Relationships
    owner: "User" = Relationship(back_populates="owned_projects", sa_relationship_kwargs={"foreign_keys": "[Project.owner_id]"})
    tasks: List["Task"] = Relationship(back_populates="project")


# Pydantic models for API requests/responses
from pydantic import BaseModel
from typing import Optional


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

    class Config:
        from_attributes = True


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ProjectResponse(ProjectBase):
    id: UUID
    owner_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True