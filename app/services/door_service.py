from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.door import Door
from schemas.door import DoorCreate, DoorUpdate
from repositories.door_repository import DoorRepository


class DoorService:

    @staticmethod
    def get_all(db: Session) -> list[Door]:
        return DoorRepository.find_all(db)

    @staticmethod
    def create_door(db: Session, data: DoorCreate) -> Door:
        door = Door(
            name=data.name,
            location=data.location,
            active=data.active,
            zone_id=data.zone_id
        )
        return DoorRepository.save(db, door)

    @staticmethod
    def update_door(db: Session, door_id: int, data: DoorUpdate) -> Door:
        door = DoorRepository.find_by_id(db, door_id)
        if not door:
            raise HTTPException(404, "Porte non trouvée")

        if data.name is not None:
            door.name = data.name
        if data.location is not None:
            door.location = data.location
        if data.active is not None:
            door.active = data.active
        if data.zone_id is not None:
            door.zone_id = data.zone_id

        return DoorRepository.save(db, door)

    @staticmethod
    def delete_door(db: Session, door_id: int):
        door = DoorRepository.find_by_id(db, door_id)
        if not door:
            raise HTTPException(404, "Porte non trouvée")
        DoorRepository.delete(db, door)