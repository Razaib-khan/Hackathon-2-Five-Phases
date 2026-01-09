from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from datetime import datetime
from decimal import Decimal
import uuid

from ..models.submission import Submission, SubmissionFile, Evaluation
from ..models.team import Team, TeamMember
from ..models.hackathon import Hackathon, Phase, HackathonParticipant
from ..models.user import User
from ..schemas.submission import SubmissionCreate, SubmissionUpdate, SubmissionFileCreate, SubmissionFileUpdate, EvaluationCreate, EvaluationUpdate
from ..services.notification_service import NotificationService


class SubmissionService:
    @staticmethod
    def create_submission(db: Session, submission_data: SubmissionCreate, user_id: str) -> Submission:
        """Create a new submission"""
        # Verify team exists and user is a member
        team = db.query(Team).filter(Team.id == submission_data.team_id, Team.is_active == True).first()
        if not team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team not found"
            )

        # Check if user is a member of the team
        team_member = db.query(TeamMember).filter(
            TeamMember.team_id == submission_data.team_id,
            TeamMember.user_id == user_id,
            TeamMember.is_confirmed == True,
            TeamMember.is_active == True
        ).first()

        if not team_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only team members can submit projects"
            )

        # Verify hackathon exists
        hackathon = db.query(Hackathon).filter(
            Hackathon.id == submission_data.hackathon_id,
            Hackathon.is_active == True
        ).first()

        if not hackathon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hackathon not found or inactive"
            )

        # Verify phase exists and belongs to the hackathon
        phase = db.query(Phase).filter(
            Phase.id == submission_data.phase_id,
            Phase.hackathon_id == submission_data.hackathon_id
        ).first()

        if not phase:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Phase not found or doesn't belong to this hackathon"
            )

        # Check if the phase is currently active for submissions
        current_time = datetime.utcnow()
        if current_time < phase.start_date or current_time > phase.end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Submissions are not allowed for phase '{phase.name}' at this time"
            )

        # Check if user has already submitted for this phase
        existing_submission = db.query(Submission).filter(
            Submission.team_id == submission_data.team_id,
            Submission.phase_id == submission_data.phase_id,
            Submission.status != "withdrawn"
        ).first()

        if existing_submission:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Team has already submitted for this phase"
            )

        db_submission = Submission(
            team_id=submission_data.team_id,
            hackathon_id=submission_data.hackathon_id,
            phase_id=submission_data.phase_id,
            title=submission_data.title,
            description=submission_data.description,
            project_url=submission_data.project_url,
            demo_video_url=submission_data.demo_video_url,
            presentation_deck_url=submission_data.presentation_deck_url,
            submission_notes=submission_data.submission_notes,
            is_final_submission=submission_data.is_final_submission,
            is_anonymous=submission_data.is_anonymous
        )

        db.add(db_submission)
        try:
            db.commit()
            db.refresh(db_submission)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error creating submission"
            )

        return db_submission

    @staticmethod
    def get_submission_by_id(db: Session, submission_id: str, user_id: str) -> Optional[Submission]:
        """Get a submission by its ID (with access control)"""
        submission = db.query(Submission).filter(Submission.id == submission_id).first()

        if not submission:
            return None

        # Check if user is a team member, hackathon creator, or judge
        team_member = db.query(TeamMember).filter(
            TeamMember.team_id == submission.team_id,
            TeamMember.user_id == user_id,
            TeamMember.is_active == True
        ).first()

        hackathon = db.query(Hackathon).filter(Hackathon.id == submission.hackathon_id).first()
        is_hackathon_creator = str(hackathon.created_by) == user_id

        # Check if user is a judge for this hackathon
        # For simplicity, we'll check if user has any role other than 'participant' in the hackathon
        participant = db.query(HackathonParticipant).filter(
            HackathonParticipant.hackathon_id == submission.hackathon_id,
            HackathonParticipant.user_id == user_id
        ).first()
        is_judge_or_mentor = participant and participant.role in ['judge', 'mentor']

        # Allow access if user is team member, hackathon creator, or judge/mentor
        if not team_member and not is_hackathon_creator and not is_judge_or_mentor and submission.is_anonymous:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to anonymous submission"
            )

        return submission

    @staticmethod
    def get_submissions_by_team(db: Session, team_id: str, user_id: str) -> List[Submission]:
        """Get all submissions for a team (with access control)"""
        # Check if user is a member of the team
        team_member = db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id == user_id,
            TeamMember.is_confirmed == True,
            TeamMember.is_active == True
        ).first()

        if not team_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only team members can view team submissions"
            )

        return db.query(Submission).filter(
            Submission.team_id == team_id,
            Submission.status != "withdrawn"
        ).all()

    @staticmethod
    def get_submissions_by_hackathon(db: Session, hackathon_id: str, user_id: str) -> List[Submission]:
        """Get all submissions for a hackathon (with access control)"""
        hackathon = db.query(Hackathon).filter(
            Hackathon.id == hackathon_id,
            Hackathon.is_active == True
        ).first()

        if not hackathon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hackathon not found"
            )

        # Check if user is hackathon creator, participant, or judge/mentor
        participant = db.query(HackathonParticipant).filter(
            HackathonParticipant.hackathon_id == hackathon_id,
            HackathonParticipant.user_id == user_id
        ).first()

        is_hackathon_creator = str(hackathon.created_by) == user_id
        is_judge_or_mentor = participant and participant.role in ['judge', 'mentor']

        if not is_hackathon_creator and not participant and not is_judge_or_mentor:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only hackathon participants, judges, mentors, or creators can view submissions"
            )

        # If user is not a judge or hackathon creator, only show non-anonymous submissions
        if not is_judge_or_mentor and not is_hackathon_creator:
            return db.query(Submission).filter(
                Submission.hackathon_id == hackathon_id,
                Submission.status != "withdrawn",
                Submission.is_anonymous == False
            ).all()
        else:
            # Judges and creators can see all submissions, including anonymous ones
            return db.query(Submission).filter(
                Submission.hackathon_id == hackathon_id,
                Submission.status != "withdrawn"
            ).all()

    @staticmethod
    def get_submissions_by_phase(db: Session, phase_id: str, user_id: str) -> List[Submission]:
        """Get all submissions for a phase (with access control)"""
        phase = db.query(Phase).filter(Phase.id == phase_id).first()
        if not phase:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Phase not found"
            )

        # Check if user is hackathon creator, participant, or judge/mentor
        participant = db.query(HackathonParticipant).filter(
            HackathonParticipant.hackathon_id == phase.hackathon_id,
            HackathonParticipant.user_id == user_id
        ).first()

        hackathon = db.query(Hackathon).filter(Hackathon.id == phase.hackathon_id).first()
        is_hackathon_creator = str(hackathon.created_by) == user_id
        is_judge_or_mentor = participant and participant.role in ['judge', 'mentor']

        if not is_hackathon_creator and not participant and not is_judge_or_mentor:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only hackathon participants, judges, mentors, or creators can view submissions"
            )

        # If user is not a judge or hackathon creator, only show non-anonymous submissions
        if not is_judge_or_mentor and not is_hackathon_creator:
            return db.query(Submission).filter(
                Submission.phase_id == phase_id,
                Submission.status != "withdrawn",
                Submission.is_anonymous == False
            ).all()
        else:
            # Judges and creators can see all submissions, including anonymous ones
            return db.query(Submission).filter(
                Submission.phase_id == phase_id,
                Submission.status != "withdrawn"
            ).all()

    @staticmethod
    def update_submission(db: Session, submission_id: str, submission_data: SubmissionUpdate, user_id: str) -> Optional[Submission]:
        """Update a submission (only team leader or hackathon creator can update)"""
        submission = db.query(Submission).filter(Submission.id == submission_id).first()

        if not submission:
            return None

        # Check if user is team leader
        team_leader = db.query(TeamMember).filter(
            TeamMember.team_id == submission.team_id,
            TeamMember.user_id == user_id,
            TeamMember.role == "leader",
            TeamMember.is_active == True
        ).first()

        # Or check if user is hackathon creator
        hackathon = db.query(Hackathon).filter(Hackathon.id == submission.hackathon_id).first()
        is_hackathon_creator = str(hackathon.created_by) == user_id

        if not team_leader and not is_hackathon_creator:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only team leaders or hackathon creators can update submissions"
            )

        # Cannot update after phase has ended
        phase = db.query(Phase).filter(Phase.id == submission.phase_id).first()
        current_time = datetime.utcnow()
        if current_time > phase.end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update submission after phase deadline has passed"
            )

        # Update fields that are provided
        for field, value in submission_data.model_dump(exclude_unset=True).items():
            setattr(submission, field, value)

        db.commit()
        db.refresh(submission)

        return submission

    @staticmethod
    def withdraw_submission(db: Session, submission_id: str, user_id: str) -> bool:
        """Withdraw a submission (only team leader or hackathon creator can withdraw)"""
        submission = db.query(Submission).filter(Submission.id == submission_id).first()

        if not submission:
            return False

        # Check if user is team leader
        team_leader = db.query(TeamMember).filter(
            TeamMember.team_id == submission.team_id,
            TeamMember.user_id == user_id,
            TeamMember.role == "leader",
            TeamMember.is_active == True
        ).first()

        # Or check if user is hackathon creator
        hackathon = db.query(Hackathon).filter(Hackathon.id == submission.hackathon_id).first()
        is_hackathon_creator = str(hackathon.created_by) == user_id

        if not team_leader and not is_hackathon_creator:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only team leaders or hackathon creators can withdraw submissions"
            )

        # Cannot withdraw after phase has ended
        phase = db.query(Phase).filter(Phase.id == submission.phase_id).first()
        current_time = datetime.utcnow()
        if current_time > phase.end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot withdraw submission after phase deadline has passed"
            )

        submission.status = "withdrawn"
        db.commit()

        return True

    @staticmethod
    def create_submission_file(db: Session, file_data: SubmissionFileCreate, user_id: str) -> SubmissionFile:
        """Create a new submission file"""
        # Verify submission exists
        submission = db.query(Submission).filter(Submission.id == file_data.submission_id).first()
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Submission not found"
            )

        # Check if user is team member
        team_member = db.query(TeamMember).filter(
            TeamMember.team_id == submission.team_id,
            TeamMember.user_id == user_id,
            TeamMember.is_confirmed == True,
            TeamMember.is_active == True
        ).first()

        if not team_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only team members can upload files to submissions"
            )

        # Check if submission is still in editable period
        phase = db.query(Phase).filter(Phase.id == submission.phase_id).first()
        current_time = datetime.utcnow()
        if current_time > phase.end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot upload files after phase deadline has passed"
            )

        db_file = SubmissionFile(
            submission_id=file_data.submission_id,
            file_name=file_data.file_name,
            file_url=file_data.file_url,
            file_size=file_data.file_size,
            file_type=file_data.file_type,
            uploaded_by=file_data.uploaded_by,
            is_public=file_data.is_public,
            description=file_data.description
        )

        db.add(db_file)
        try:
            db.commit()
            db.refresh(db_file)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error creating submission file"
            )

        return db_file

    @staticmethod
    def get_submission_files(db: Session, submission_id: str, user_id: str) -> List[SubmissionFile]:
        """Get all files for a submission (with access control)"""
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Submission not found"
            )

        # Check if user is a team member, hackathon creator, or judge/mentor
        team_member = db.query(TeamMember).filter(
            TeamMember.team_id == submission.team_id,
            TeamMember.user_id == user_id,
            TeamMember.is_active == True
        ).first()

        hackathon = db.query(Hackathon).filter(Hackathon.id == submission.hackathon_id).first()
        is_hackathon_creator = str(hackathon.created_by) == user_id

        participant = db.query(HackathonParticipant).filter(
            HackathonParticipant.hackathon_id == submission.hackathon_id,
            HackathonParticipant.user_id == user_id
        ).first()
        is_judge_or_mentor = participant and participant.role in ['judge', 'mentor']

        # Allow access if user is team member, hackathon creator, or judge/mentor
        if not team_member and not is_hackathon_creator and not is_judge_or_mentor:
            # For non-team members, only show public files
            return db.query(SubmissionFile).filter(
                SubmissionFile.submission_id == submission_id,
                SubmissionFile.is_public == True
            ).all()
        else:
            # Team members, creators, and judges can see all files
            return db.query(SubmissionFile).filter(
                SubmissionFile.submission_id == submission_id
            ).all()

    @staticmethod
    def create_evaluation(db: Session, evaluation_data: EvaluationCreate, user_id: str) -> Evaluation:
        """Create a new evaluation for a submission"""
        # Verify submission exists
        submission = db.query(Submission).filter(Submission.id == evaluation_data.submission_id).first()
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Submission not found"
            )

        # Verify evaluator exists and is a judge for this hackathon
        participant = db.query(HackathonParticipant).filter(
            HackathonParticipant.hackathon_id == submission.hackathon_id,
            HackathonParticipant.user_id == evaluation_data.evaluator_id,
            HackathonParticipant.role == "judge"
        ).first()

        if not participant:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only judges can evaluate submissions"
            )

        # Check if evaluator is the same as the one in the data
        if str(evaluation_data.evaluator_id) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot create evaluation for another user"
            )

        # Check if evaluation already exists for this category
        existing_evaluation = db.query(Evaluation).filter(
            Evaluation.submission_id == evaluation_data.submission_id,
            Evaluation.evaluator_id == evaluation_data.evaluator_id,
            Evaluation.category == evaluation_data.category
        ).first()

        if existing_evaluation:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Evaluation for this category already exists"
            )

        # Validate score range
        if evaluation_data.score < 0 or evaluation_data.score > evaluation_data.max_score:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Score must be between 0 and {evaluation_data.max_score}"
            )

        db_evaluation = Evaluation(
            submission_id=evaluation_data.submission_id,
            evaluator_id=evaluation_data.evaluator_id,
            category=evaluation_data.category,
            score=evaluation_data.score,
            max_score=evaluation_data.max_score,
            feedback=evaluation_data.feedback
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

        return db_evaluation

    @staticmethod
    def update_evaluation(db: Session, evaluation_id: str, evaluation_data: EvaluationUpdate, user_id: str) -> Optional[Evaluation]:
        """Update an evaluation (only the evaluator can update their own evaluation)"""
        evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()

        if not evaluation:
            return None

        # Check if user is the evaluator
        if str(evaluation.evaluator_id) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the evaluator can update their evaluation"
            )

        # Update fields that are provided
        for field, value in evaluation_data.model_dump(exclude_unset=True).items():
            setattr(evaluation, field, value)

        db.commit()
        db.refresh(evaluation)

        return evaluation

    @staticmethod
    def get_evaluations_by_submission(db: Session, submission_id: str, user_id: str) -> List[Evaluation]:
        """Get all evaluations for a submission (with access control)"""
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Submission not found"
            )

        # Check if user is a team member, hackathon creator, or judge/mentor
        team_member = db.query(TeamMember).filter(
            TeamMember.team_id == submission.team_id,
            TeamMember.user_id == user_id,
            TeamMember.is_active == True
        ).first()

        hackathon = db.query(Hackathon).filter(Hackathon.id == submission.hackathon_id).first()
        is_hackathon_creator = str(hackathon.created_by) == user_id

        participant = db.query(HackathonParticipant).filter(
            HackathonParticipant.hackathon_id == submission.hackathon_id,
            HackathonParticipant.user_id == user_id
        ).first()
        is_judge_or_mentor = participant and participant.role in ['judge', 'mentor']

        # Allow access if user is team member, hackathon creator, or judge/mentor
        if not team_member and not is_hackathon_creator and not is_judge_or_mentor:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only team members, hackathon creators, or judges/mentors can view evaluations"
            )

        return db.query(Evaluation).filter(
            Evaluation.submission_id == submission_id,
            Evaluation.is_valid == True
        ).all()

    @staticmethod
    def get_evaluations_by_evaluator(db: Session, evaluator_id: str, user_id: str) -> List[Evaluation]:
        """Get all evaluations by an evaluator (with access control)"""
        # Check if the requesting user is the same as the evaluator
        if str(evaluator_id) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot view evaluations of another user"
            )

        return db.query(Evaluation).filter(
            Evaluation.evaluator_id == evaluator_id,
            Evaluation.is_valid == True
        ).all()

    @staticmethod
    def calculate_average_score(db: Session, submission_id: str) -> Optional[Decimal]:
        """Calculate the average score for a submission"""
        evaluations = db.query(Evaluation).filter(
            Evaluation.submission_id == submission_id,
            Evaluation.is_valid == True
        ).all()

        if not evaluations:
            return None

        total_score = sum(evaluation.score for evaluation in evaluations)
        count = len(evaluations)

        if count == 0:
            return None

        return total_score / count