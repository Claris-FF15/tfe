from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from db.database import get_db
from services.badge_service import BadgeService
from repositories.badge_repository import BadgeRepository
from repositories.access_permission_repository import AccessPermissionRepository
from repositories.access_log_repository import AccessLogRepository
from schemas.badge import BadgeCreate, BadgeResponse, BadgeUpdate
from schemas.access_permission import AccessPermissionResponse
from schemas.access_log import AccessLogResponse
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


@router.get("", response_model=list[BadgeResponse])
def list_badges(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    return BadgeService.list_badges_with_activity(db)


@router.get("/{badge_id}/logs", response_model=list[AccessLogResponse])
def get_badge_logs(
    badge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    return AccessLogRepository.find_by_badge_id(db, badge_id)


@router.get("/{badge_id}", response_model=BadgeResponse)
def get_badge(
    badge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    badge = BadgeRepository.find_by_id(db, badge_id)
    if not badge:
        from fastapi import HTTPException
        raise HTTPException(404, "Badge non trouvé")
    return badge


@router.post("", response_model=BadgeResponse)
def create_badge(
    data: BadgeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    return BadgeService.create_badge(db, data)


@router.put("/{badge_id}", response_model=BadgeResponse)
def update_badge(
    badge_id: int,
    data: BadgeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    return BadgeService.update_badge(db, badge_id, data)


@router.delete("/{badge_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_badge(
    badge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    return BadgeService.delete_badge(db, badge_id)