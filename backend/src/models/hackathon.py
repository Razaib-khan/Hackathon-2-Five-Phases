from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum as SQLEnum, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from sqlalchemy.orm import relationship
from sqlalchemy import UniqueConstraint
from ..config.database import Base


class HackathonStatus(SQLEnum):
    DRAFT = "draft"
    REGISTRATION_OPEN = "registration_open"
    REGISTRATION_CLOSED = "registration_closed"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Hackathon(Base):
    __tablename__ = "hackathons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(SQLEnum(HackathonStatus), nullable=False, default=HackathonStatus.DRAFT)
    max_participants = Column(Integer, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Relationships
    creator = relationship("User", back_populates="created_hackathons")
    phases = relationship("Phase", back_populates="hackathon", cascade="all, delete-orphan")
    participants = relationship("HackathonParticipant", back_populates="hackathon")


class PhaseType(SQLEnum):
    REGISTRATION = "registration"
    IDEATION = "ideation"
    DEVELOPMENT = "development"
    SUBMISSION = "submission"
    PRESENTATION = "presentation"
    JUDGING = "judging"
    RESULTS = "results"


class Phase(Base):
    __tablename__ = "phases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hackathon_id = Column(UUID(as_uuid=True), ForeignKey("hackathons.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    phase_type = Column(SQLEnum(PhaseType), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    hackathon = relationship("Hackathon", back_populates="phases")
    phase_submissions = relationship("Submission", back_populates="phase")


class HackathonParticipant(Base):
    __tablename__ = "hackathon_participants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hackathon_id = Column(UUID(as_uuid=True), ForeignKey("hackathons.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    is_confirmed = Column(Boolean, default=False)
    role = Column(String, default="participant")  # participant, mentor, judge
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    hackathon = relationship("Hackathon", back_populates="participants")
    user = relationship("User", back_populates="hackathon_participations")

    # Unique constraint to prevent duplicate participation
    __table_args__ = (UniqueConstraint('hackathon_id', 'user_id'),)