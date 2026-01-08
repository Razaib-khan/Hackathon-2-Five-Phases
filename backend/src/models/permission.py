from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from sqlalchemy import DateTime, func, Column
from .base import Base


# Association table for many-to-many relationship between roles and permissions
class RolePermissionLink(SQLModel, table=True):
    __tablename__ = "role_permissions"
    role_id: Optional[int] = Field(default=None, foreign_key="roles.id", primary_key=True)
    permission_id: Optional[int] = Field(default=None, foreign_key="permissions.id", primary_key=True)
    assigned_at: Optional[datetime] = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True)))


class Permission(Base, table=True):
    """Permission model representing a specific access right or capability within the system."""
    __tablename__ = "permissions"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, nullable=False, max_length=50)
    description: Optional[str] = Field(default=None, max_length=200)
    resource: str = Field(nullable=False, max_length=50)
    action: str = Field(nullable=False, max_length=20)

    # Relationships
    roles: List["Role"] = Relationship(back_populates="permissions", link_model=RolePermissionLink)


# Pydantic models for API requests/responses
from pydantic import BaseModel
from typing import Optional


class PermissionBase(BaseModel):
    name: str
    description: Optional[str] = None
    resource: str
    action: str

    class Config:
        from_attributes = True


class PermissionCreate(PermissionBase):
    pass


class PermissionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    resource: Optional[str] = None
    action: Optional[str] = None


class PermissionResponse(PermissionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True