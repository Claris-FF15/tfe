from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from db.database import get_db
from services.badge_service import BadgeService  
from schemas.badge import BadgeCreate, BadgeResponse, BadgeUpdate  

router = APIRouter(prefix="/badges", tags=["Badges"])

@router.post("", response_model=BadgeResponse)
def create_badge(
    data: BadgeCreate,
    db: Session = Depends(get_db)
):
    return BadgeService.create_badge(db, data)

@router.put("/{badge_id}", response_model=BadgeResponse)
def update_badge(
    badge_id: int,
    data: BadgeUpdate,
    db: Session = Depends(get_db)
):
    return BadgeService.update_badge(db, badge_id, data)

@router.delete("/{badge_id}", status_code=status.HTTP_204_NO_CONTENT) 
def delete_badge(
    badge_id: int,
    db: Session = Depends(get_db)
):
    return BadgeService.delete_badge(db, badge_id)