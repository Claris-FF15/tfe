from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from db.database import get_db
from repositories.user_repository import UserRepository
from services.security import decode_access_token
from models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider les identifiants",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_error

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_error

    user = UserRepository.find_by_id(db, int(user_id))
    if user is None:
        raise credentials_error

    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role is None or current_user.role.name != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin requis")
    return current_user


def require_admin_or_security(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role is None or current_user.role.name not in ("admin", "responsable_securite"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin ou responsable sécurité requis")
    return current_user