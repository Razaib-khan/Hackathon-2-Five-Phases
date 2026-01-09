from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict

from ..services.database_optimization_service import DatabaseOptimizationService
from ..config.database import get_db
from ..config.auth import get_current_user
from ..models.user import User


router = APIRouter()


@router.get("/admin/db-performance-insights")
async def get_database_performance_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get database performance insights (admin only)
    """
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view database performance insights"
        )

    return DatabaseOptimizationService.get_performance_insights(db)


@router.get("/admin/db-index-suggestions")
async def get_index_suggestions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get database index suggestions (admin only)
    """
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view index suggestions"
        )

    return DatabaseOptimizationService.suggest_indexes(db)


@router.post("/admin/apply-index-suggestions")
async def apply_index_suggestions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Apply suggested indexes to the database (admin only)
    """
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can apply index suggestions"
        )

    return DatabaseOptimizationService.apply_suggested_indexes(db)


@router.get("/admin/query-optimization-tips")
async def get_query_optimization_tips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get query optimization tips (admin only)
    """
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view query optimization tips"
        )

    return {"tips": DatabaseOptimizationService.get_query_optimization_tips(db)}


@router.post("/admin/run-vacuum-analyze")
async def run_vacuum_analyze(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Run vacuum and analyze operations (admin only)
    """
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can run vacuum operations"
        )

    result = DatabaseOptimizationService.run_vacuum_analyze(db)
    return {"message": result}