from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from repositories.security_alert_repository import SecurityAlertRepository
from dependencies.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/security-alerts", tags=["Security Alerts"])


@router.get("/unacknowledged")
def get_unacknowledged(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alerts = SecurityAlertRepository.find_unacknowledged(db)
    return [
        {
            "id": a.id,
            "user_id": a.user_id,
            "message": a.message,
            "created_at": a.created_at,
        }
        for a in alerts
    ]


@router.put("/{alert_id}/acknowledge")
def acknowledge(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alert = SecurityAlertRepository.find_by_id(db, alert_id)
    if not alert:
        raise HTTPException(404, "Alerte non trouvée")
    SecurityAlertRepository.acknowledge(db, alert)
    return {"ok": True}