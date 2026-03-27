from fastapi import HTTPException
from sqlalchemy.orm import Session
from repositories.door_repository import DoorRepository
from schemas.door import DoorCreate, DoorUpdate
from models.door import Door

class DoorService:
    @staticmethod
    def get_all(db: Session) -> list[Door]:
        return DoorRepository.find_all(db)

    @staticmethod
    def create_door(db: Session, data: DoorCreate) -> Door:
        door = Door(**data.dict())
        return DoorRepository.save(db, door)

    @staticmethod
    def update_door(db: Session, door_id: int, data: DoorUpdate) -> Door:
        door = DoorRepository.find_by_id(db, door_id)
        if not door:
            raise HTTPException(404, "Porte non trouvée")
        return DoorRepository.update(db, door, data)

    @staticmethod
    def delete_door(db: Session, door_id: int):
        door = DoorRepository.find_by_id(db, door_id)
        if not door:
            raise HTTPException(404, "Porte non trouvée")
        DoorRepository.delete(db, door)