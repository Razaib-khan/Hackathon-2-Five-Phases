from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..services.backup_service import BackupService
from ..config.database import get_db
from ..config.auth import get_current_user
from ..models.user import User


router = APIRouter()


@router.post("/admin/backups/create")
async def create_backup(
    backup_type: str = "full",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a database backup (admin only)
    """
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create backups"
        )

    backup_path = BackupService.create_backup(db, backup_type)
    return {
        "message": "Backup created successfully",
        "backup_path": backup_path
    }


@router.get("/admin/backups/history", response_model=List[dict])
async def get_backup_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get backup history (admin only)
    """
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view backup history"
        )

    return BackupService.get_backup_history()


@router.get("/admin/retention-policy")
async def get_retention_policy(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get data retention policy (admin only)
    """
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view retention policy"
        )

    return BackupService.get_retention_policy()


@router.post("/admin/data-cleanup")
async def cleanup_old_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Clean up old data based on retention policy (admin only)
    """
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can perform data cleanup"
        )

    BackupService.cleanup_old_data(db)
    return {"message": "Data cleanup completed successfully"}


@router.get("/admin/backup-schedule")
async def get_backup_schedule(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get backup schedule information (admin only)
    """
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view backup schedule"
        )

    return BackupService.schedule_regular_backups()


@router.get("/admin/backup-status")
async def get_backup_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get backup status information (admin only)
    """
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view backup status"
        )

    history = BackupService.get_backup_history()
    policy = BackupService.get_retention_policy()
    schedule = BackupService.schedule_regular_backups()

    return {
        "backup_count": len(history),
        "latest_backup": history[0]["created_at"] if history else None,
        "retention_policy": policy,
        "backup_schedule": schedule
    }