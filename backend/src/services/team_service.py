from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from datetime import datetime, timedelta
import uuid

from ..models.team import Team, TeamMember, TeamInvitation
from ..models.user import User
from ..models.hackathon import Hackathon
from ..schemas.team import TeamCreate, TeamUpdate, TeamMemberCreate, TeamMemberUpdate, TeamInvitationCreate, TeamInvitationUpdate
from ..services.notification_service import NotificationService
from ..services.email_service import EmailService


class TeamService:
    @staticmethod
    def create_team(db: Session, team_data: TeamCreate, creator_id: str) -> Team:
        """Create a new team"""
        # Verify the hackathon exists
        hackathon = db.query(Hackathon).filter(
            Hackathon.id == team_data.hackathon_id,
            Hackathon.is_active == True
        ).first()

        if not hackathon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hackathon not found or inactive"
            )

        # Verify the creator exists
        creator = db.query(User).filter(User.id == creator_id).first()
        if not creator:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Creator user not found"
            )

        # Check if user is already in a team for this hackathon
        existing_membership = db.query(TeamMember).join(Team).filter(
            TeamMember.user_id == creator_id,
            Team.hackathon_id == team_data.hackathon_id,
            TeamMember.is_active == True,
            Team.is_active == True
        ).first()

        if existing_membership:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member of a team in this hackathon"
            )

        db_team = Team(
            name=team_data.name,
            description=team_data.description,
            hackathon_id=team_data.hackathon_id,
            created_by=creator_id,
            max_members=team_data.max_members
        )

        db.add(db_team)
        try:
            db.commit()
            db.refresh(db_team)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error creating team"
            )

        # Add the creator as the team leader
        team_member = TeamMember(
            team_id=db_team.id,
            user_id=creator_id,
            role="leader",
            is_confirmed=True
        )

        db.add(team_member)
        db.commit()

        return db_team

    @staticmethod
    def get_team_by_id(db: Session, team_id: str) -> Optional[Team]:
        """Get a team by its ID"""
        return db.query(Team).filter(Team.id == team_id, Team.is_active == True).first()

    @staticmethod
    def get_teams_by_hackathon(db: Session, hackathon_id: str) -> List[Team]:
        """Get all teams for a hackathon"""
        return db.query(Team).filter(
            Team.hackathon_id == hackathon_id,
            Team.is_active == True
        ).all()

    @staticmethod
    def get_user_teams(db: Session, user_id: str) -> List[Team]:
        """Get all teams a user is a member of"""
        return db.query(Team).join(TeamMember).filter(
            TeamMember.user_id == user_id,
            TeamMember.is_confirmed == True,
            TeamMember.is_active == True,
            Team.is_active == True
        ).all()

    @staticmethod
    def update_team(db: Session, team_id: str, team_data: TeamUpdate, user_id: str) -> Optional[Team]:
        """Update a team (only team leader or hackathon admin can update)"""
        db_team = db.query(Team).filter(Team.id == team_id, Team.is_active == True).first()

        if not db_team:
            return None

        # Check if user is team leader or hackathon creator
        team_leader = db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.role == "leader",
            TeamMember.is_active == True
        ).first()

        if not team_leader or str(team_leader.user_id) != user_id:
            # Check if user is hackathon creator
            hackathon = db.query(Hackathon).filter(Hackathon.id == db_team.hackathon_id).first()
            if str(hackathon.created_by) != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only team leaders or hackathon creators can update teams"
                )

        # Update fields that are provided
        for field, value in team_data.model_dump(exclude_unset=True).items():
            setattr(db_team, field, value)

        db.commit()
        db.refresh(db_team)

        return db_team

    @staticmethod
    def delete_team(db: Session, team_id: str, user_id: str) -> bool:
        """Delete a team (only team leader or hackathon admin can delete)"""
        db_team = db.query(Team).filter(Team.id == team_id, Team.is_active == True).first()

        if not db_team:
            return False

        # Check if user is team leader or hackathon creator
        team_leader = db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.role == "leader",
            TeamMember.is_active == True
        ).first()

        if not team_leader or str(team_leader.user_id) != user_id:
            # Check if user is hackathon creator
            hackathon = db.query(Hackathon).filter(Hackathon.id == db_team.hackathon_id).first()
            if str(hackathon.created_by) != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only team leaders or hackathon creators can delete teams"
                )

        db_team.is_active = False
        db.commit()

        return True

    @staticmethod
    def add_member_to_team(db: Session, team_id: str, user_id: str, requesting_user_id: str, role: str = "member") -> TeamMember:
        """Add a member to a team (only team leader can add members)"""
        team = db.query(Team).filter(Team.id == team_id, Team.is_active == True).first()
        if not team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team not found"
            )

        requesting_member = db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id == requesting_user_id,
            TeamMember.role == "leader",
            TeamMember.is_active == True
        ).first()

        if not requesting_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only team leaders can add members"
            )

        # Check if team is at max capacity
        active_members_count = db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.is_active == True,
            TeamMember.is_confirmed == True
        ).count()

        if active_members_count >= team.max_members:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Team is at maximum capacity of {team.max_members} members"
            )

        # Check if user is already in the team
        existing_member = db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id == user_id,
            TeamMember.is_active == True
        ).first()

        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member of this team"
            )

        # Check if user is already in another team for this hackathon
        existing_membership = db.query(TeamMember).join(Team).filter(
            TeamMember.user_id == user_id,
            Team.hackathon_id == team.hackathon_id,
            TeamMember.is_active == True,
            Team.is_active == True
        ).first()

        if existing_membership:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of another team in this hackathon"
        )

        team_member = TeamMember(
            team_id=team_id,
            user_id=user_id,
            role=role,
            is_confirmed=False  # Need to confirm invitation
        )

        db.add(team_member)
        db.commit()
        db.refresh(team_member)

        # Create a notification for the user about the team invitation
        notification_title = f"Team Invitation: {team.name}"
        notification_message = f"You have been invited to join team '{team.name}' in hackathon '{team.hackathon.name}'. Please confirm your membership."

        notification_data = {
            "user_id": user_id,
            "title": notification_title,
            "message": notification_message,
            "notification_type": "team_invitation",
            "related_entity_type": "team",
            "related_entity_id": team_id
        }

        # We'll need to create a notification using the NotificationService
        # For now, we'll just create it directly
        from ..models.notification import Notification, NotificationType
        from sqlalchemy import and_

        notification = Notification(
            user_id=user_id,
            title=notification_title,
            message=notification_message,
            notification_type=NotificationType.TEAM_INVITATION,
            related_entity_type="team",
            related_entity_id=team_id
        )

        db.add(notification)
        db.commit()

        return team_member

    @staticmethod
    def remove_member_from_team(db: Session, team_id: str, member_user_id: str, requesting_user_id: str) -> bool:
        """Remove a member from a team (team leader or self can remove)"""
        team_member = db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id == member_user_id,
            TeamMember.is_active == True
        ).first()

        if not team_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team member not found"
            )

        # Check if requesting user is team leader or the member themselves
        requesting_member = db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id == requesting_user_id,
            TeamMember.is_active == True
        ).first()

        if not requesting_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Requesting user is not a member of this team"
            )

        if (str(requesting_user_id) != str(member_user_id) and
            requesting_member.role != "leader"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only team leaders can remove other members, and users can only leave their own teams"
            )

        # Don't allow removing the last member
        active_members_count = db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.is_active == True
        ).count()

        if active_members_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove the last member of a team"
            )

        # Don't allow removing the team leader unless it's the leader leaving
        if (team_member.role == "leader" and
            str(requesting_user_id) != str(member_user_id)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Team leaders cannot be removed by other members"
            )

        # If the member being removed is the leader, transfer leadership to another member
        if team_member.role == "leader":
            other_member = db.query(TeamMember).filter(
                TeamMember.team_id == team_id,
                TeamMember.user_id != member_user_id,
                TeamMember.is_active == True
            ).first()

            if other_member:
                other_member.role = "leader"
                db.commit()

        team_member.is_active = False
        db.commit()

        return True

    @staticmethod
    def confirm_team_membership(db: Session, team_id: str, user_id: str) -> TeamMember:
        """Confirm a team membership invitation"""
        team_member = db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id == user_id,
            TeamMember.is_active == True
        ).first()

        if not team_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team membership invitation not found"
            )

        if team_member.is_confirmed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Membership already confirmed"
            )

        team_member.is_confirmed = True
        db.commit()
        db.refresh(team_member)

        return team_member

    @staticmethod
    def create_team_invitation(db: Session, invitation_data: TeamInvitationCreate, inviter_id: str) -> TeamInvitation:
        """Create a team invitation"""
        team = db.query(Team).filter(Team.id == invitation_data.team_id, Team.is_active == True).first()
        if not team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team not found"
            )

        # Check if inviter is team leader
        team_leader = db.query(TeamMember).filter(
            TeamMember.team_id == invitation_data.team_id,
            TeamMember.user_id == inviter_id,
            TeamMember.role == "leader",
            TeamMember.is_active == True
        ).first()

        if not team_leader:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only team leaders can send invitations"
            )

        # Check if user with that email already exists and is in the team
        invited_user = db.query(User).filter(User.email == invitation_data.invitee_email).first()
        if invited_user:
            existing_member = db.query(TeamMember).filter(
                TeamMember.team_id == invitation_data.team_id,
                TeamMember.user_id == invited_user.id,
                TeamMember.is_active == True
            ).first()

            if existing_member:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User with this email is already in the team"
                )

        # Check if there's already a pending invitation to this email for this team
        existing_invitation = db.query(TeamInvitation).filter(
            TeamInvitation.team_id == invitation_data.team_id,
            TeamInvitation.invitee_email == invitation_data.invitee_email,
            TeamInvitation.status == "pending"
        ).first()

        if existing_invitation:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="There is already a pending invitation for this email"
            )

        # Check if team is at max capacity
        active_members_count = db.query(TeamMember).filter(
            TeamMember.team_id == invitation_data.team_id,
            TeamMember.is_active == True,
            TeamMember.is_confirmed == True
        ).count()

        if active_members_count >= team.max_members:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Team is at maximum capacity of {team.max_members} members"
            )

        db_invitation = TeamInvitation(
            team_id=invitation_data.team_id,
            invited_by=inviter_id,
            invitee_email=invitation_data.invitee_email,
            expires_at=datetime.utcnow() + timedelta(days=7)  # Invite expires in 7 days
        )

        db.add(db_invitation)
        db.commit()
        db.refresh(db_invitation)

        # Send email invitation
        try:
            EmailService.send_email(
                to_email=invitation_data.invitee_email,
                subject=f"Team Invitation to Join {team.name}",
                body=f"You have been invited to join team '{team.name}' in hackathon '{team.hackathon.name}'. Please register or log in to accept the invitation."
            )
        except Exception:
            # Log error but don't fail the invitation creation
            print(f"Failed to send invitation email to {invitation_data.invitee_email}")

        return db_invitation

    @staticmethod
    def accept_team_invitation(db: Session, invitation_id: str, user_id: str) -> TeamMember:
        """Accept a team invitation"""
        invitation = db.query(TeamInvitation).filter(
            TeamInvitation.id == invitation_id,
            TeamInvitation.status == "pending"
        ).first()

        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found or already processed"
            )

        if invitation.expires_at < datetime.utcnow():
            invitation.status = "expired"
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invitation has expired"
            )

        # Get the user who is accepting
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Check if user email matches the invitation
        if user.email != invitation.invitee_email:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email mismatch - invitation is not for this user"
            )

        # Check if user is already in the team
        existing_member = db.query(TeamMember).filter(
            TeamMember.team_id == invitation.team_id,
            TeamMember.user_id == user_id,
            TeamMember.is_active == True
        ).first()

        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member of this team"
            )

        # Check if user is already in another team for this hackathon
        team = db.query(Team).filter(Team.id == invitation.team_id).first()
        existing_membership = db.query(TeamMember).join(Team).filter(
            TeamMember.user_id == user_id,
            Team.hackathon_id == team.hackathon_id,
            TeamMember.is_active == True,
            Team.is_active == True
        ).first()

        if existing_membership:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member of another team in this hackathon"
            )

        # Check if team is at max capacity
        active_members_count = db.query(TeamMember).filter(
            TeamMember.team_id == invitation.team_id,
            TeamMember.is_active == True,
            TeamMember.is_confirmed == True
        ).count()

        if active_members_count >= team.max_members:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Team is at maximum capacity of {team.max_members} members"
            )

        # Create team membership
        team_member = TeamMember(
            team_id=invitation.team_id,
            user_id=user_id,
            role="member",
            is_confirmed=True
        )

        db.add(team_member)

        # Update invitation status
        invitation.status = "accepted"
        db.commit()
        db.refresh(team_member)

        return team_member

    @staticmethod
    def decline_team_invitation(db: Session, invitation_id: str, user_id: str) -> bool:
        """Decline a team invitation"""
        invitation = db.query(TeamInvitation).filter(
            TeamInvitation.id == invitation_id,
            TeamInvitation.status == "pending"
        ).first()

        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found or already processed"
            )

        if invitation.expires_at < datetime.utcnow():
            invitation.status = "expired"
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invitation has expired"
            )

        # Get the user who is declining
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Check if user email matches the invitation
        if user.email != invitation.invitee_email:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email mismatch - invitation is not for this user"
            )

        invitation.status = "declined"
        db.commit()

        return True

    @staticmethod
    def get_team_members(db: Session, team_id: str) -> List[TeamMember]:
        """Get all members of a team"""
        return db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.is_active == True
        ).all()

    @staticmethod
    def get_user_pending_invitations(db: Session, user_id: str) -> List[TeamInvitation]:
        """Get all pending invitations for a user"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return db.query(TeamInvitation).filter(
            TeamInvitation.invitee_email == user.email,
            TeamInvitation.status == "pending",
            TeamInvitation.expires_at > datetime.utcnow()
        ).all()