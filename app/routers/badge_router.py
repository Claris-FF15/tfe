from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from core.database import get_db
from services.user_service import UserService
from schemas.user import *
from dependencies.auth import get_current_user
from models.badge import Badge

router = APIRouter(prefix="/badges", tags=["Badges"])

@router.post("", response_model=BadgeResponse)
def create_badge(
    data: BadgeCreate,
    db: Session = Depends(get_db)
):
    return BadgeService.create_badge(db, data)

@router.delete("/{badge_id}", status_code=status.TTP_204_NO_CONTENT)
def delete_badge(
    badge_id: int,
    db: Session = Depends(get_db)
)
return BadgeService.delete_user(db, badge_id)

#router update to add