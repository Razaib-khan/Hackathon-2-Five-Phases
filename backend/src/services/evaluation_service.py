from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from datetime import datetime

from ..models.submission import Submission
from ..models.evaluation import Evaluation, EvaluationCriteria
from ..models.user import User, UserRole
from ..schemas.evaluation import EvaluationCreate, EvaluationUpdate, EvaluationCriteriaCreate
from ..services.notification_service import NotificationService


class EvaluationService:
    @staticmethod
    def create_evaluation(db: Session, evaluation_data: EvaluationCreate, evaluator_id: str) -> Evaluation:
        """Create a new evaluation for a submission"""
        # Verify the evaluator is a judge
        evaluator = db.query(User).filter(User.id == evaluator_id).first()
        if not evaluator or evaluator.role != UserRole.JUDGE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only judges can create evaluations"
            )

        # Verify the submission exists
        submission = db.query(Submission).filter(Submission.id == evaluation_data.submission_id).first()
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Submission not found"
            )

        # Check if evaluator has already evaluated this submission
        existing_evaluation = db.query(Evaluation).filter(
            Evaluation.submission_id == evaluation_data.submission_id,
            Evaluation.evaluator_id == evaluator_id
        ).first()

        if existing_evaluation:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Evaluator has already evaluated this submission"
            )

        # Calculate total score from criteria scores
        total_score = sum(criterion.score for criterion in evaluation_data.criteria_scores)

        db_evaluation = Evaluation(
            submission_id=evaluation_data.submission_id,
            evaluator_id=evaluator_id,
            overall_score=total_score,
            feedback=evaluation_data.feedback,
            evaluation_date=datetime.utcnow()
        )

        db.add(db_evaluation)
        try:
            db.commit()
            db.refresh(db_evaluation)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error creating evaluation"
            )

        # Add criteria scores
        for criterion_data in evaluation_data.criteria_scores:
            criterion = EvaluationCriteria(
                evaluation_id=db_evaluation.id,
                criterion_name=criterion_data.criterion_name,
                score=criterion_data.score,
                feedback=criterion_data.feedback
            )
            db.add(criterion)

        db.commit()

        # Create notification for the team about the evaluation
        try:
            team = submission.team
            NotificationService.create_notification(
                db,
                {
                    "user_id": team.created_by,
                    "title": f"Evaluation Received for {submission.title}",
                    "message": f"Your submission '{submission.title}' has been evaluated by a judge with a score of {total_score}.",
                    "notification_type": "submission_status",
                    "related_entity_type": "submission",
                    "related_entity_id": str(submission.id)
                }
            )
        except Exception:
            # If notification creation fails, don't fail the evaluation
            print("Failed to create notification for evaluation")

        return db_evaluation

    @staticmethod
    def get_evaluation_by_id(db: Session, evaluation_id: str) -> Optional[Evaluation]:
        """Get an evaluation by its ID"""
        return db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()

    @staticmethod
    def get_evaluations_by_submission(db: Session, submission_id: str) -> List[Evaluation]:
        """Get all evaluations for a submission"""
        return db.query(Evaluation).filter(
            Evaluation.submission_id == submission_id
        ).all()

    @staticmethod
    def get_evaluations_by_evaluator(db: Session, evaluator_id: str) -> List[Evaluation]:
        """Get all evaluations created by a specific evaluator"""
        return db.query(Evaluation).filter(
            Evaluation.evaluator_id == evaluator_id
        ).all()

    @staticmethod
    def get_submission_average_score(db: Session, submission_id: str) -> float:
        """Calculate the average score for a submission across all evaluations"""
        evaluations = db.query(Evaluation).filter(
            Evaluation.submission_id == submission_id
        ).all()

        if not evaluations:
            return 0.0

        total_score = sum(e.overall_score for e in evaluations)
        return total_score / len(evaluations)

    @staticmethod
    def update_evaluation(db: Session, evaluation_id: str, evaluation_data: EvaluationUpdate, evaluator_id: str) -> Optional[Evaluation]:
        """Update an existing evaluation"""
        db_evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()

        if not db_evaluation:
            return None

        # Verify the evaluator is the same as the original evaluator
        if str(db_evaluation.evaluator_id) != evaluator_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the original evaluator can update this evaluation"
            )

        # Update fields that are provided
        for field, value in evaluation_data.model_dump(exclude_unset=True).items():
            setattr(db_evaluation, field, value)

        # If criteria scores are provided, update them
        if evaluation_data.criteria_scores:
            # Delete existing criteria
            db.query(EvaluationCriteria).filter(
                EvaluationCriteria.evaluation_id == evaluation_id
            ).delete()

            # Add new criteria scores
            total_score = sum(criterion.score for criterion in evaluation_data.criteria_scores)
            db_evaluation.overall_score = total_score

            for criterion_data in evaluation_data.criteria_scores:
                criterion = EvaluationCriteria(
                    evaluation_id=evaluation_id,
                    criterion_name=criterion_data.criterion_name,
                    score=criterion_data.score,
                    feedback=criterion_data.feedback
                )
                db.add(criterion)

        db.commit()
        db.refresh(db_evaluation)

        return db_evaluation

    @staticmethod
    def delete_evaluation(db: Session, evaluation_id: str, evaluator_id: str) -> bool:
        """Delete an evaluation (only evaluator or admin can delete)"""
        db_evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()

        if not db_evaluation:
            return False

        # Verify the evaluator is the same as the original evaluator or is an admin
        evaluator = db.query(User).filter(User.id == evaluator_id).first()
        if (str(db_evaluation.evaluator_id) != evaluator_id and
            evaluator.role != UserRole.ADMIN):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the original evaluator or admin can delete this evaluation"
            )

        # Delete associated criteria
        db.query(EvaluationCriteria).filter(
            EvaluationCriteria.evaluation_id == evaluation_id
        ).delete()

        db.delete(db_evaluation)
        db.commit()

        return True

    @staticmethod
    def get_evaluation_criteria(db: Session, evaluation_id: str) -> List[EvaluationCriteria]:
        """Get all criteria for an evaluation"""
        return db.query(EvaluationCriteria).filter(
            EvaluationCriteria.evaluation_id == evaluation_id
        ).all()

    @staticmethod
    def get_submissions_for_evaluation(db: Session, evaluator_id: str, hackathon_id: Optional[str] = None) -> List[Submission]:
        """Get submissions that need to be evaluated by the given evaluator"""
        # Get evaluator
        evaluator = db.query(User).filter(User.id == evaluator_id).first()
        if not evaluator or evaluator.role != UserRole.JUDGE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only judges can evaluate submissions"
            )

        # Query for submissions that haven't been evaluated by this evaluator
        query = db.query(Submission).outerjoin(
            Evaluation,
            (Evaluation.submission_id == Submission.id) & (Evaluation.evaluator_id == evaluator_id)
        ).filter(
            Evaluation.id.is_(None)  # Only submissions without evaluation from this evaluator
        )

        # If hackathon_id is specified, filter by it
        if hackathon_id:
            query = query.filter(Submission.hackathon_id == hackathon_id)

        return query.all()