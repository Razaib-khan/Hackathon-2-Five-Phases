from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..schemas.submission import (
    SubmissionCreate,
    SubmissionUpdate,
    SubmissionResponse,
    SubmissionFileCreate,
    SubmissionFileUpdate,
    SubmissionFileResponse,
    EvaluationCreate,
    EvaluationUpdate,
    EvaluationResponse,
    SubmissionWithFilesResponse,
    SubmissionWithEvaluationsResponse
)
from ..services.submission_service import SubmissionService
from ..config.database import get_db
from ..config.auth import get_current_user
from ..models.user import User


router = APIRouter()


@router.post("/submissions", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
async def create_submission(
    submission_data: SubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new submission
    """
    return SubmissionService.create_submission(db, submission_data, str(current_user.id))


@router.get("/submissions/{submission_id}", response_model=SubmissionWithFilesResponse)
async def get_submission(
    submission_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific submission by ID
    """
    submission = SubmissionService.get_submission_by_id(db, submission_id, str(current_user.id))
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    return submission


@router.put("/submissions/{submission_id}", response_model=SubmissionResponse)
async def update_submission(
    submission_id: str,
    submission_data: SubmissionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a submission (only team leader or hackathon creator can update)
    """
    updated_submission = SubmissionService.update_submission(db, submission_id, submission_data, str(current_user.id))
    if not updated_submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    return updated_submission


@router.delete("/submissions/{submission_id}")
async def withdraw_submission(
    submission_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Withdraw a submission (only team leader or hackathon creator can withdraw)
    """
    success = SubmissionService.withdraw_submission(db, submission_id, str(current_user.id))
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    return {"message": "Submission withdrawn successfully"}


@router.get("/teams/{team_id}/submissions", response_model=List[SubmissionResponse])
async def get_team_submissions(
    team_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all submissions for a team
    """
    return SubmissionService.get_submissions_by_team(db, team_id, str(current_user.id))


@router.get("/hackathons/{hackathon_id}/submissions", response_model=List[SubmissionResponse])
async def get_hackathon_submissions(
    hackathon_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all submissions for a hackathon
    """
    return SubmissionService.get_submissions_by_hackathon(db, hackathon_id, str(current_user.id))


@router.get("/phases/{phase_id}/submissions", response_model=List[SubmissionResponse])
async def get_phase_submissions(
    phase_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all submissions for a phase
    """
    return SubmissionService.get_submissions_by_phase(db, phase_id, str(current_user.id))


@router.post("/submissions/{submission_id}/files", response_model=SubmissionFileResponse, status_code=status.HTTP_201_CREATED)
async def create_submission_file(
    submission_id: str,
    file_data: SubmissionFileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a file to a submission
    """
    # Override the submission_id to ensure consistency
    file_data.submission_id = submission_id
    return SubmissionService.create_submission_file(db, file_data, str(current_user.id))


@router.get("/submissions/{submission_id}/files", response_model=List[SubmissionFileResponse])
async def get_submission_files(
    submission_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all files for a submission
    """
    return SubmissionService.get_submission_files(db, submission_id, str(current_user.id))


@router.post("/submissions/{submission_id}/evaluations", response_model=EvaluationResponse, status_code=status.HTTP_201_CREATED)
async def create_evaluation(
    submission_id: str,
    evaluation_data: EvaluationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create an evaluation for a submission (by judges)
    """
    # Override the submission_id to ensure consistency
    evaluation_data.submission_id = submission_id
    # Ensure the evaluator is the current user
    evaluation_data.evaluator_id = str(current_user.id)
    return SubmissionService.create_evaluation(db, evaluation_data, str(current_user.id))


@router.put("/evaluations/{evaluation_id}", response_model=EvaluationResponse)
async def update_evaluation(
    evaluation_id: str,
    evaluation_data: EvaluationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an evaluation (only the evaluator can update)
    """
    updated_evaluation = SubmissionService.update_evaluation(db, evaluation_id, evaluation_data, str(current_user.id))
    if not updated_evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found"
        )
    return updated_evaluation


@router.get("/submissions/{submission_id}/evaluations", response_model=List[EvaluationResponse])
async def get_submission_evaluations(
    submission_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all evaluations for a submission
    """
    return SubmissionService.get_evaluations_by_submission(db, submission_id, str(current_user.id))


@router.get("/evaluators/{evaluator_id}/evaluations", response_model=List[EvaluationResponse])
async def get_evaluator_evaluations(
    evaluator_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all evaluations by an evaluator
    """
    return SubmissionService.get_evaluations_by_evaluator(db, evaluator_id, str(current_user.id))


@router.get("/submissions/{submission_id}/score")
async def get_submission_average_score(
    submission_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the average score for a submission
    """
    # Verify access to submission first
    submission = SubmissionService.get_submission_by_id(db, submission_id, str(current_user.id))
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )

    avg_score = SubmissionService.calculate_average_score(db, submission_id)
    if avg_score is None:
        return {"average_score": None, "message": "No evaluations available"}

    return {"average_score": avg_score}