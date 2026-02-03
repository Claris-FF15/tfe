from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.user import User
from repositories.badge_repository import BadgeRepository
from schemas.Badge import *

class BadgeService:

    @staticmethod
    def create_badge(db: Session, data: BadgeCreate) -> Badge:
        badge = Badge(**data.dict())
        return BadgeRepository.save(db, badge)

    @staticmethod
    def delete_badge(db: Session, badge_id: int):
        badge = BadgeRepository.find_by_id(db, badge_id)
        if not badge:
            raise HTTPException(404, "Badge non trouvé")

        BadgeRepository.delete(db, badge)

    #add update later 

    