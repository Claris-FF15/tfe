from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from db.database import get_db
from services.door_service import DoorService
from schemas.door import DoorCreate, DoorUpdate, DoorResponse
from schemas.access_permission import DoorAuthorizedUser
from schemas.access_log import AccessLogResponse
from repositories.access_permission_repository import AccessPermissionRepository
from repositories.access_log_repository import AccessLogRepository
from dependencies.auth import require_admin_or_security
from models.user import User

router = APIRouter(prefix="/doors", tags=["Doors"])

@router.get("", response_model=list[DoorResponse])
def get_all_doors(db: Session = Depends(get_db)):
    return DoorService.get_all(db)

@router.get("/{door_id}/authorized-users", response_model=list[DoorAuthorizedUser])
def get_door_authorized_users(
    door_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    return AccessPermissionRepository.find_by_door_id(db, door_id)

@router.get("/{door_id}/logs", response_model=list[AccessLogResponse])
def get_door_logs(
    door_id: int,
    allowed: bool | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    return AccessLogRepository.find_by_door_id(db, door_id, allowed=allowed)

@router.post("", response_model=DoorResponse)
def create_door(data: DoorCreate, db: Session = Depends(get_db)):
    return DoorService.create_door(db, data)

@router.put("/{door_id}", response_model=DoorResponse)
def update_door(door_id: int, data: DoorUpdate, db: Session = Depends(get_db)):
    return DoorService.update_door(db, door_id, data)

@router.delete("/{door_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_door(door_id: int, db: Session = Depends(get_db)):
    return DoorService.delete_door(db, door_id)