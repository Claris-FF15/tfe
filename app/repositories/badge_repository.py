from sqlalchemy.orm import Session
from models.badge import Badge

class BadgeRepository:
    @staticmethod
    def find_by_id(db: Session, badge_id: int) -> Badge | None:
        return db.query(Badge).filter(Badge.id == badge_id).first()

    @staticmethod
    def find_by_user_id(db: Session, user_id: int) -> Badge | None:
        return db.query(Badge).filter(Badge.user_id == user_id).first()

    @staticmethod
    def find_all(db: Session) -> list[Badge]:
        return db.query(Badge).all()

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