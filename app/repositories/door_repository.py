from sqlalchemy.orm import Session
from models.door import Door
from schemas.door import DoorUpdate

class DoorRepository:
    @staticmethod
    def find_by_id(db: Session, door_id: int) -> Door | None:
        return db.query(Door).filter(Door.id == door_id).first()

    @staticmethod
    def find_all(db: Session) -> list[Door]:
        return db.query(Door).all()

    @staticmethod
    def save(db: Session, door: Door) -> Door:
        db.add(door)
        db.commit()
        db.refresh(door)
        return door

    @staticmethod
    def update(db: Session, door: Door, data: DoorUpdate) -> Door:
        if data.name is not None:
            door.name = data.name
        if data.location is not None:
            door.location = data.location
        if data.active is not None:
            door.active = data.active
        db.commit()
        db.refresh(door)
        return door

    @staticmethod
    def delete(db: Session, door: Door):
        db.delete(door)
        db.commit()