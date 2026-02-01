from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from core.database import get_db
from services.user_service import UserService
from schemas.user import *
from dependencies.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("", response_model=UserResponse)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db)
):
    return UserService.create_user(db, data)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    UserService.delete_user(db, user_id)

@router.put("/{user_id}/name", response_model=UserResponse)
def update_username(
    user_id: int,
    data: UserUpdateName,
    db: Session = Depends(get_db)
):
    return UserService.update_username(db, user_id, data)

@router.put("/{user_id}/role", response_model=UserResponse)
def update_role(
    user_id: int,
    data: UserUpdateRole,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return UserService.update_role(db, user_id, data, current_user)
