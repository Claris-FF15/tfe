from sqlalchemy.orm import Session
from fastapi import Depends
from core.database import get_db
from models.user import User

def get_current_user(db: Session = Depends(get_db)) -> User:
    # MOCK → remplace par JWT plus tard
    return db.query(User).filter(User.role == "admin").first()
