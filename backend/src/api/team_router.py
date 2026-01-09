from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..schemas.team import (
    TeamCreate,
    TeamUpdate,
    TeamResponse,
    TeamMemberCreate,
    TeamMemberUpdate,
    TeamMemberResponse,
    TeamInvitationCreate,
    TeamInvitationUpdate,
    TeamInvitationResponse,
    TeamWithMembersResponse
)
from ..services.team_service import TeamService
from ..config.database import get_db
from ..config.auth import get_current_user
from ..models.user import User
from ..models.team import TeamMember
from ..models.hackathon import Hackathon, HackathonParticipant


router = APIRouter()


@router.post("/teams", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
async def create_team(
    team_data: TeamCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new team
    """
    return TeamService.create_team(db, team_data, str(current_user.id))


@router.get("/teams/{team_id}", response_model=TeamWithMembersResponse)
async def get_team(
    team_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific team by ID
    """
    team = TeamService.get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    # Check if user is a member of the team or hackathon creator
    team_member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == str(current_user.id),
        TeamMember.is_active == True
    ).first()

    hackathon = db.query(Hackathon).filter(Hackathon.id == team.hackathon_id).first()
    is_hackathon_creator = str(hackathon.created_by) == str(current_user.id)

    if not team_member and not is_hackathon_creator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team members or hackathon creators can view team details"
        )

    return team


@router.put("/teams/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: str,
    team_data: TeamUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a team (only team leader or hackathon creator can update)
    """
    updated_team = TeamService.update_team(db, team_id, team_data, str(current_user.id))
    if not updated_team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    return updated_team


@router.delete("/teams/{team_id}")
async def delete_team(
    team_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a team (only team leader or hackathon creator can delete)
    """
    success = TeamService.delete_team(db, team_id, str(current_user.id))
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    return {"message": "Team deleted successfully"}


@router.get("/teams", response_model=List[TeamResponse])
async def get_teams_by_hackathon(
    hackathon_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all teams for a hackathon (only participants can view)
    """
    # Check if user is a participant in the hackathon
    from ..models.hackathon import HackathonParticipant
    participant = db.query(HackathonParticipant).filter(
        HackathonParticipant.hackathon_id == hackathon_id,
        HackathonParticipant.user_id == str(current_user.id),
        HackathonParticipant.is_confirmed == True
    ).first()

    if not participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only hackathon participants can view teams"
        )

    return TeamService.get_teams_by_hackathon(db, hackathon_id)


@router.get("/my-teams", response_model=List[TeamResponse])
async def get_user_teams(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all teams the current user is a member of
    """
    return TeamService.get_user_teams(db, str(current_user.id))


@router.post("/teams/{team_id}/members", response_model=TeamMemberResponse)
async def add_member_to_team(
    team_id: str,
    member_data: TeamMemberCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a member to a team (only team leader can add members)
    """
    return TeamService.add_member_to_team(
        db, team_id, str(member_data.user_id), str(current_user.id), member_data.role
    )


@router.delete("/teams/{team_id}/members/{member_user_id}")
async def remove_member_from_team(
    team_id: str,
    member_user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a member from a team (team leader or self can remove)
    """
    success = TeamService.remove_member_from_team(
        db, team_id, member_user_id, str(current_user.id)
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found"
        )
    return {"message": "Member removed from team successfully"}


@router.post("/teams/{team_id}/confirm-membership", response_model=TeamMemberResponse)
async def confirm_team_membership(
    team_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Confirm team membership invitation
    """
    return TeamService.confirm_team_membership(db, team_id, str(current_user.id))


@router.post("/teams/{team_id}/invitations", response_model=TeamInvitationResponse)
async def create_team_invitation(
    team_id: str,
    invitation_data: TeamInvitationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a team invitation (only team leader can send invitations)
    """
    # Override the team_id from the path to ensure consistency
    invitation_data.team_id = team_id
    return TeamService.create_team_invitation(db, invitation_data, str(current_user.id))


@router.post("/team-invitations/{invitation_id}/accept")
async def accept_team_invitation(
    invitation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Accept a team invitation
    """
    team_member = TeamService.accept_team_invitation(db, invitation_id, str(current_user.id))
    return {
        "message": "Successfully joined the team",
        "team_member": team_member
    }


@router.post("/team-invitations/{invitation_id}/decline")
async def decline_team_invitation(
    invitation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Decline a team invitation
    """
    success = TeamService.decline_team_invitation(db, invitation_id, str(current_user.id))
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found or already processed"
        )
    return {"message": "Invitation declined successfully"}


@router.get("/team-invitations/pending", response_model=List[TeamInvitationResponse])
async def get_user_pending_invitations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all pending team invitations for the current user
    """
    return TeamService.get_user_pending_invitations(db, str(current_user.id))


@router.get("/teams/{team_id}/members", response_model=List[TeamMemberResponse])
async def get_team_members(
    team_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all members of a team (only team members or hackathon creators can view)
    """
    # Check if user is a member of the team or hackathon creator
    from ..models.hackathon import Hackathon
    from ..models.team import TeamMember

    team = TeamService.get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    team_member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == str(current_user.id),
        TeamMember.is_active == True
    ).first()

    hackathon = db.query(Hackathon).filter(Hackathon.id == team.hackathon_id).first()
    is_hackathon_creator = str(hackathon.created_by) == str(current_user.id)

    if not team_member and not is_hackathon_creator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team members or hackathon creators can view team members"
        )

    return TeamService.get_team_members(db, team_id)