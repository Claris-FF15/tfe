from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from db.database import get_db
from services.door_service import DoorService
from schemas.door import DoorCreate, DoorUpdate, DoorResponse

router = APIRouter(prefix="/doors", tags=["Doors"])

@router.get("", response_model=list[DoorResponse])
def get_all_doors(db: Session = Depends(get_db)):
    return DoorService.get_all(db)

@router.post("", response_model=DoorResponse)
def create_door(data: DoorCreate, db: Session = Depends(get_db)):
    return DoorService.create_door(db, data)

@router.put("/{door_id}", response_model=DoorResponse)
def update_door(door_id: int, data: DoorUpdate, db: Session = Depends(get_db)):
    return DoorService.update_door(db, door_id, data)

@router.delete("/{door_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_door(door_id: int, db: Session = Depends(get_db)):
    return DoorService.delete_door(db, door_id)