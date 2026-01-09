from typing import Dict, Optional, List
from sqlalchemy.orm import Session
from datetime import datetime
import json
import logging

from ..models.audit_log import AuditLog
from ..models.user import User


class AuditService:
    @staticmethod
    def log_action(
        db: Session,
        user_id: Optional[str],
        action: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        old_values: Optional[dict] = None,
        new_values: Optional[dict] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        metadata: Optional[dict] = None
    ):
        """
        Log an action to the audit trail

        Args:
            db: Database session
            user_id: ID of the user performing the action (None for system events)
            action: Type of action (e.g., 'user_login', 'hackathon_created', 'user_role_updated')
            resource_type: Type of resource affected (e.g., 'user', 'hackathon', 'submission')
            resource_id: ID of the specific resource affected
            old_values: Dictionary of old values before change
            new_values: Dictionary of new values after change
            ip_address: IP address of the request
            user_agent: User agent string
            metadata: Additional metadata as dictionary
        """
        try:
            audit_log = AuditLog(
                user_id=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                ip_address=ip_address,
                user_agent=user_agent,
                old_values=json.dumps(old_values) if old_values else None,
                new_values=json.dumps(new_values) if new_values else None,
                changes=AuditService._get_changes(old_values, new_values),
                metadata=json.dumps(metadata) if metadata else None,
                timestamp=datetime.utcnow()
            )

            db.add(audit_log)
            db.commit()

            logging.info(f"Audit log created: {action} for {resource_type}:{resource_id} by user:{user_id}")
        except Exception as e:
            logging.error(f"Failed to create audit log: {str(e)}")
            # Don't raise exception as audit logging shouldn't break main functionality
            db.rollback()

    @staticmethod
    def _get_changes(old_values: Optional[dict], new_values: Optional[dict]) -> Optional[str]:
        """Generate a string representation of changes between old and new values"""
        if not old_values or not new_values:
            return None

        changes = {}
        for key, new_val in new_values.items():
            old_val = old_values.get(key)
            if old_val != new_val:
                changes[key] = {"old": old_val, "new": new_val}

        return json.dumps(changes) if changes else None

    @staticmethod
    def get_audit_logs(
        db: Session,
        user_id: Optional[str] = None,
        action: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        days: int = 7,
        limit: int = 100
    ) -> List[AuditLog]:
        """Get audit logs with optional filters"""
        query = db.query(AuditLog).filter(
            AuditLog.timestamp >= datetime.utcnow() - datetime.timedelta(days=days)
        )

        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if action:
            query = query.filter(AuditLog.action == action)
        if resource_type:
            query = query.filter(AuditLog.resource_type == resource_type)
        if resource_id:
            query = query.filter(AuditLog.resource_id == resource_id)

        return query.order_by(AuditLog.timestamp.desc()).limit(limit).all()

    @staticmethod
    def get_user_audit_logs(db: Session, user_id: str, days: int = 30) -> List[AuditLog]:
        """Get audit logs for a specific user"""
        return db.query(AuditLog).filter(
            AuditLog.user_id == user_id,
            AuditLog.timestamp >= datetime.utcnow() - datetime.timedelta(days=days)
        ).order_by(AuditLog.timestamp.desc()).all()

    @staticmethod
    def get_security_events(db: Session, days: int = 7) -> List[AuditLog]:
        """Get security-related audit events"""
        security_actions = [
            'user_login_failed', 'user_password_reset', 'user_role_updated',
            'user_banned', 'user_deactivated', 'admin_action_performed',
            'security_setting_changed', 'permission_granted', 'permission_revoked'
        ]

        return db.query(AuditLog).filter(
            AuditLog.action.in_(security_actions),
            AuditLog.timestamp >= datetime.utcnow() - datetime.timedelta(days=days)
        ).order_by(AuditLog.timestamp.desc()).all()

    @staticmethod
    def log_security_event(
        db: Session,
        user_id: Optional[str],
        event_type: str,
        description: str,
        ip_address: Optional[str] = None,
        severity: str = 'medium',
        metadata: Optional[dict] = None
    ):
        """Convenience method to log security events"""
        AuditService.log_action(
            db=db,
            user_id=user_id,
            action=f"security_{event_type}",
            resource_type="security",
            resource_id=None,
            old_values=None,
            new_values=None,
            ip_address=ip_address,
            user_agent=None,
            metadata={
                **(metadata or {}),
                "description": description,
                "severity": severity
            }
        )

    @staticmethod
    def log_admin_action(
        db: Session,
        admin_user_id: str,
        action: str,
        target_resource_type: str,
        target_resource_id: str,
        details: Optional[dict] = None,
        ip_address: Optional[str] = None
    ):
        """Convenience method to log admin actions"""
        AuditService.log_action(
            db=db,
            user_id=admin_user_id,
            action=action,
            resource_type=target_resource_type,
            resource_id=target_resource_id,
            metadata={
                "action_type": "admin",
                **(details or {})
            },
            ip_address=ip_address
        )