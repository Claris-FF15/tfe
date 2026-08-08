from sqlalchemy.orm import Session
from models.zone import Zone


class ZoneRepository:

    @staticmethod
    def find_all(db: Session) -> list[Zone]:
        return db.query(Zone).all()

    @staticmethod
    def find_by_id(db: Session, zone_id: int) -> Zone | None:
        return db.query(Zone).filter(Zone.id == zone_id).first()