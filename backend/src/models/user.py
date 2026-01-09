from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from sqlalchemy.orm import relationship
from ..config.database import Base


class UserRole(SQLEnum):
    PARTICIPANT = "participant"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.PARTICIPANT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    profile_image_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    gdpr_consent = Column(Boolean, nullable=False, default=False)
    gdpr_consent_at = Column(DateTime, nullable=True)
    email_confirmed = Column(Boolean, default=False)
    confirmation_token = Column(String, nullable=True)
    confirmed_at = Column(DateTime, nullable=True)

    # Relationships
    tasks = relationship("Task", back_populates="created_by_user", foreign_keys="[Task.created_by]")
    assigned_tasks = relationship("Task", back_populates="assigned_to_user", foreign_keys="[Task.assigned_to]")
    saved_filters = relationship("TaskFilter", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    verification_codes = relationship("VerificationCode", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")