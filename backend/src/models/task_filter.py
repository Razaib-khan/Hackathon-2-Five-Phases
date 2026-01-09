from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum as SQLEnum, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from sqlalchemy.orm import relationship
from ..config.database import Base


class TaskFilter(Base):
    __tablename__ = "task_filters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)  # Name of the saved filter
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)  # Owner of the filter
    filter_config = Column(JSON, nullable=False)  # JSON configuration of the filter
    is_default = Column(Boolean, default=False)  # Whether this is the default filter
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="saved_filters")


class TaskFilterConfig:
    """Helper class to define the structure of filter configurations"""

    def __init__(self):
        self.title_contains = None
        self.description_contains = None
        self.statuses = []  # List of status values
        self.priorities = []  # List of priority values
        self.assigned_to_me = None  # Boolean
        self.created_by_me = None  # Boolean
        self.due_date_from = None  # DateTime
        self.due_date_to = None  # DateTime
        self.completed_from = None  # DateTime
        self.completed_to = None  # DateTime
        self.tags = []  # List of tag IDs
        self.is_public = None  # Boolean
        self.sort_field = "created_at"  # Field to sort by
        self.sort_order = "desc"  # Sort order: asc or desc
        self.limit = 100  # Number of results to return