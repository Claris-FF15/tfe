from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models.access_log import AccessLog
from models.security_alert import SecurityAlert
from models.badge import Badge
from models.door import Door
from repositories.user_repository import UserRepository
from repositories.access_permission_repository import AccessPermissionRepository
from repositories.security_alert_repository import SecurityAlertRepository
from services.user_service import UserService


class AccessLogService:

    DENIED_THRESHOLD = 3
    TIME_WINDOW_MINUTES = 10

    @staticmethod
    def process_access_attempt(db: Session, badge_uid: str, door_id: int) -> AccessLog:
        badge = db.query(Badge).filter(Badge.uid == badge_uid).first()
        door = db.query(Door).filter(Door.id == door_id).first()

        allowed = False
        reason = None
        user_id = None

        if not door:
            reason = "Porte inconnue"
        elif not badge:
            reason = "Badge inconnu"
        else:
            user_id = badge.user_id

            if not badge.active:
                reason = "Badge inactif"
            elif badge.user_id is None:
                reason = "Badge non assigné"
            else:
                has_permission = AccessPermissionRepository.find_by_user_and_door(
                    db, badge.user_id, door_id
                )
                if has_permission:
                    allowed = True
                else:
                    reason = "Accès non autorisé pour cette porte"

        log = AccessLog(
            badge_id=badge.id if badge else None,
            user_id=user_id,
            door_id=door_id if door else None,
            timestamp=datetime.utcnow(),
            allowed=allowed,
            reason=reason,
        )
        db.add(log)
        db.commit()
        db.refresh(log)

        if not allowed and user_id is not None:
            AccessLogService.check_and_auto_disable(db, user_id)

        return log

    @staticmethod
    def check_and_auto_disable(db: Session, user_id: int | None):
        if user_id is None:
            return

        cutoff = datetime.utcnow() - timedelta(minutes=AccessLogService.TIME_WINDOW_MINUTES)

        recent_denied_count = (
            db.query(AccessLog)
            .filter(
                AccessLog.user_id == user_id,
                AccessLog.allowed == False,
                AccessLog.timestamp >= cutoff,
            )
            .count()
        )

        if recent_denied_count >= AccessLogService.DENIED_THRESHOLD:
            user = UserRepository.find_by_id(db, user_id)
            if user and user.active:
                UserService.force_deactivate(db, user_id)

                alert = SecurityAlert(
                    user_id=user_id,
                    message=(
                        f"{user.first_name} {user.last_name} a été désactivé automatiquement "
                        f"après {AccessLogService.DENIED_THRESHOLD} accès refusés en moins de "
                        f"{AccessLogService.TIME_WINDOW_MINUTES} minutes."
                    )
                )
                SecurityAlertRepository.save(db, alert)