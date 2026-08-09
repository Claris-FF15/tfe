from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from repositories.access_log_repository import AccessLogRepository
from services.access_log_service import AccessLogService
from schemas.access_log import AccessLogResponse, AccessAttempt
from dependencies.auth import require_admin_or_security
from models.user import User

router = APIRouter(prefix="/access-logs", tags=["Access Logs"])


@router.post("", response_model=AccessLogResponse)
def create_access_attempt(
    data: AccessAttempt,
    db: Session = Depends(get_db),
):
    return AccessLogService.process_access_attempt(db, data.badge_uid, data.door_id)


@router.get("", response_model=list[AccessLogResponse])
def list_access_logs(
    allowed: bool | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    return AccessLogRepository.find_all(db, allowed=allowed)


@router.get("/{log_id}", response_model=AccessLogResponse)
def get_access_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    log = AccessLogRepository.find_by_id(db, log_id)
    if not log:
        raise HTTPException(404, "Log non trouvé")
    return log