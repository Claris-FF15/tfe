from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from db.database import get_db
from services.badge_service import BadgeService  
from schemas.badge import BadgeCreate, BadgeResponse, BadgeUpdate
from dependencies.auth import get_current_user, require_admin_or_security
from models.user import User

router = APIRouter(prefix="/badges", tags=["Badges"])

@router.get("/me", response_model=BadgeResponse)
def get_my_badge(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return BadgeService.get_badge_by_user(db, current_user.id)

@router.get("/user/{user_id}", response_model=BadgeResponse)
def get_badge_by_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    return BadgeService.get_badge_by_user(db, user_id)

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