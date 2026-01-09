from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from collections import defaultdict

from ..models.user import User
from ..models.hackathon import Hackathon, HackathonParticipant
from ..models.team import Team
from ..models.submission import Submission, Evaluation, SubmissionFile
from ..models.audit_log import AuditLog


class ReportingService:
    @staticmethod
    def get_hackathon_participation_report(db: Session, hackathon_id: str) -> Dict:
        """Generate a participation report for a hackathon"""
        # Get hackathon details
        hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
        if not hackathon:
            return {"error": "Hackathon not found"}

        # Get participant count
        participant_count = db.query(HackathonParticipant).filter(
            HackathonParticipant.hackathon_id == hackathon_id
        ).count()

        # Get team count
        team_count = db.query(Team).filter(
            Team.hackathon_id == hackathon_id
        ).count()

        # Get submission count
        submission_count = db.query(Submission).filter(
            Submission.hackathon_id == hackathon_id
        ).count()

        # Get confirmed vs unconfirmed participants
        confirmed_participants = db.query(HackathonParticipant).filter(
            HackathonParticipant.hackathon_id == hackathon_id,
            HackathonParticipant.is_confirmed == True
        ).count()

        # Get participant roles distribution
        role_counts = db.query(
            HackathonParticipant.role,
            db.func.count(HackathonParticipant.id)
        ).filter(
            HackathonParticipant.hackathon_id == hackathon_id
        ).group_by(HackathonParticipant.role).all()

        role_distribution = {role: count for role, count in role_counts}

        return {
            "hackathon": {
                "id": str(hackathon.id),
                "name": hackathon.name,
                "start_date": hackathon.start_date,
                "end_date": hackathon.end_date,
                "status": hackathon.status.value
            },
            "participation": {
                "total_participants": participant_count,
                "confirmed_participants": confirmed_participants,
                "unconfirmed_participants": participant_count - confirmed_participants,
                "total_teams": team_count,
                "total_submissions": submission_count,
                "role_distribution": role_distribution
            }
        }

    @staticmethod
    def get_hackathon_evaluation_report(db: Session, hackathon_id: str) -> Dict:
        """Generate an evaluation report for a hackathon"""
        # Get submissions for the hackathon
        submissions = db.query(Submission).filter(
            Submission.hackathon_id == hackathon_id
        ).all()

        submission_scores = []
        category_scores = defaultdict(list)

        for submission in submissions:
            evaluations = db.query(Evaluation).filter(
                Evaluation.submission_id == submission.id,
                Evaluation.is_valid == True
            ).all()

            if evaluations:
                submission_avg = sum(e.score for e in evaluations) / len(evaluations)
                submission_scores.append({
                    "submission_id": str(submission.id),
                    "team_name": submission.team.name,
                    "title": submission.title,
                    "average_score": float(submission_avg),
                    "evaluation_count": len(evaluations)
                })

                # Group scores by category
                for evaluation in evaluations:
                    category_scores[evaluation.category].append(float(evaluation.score))

        # Calculate category averages
        category_averages = {
            category: sum(scores) / len(scores) if scores else 0
            for category, scores in category_scores.items()
        }

        # Calculate overall hackathon stats
        overall_average = sum(s['average_score'] for s in submission_scores) / len(submission_scores) if submission_scores else 0

        return {
            "hackathon_id": hackathon_id,
            "total_submissions": len(submission_scores),
            "submissions": submission_scores,
            "category_averages": category_averages,
            "overall_average": overall_average
        }

    @staticmethod
    def get_platform_usage_report(db: Session, days: int = 30) -> Dict:
        """Generate a platform usage report for the last N days"""
        start_date = datetime.utcnow() - timedelta(days=days)

        # Get daily user activity
        daily_users = db.query(
            db.func.date(User.created_at).label('date'),
            db.func.count(User.id).label('new_users')
        ).filter(
            User.created_at >= start_date
        ).group_by(db.func.date(User.created_at)).all()

        # Get daily hackathon activity
        daily_hackathons = db.query(
            db.func.date(Hackathon.created_at).label('date'),
            db.func.count(Hackathon.id).label('new_hackathons')
        ).filter(
            Hackathon.created_at >= start_date
        ).group_by(db.func.date(Hackathon.created_at)).all()

        # Get daily team creation
        daily_teams = db.query(
            db.func.date(Team.created_at).label('date'),
            db.func.count(Team.id).label('new_teams')
        ).filter(
            Team.created_at >= start_date
        ).group_by(db.func.date(Team.created_at)).all()

        # Get daily submissions
        daily_submissions = db.query(
            db.func.date(Submission.submitted_at).label('date'),
            db.func.count(Submission.id).label('new_submissions')
        ).filter(
            Submission.submitted_at >= start_date
        ).group_by(db.func.date(Submission.submitted_at)).all()

        # Convert to dictionaries for easier consumption
        def to_dict_list(query_result):
            return [{"date": str(row.date), "count": row[1]} for row in query_result]

        return {
            "period_days": days,
            "start_date": start_date.isoformat(),
            "end_date": datetime.utcnow().isoformat(),
            "daily_metrics": {
                "new_users": to_dict_list(daily_users),
                "new_hackathons": to_dict_list(daily_hackathons),
                "new_teams": to_dict_list(daily_teams),
                "new_submissions": to_dict_list(daily_submissions)
            },
            "totals": {
                "total_users": db.query(User).count(),
                "total_hackathons": db.query(Hackathon).count(),
                "total_teams": db.query(Team).count(),
                "total_submissions": db.query(Submission).count()
            }
        }

    @staticmethod
    def get_audit_trail_report(db: Session, days: int = 7) -> List[Dict]:
        """Generate an audit trail report for the last N days"""
        start_date = datetime.utcnow() - timedelta(days=days)

        audit_logs = db.query(AuditLog).filter(
            AuditLog.timestamp >= start_date
        ).order_by(AuditLog.timestamp.desc()).limit(100).all()  # Limit to last 100 events

        return [{
            "id": str(log.id),
            "user_id": str(log.user_id) if log.user_id else "SYSTEM",
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "ip_address": log.ip_address,
            "timestamp": log.timestamp.isoformat(),
            "metadata": log.metadata
        } for log in audit_logs]

    @staticmethod
    def get_system_health_report(db: Session) -> Dict:
        """Generate a system health report"""
        # Count of active users
        active_users = db.query(User).filter(User.is_active == True).count()

        # Count of active hackathons
        active_hackathons = db.query(Hackathon).filter(
            Hackathon.is_active == True,
            Hackathon.start_date <= datetime.utcnow(),
            Hackathon.end_date >= datetime.utcnow()
        ).count()

        # Count of upcoming hackathons
        upcoming_hackathons = db.query(Hackathon).filter(
            Hackathon.is_active == True,
            Hackathon.start_date > datetime.utcnow()
        ).count()

        # Count of completed hackathons
        completed_hackathons = db.query(Hackathon).filter(
            Hackathon.is_active == True,
            Hackathon.end_date < datetime.utcnow()
        ).count()

        # Storage usage (approximate based on submissions and files)
        total_submissions = db.query(Submission).count()
        total_files = db.query(SubmissionFile).count() if hasattr(ReportingService, 'SubmissionFile') else 0

        # Recent activity (last 24 hours)
        yesterday = datetime.utcnow() - timedelta(days=1)
        recent_user_registrations = db.query(User).filter(
            User.created_at >= yesterday
        ).count()

        recent_hackathon_creations = db.query(Hackathon).filter(
            Hackathon.created_at >= yesterday
        ).count()

        recent_submissions = db.query(Submission).filter(
            Submission.submitted_at >= yesterday
        ).count()

        return {
            "timestamp": datetime.utcnow().isoformat(),
            "health_indicators": {
                "active_users": active_users,
                "active_hackathons": active_hackathons,
                "upcoming_hackathons": upcoming_hackathons,
                "completed_hackathons": completed_hackathons
            },
            "recent_activity": {
                "last_24_hours": {
                    "new_users": recent_user_registrations,
                    "new_hackathons": recent_hackathon_creations,
                    "new_submissions": recent_submissions
                }
            },
            "data_volume": {
                "total_users": db.query(User).count(),
                "total_hackathons": db.query(Hackathon).count(),
                "total_teams": db.query(Team).count(),
                "total_submissions": total_submissions,
                "total_files": total_files
            }
        }