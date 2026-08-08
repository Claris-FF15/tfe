from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.door import Door
from models.access_permission import AccessPermission
from repositories.user_repository import UserRepository
from repositories.access_permission_repository import AccessPermissionRepository


class AccessPermissionService:

    @staticmethod
    def grant_access(db: Session, user_id: int, door_id: int) -> AccessPermission:
        user = UserRepository.find_by_id(db, user_id)
        if not user:
            raise HTTPException(404, "Utilisateur non trouvé")

        door = db.query(Door).filter(Door.id == door_id).first()
        if not door:
            raise HTTPException(404, "Porte non trouvée")

        if door.zone and door.zone.name.lower() == "salle serveur":
            role_name = user.role.name.lower() if user.role else None
            if role_name not in ("admin", "responsable_securite"):
                raise HTTPException(
                    403,
                    "Seuls les admins et responsables sécurité peuvent accéder à la zone Serveur",
                )

        existing = AccessPermissionRepository.find_by_user_and_door(db, user_id, door_id)
        if existing:
            raise HTTPException(409, "Cet accès est déjà accordé")

        permission = AccessPermission(user_id=user_id, door_id=door_id)
        return AccessPermissionRepository.save(db, permission)

    @staticmethod
    def revoke_access(db: Session, permission_id: int):
        permission = AccessPermissionRepository.find_by_id(db, permission_id)
        if not permission:
            raise HTTPException(404, "Permission non trouvée")
        AccessPermissionRepository.delete(db, permission)