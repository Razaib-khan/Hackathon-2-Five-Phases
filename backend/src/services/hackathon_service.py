from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from datetime import datetime

from ..models.hackathon import Hackathon, HackathonStatus, HackathonParticipant
from ..schemas.hackathon import HackathonCreate, HackathonUpdate, HackathonParticipantCreate
from ..models.user import User


class HackathonService:
    @staticmethod
    def create_hackathon(db: Session, hackathon_data: HackathonCreate, creator_id: str) -> Hackathon:
        """Create a new hackathon"""
        db_hackathon = Hackathon(
            name=hackathon_data.name,
            description=hackathon_data.description,
            start_date=hackathon_data.start_date,
            end_date=hackathon_data.end_date,
            max_participants=hackathon_data.max_participants,
            created_by=creator_id
        )

        db.add(db_hackathon)
        try:
            db.commit()
            db.refresh(db_hackathon)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error creating hackathon"
            )

        return db_hackathon

    @staticmethod
    def get_hackathon_by_id(db: Session, hackathon_id: str) -> Optional[Hackathon]:
        """Get a hackathon by its ID"""
        return db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()

    @staticmethod
    def get_all_hackathons(db: Session, skip: int = 0, limit: int = 100) -> List[Hackathon]:
        """Get all hackathons with pagination"""
        return db.query(Hackathon).offset(skip).limit(limit).all()

    @staticmethod
    def get_active_hackathons(db: Session) -> List[Hackathon]:
        """Get all active hackathons"""
        return db.query(Hackathon).filter(
            Hackathon.is_active == True,
            Hackathon.status.in_([HackathonStatus.ACTIVE, HackathonStatus.REGISTRATION_OPEN])
        ).all()

    @staticmethod
    def update_hackathon(db: Session, hackathon_id: str, hackathon_data: HackathonUpdate) -> Optional[Hackathon]:
        """Update a hackathon"""
        db_hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()

        if not db_hackathon:
            return None

        # Update fields that are provided
        for field, value in hackathon_data.model_dump(exclude_unset=True).items():
            setattr(db_hackathon, field, value)

        db.commit()
        db.refresh(db_hackathon)

        return db_hackathon

    @staticmethod
    def delete_hackathon(db: Session, hackathon_id: str) -> bool:
        """Soft delete a hackathon"""
        db_hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()

        if not db_hackathon:
            return False

        db_hackathon.is_active = False
        db.commit()

        return True

    @staticmethod
    def join_hackathon(db: Session, participant_data: HackathonParticipantCreate, current_user_id: str) -> HackathonParticipant:
        """Join a hackathon as a participant"""
        # Verify the user is the one joining (not someone else)
        if str(participant_data.user_id) != str(current_user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot join hackathon for another user"
            )

        # Check if hackathon exists and is accepting registrations
        hackathon = db.query(Hackathon).filter(
            Hackathon.id == participant_data.hackathon_id,
            Hackathon.is_active == True
        ).first()

        if not hackathon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hackathon not found or inactive"
            )

        if hackathon.status not in [HackathonStatus.REGISTRATION_OPEN, HackathonStatus.ACTIVE]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration is not open for this hackathon"
            )

        # Check if user is already participating
        existing_participation = db.query(HackathonParticipant).filter(
            HackathonParticipant.hackathon_id == participant_data.hackathon_id,
            HackathonParticipant.user_id == participant_data.user_id
        ).first()

        if existing_participation:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already participating in this hackathon"
            )

        # Check max participants limit
        if hackathon.max_participants:
            current_participants = db.query(HackathonParticipant).filter(
                HackathonParticipant.hackathon_id == participant_data.hackathon_id,
                HackathonParticipant.is_confirmed == True
            ).count()

            if current_participants >= hackathon.max_participants:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Hackathon is at maximum capacity"
                )

        # Create participation record
        db_participant = HackathonParticipant(
            hackathon_id=participant_data.hackathon_id,
            user_id=participant_data.user_id,
            role=participant_data.role
        )

        db.add(db_participant)
        try:
            db.commit()
            db.refresh(db_participant)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error joining hackathon"
            )

        return db_participant

    @staticmethod
    def get_user_hackathons(db: Session, user_id: str) -> List[Hackathon]:
        """Get all hackathons a user is participating in"""
        return db.query(Hackathon).join(HackathonParticipant).filter(
            HackathonParticipant.user_id == user_id,
            Hackathon.is_active == True
        ).all()

    @staticmethod
    def get_hackathon_participants(db: Session, hackathon_id: str) -> List[User]:
        """Get all participants for a hackathon"""
        return db.query(User).join(HackathonParticipant).filter(
            HackathonParticipant.hackathon_id == hackathon_id,
            HackathonParticipant.is_confirmed == True
        ).all()

    @staticmethod
    def is_user_participating(db: Session, user_id: str, hackathon_id: str) -> bool:
        """Check if a user is participating in a hackathon"""
        participant = db.query(HackathonParticipant).filter(
            HackathonParticipant.user_id == user_id,
            HackathonParticipant.hackathon_id == hackathon_id,
            HackathonParticipant.is_confirmed == True
        ).first()

        return participant is not None

    @staticmethod
    def get_current_phase(db: Session, hackathon_id: str) -> Optional[Hackathon]:
        """Get the current active phase of a hackathon"""
        from ..models.hackathon import Phase
        current_time = datetime.utcnow()

        # Get the hackathon
        hackathon = db.query(Hackathon).filter(
            Hackathon.id == hackathon_id,
            Hackathon.is_active == True
        ).first()

        if not hackathon:
            return None

        # Get the currently active phase based on dates
        current_phase = db.query(Phase).filter(
            Phase.hackathon_id == hackathon_id,
            Phase.start_date <= current_time,
            Phase.end_date >= current_time,
            Phase.is_active == True
        ).first()

        return current_phase