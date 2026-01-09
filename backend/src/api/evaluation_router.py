from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..schemas.evaluation import EvaluationCreate, EvaluationUpdate, EvaluationResponse
from ..services.evaluation_service import EvaluationService
from ..config.database import get_db
from ..config.auth import get_current_user
from ..models.user import User


router = APIRouter()


@router.post("/evaluations", response_model=EvaluationResponse, status_code=status.HTTP_201_CREATED)
async def create_evaluation(
    evaluation_data: EvaluationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new evaluation for a submission (judges only)
    """
    if current_user.role.value != "judge" and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only judges and admins can create evaluations"
        )

    return EvaluationService.create_evaluation(db, evaluation_data, str(current_user.id))


@router.get("/evaluations/{evaluation_id}", response_model=EvaluationResponse)
async def get_evaluation(
    evaluation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific evaluation by ID
    """
    evaluation = EvaluationService.get_evaluation_by_id(db, evaluation_id)
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found"
        )

    # Check permissions - only evaluators, team members, or admins can view
    if (str(evaluation.evaluator_id) != str(current_user.id) and
        current_user.role.value != "admin"):
        # Check if user is part of the team that submitted the project
        submission = evaluation.submission
        if submission.team.created_by != current_user.id:
            team_members = [member.user_id for member in submission.team.members]
            if str(current_user.id) not in team_members:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to view this evaluation"
                )

    return evaluation


@router.get("/evaluations/submission/{submission_id}", response_model=List[EvaluationResponse])
async def get_evaluations_by_submission(
    submission_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all evaluations for a specific submission
    """
    # Check if user is part of the team that submitted, evaluator, or admin
    from ..models.submission import Submission
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )

    if (str(submission.team.created_by) != str(current_user.id) and
        current_user.role.value != "admin" and
        str(current_user.id) != str(submission.evaluations[0].evaluator_id if submission.evaluations else None)):
        # Check if user is a team member
        team_members = [member.user_id for member in submission.team.members]
        if str(current_user.id) not in team_members and current_user.role.value != "judge":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view evaluations for this submission"
            )

    return EvaluationService.get_evaluations_by_submission(db, submission_id)


@router.get("/evaluations/evaluator/{evaluator_id}", response_model=List[EvaluationResponse])
async def get_evaluations_by_evaluator(
    evaluator_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all evaluations created by a specific evaluator
    """
    # Only the evaluator themselves or an admin can view their evaluations
    if (str(current_user.id) != evaluator_id and
        current_user.role.value != "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view evaluations for this evaluator"
        )

    return EvaluationService.get_evaluations_by_evaluator(db, evaluator_id)


@router.put("/evaluations/{evaluation_id}", response_model=EvaluationResponse)
async def update_evaluation(
    evaluation_id: str,
    evaluation_data: EvaluationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing evaluation (only evaluator or admin can update)
    """
    evaluation = EvaluationService.get_evaluation_by_id(db, evaluation_id)
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found"
        )

    # Only the original evaluator or an admin can update
    if (str(evaluation.evaluator_id) != str(current_user.id) and
        current_user.role.value != "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the original evaluator or admin can update this evaluation"
        )

    updated_evaluation = EvaluationService.update_evaluation(db, evaluation_id, evaluation_data, str(current_user.id))
    if not updated_evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found"
        )
    return updated_evaluation


@router.delete("/evaluations/{evaluation_id}")
async def delete_evaluation(
    evaluation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an evaluation (only evaluator or admin can delete)
    """
    evaluation = EvaluationService.get_evaluation_by_id(db, evaluation_id)
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found"
        )

    success = EvaluationService.delete_evaluation(db, evaluation_id, str(current_user.id))
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found"
        )

    return {"message": "Evaluation deleted successfully"}


@router.get("/evaluations/my-submissions", response_model=List[EvaluationResponse])
async def get_my_evaluations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get evaluations for submissions made by the current user's teams
    """
    from ..models.submission import Submission
    # Get all submissions made by the user's teams
    # First, get the teams the user has created or is a member of
    from ..models.team import TeamMember, Team
    team_ids = db.query(Team.id).join(TeamMember).filter(
        TeamMember.user_id == current_user.id,
        TeamMember.is_active == True,
        TeamMember.is_confirmed == True
    ).all()

    evaluation_list = []
    for team_id in team_ids:
        submissions = db.query(Submission).filter(Submission.team_id == team_id[0]).all()
        for submission in submissions:
            evaluations = EvaluationService.get_evaluations_by_submission(db, str(submission.id))
            evaluation_list.extend(evaluations)

    return evaluation_list


@router.get("/evaluations/for-me", response_model=List[EvaluationResponse])
async def get_evaluations_assigned_to_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get evaluations assigned to the current user (as evaluator)
    """
    if current_user.role.value != "judge" and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only judges and admins can access this endpoint"
        )

    return EvaluationService.get_evaluations_by_evaluator(db, str(current_user.id))


@router.get("/submissions/for-evaluation", response_model=List[dict])
async def get_submissions_for_evaluation(
    hackathon_id: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get submissions that need to be evaluated by the current user
    """
    if current_user.role.value != "judge" and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only judges and admins can access this endpoint"
        )

    submissions = EvaluationService.get_submissions_for_evaluation(db, str(current_user.id), hackathon_id)

    # Convert to response format
    result = []
    for submission in submissions:
        result.append({
            "id": str(submission.id),
            "title": submission.title,
            "description": submission.description,
            "team_name": submission.team.name,
            "hackathon_id": str(submission.hackathon_id),
            "submitted_at": submission.submitted_at
        })

    return result