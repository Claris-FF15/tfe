import pytest
from unittest.mock import MagicMock
from services.user_service import UserService
from schemas.user import UserCreate, UserUpdateName, UserUpdateRole
from models.user import User
from fastapi import HTTPException

def test_create_user():
    db = MagicMock()

    data = UserCreate(username="john", role="user")
    user = UserService.create_user(db, data)

    assert user.username == "john"
    assert user.role == "user"

def test_delete_user_success(monkeypatch):
    db = MagicMock()
    user = User(id=1, username="john", role="user")

    monkeypatch.setattr(
        "repositories.user_repository.UserRepository.find_by_id",
        lambda db, id: user
    )

    monkeypatch.setattr(
        "repositories.user_repository.UserRepository.delete",
        lambda db, user: None
    )

    UserService.delete_user(db, 1)

def test_delete_user_not_found(monkeypatch):
    db = MagicMock()

    monkeypatch.setattr(
        "repositories.user_repository.UserRepository.find_by_id",
        lambda db, id: None
    )

    with pytest.raises(HTTPException) as exc:
        UserService.delete_user(db, 1)

    assert exc.value.status_code == 404

def test_update_username(monkeypatch):
    db = MagicMock()
    user = User(id=1, username="old", role="user")

    monkeypatch.setattr(
        "repositories.user_repository.UserRepository.find_by_id",
        lambda db, id: user
    )

    monkeypatch.setattr(
        "repositories.user_repository.UserRepository.save",
        lambda db, user: user
    )

    data = UserUpdateName(username="new")
    result = UserService.update_username(db, 1, data)

    assert result.username == "new"


def test_update_role_admin(monkeypatch):
    db = MagicMock()

    target_user = User(id=2, username="bob", role="user")
    admin = User(id=1, username="admin", role="admin")

    monkeypatch.setattr(
        "repositories.user_repository.UserRepository.find_by_id",
        lambda db, id: target_user
    )

    monkeypatch.setattr(
        "repositories.user_repository.UserRepository.save",
        lambda db, user: user
    )

    data = UserUpdateRole(role="admin")
    result = UserService.update_role(db, 2, data, admin)

    assert result.role == "admin"


def test_update_role_forbidden():
    db = MagicMock()

    user = User(id=1, username="john", role="user")
    target = User(id=2, username="bob", role="user")

    with pytest.raises(HTTPException) as exc:
        UserService.update_role(db, 2, UserUpdateRole(role="admin"), user)

    assert exc.value.status_code == 403
