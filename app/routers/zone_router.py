from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from repositories.zone_repository import ZoneRepository
from schemas.zone import ZoneResponse, ZoneCreate
from models.zone import Zone
from dependencies.auth import require_admin_or_security
from models.user import User

router = APIRouter(prefix="/zones", tags=["Zones"])


@router.get("", response_model=list[ZoneResponse])
def list_zones(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    return ZoneRepository.find_all(db)


@router.post("", response_model=ZoneResponse)
def create_zone(
    data: ZoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    zone = Zone(name=data.name, description=data.description)
    return ZoneRepository.save(db, zone)


@router.get("/{zone_id}", response_model=ZoneResponse)
def get_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    zone = ZoneRepository.find_by_id(db, zone_id)
    if not zone:
        raise HTTPException(404, "Zone non trouvée")
    return zone