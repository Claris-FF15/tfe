from fastapi import HTTPException
from sqlalchemy.orm import Session
from repositories.badge_repository import BadgeRepository
from schemas.badge import BadgeCreate, BadgeUpdate 
from models.badge import Badge

class BadgeService:
    @staticmethod
    def create_badge(db: Session, data: BadgeCreate) -> Badge:
        badge = Badge(**data.dict())
        return BadgeRepository.save(db, badge)
    
    @staticmethod
    def update_badge(db: Session, badge_id: int, data: BadgeUpdate) -> Badge:
        badge = BadgeRepository.find_by_id(db, badge_id)
        if not badge:
            raise HTTPException(404, "Badge non trouvé")
        return BadgeRepository.update(db, badge, data.active)

    @staticmethod
    def delete_badge(db: Session, badge_id: int):
        badge = BadgeRepository.find_by_id(db, badge_id)
        if not badge:
            raise HTTPException(404, "Badge non trouvé")
        BadgeRepository.delete(db, badge)