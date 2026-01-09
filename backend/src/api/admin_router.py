from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from fastapi.requests import Request
from sqlalchemy import func

from ..schemas.user import UserResponse, UserUpdate
from ..schemas.hackathon import HackathonCreate, HackathonUpdate, HackathonResponse
from ..services.user_service import UserService
from ..services.hackathon_service import HackathonService
from ..services.notification_service import NotificationService
from ..services.reporting_service import ReportingService
from ..services.audit_service import AuditService
from ..config.database import get_db
from ..config.auth import get_current_user
from ..models.user import User, UserRole
from ..models.audit_log import AuditLog
from ..middleware.rbac import require_role


router = APIRouter()


@router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Get all users (admin only)
    """
    return UserService.get_all_users(db, skip, limit)


@router.put("/admin/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    request: Request,
    user_id: str,
    role: str,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Update user role (admin only)
    """
    # Get the original user to log the change
    original_user = UserService.get_user_by_id(db, user_id)
    if not original_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Validate role
    try:
        role_enum = UserRole(role.upper())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
        )

    updated_user = UserService.update_user_role(db, user_id, role_enum)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Log the admin action
    AuditService.log_admin_action(
        db=db,
        admin_user_id=str(current_user.id),
        action="user_role_updated",
        target_resource_type="user",
        target_resource_id=user_id,
        details={
            "previous_role": original_user.role.value,
            "new_role": role_enum.value
        },
        ip_address=request.client.host if request.client else None
    )

    return updated_user


@router.put("/admin/users/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    request: Request,
    user_id: str,
    is_active: bool,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Update user status (activate/deactivate) (admin only)
    """
    # Get the original user to log the change
    original_user = UserService.get_user_by_id(db, user_id)
    if not original_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    updated_user = UserService.update_user_status(db, user_id, is_active)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Log the admin action
    AuditService.log_admin_action(
        db=db,
        admin_user_id=str(current_user.id),
        action="user_status_updated" if is_active else "user_deactivated",
        target_resource_type="user",
        target_resource_id=user_id,
        details={
            "previous_status": original_user.is_active,
            "new_status": is_active
        },
        ip_address=request.client.host if request.client else None
    )

    return updated_user


@router.delete("/admin/users/{user_id}")
async def ban_user(
    request: Request,
    user_id: str,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Ban a user (admin only)
    """
    # Get the original user to log the change
    original_user = UserService.get_user_by_id(db, user_id)
    if not original_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    success = UserService.ban_user(db, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Log the admin action
    AuditService.log_admin_action(
        db=db,
        admin_user_id=str(current_user.id),
        action="user_banned",
        target_resource_type="user",
        target_resource_id=user_id,
        details={
            "previous_status": original_user.is_active,
            "new_status": False,
            "ban_reason": "Administrative action"
        },
        ip_address=request.client.host if request.client else None
    )

    return {"message": "User banned successfully"}


@router.get("/admin/hackathons", response_model=List[HackathonResponse])
async def get_all_hackathons(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Get all hackathons (admin only)
    """
    return HackathonService.get_all_hackathons(db, skip, limit)


@router.post("/admin/hackathons", response_model=HackathonResponse, status_code=status.HTTP_201_CREATED)
async def create_hackathon_admin(
    request: Request,
    hackathon_data: HackathonCreate,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Create a hackathon (admin only)
    """
    # For admin-created hackathons, the admin becomes the creator
    hackathon = HackathonService.create_hackathon(db, hackathon_data, str(current_user.id))

    # Log the admin action
    AuditService.log_admin_action(
        db=db,
        admin_user_id=str(current_user.id),
        action="hackathon_created",
        target_resource_type="hackathon",
        target_resource_id=str(hackathon.id),
        details={
            "hackathon_name": hackathon.name,
            "start_date": str(hackathon.start_date),
            "end_date": str(hackathon.end_date)
        },
        ip_address=request.client.host if request.client else None
    )

    return hackathon


@router.put("/admin/hackathons/{hackathon_id}", response_model=HackathonResponse)
async def update_hackathon_admin(
    request: Request,
    hackathon_id: str,
    hackathon_data: HackathonUpdate,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Update a hackathon (admin only)
    """
    # Get the original hackathon to log the change
    original_hackathon = HackathonService.get_hackathon_by_id(db, hackathon_id)
    if not original_hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found"
        )

    updated_hackathon = HackathonService.update_hackathon(db, hackathon_id, hackathon_data)
    if not updated_hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found"
        )

    # Log the admin action
    AuditService.log_admin_action(
        db=db,
        admin_user_id=str(current_user.id),
        action="hackathon_updated",
        target_resource_type="hackathon",
        target_resource_id=hackathon_id,
        details={
            "hackathon_name": updated_hackathon.name,
            "changes": {
                "name": {"old": original_hackathon.name, "new": updated_hackathon.name},
                "description": {"old": original_hackathon.description, "new": updated_hackathon.description},
                "start_date": {"old": str(original_hackathon.start_date), "new": str(updated_hackathon.start_date)},
                "end_date": {"old": str(original_hackathon.end_date), "new": str(updated_hackathon.end_date)}
            }
        },
        ip_address=request.client.host if request.client else None
    )

    return updated_hackathon


@router.delete("/admin/hackathons/{hackathon_id}")
async def delete_hackathon_admin(
    request: Request,
    hackathon_id: str,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Delete a hackathon (admin only)
    """
    # Get the original hackathon to log the change
    original_hackathon = HackathonService.get_hackathon_by_id(db, hackathon_id)
    if not original_hackathon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found"
        )

    success = HackathonService.delete_hackathon(db, hackathon_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hackathon not found"
        )

    # Log the admin action
    AuditService.log_admin_action(
        db=db,
        admin_user_id=str(current_user.id),
        action="hackathon_deleted",
        target_resource_type="hackathon",
        target_resource_id=hackathon_id,
        details={
            "hackathon_name": original_hackathon.name,
            "deleted_by": str(current_user.id)
        },
        ip_address=request.client.host if request.client else None
    )

    return {"message": "Hackathon deleted successfully"}


@router.get("/admin/dashboard-stats")
async def get_admin_dashboard_stats(
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Get admin dashboard statistics (admin only)
    """
    # Get user statistics
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    admin_users = db.query(User).filter(User.role == UserRole.ADMIN).count()

    # Get hackathon statistics
    from ..models.hackathon import Hackathon
    total_hackathons = db.query(Hackathon).count()
    active_hackathons = db.query(Hackathon).filter(Hackathon.is_active == True).count()

    # Get participant statistics
    from ..models.hackathon import HackathonParticipant
    total_participants = db.query(HackathonParticipant).count()

    # Get team statistics
    from ..models.team import Team
    total_teams = db.query(Team).count()

    # Get submission statistics
    from ..models.submission import Submission
    total_submissions = db.query(Submission).count()

    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "admins": admin_users
        },
        "hackathons": {
            "total": total_hackathons,
            "active": active_hackathons
        },
        "participants": {
            "total": total_participants
        },
        "teams": {
            "total": total_teams
        },
        "submissions": {
            "total": total_submissions
        }
    }


@router.post("/admin/send-notification")
async def send_admin_notification(
    request: Request,
    user_id: str,
    title: str,
    message: str,
    notification_type: str = "ANNOUNCEMENT",
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Send an admin notification to a specific user (admin only)
    """
    from ..models.notification import NotificationType
    try:
        notification_type_enum = NotificationType(notification_type.upper())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid notification type"
        )

    from ..schemas.notification import NotificationCreate
    notification_data = NotificationCreate(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type_enum
    )

    notification = NotificationService.create_notification(db, notification_data)

    # Log the admin action
    AuditService.log_admin_action(
        db=db,
        admin_user_id=str(current_user.id),
        action="admin_notification_sent",
        target_resource_type="notification",
        target_resource_id=str(notification.id),
        details={
            "recipient_user_id": user_id,
            "notification_type": notification_type,
            "notification_title": title
        },
        ip_address=request.client.host if request.client else None
    )

    return {"message": "Notification sent successfully", "notification_id": str(notification.id)}


@router.get("/admin/reports/hackathon/{hackathon_id}/participation")
async def get_hackathon_participation_report(
    hackathon_id: str,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Get participation report for a hackathon (admin only)
    """
    report = ReportingService.get_hackathon_participation_report(db, hackathon_id)
    return report


@router.get("/admin/reports/hackathon/{hackathon_id}/evaluations")
async def get_hackathon_evaluation_report(
    hackathon_id: str,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Get evaluation report for a hackathon (admin only)
    """
    report = ReportingService.get_hackathon_evaluation_report(db, hackathon_id)
    return report


@router.get("/admin/reports/platform-usage")
async def get_platform_usage_report(
    days: int = 30,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Get platform usage report for the last N days (admin only)
    """
    report = ReportingService.get_platform_usage_report(db, days)
    return report


@router.get("/admin/reports/audit-trail")
async def get_audit_trail_report(
    days: int = 7,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Get audit trail report for the last N days (admin only)
    """
    report = ReportingService.get_audit_trail_report(db, days)
    return report


@router.get("/admin/reports/system-health")
async def get_system_health_report(
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Get system health report (admin only)
    """
    report = ReportingService.get_system_health_report(db)
    return report


@router.get("/admin/security-events")
async def get_security_events(
    days: int = 7,
    limit: int = 100,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Get security-related events (admin only)
    """
    from ..services.audit_service import AuditService
    security_events = AuditService.get_security_events(db, days)
    return security_events


@router.get("/admin/user-audit-log/{user_id}")
async def get_user_audit_log(
    user_id: str,
    days: int = 30,
    limit: int = 100,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Get audit log for a specific user (admin only)
    """
    from ..services.audit_service import AuditService
    user_audit_logs = AuditService.get_user_audit_logs(db, user_id, days)
    return user_audit_logs


@router.post("/admin/security-alert")
async def trigger_security_alert(
    alert_type: str,
    message: str,
    severity: str = "high",
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Manually trigger a security alert (admin only)
    """
    from ..services.audit_service import AuditService

    AuditService.log_security_event(
        db=db,
        user_id=str(current_user.id),
        event_type=alert_type,
        description=message,
        severity=severity
    )

    return {"message": f"Security alert '{alert_type}' logged successfully"}


@router.get("/admin/security-dashboard")
async def get_security_dashboard(
    days: int = 7,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Get security dashboard overview (admin only)
    """
    from ..services.audit_service import AuditService
    from sqlalchemy import func

    # Get security events count
    security_events = AuditService.get_security_events(db, days)
    security_events_count = len(security_events)

    # Get failed login attempts
    failed_logins = db.query(AuditLog).filter(
        AuditLog.action == 'user_login_failed',
        AuditLog.timestamp >= datetime.utcnow() - timedelta(days=days)
    ).count()

    # Get suspicious activities (multiple failed logins from same IP)
    from ..models.audit_log import AuditLog
    from datetime import datetime, timedelta

    suspicious_activities = db.query(
        AuditLog.ip_address,
        func.count(AuditLog.id).label('failed_attempts')
    ).filter(
        AuditLog.action == 'user_login_failed',
        AuditLog.timestamp >= datetime.utcnow() - timedelta(days=days)
    ).group_by(AuditLog.ip_address).having(func.count(AuditLog.id) > 5).all()

    # Get admin actions
    admin_actions = db.query(AuditLog).filter(
        AuditLog.action.like('%admin%'),
        AuditLog.timestamp >= datetime.utcnow() - timedelta(days=days)
    ).count()

    return {
        "period_days": days,
        "security_summary": {
            "total_security_events": security_events_count,
            "failed_login_attempts": failed_logins,
            "admin_actions_performed": admin_actions
        },
        "suspicious_activities": [
            {
                "ip_address": ip,
                "failed_attempts": count
            } for ip, count in suspicious_activities
        ],
        "recent_security_events": [
            {
                "id": str(event.id),
                "action": event.action,
                "user_id": str(event.user_id) if event.user_id else "SYSTEM",
                "ip_address": event.ip_address,
                "timestamp": event.timestamp.isoformat(),
                "metadata": event.metadata
            } for event in security_events[:10]  # Last 10 events
        ]
    }