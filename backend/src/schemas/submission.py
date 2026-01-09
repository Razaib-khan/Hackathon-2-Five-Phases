from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class SubmissionBase(BaseModel):
    team_id: UUID
    hackathon_id: UUID
    phase_id: UUID
    title: str
    description: Optional[str] = None
    project_url: Optional[str] = None
    demo_video_url: Optional[str] = None
    presentation_deck_url: Optional[str] = None
    submission_notes: Optional[str] = None
    is_final_submission: Optional[bool] = False
    is_anonymous: Optional[bool] = False


class SubmissionCreate(SubmissionBase):
    pass


class SubmissionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    project_url: Optional[str] = None
    demo_video_url: Optional[str] = None
    presentation_deck_url: Optional[str] = None
    submission_notes: Optional[str] = None
    is_final_submission: Optional[bool] = None
    is_anonymous: Optional[bool] = None
    status: Optional[str] = None


class SubmissionResponse(SubmissionBase):
    id: UUID
    submitted_at: datetime
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SubmissionFileBase(BaseModel):
    submission_id: UUID
    file_name: str
    file_url: str
    uploaded_by: UUID
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    is_public: Optional[bool] = True
    description: Optional[str] = None


class SubmissionFileCreate(SubmissionFileBase):
    pass


class SubmissionFileUpdate(BaseModel):
    is_public: Optional[bool] = None
    description: Optional[str] = None


class SubmissionFileResponse(SubmissionFileBase):
    id: UUID
    uploaded_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EvaluationBase(BaseModel):
    submission_id: UUID
    evaluator_id: UUID
    category: str
    score: Decimal
    max_score: Optional[Decimal] = 10.0
    feedback: Optional[str] = None


class EvaluationCreate(EvaluationBase):
    pass


class EvaluationUpdate(BaseModel):
    score: Optional[Decimal] = None
    feedback: Optional[str] = None
    is_valid: Optional[bool] = None


class EvaluationResponse(EvaluationBase):
    id: UUID
    evaluated_at: datetime
    is_valid: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SubmissionWithFilesResponse(SubmissionResponse):
    files: List[SubmissionFileResponse] = []

    class Config:
        from_attributes = True


class SubmissionWithEvaluationsResponse(SubmissionResponse):
    evaluations: List[EvaluationResponse] = []

    class Config:
        from_attributes = True