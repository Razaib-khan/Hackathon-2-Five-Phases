from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from datetime import datetime, timedelta

from ..models.hackathon import Phase, Hackathon, HackathonParticipant
from ..schemas.hackathon import PhaseCreate, PhaseUpdate
from ..services.notification_service import NotificationService


class PhaseService:
    @staticmethod
    def create_phase(db: Session, phase_data: PhaseCreate) -> Phase:
        """Create a new phase for a hackathon"""
        # Verify the hackathon exists
        hackathon = db.query(Hackathon).filter(
            Hackathon.id == phase_data.hackathon_id,
            Hackathon.is_active == True
        ).first()

        if not hackathon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hackathon not found or inactive"
            )

        # Check that phase dates are within hackathon dates
        if (phase_data.start_date < hackathon.start_date or
            phase_data.end_date > hackathon.end_date or
            phase_data.start_date >= phase_data.end_date):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phase dates must be within hackathon dates and start before end"
            )

        # Check for overlapping phases in the same hackathon
        overlapping_phase = db.query(Phase).filter(
            Phase.hackathon_id == phase_data.hackathon_id,
            Phase.is_active == True,
            Phase.start_date < phase_data.end_date,
            Phase.end_date > phase_data.start_date
        ).first()

        if overlapping_phase:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phase dates overlap with existing phase"
            )

        db_phase = Phase(
            hackathon_id=phase_data.hackathon_id,
            name=phase_data.name,
            description=phase_data.description,
            phase_type=phase_data.phase_type,
            start_date=phase_data.start_date,
            end_date=phase_data.end_date
        )

        db.add(db_phase)
        try:
            db.commit()
            db.refresh(db_phase)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error creating phase"
            )

        return db_phase

    @staticmethod
    def get_phase_by_id(db: Session, phase_id: str) -> Optional[Phase]:
        """Get a phase by its ID"""
        return db.query(Phase).filter(Phase.id == phase_id).first()

    @staticmethod
    def get_phases_by_hackathon(db: Session, hackathon_id: str) -> List[Phase]:
        """Get all phases for a hackathon"""
        return db.query(Phase).filter(
            Phase.hackathon_id == hackathon_id,
            Phase.is_active == True
        ).order_by(Phase.start_date).all()

    @staticmethod
    def get_current_phase(db: Session, hackathon_id: str) -> Optional[Phase]:
        """Get the currently active phase of a hackathon"""
        current_time = datetime.utcnow()

        return db.query(Phase).filter(
            Phase.hackathon_id == hackathon_id,
            Phase.start_date <= current_time,
            Phase.end_date >= current_time,
            Phase.is_active == True
        ).first()

    @staticmethod
    def get_next_phase(db: Session, hackathon_id: str) -> Optional[Phase]:
        """Get the next upcoming phase of a hackathon"""
        current_time = datetime.utcnow()

        return db.query(Phase).filter(
            Phase.hackathon_id == hackathon_id,
            Phase.start_date > current_time,
            Phase.is_active == True
        ).order_by(Phase.start_date).first()

    @staticmethod
    def get_phase_by_type(db: Session, hackathon_id: str, phase_type: str) -> Optional[Phase]:
        """Get a specific type of phase for a hackathon"""
        return db.query(Phase).filter(
            Phase.hackathon_id == hackathon_id,
            Phase.phase_type == phase_type,
            Phase.is_active == True
        ).first()

    @staticmethod
    def update_phase(db: Session, phase_id: str, phase_data: PhaseUpdate) -> Optional[Phase]:
        """Update a phase"""
        db_phase = db.query(Phase).filter(Phase.id == phase_id).first()

        if not db_phase:
            return None

        # Update fields that are provided
        for field, value in phase_data.model_dump(exclude_unset=True).items():
            setattr(db_phase, field, value)

        db.commit()
        db.refresh(db_phase)

        return db_phase

    @staticmethod
    def delete_phase(db: Session, phase_id: str) -> bool:
        """Soft delete a phase"""
        db_phase = db.query(Phase).filter(Phase.id == phase_id).first()

        if not db_phase:
            return False

        db_phase.is_active = False
        db.commit()

        return True

    @staticmethod
    def is_phase_active(db: Session, phase_id: str) -> bool:
        """Check if a phase is currently active"""
        phase = db.query(Phase).filter(
            Phase.id == phase_id,
            Phase.is_active == True
        ).first()

        if not phase:
            return False

        current_time = datetime.utcnow()
        return phase.start_date <= current_time <= phase.end_date

    @staticmethod
    def get_hackathon_status(db: Session, hackathon_id: str) -> Optional[str]:
        """Get the overall status of a hackathon based on its phases"""
        hackathon = db.query(Hackathon).filter(
            Hackathon.id == hackathon_id,
            Hackathon.is_active == True
        ).first()

        if not hackathon:
            return None

        current_time = datetime.utcnow()

        # Check if hackathon hasn't started yet
        if current_time < hackathon.start_date:
            return "upcoming"

        # Check if hackathon has ended
        if current_time > hackathon.end_date:
            return "completed"

        # Check for current phase
        current_phase = db.query(Phase).filter(
            Phase.hackathon_id == hackathon_id,
            Phase.start_date <= current_time,
            Phase.end_date >= current_time,
            Phase.is_active == True
        ).first()

        if current_phase:
            return current_phase.phase_type.value
        else:
            # If no active phase but within hackathon dates, it's between phases
            return "between_phases"

    @staticmethod
    def check_phase_transitions(db: Session) -> List[dict]:
        """Check for hackathons that are transitioning between phases and send notifications"""
        current_time = datetime.utcnow()
        transitions = []

        # Get hackathons that might be transitioning
        hackathons = db.query(Hackathon).filter(
            Hackathon.is_active == True,
            Hackathon.start_date <= current_time,
            Hackathon.end_date >= current_time
        ).all()

        for hackathon in hackathons:
            # Check if we're entering a new phase
            current_phase = db.query(Phase).filter(
                Phase.hackathon_id == hackathon.id,
                Phase.start_date <= current_time,
                Phase.end_date >= current_time,
                Phase.is_active == True
            ).first()

            # Check if we're at the boundary of a phase (within a 5-minute window)
            potential_new_phase = db.query(Phase).filter(
                Phase.hackathon_id == hackathon.id,
                Phase.start_date <= current_time,
                Phase.start_date > (current_time - datetime.timedelta(minutes=5)),
                Phase.is_active == True
            ).first()

            if potential_new_phase and (not current_phase or potential_new_phase.id != current_phase.id):
                # A phase transition is happening
                old_phase_name = current_phase.phase_type.value if current_phase else "N/A"
                new_phase_name = potential_new_phase.phase_type.value

                # Get all participants in this hackathon
                participants = db.query(HackathonParticipant).filter(
                    HackathonParticipant.hackathon_id == hackathon.id,
                    HackathonParticipant.is_confirmed == True
                ).all()

                # Send notifications to all participants
                for participant in participants:
                    NotificationService.create_phase_change_notification(
                        db,
                        str(participant.user_id),
                        hackathon.name,
                        old_phase_name,
                        new_phase_name
                    )

                transition_info = {
                    "hackathon_id": str(hackathon.id),
                    "hackathon_name": hackathon.name,
                    "old_phase": old_phase_name,
                    "new_phase": new_phase_name,
                    "transition_time": current_time
                }
                transitions.append(transition_info)

        return transitions

    @staticmethod
    def get_hackathon_timeline(db: Session, hackathon_id: str) -> List[dict]:
        """Get the timeline of phases for a hackathon"""
        phases = db.query(Phase).filter(
            Phase.hackathon_id == hackathon_id,
            Phase.is_active == True
        ).order_by(Phase.start_date).all()

        timeline = []
        for phase in phases:
            timeline.append({
                "id": str(phase.id),
                "name": phase.name,
                "description": phase.description,
                "phase_type": phase.phase_type.value,
                "start_date": phase.start_date,
                "end_date": phase.end_date,
                "is_active": PhaseService.is_phase_active(db, str(phase.id))
            })

        return timeline