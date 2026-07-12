from sqlalchemy.orm import Session
from models.user import User


class UserRepository:

    @staticmethod
    def find_by_id(db: Session, user_id: int) -> User | None:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def find_all(db: Session) -> list[User]:
        return db.query(User).all()

    @staticmethod
    def find_by_email(db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def save(db: Session, user: User) -> User:
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete(db: Session, user: User):
        db.delete(user)
        db.commit()