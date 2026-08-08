from sqlalchemy.orm import Session
from models.access_permission import AccessPermission


class AccessPermissionRepository:

    @staticmethod
    def find_by_id(db: Session, permission_id: int) -> AccessPermission | None:
        return db.query(AccessPermission).filter(AccessPermission.id == permission_id).first()

    @staticmethod
    def find_by_user_id(db: Session, user_id: int) -> list[AccessPermission]:
        return db.query(AccessPermission).filter(AccessPermission.user_id == user_id).all()

    @staticmethod
    def find_by_door_id(db: Session, door_id: int) -> list[AccessPermission]:
        return db.query(AccessPermission).filter(AccessPermission.door_id == door_id).all()

    @staticmethod
    def find_by_user_and_door(db: Session, user_id: int, door_id: int) -> AccessPermission | None:
        return (
            db.query(AccessPermission)
            .filter(AccessPermission.user_id == user_id, AccessPermission.door_id == door_id)
            .first()
        )

    @staticmethod
    def save(db: Session, permission: AccessPermission) -> AccessPermission:
        db.add(permission)
        db.commit()
        db.refresh(permission)
        return permission

    @staticmethod
    def delete(db: Session, permission: AccessPermission):
        db.delete(permission)
        db.commit()