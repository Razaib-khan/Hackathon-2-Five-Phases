from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum as SQLEnum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from sqlalchemy.orm import relationship
from ..config.database import Base


class TaskPriority(SQLEnum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class TaskStatus(SQLEnum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)  # Required
    description = Column(Text, nullable=True)    # Optional
    priority = Column(SQLEnum(TaskPriority), nullable=False, default=TaskPriority.MEDIUM)  # Required
    status = Column(SQLEnum(TaskStatus), nullable=False, default=TaskStatus.PENDING)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_public = Column(Boolean, default=False)  # For sharing tasks

    # Relationships
    created_by_user = relationship("User", back_populates="tasks", foreign_keys=[created_by])
    assigned_to_user = relationship("User", back_populates="assigned_tasks", foreign_keys=[assigned_to])
    tags = relationship("TaskTagAssociation", back_populates="task")


class TaskTag(Base):
    __tablename__ = "task_tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    color = Column(String, nullable=True)  # Hex color code
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    associations = relationship("TaskTagAssociation", back_populates="tag")


class TaskTagAssociation(Base):
    __tablename__ = "task_tag_associations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=False)
    tag_id = Column(UUID(as_uuid=True), ForeignKey("task_tags.id"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    task = relationship("Task", back_populates="tags")
    tag = relationship("TaskTag", back_populates="associations")