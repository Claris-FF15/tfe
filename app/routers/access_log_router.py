from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from repositories.access_log_repository import AccessLogRepository
from schemas.access_log import AccessLogResponse
from dependencies.auth import require_admin_or_security
from models.user import User

router = APIRouter(prefix="/access-logs", tags=["Access Logs"])


@router.get("", response_model=list[AccessLogResponse])
def list_access_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    return AccessLogRepository.find_all(db)


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