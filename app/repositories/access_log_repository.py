from sqlalchemy.orm import Session
from models.access_log import AccessLog


class AccessLogRepository:

    @staticmethod
    def find_by_id(db: Session, log_id: int):
        return db.query(AccessLog).filter(AccessLog.id == log_id).first()

    @staticmethod
    def find_by_badge_id(db: Session, badge_id: int, limit: int = 20) -> list[AccessLog]:
        return (
            db.query(AccessLog)
            .filter(AccessLog.badge_id == badge_id)
            .order_by(AccessLog.timestamp.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def find_by_door_id(db: Session, door_id: int, limit: int = 50, allowed: bool | None = None) -> list[AccessLog]:
        query = db.query(AccessLog).filter(AccessLog.door_id == door_id)
        if allowed is not None:
            query = query.filter(AccessLog.allowed == allowed)
        return query.order_by(AccessLog.timestamp.desc()).limit(limit).all()

    @staticmethod
    def find_all(db: Session, limit: int = 100, allowed: bool | None = None) -> list[AccessLog]:
        query = db.query(AccessLog)
        if allowed is not None:
            query = query.filter(AccessLog.allowed == allowed)
        return query.order_by(AccessLog.timestamp.desc()).limit(limit).all()