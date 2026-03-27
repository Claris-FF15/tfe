from sqlalchemy.orm import Session
from models.badge import Badge

class BadgeRepository:
    @staticmethod
    def find_by_id(db: Session, badge_id: int) -> Badge | None:
        return db.query(Badge).filter(Badge.id == badge_id).first()

    @staticmethod
    def save(db: Session, badge: Badge) -> Badge:
        db.add(badge)
        db.commit()
        db.refresh(badge)
        return badge
    
    @staticmethod
    def update(db: Session, badge: Badge, active: bool) -> Badge:
        badge.active = active
        db.commit()
        db.refresh(badge)
        return badge

    @staticmethod
    def delete(db: Session, badge: Badge):
        db.delete(badge)  
        db.commit()