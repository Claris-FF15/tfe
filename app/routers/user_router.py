from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from db.database import get_db
from services.user_service import UserService
from repositories.user_repository import UserRepository
from repositories.access_permission_repository import AccessPermissionRepository
from schemas.user import UserCreate, UserUpdateName, UserUpdateRole, UserResponse, UserUpdateActive
from schemas.access_permission import AccessPermissionResponse
from dependencies.auth import get_current_user, require_admin, require_admin_or_security
from models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("", response_model=UserResponse)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    return UserService.create_user(db, data, current_user)


@router.get("", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    return UserRepository.find_all(db)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/{user_id}/permissions", response_model=list[AccessPermissionResponse])
def get_user_permissions(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    return AccessPermissionRepository.find_by_user_id(db, user_id)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    return UserService.get_user(db, user_id)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    UserService.delete_user(db, user_id)


@router.put("/{user_id}/name", response_model=UserResponse)
def update_name(
    user_id: int,
    data: UserUpdateName,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    return UserService.update_name(db, user_id, data, current_user)


@router.put("/{user_id}/role", response_model=UserResponse)
def update_role(
    user_id: int,
    data: UserUpdateRole,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    return UserService.update_role(db, user_id, data, current_user)


@router.put("/{user_id}/active", response_model=UserResponse)
def update_active(
    user_id: int,
    data: UserUpdateActive,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_security),
):
    return UserService.update_active(db, user_id, data.active, current_user)