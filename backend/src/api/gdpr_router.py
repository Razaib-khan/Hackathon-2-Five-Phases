from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..schemas.user import GDPRDataExportResponse
from ..services.gdpr_service import GDPRService
from ..config.database import get_db
from ..config.auth import get_current_user
from ..models.user import User


router = APIRouter()


@router.get("/gdpr/data-export", response_model=dict)
async def export_personal_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export all personal data for the current user (GDPR Article 20 - Data Portability)
    """
    return GDPRService.request_data_export(db, str(current_user.id))


@router.post("/gdpr/request-deletion")
async def request_account_deletion(
    reason: str = "",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Request account deletion (GDPR Article 17 - Right to be Forgotten)
    """
    success = GDPRService.request_account_deletion(db, str(current_user.id), reason)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {"message": "Account deletion request processed successfully"}


@router.post("/gdpr/withdraw-consent")
async def withdraw_gdpr_consent(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Withdraw GDPR consent (GDPR Article 7 - Consent Withdrawal)
    """
    success = GDPRService.withdraw_consent(db, str(current_user.id))
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {"message": "Consent withdrawn successfully"}


@router.get("/gdpr/requests", response_model=List[dict])
async def get_gdpr_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get GDPR-related requests history for the current user
    """
    return GDPRService.get_gdpr_requests(db, str(current_user.id))


@router.get("/gdpr/retention-info")
async def get_data_retention_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get information about data retention periods (GDPR Article 5 - Storage Limitation)
    """
    return GDPRService.get_data_retention_info(db)


@router.get("/gdpr/rights-info")
async def get_gdpr_rights_info():
    """
    Get information about GDPR rights
    """
    return {
        "rights": [
            {
                "right": "Right of access",
                "description": "You have the right to obtain confirmation as to whether or not personal data concerning you are being processed"
            },
            {
                "right": "Right to rectification",
                "description": "You have the right to obtain without undue delay the rectification of inaccurate personal data"
            },
            {
                "right": "Right to erasure ('right to be forgotten')",
                "description": "You have the right to obtain the erasure of personal data concerning you"
            },
            {
                "right": "Right to restrict processing",
                "description": "You have the right to obtain restriction of processing under certain circumstances"
            },
            {
                "right": "Right to data portability",
                "description": "You have the right to receive personal data concerning you in a structured, commonly used and machine-readable format"
            },
            {
                "right": "Right to object",
                "description": "You have the right to object to processing based on legitimate interests or direct marketing"
            }
        ],
        "contact": {
            "data_protection_officer": "dpo@hackathon-platform.com",
            "privacy_policy_url": "/api/v1/gdpr/privacy-policy"
        }
    }


@router.get("/gdpr/privacy-policy")
async def get_privacy_policy():
    """
    Get the privacy policy
    """
    return {
        "title": "Privacy Policy",
        "effective_date": "2024-01-01",
        "last_updated": "2024-01-01",
        "data_controller": "Five Phase Hackathon Platform",
        "data_controller_contact": "privacy@hackathon-platform.com",
        "purposes_of_processing": [
            "Providing hackathon platform services",
            "User authentication and account management",
            "Communication and notifications",
            "Platform improvement and analytics",
            "Legal compliance and fraud prevention"
        ],
        "legal_basis": [
            "Contract performance (Terms of Service)",
            "Legitimate interests (platform operations)",
            "Consent (where required)",
            "Legal obligation (regulatory compliance)"
        ],
        "data_recipients": [
            "Cloud service providers for hosting",
            "Payment processors (if applicable)",
            "Professional advisors (legal, accounting)"
        ],
        "data_retention_periods": {
            "user_account_data": "Until account deletion request",
            "audit_logs": "7 years for legal compliance",
            "analytics_data": "2 years",
            "communications": "1 year after account closure"
        },
        "individual_rights": [
            "Right of access, rectification, erasure, restriction, portability, and objection",
            "Right to lodge a complaint with a supervisory authority"
        ],
        "automated_decision_making": "We do not use automated decision-making or profiling"
    }