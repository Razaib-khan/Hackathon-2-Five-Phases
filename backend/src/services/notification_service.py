from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from datetime import datetime

from ..models.notification import Notification, NotificationType, NotificationStatus, UserNotificationPreferences
from ..schemas.notification import NotificationCreate, NotificationUpdate, UserNotificationPreferencesCreate, UserNotificationPreferencesUpdate
from ..services.email_service import EmailService


class NotificationService:
    @staticmethod
    def create_notification(db: Session, notification_data: NotificationCreate) -> Notification:
        """Create a new notification"""
        db_notification = Notification(
            user_id=notification_data.user_id,
            title=notification_data.title,
            message=notification_data.message,
            notification_type=notification_data.notification_type,
            related_entity_type=notification_data.related_entity_type,
            related_entity_id=notification_data.related_entity_id
        )

        db.add(db_notification)
        try:
            db.commit()
            db.refresh(db_notification)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error creating notification"
            )

        # Check if user wants email notifications for this type
        user_prefs = db.query(UserNotificationPreferences).filter(
            UserNotificationPreferences.user_id == notification_data.user_id
        ).first()

        if user_prefs and user_prefs.email_notifications:
            # Determine if this notification type should send email
            should_send_email = False
            if notification_data.notification_type == NotificationType.PHASE_CHANGE and user_prefs.phase_change_notifications:
                should_send_email = True
            elif notification_data.notification_type == NotificationType.DEADLINE_REMINDER and user_prefs.deadline_reminders:
                should_send_email = True
            elif notification_data.notification_type == NotificationType.ANNOUNCEMENT and user_prefs.announcements:
                should_send_email = True

            if should_send_email:
                # Get user email (simplified - in real app you'd fetch user details)
                from ..models.user import User
                user = db.query(User).filter(User.id == notification_data.user_id).first()
                if user:
                    try:
                        EmailService.send_email(
                            to_email=user.email,
                            subject=notification_data.title,
                            body=notification_data.message
                        )
                    except Exception:
                        # Log error but don't fail the notification creation
                        print(f"Failed to send email notification to {user.email}")

        return db_notification

    @staticmethod
    def get_notification_by_id(db: Session, notification_id: str) -> Optional[Notification]:
        """Get a notification by its ID"""
        return db.query(Notification).filter(Notification.id == notification_id).first()

    @staticmethod
    def get_user_notifications(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[Notification]:
        """Get all notifications for a user"""
        return db.query(Notification).filter(
            Notification.user_id == user_id
        ).order_by(Notification.sent_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_unread_notifications(db: Session, user_id: str) -> List[Notification]:
        """Get all unread notifications for a user"""
        return db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).order_by(Notification.sent_at.desc()).all()

    @staticmethod
    def update_notification(db: Session, notification_id: str, notification_data: NotificationUpdate) -> Optional[Notification]:
        """Update a notification"""
        db_notification = db.query(Notification).filter(Notification.id == notification_id).first()

        if not db_notification:
            return None

        # Update fields that are provided
        for field, value in notification_data.model_dump(exclude_unset=True).items():
            setattr(db_notification, field, value)

        # If marking as read, set read_at timestamp
        if notification_data.is_read or notification_data.status == NotificationStatus.READ:
            db_notification.is_read = True
            if not db_notification.read_at:
                db_notification.read_at = datetime.utcnow()

        db.commit()
        db.refresh(db_notification)

        return db_notification

    @staticmethod
    def mark_notification_as_read(db: Session, notification_id: str) -> Optional[Notification]:
        """Mark a notification as read"""
        db_notification = db.query(Notification).filter(Notification.id == notification_id).first()

        if not db_notification:
            return None

        db_notification.is_read = True
        db_notification.status = NotificationStatus.READ
        db_notification.read_at = datetime.utcnow()

        db.commit()
        db.refresh(db_notification)

        return db_notification

    @staticmethod
    def delete_notification(db: Session, notification_id: str) -> bool:
        """Delete a notification"""
        db_notification = db.query(Notification).filter(Notification.id == notification_id).first()

        if not db_notification:
            return False

        db.delete(db_notification)
        db.commit()

        return True

    @staticmethod
    def create_phase_change_notification(db: Session, user_id: str, hackathon_name: str, old_phase: str, new_phase: str) -> Notification:
        """Create a phase change notification"""
        title = f"Phase Change in {hackathon_name}"
        message = f"The hackathon has moved from the {old_phase} phase to the {new_phase} phase. Please check the new requirements and deadlines."

        notification_data = NotificationCreate(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=NotificationType.PHASE_CHANGE,
            related_entity_type="hackathon_phase"
        )

        return NotificationService.create_notification(db, notification_data)

    @staticmethod
    def get_user_notification_preferences(db: Session, user_id: str) -> Optional[UserNotificationPreferences]:
        """Get user's notification preferences"""
        return db.query(UserNotificationPreferences).filter(
            UserNotificationPreferences.user_id == user_id
        ).first()

    @staticmethod
    def create_user_notification_preferences(db: Session, preferences_data: UserNotificationPreferencesCreate) -> UserNotificationPreferences:
        """Create user's notification preferences"""
        db_preferences = UserNotificationPreferences(
            user_id=preferences_data.user_id,
            email_notifications=preferences_data.email_notifications,
            push_notifications=preferences_data.push_notifications,
            phase_change_notifications=preferences_data.phase_change_notifications,
            deadline_reminders=preferences_data.deadline_reminders,
            announcements=preferences_data.announcements
        )

        db.add(db_preferences)
        try:
            db.commit()
            db.refresh(db_preferences)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error creating notification preferences"
            )

        return db_preferences

    @staticmethod
    def update_user_notification_preferences(db: Session, user_id: str, preferences_data: UserNotificationPreferencesUpdate) -> Optional[UserNotificationPreferences]:
        """Update user's notification preferences"""
        db_preferences = db.query(UserNotificationPreferences).filter(
            UserNotificationPreferences.user_id == user_id
        ).first()

        if not db_preferences:
            # Create preferences if they don't exist
            create_data = UserNotificationPreferencesCreate(
                user_id=user_id,
                **preferences_data.model_dump(exclude_unset=True)
            )
            return NotificationService.create_user_notification_preferences(db, create_data)

        # Update fields that are provided
        for field, value in preferences_data.model_dump(exclude_unset=True).items():
            setattr(db_preferences, field, value)

        db.commit()
        db.refresh(db_preferences)

        return db_preferences