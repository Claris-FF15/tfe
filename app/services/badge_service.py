from fastapi import HTTPException
from sqlalchemy.orm import Session
from repositories.badge_repository import BadgeRepository
from repositories.access_log_repository import AccessLogRepository
from schemas.badge import BadgeCreate, BadgeUpdate 
from models.badge import Badge

class BadgeService:
    @staticmethod
    def create_badge(db: Session, data: BadgeCreate) -> Badge:
        if data.user_id is not None:
            existing = BadgeRepository.find_by_user_id(db, data.user_id)
            if existing:
                raise HTTPException(409, "Cet utilisateur a déjà un badge assigné")

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