from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timedelta

from ..models.user import User
from ..models.audit_log import AuditLog
from ..models.submission import Submission
from ..models.team import Team, TeamMember
from ..models.notification import Notification


class GDPRService:
    @staticmethod
    def request_data_export(db: Session, user_id: str) -> dict:
        """Export all personal data for a user"""
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Create audit log for data export
        GDPRService._log_audit_event(db, user_id, "data_export_request", "User requested personal data export")

        # Gather all user data
        user_data = {
            "user_info": {
                "id": str(user.id),
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "bio": user.bio,
                "profile_image_url": user.profile_image_url,
                "role": user.role.value,
                "is_active": user.is_active,
                "gdpr_consent": user.gdpr_consent,
                "gdpr_consent_at": user.gdpr_consent_at,
                "email_confirmed": user.email_confirmed,
                "confirmed_at": user.confirmed_at,
                "created_at": user.created_at,
                "updated_at": user.updated_at,
                "last_login": user.last_login
            },
            "teams": [],
            "submissions": [],
            "notifications": [],
            "audit_logs": []
        }

        # Get teams user belongs to
        team_memberships = db.query(TeamMember).filter(
            TeamMember.user_id == user_id,
            TeamMember.is_active == True
        ).all()

        for membership in team_memberships:
            team = db.query(Team).filter(Team.id == membership.team_id).first()
            if team:
                user_data["teams"].append({
                    "team_id": str(team.id),
                    "team_name": team.name,
                    "team_description": team.description,
                    "role_in_team": membership.role,
                    "joined_at": membership.joined_at,
                    "is_confirmed": membership.is_confirmed
                })

        # Get user's submissions
        submissions = db.query(Submission).filter(
            Submission.team.has(
                Team.members.any(user_id=user_id)
            )
        ).all()

        for submission in submissions:
            user_data["submissions"].append({
                "id": str(submission.id),
                "title": submission.title,
                "description": submission.description,
                "status": submission.status,
                "category": submission.category,
                "demo_link": submission.demo_link,
                "repo_link": submission.repo_link,
                "submitted_at": submission.submitted_at,
                "updated_at": submission.updated_at
            })

        # Get user's notifications
        notifications = db.query(Notification).filter(
            Notification.user_id == user_id
        ).all()

        for notification in notifications:
            user_data["notifications"].append({
                "id": str(notification.id),
                "title": notification.title,
                "message": notification.message,
                "notification_type": notification.notification_type.value,
                "status": notification.status.value,
                "is_read": notification.is_read,
                "sent_at": notification.sent_at,
                "read_at": notification.read_at
            })

        # Get user's audit logs
        audit_logs = db.query(AuditLog).filter(
            AuditLog.user_id == user_id
        ).order_by(AuditLog.timestamp.desc()).limit(100).all()

        for log in audit_logs:
            user_data["audit_logs"].append({
                "id": str(log.id),
                "action": log.action,
                "resource_type": log.resource_type,
                "resource_id": log.resource_id,
                "timestamp": log.timestamp,
                "ip_address": log.ip_address,
                "user_agent": log.user_agent
            })

        return user_data

    @staticmethod
    def request_account_deletion(db: Session, user_id: str, reason: str = "") -> bool:
        """Request account deletion (soft delete with data anonymization)"""
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Log the deletion request
        GDPRService._log_audit_event(
            db,
            user_id,
            "account_deletion_request",
            f"User requested account deletion. Reason: {reason}"
        )

        # Anonymize the user data (keep for legal/auditing purposes but remove PII)
        GDPRService._anonymize_user_data(db, user)

        # Deactivate the account
        user.is_active = False
        db.commit()

        return True

    @staticmethod
    def withdraw_consent(db: Session, user_id: str) -> bool:
        """Withdraw GDPR consent and anonymize data if requested"""
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Update consent status
        user.gdpr_consent = False
        user.gdpr_consent_at = None

        # Log the consent withdrawal
        GDPRService._log_audit_event(
            db,
            user_id,
            "consent_withdrawal",
            "User withdrew GDPR consent"
        )

        db.commit()
        return True

    @staticmethod
    def _anonymize_user_data(db: Session, user: User):
        """Anonymize user data while keeping records for legal purposes"""
        # Keep the record but anonymize personal information
        user.email = f"anonymized_{user.id}@example.com"
        user.username = f"anonymized_{user.id}"
        user.first_name = "[ANONYMIZED]"
        user.last_name = "[ANONYMIZED]"
        user.bio = "[ANONYMIZED]"
        user.profile_image_url = None

        # Clear any sensitive data
        user.skills = None

        # Mark as anonymized
        user.is_active = False

        db.commit()

    @staticmethod
    def _log_audit_event(db: Session, user_id: str, action: str, details: str):
        """Log GDPR-related events for audit trail"""
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type="user",
            resource_id=user_id,
            details=details
        )

        db.add(audit_log)
        db.commit()

    @staticmethod
    def get_gdpr_requests(db: Session, user_id: str) -> List[dict]:
        """Get all GDPR-related requests for a user"""
        # Get audit logs related to GDPR
        gdpr_logs = db.query(AuditLog).filter(
            AuditLog.user_id == user_id,
            AuditLog.action.like("%gdpr%") |
            AuditLog.action.like("%privacy%") |
            AuditLog.action.like("%consent%") |
            AuditLog.action.like("%data_export%") |
            AuditLog.action.like("%account_deletion%") |
            AuditLog.action.like("%anonymize%")
        ).order_by(AuditLog.timestamp.desc()).all()

        requests = []
        for log in gdpr_logs:
            requests.append({
                "timestamp": log.timestamp,
                "action": log.action,
                "details": log.details
            })

        return requests

    @staticmethod
    def get_data_retention_info(db: Session) -> dict:
        """Get information about data retention periods"""
        return {
            "user_accounts": "Accounts are retained indefinitely until user requests deletion",
            "audit_logs": "Audit logs are retained for 7 years for legal compliance",
            "notifications": "Notifications are retained for 1 year",
            "submissions": "Submissions are retained for 2 years after hackathon ends",
            "gdpr_log": "GDPR request logs are retained for 7 years"
        }