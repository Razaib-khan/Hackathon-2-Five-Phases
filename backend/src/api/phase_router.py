from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..schemas.hackathon import (
    HackathonCreate,
    HackathonUpdate,
    HackathonResponse,
    PhaseCreate,
    PhaseUpdate,
    PhaseResponse,
    HackathonParticipantCreate,
    HackathonParticipantResponse
)
from ..services.hackathon_service import HackathonService
from ..services.phase_service import PhaseService
from ..config.database import get_db
from ..config.auth import get_current_user
from ..models.user import User


router = APIRouter()


@router.post("/hackathons", response_model=HackathonResponse, status_code=status.HTTP_201_CREATED)
async def create_hackathon(
    hackathon_data: HackathonCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new hackathon
    """
    return HackathonService.create_hackathon(db, hackathon_data, str(current_user.id))


@router.get("/hackathons", response_model=List[HackathonResponse])
async def get_all_hackathons(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all hackathons with pagination
    """
    return HackathonService.get_all_hackathons(db, skip, limit)


@router.get("/hackathons/active", response_model=List[HackathonResponse])
async def get_active_hackathons(
    db: Session = Depends(get_db)
):
    """
    Get all active hackathons
    """
    return HackathonService.get_active_hackathons(db)


@router.get("/hackathons/{hackathon_id}", response_model=HackathonResponse)
async def get_hackathon(
    hackathon_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a specific hackathon by ID
    """
    hackathon = HackathonService.get_hackathon_by_id(db, hackathon_id)
    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found"
        )
    return hackathon


@router.put("/hackathons/{hackathon_id}", response_model=HackathonResponse)
async def update_hackathon(
    hackathon_id: str,
    hackathon_data: HackathonUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a hackathon (only creator can update)
    """
    hackathon = HackathonService.get_hackathon_by_id(db, hackathon_id)
    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found"
        )

    # Check if current user is the creator
    if str(hackathon.created_by) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the hackathon creator can update it"
        )

    updated_hackathon = HackathonService.update_hackathon(db, hackathon_id, hackathon_data)
    if not updated_hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found"
        )
    return updated_hackathon


@router.delete("/hackathons/{hackathon_id}")
async def delete_hackathon(
    hackathon_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a hackathon (soft delete, only creator can delete)
    """
    hackathon = HackathonService.get_hackathon_by_id(db, hackathon_id)
    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found"
        )

    # Check if current user is the creator
    if str(hackathon.created_by) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the hackathon creator can delete it"
        )

    success = HackathonService.delete_hackathon(db, hackathon_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found"
        )

    return {"message": "Hackathon deleted successfully"}


@router.post("/hackathons/{hackathon_id}/join", response_model=HackathonParticipantResponse)
async def join_hackathon(
    hackathon_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Join a hackathon as a participant
    """
    participant_data = HackathonParticipantCreate(
        hackathon_id=hackathon_id,
        user_id=str(current_user.id)
    )

    return HackathonService.join_hackathon(db, participant_data, str(current_user.id))


@router.get("/hackathons/{hackathon_id}/participants", response_model=List[HackathonParticipantResponse])
async def get_hackathon_participants(
    hackathon_id: str,
    db: Session = Depends(get_db)
):
    """
    Get all participants for a hackathon
    """
    return HackathonService.get_hackathon_participants(db, hackathon_id)


@router.get("/my-hackathons", response_model=List[HackathonResponse])
async def get_user_hackathons(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all hackathons the current user is participating in
    """
    return HackathonService.get_user_hackathons(db, str(current_user.id))


@router.get("/hackathons/{hackathon_id}/current-phase")
async def get_current_hackathon_phase(
    hackathon_id: str,
    db: Session = Depends(get_db)
):
    """
    Get the current active phase of a hackathon
    """
    current_phase = PhaseService.get_current_phase(db, hackathon_id)
    if not current_phase:
        return {"message": "No active phase", "current_phase": None}
    return {"message": "Current phase retrieved", "current_phase": PhaseResponse.model_validate(current_phase)}


@router.post("/hackathons/{hackathon_id}/phases", response_model=PhaseResponse, status_code=status.HTTP_201_CREATED)
async def create_phase(
    hackathon_id: str,
    phase_data: PhaseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new phase for a hackathon (only hackathon creator can create phases)
    """
    hackathon = HackathonService.get_hackathon_by_id(db, hackathon_id)
    if not hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found"
        )

    # Check if current user is the creator
    if str(hackathon.created_by) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the hackathon creator can create phases"
        )

    # Set the hackathon_id from the URL path to ensure consistency
    phase_data.hackathon_id = hackathon_id

    return PhaseService.create_phase(db, phase_data)


@router.get("/hackathons/{hackathon_id}/phases", response_model=List[PhaseResponse])
async def get_hackathon_phases(
    hackathon_id: str,
    db: Session = Depends(get_db)
):
    """
    Get all phases for a hackathon
    """
    return PhaseService.get_phases_by_hackathon(db, hackathon_id)


@router.get("/phases/{phase_id}", response_model=PhaseResponse)
async def get_phase(
    phase_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a specific phase by ID
    """
    phase = PhaseService.get_phase_by_id(db, phase_id)
    if not phase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Phase not found"
        )
    return phase


@router.put("/phases/{phase_id}", response_model=PhaseResponse)
async def update_phase(
    phase_id: str,
    phase_data: PhaseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a phase (only hackathon creator can update)
    """
    phase = PhaseService.get_phase_by_id(db, phase_id)
    if not phase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Phase not found"
        )

    # Check if current user is the hackathon creator
    hackathon = HackathonService.get_hackathon_by_id(db, str(phase.hackathon_id))
    if str(hackathon.created_by) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the hackathon creator can update phases"
        )

    updated_phase = PhaseService.update_phase(db, phase_id, phase_data)
    if not updated_phase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Phase not found"
        )
    return updated_phase


@router.delete("/phases/{phase_id}")
async def delete_phase(
    phase_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a phase (soft delete, only hackathon creator can delete)
    """
    phase = PhaseService.get_phase_by_id(db, phase_id)
    if not phase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Phase not found"
        )

    # Check if current user is the hackathon creator
    hackathon = HackathonService.get_hackathon_by_id(db, str(phase.hackathon_id))
    if str(hackathon.created_by) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the hackathon creator can delete phases"
        )

    success = PhaseService.delete_phase(db, phase_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Phase not found"
        )

    return {"message": "Phase deleted successfully"}


@router.post("/check-phase-transitions")
async def check_phase_transitions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check for phase transitions and send notifications (admin only)
    """
    # Only allow admins to trigger this manually
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can check for phase transitions"
        )

    transitions = PhaseService.check_phase_transitions(db)
    return {
        "message": f"Checked for phase transitions, found {len(transitions)} transitions",
        "transitions": transitions
    }


@router.get("/hackathons/{hackathon_id}/timeline")
async def get_hackathon_timeline(
    hackathon_id: str,
    db: Session = Depends(get_db)
):
    """
    Get the timeline of phases for a hackathon
    """
    timeline = PhaseService.get_hackathon_timeline(db, hackathon_id)
    return {
        "message": "Timeline retrieved successfully",
        "timeline": timeline
    }