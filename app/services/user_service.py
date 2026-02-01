from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.user import User
from repositories.user_repository import UserRepository
from schemas.user import *

class UserService:

    @staticmethod
    def create_user(db: Session, data: UserCreate) -> User:
        user = User(**data.dict())
        return UserRepository.save(db, user)

    @staticmethod
    def delete_user(db: Session, user_id: int):
        user = UserRepository.find_by_id(db, user_id)
        if not user:
            raise HTTPException(404, "Utilisateur non trouvé")

        UserRepository.delete(db, user)

    @staticmethod
    def update_username(db: Session, user_id: int, data: UserUpdateName) -> User:
        user = UserRepository.find_by_id(db, user_id)
        if not user:
            raise HTTPException(404, "Utilisateur non trouvé")

        user.username = data.username
        return UserRepository.save(db, user)

    @staticmethod
    def update_role(
        db: Session,
        user_id: int,
        data: UserUpdateRole,
        current_user: User
    ) -> User:

        if current_user.role != "admin":
            raise HTTPException(403, "Admin requis")

        user = UserRepository.find_by_id(db, user_id)
        if not user:
            raise HTTPException(404, "Utilisateur non trouvé")

        user.role = data.role
        return UserRepository.save(db, user)
