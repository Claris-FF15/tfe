import secrets
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.user import User
from repositories.user_repository import UserRepository
from schemas.user import UserCreate, UserUpdateName, UserUpdateRole, LoginRequest
from services.security import hash_password, verify_password, create_access_token


class UserService:

    @staticmethod
    def create_user(db: Session, data: UserCreate, current_user: User) -> User:
        if UserRepository.find_by_email(db, data.email):
            raise HTTPException(409, "Un utilisateur avec cet email existe déjà")

        current_role = current_user.role.name.lower() if current_user.role else None

        if current_role != "responsable_securite":
            from models.role import Role
            role = db.query(Role).filter(Role.id == data.role_id).first()
            if role is None or role.name.lower() != "user":
                raise HTTPException(
                    403,
                    "Seul un responsable sécurité peut créer un compte admin ou responsable sécurité",
                )

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
            allowed = True  # peut tout modifier
        elif current_role == "admin":
            # peut modifier son propre profil, ou un user simple
            allowed = current_user.id == user.id or target_role == "user"

        if not allowed:
            raise HTTPException(403, "Vous n'avez pas les droits pour modifier cet utilisateur")

        user.first_name = data.first_name
        user.last_name = data.last_name
        return UserRepository.save(db, user)

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