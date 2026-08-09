from fastapi import HTTPException
from sqlalchemy.orm import Session
from repositories.badge_repository import BadgeRepository
from repositories.access_log_repository import AccessLogRepository
from repositories.user_repository import UserRepository
from schemas.badge import BadgeCreate, BadgeUpdate 
from models.badge import Badge

class BadgeService:
    @staticmethod
    def create_badge(db: Session, data: BadgeCreate) -> Badge:
        badge = Badge(**data.dict())
        return BadgeRepository.save(db, badge)
    
    @staticmethod
    def get_badge_by_user(db: Session, user_id: int) -> Badge:
        badge = BadgeRepository.find_by_user_id(db, user_id)
        if not badge:
            raise HTTPException(404, "Aucun badge assigné à cet utilisateur")
        return badge
    
    @staticmethod
    def update_badge(db: Session, badge_id: int, data: BadgeUpdate) -> Badge:
        badge = BadgeRepository.find_by_id(db, badge_id)
        if not badge:
            raise HTTPException(404, "Badge non trouvé")

        fields_set = data.model_fields_set
        user_id_provided = "user_id" in fields_set

        if user_id_provided and data.user_id is not None:
            existing = BadgeRepository.find_by_user_id(db, data.user_id)
            if existing and existing.id != badge.id:
                raise HTTPException(409, "Cet utilisateur a déjà un badge assigné")

        target_user_id = data.user_id if user_id_provided else badge.user_id

        if data.active is True and target_user_id is not None:
            user = UserRepository.find_by_id(db, target_user_id)
            if user and not user.active:
                raise HTTPException(
                    403,
                    "Impossible d'activer ce badge : l'utilisateur associé est désactivé"
                )

        return BadgeRepository.update_fields(
            db, badge,
            active=data.active,
            user_id=data.user_id,
            user_id_provided=user_id_provided
        )

    @staticmethod
    def delete_badge(db: Session, badge_id: int):
        badge = BadgeRepository.find_by_id(db, badge_id)
        if not badge:
            raise HTTPException(404, "Badge non trouvé")
        BadgeRepository.delete(db, badge)

    @staticmethod
    def deactivate_badge_for_user(db: Session, user_id: int):
        badge = BadgeRepository.find_by_user_id(db, user_id)
        if badge and badge.active:
            BadgeRepository.update_fields(db, badge, active=False, user_id=None, user_id_provided=False)

    @staticmethod
    def reactivate_badge_for_user(db: Session, user_id: int):
        badge = BadgeRepository.find_by_user_id(db, user_id)
        if badge and not badge.active:
            BadgeRepository.update_fields(db, badge, active=True, user_id=None, user_id_provided=False)

    @staticmethod
    def list_badges_with_activity(db: Session) -> list[dict]:
        badges = BadgeRepository.find_all(db)
        result = []
        for badge in badges:
            logs = AccessLogRepository.find_by_badge_id(db, badge.id, limit=1)
            result.append({
                "id": badge.id,
                "uid": badge.uid,
                "user_id": badge.user_id,
                "active": badge.active,
                "last_activity": logs[0].timestamp if logs else None
            })
        return result