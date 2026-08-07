from sqlalchemy.orm import Session
from models.access_permission import AccessPermission


class AccessPermissionRepository:

    @staticmethod
    def find_by_user_id(db: Session, user_id: int) -> list[AccessPermission]:
        return db.query(AccessPermission).filter(AccessPermission.user_id == user_id).all()