import secrets
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.user import User
from repositories.user_repository import UserRepository
from schemas.user import UserCreate, UserUpdateName, UserUpdateRole, LoginRequest, UserChangePassword
from services.security import hash_password, verify_password, create_access_token
from services.badge_service import BadgeService


class UserService:

    @staticmethod
    def create_user(db: Session, data: UserCreate, current_user: User) -> User:
        if UserRepository.find_by_email(db, data.email):
            raise HTTPException(409, "Un utilisateur avec cet email existe déjà")

        from models.role import Role
        target_role = db.query(Role).filter(Role.id == data.role_id).first()
        if target_role is None:
            raise HTTPException(400, "Rôle invalide")

        current_role = current_user.role.name.lower() if current_user.role else None
        target_role_name = target_role.name.lower()

        if current_role != "responsable_securite" and target_role_name != "user":
            raise HTTPException(
                403,
                "Seul un responsable sécurité peut créer un compte admin ou responsable sécurité",
            )

        if target_role_name == "responsable_securite":
            if not data.confirm_password or not verify_password(data.confirm_password, current_user.password):
                raise HTTPException(403, "Mot de passe de confirmation incorrect")

        password = data.password or secrets.token_urlsafe(32)

        user = User(
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email,
            password=hash_password(password),
            role_id=data.role_id,
        )
        return UserRepository.save(db, user)

    @staticmethod
    def get_user(db: Session, user_id: int) -> User:
        user = UserRepository.find_by_id(db, user_id)
        if not user:
            raise HTTPException(404, "Utilisateur non trouvé")
        return user

    @staticmethod
    def delete_user(db: Session, user_id: int):
        user = UserRepository.find_by_id(db, user_id)
        if not user:
            raise HTTPException(404, "Utilisateur non trouvé")

        UserRepository.delete(db, user)

    @staticmethod
    def update_name(
        db: Session,
        user_id: int,
        data: UserUpdateName,
        current_user: User,
    ) -> User:
        user = UserRepository.find_by_id(db, user_id)
        if not user:
            raise HTTPException(404, "Utilisateur non trouvé")

        current_role = current_user.role.name.lower() if current_user.role else None
        target_role = user.role.name.lower() if user.role else None

        allowed = False
        if current_role == "responsable_securite":
            allowed = True
        elif current_role == "admin":
            allowed = current_user.id == user.id or target_role == "user"

        if not allowed:
            raise HTTPException(403, "Vous n'avez pas les droits pour modifier cet utilisateur")

        user.first_name = data.first_name
        user.last_name = data.last_name
        return UserRepository.save(db, user)

    @staticmethod
    def update_active(db: Session, user_id: int, active: bool, current_user: User) -> User:
        user = UserRepository.find_by_id(db, user_id)
        if not user:
            raise HTTPException(404, "Utilisateur non trouvé")

        current_role = current_user.role.name.lower() if current_user.role else None
        target_role = user.role.name.lower() if user.role else None

        allowed = False
        if current_role == "responsable_securite":
            allowed = True
        elif current_role == "admin":
            allowed = current_user.id == user.id or target_role == "user"

        if not allowed:
            raise HTTPException(403, "Vous n'avez pas les droits pour modifier cet utilisateur")

        user.active = active
        updated_user = UserRepository.save(db, user)

        if not active:
            BadgeService.deactivate_badge_for_user(db, user_id)
        else:
            BadgeService.reactivate_badge_for_user(db, user_id)

        return updated_user
    
    @staticmethod
    def update_role(
        db: Session,
        user_id: int,
        data: UserUpdateRole,
        current_user: User,
    ) -> User:

        if current_user.role is None or current_user.role.name.lower() != "responsable_securite":
            raise HTTPException(403, "Seul un responsable sécurité peut modifier un rôle")

        user = UserRepository.find_by_id(db, user_id)
        if not user:
            raise HTTPException(404, "Utilisateur non trouvé")

        user.role_id = data.role_id
        return UserRepository.save(db, user)

    @staticmethod
    def authenticate(db: Session, data: LoginRequest) -> str:
        user = UserRepository.find_by_email(db, data.email)
        if not user or not verify_password(data.password, user.password):
            raise HTTPException(401, "Email ou mot de passe incorrect")

        if not user.active:
            raise HTTPException(403, "Compte désactivé")

        if user.role is None or user.role.name.lower() == "user":
            raise HTTPException(403, "Ce rôle n'a pas accès à l'application")

        return create_access_token({"sub": str(user.id)})

    @staticmethod
    def force_deactivate(db: Session, user_id: int) -> User | None:
        user = UserRepository.find_by_id(db, user_id)
        if not user:
            return None
        if not user.active:
            return user
        user.active = False
        updated = UserRepository.save(db, user)
        BadgeService.deactivate_badge_for_user(db, user_id)
        return updated

    @staticmethod
    def change_password(db: Session, user_id: int, data: UserChangePassword, current_user: User) -> None:
        if current_user.id != user_id:
            raise HTTPException(403, "Vous ne pouvez modifier que votre propre mot de passe")

        if not verify_password(data.current_password, current_user.password):
            raise HTTPException(403, "Mot de passe actuel incorrect")

        if len(data.new_password) < 6:
            raise HTTPException(400, "Le nouveau mot de passe doit contenir au moins 6 caractères")

        current_user.password = hash_password(data.new_password)
        UserRepository.save(db, current_user)