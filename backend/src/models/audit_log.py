from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from sqlalchemy.orm import relationship
from ..config.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)  # Nullable for system events
    action = Column(String(100), nullable=False)  # e.g., "user_login", "hackathon_created", "submission_deleted"
    resource_type = Column(String(50), nullable=False)  # e.g., "user", "hackathon", "submission", "team"
    resource_id = Column(String(100), nullable=True)  # ID of the resource affected
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6 address
    user_agent = Column(Text, nullable=True)  # Browser/device info
    old_values = Column(Text, nullable=True)  # JSON string of old values before change
    new_values = Column(Text, nullable=True)  # JSON string of new values after change
    changes = Column(Text, nullable=True)  # JSON string of specific changes made
    metadata = Column(Text, nullable=True)  # Additional metadata as JSON string
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="audit_logs")