from sqlalchemy.orm import Session
from models.security_alert import SecurityAlert


class SecurityAlertRepository:

    @staticmethod
    def find_unacknowledged(db: Session) -> list[SecurityAlert]:
        return db.query(SecurityAlert).filter(SecurityAlert.acknowledged == False).all()

    @staticmethod
    def find_by_id(db: Session, alert_id: int) -> SecurityAlert | None:
        return db.query(SecurityAlert).filter(SecurityAlert.id == alert_id).first()

    @staticmethod
    def save(db: Session, alert: SecurityAlert) -> SecurityAlert:
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert

    @staticmethod
    def acknowledge(db: Session, alert: SecurityAlert) -> SecurityAlert:
        alert.acknowledged = True
        db.commit()
        db.refresh(alert)
        return alert