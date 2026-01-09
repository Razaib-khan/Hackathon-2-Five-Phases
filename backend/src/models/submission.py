from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from sqlalchemy.orm import relationship
from ..config.database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=False)
    hackathon_id = Column(UUID(as_uuid=True), ForeignKey("hackathons.id"), nullable=False)
    phase_id = Column(UUID(as_uuid=True), ForeignKey("phases.id"), nullable=False)  # Which phase this submission is for
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    project_url = Column(String(500), nullable=True)  # Link to GitHub repo, demo, etc.
    demo_video_url = Column(String(500), nullable=True)  # Link to demo video
    presentation_deck_url = Column(String(500), nullable=True)  # Link to presentation deck
    submission_notes = Column(Text, nullable=True)  # Additional notes from team
    submitted_at = Column(DateTime, default=datetime.utcnow)
    is_final_submission = Column(Boolean, default=False)  # Whether this is the final submission
    is_anonymous = Column(Boolean, default=False)  # Whether to hide team identity during judging
    status = Column(String(20), default="submitted")  # submitted, under_review, completed, withdrawn
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    team = relationship("Team", back_populates="submissions")
    hackathon = relationship("Hackathon")
    phase = relationship("Phase")
    files = relationship("SubmissionFile", back_populates="submission", cascade="all, delete-orphan")
    evaluations = relationship("Evaluation", back_populates="submission", cascade="all, delete-orphan")


class SubmissionFile(Base):
    __tablename__ = "submission_files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("submissions.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)  # URL to stored file
    file_size = Column(Integer, nullable=True)  # Size in bytes
    file_type = Column(String(100), nullable=True)  # MIME type
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    is_public = Column(Boolean, default=True)  # Whether file is publicly accessible
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    submission = relationship("Submission", back_populates="files")
    uploader = relationship("User")


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("submissions.id"), nullable=False)
    evaluator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)  # Judge/evaluator
    category = Column(String(100), nullable=False)  # Overall, Technical, Creativity, etc.
    score = Column(Numeric(5, 2))  # Score out of 10 (e.g., 8.50)
    max_score = Column(Numeric(5, 2), default=10.0)  # Maximum possible score
    feedback = Column(Text, nullable=True)  # Written feedback from evaluator
    evaluated_at = Column(DateTime, default=datetime.utcnow)
    is_valid = Column(Boolean, default=True)  # Whether this evaluation is valid (not invalidated)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    submission = relationship("Submission", back_populates="evaluations")
    evaluator = relationship("User")

    # Ensure one evaluation per category per evaluator per submission
    __table_args__ = (UniqueConstraint('submission_id', 'evaluator_id', 'category'),)