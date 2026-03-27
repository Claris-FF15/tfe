import pytest
from unittest.mock import MagicMock
from services.badge_service import BadgeService
from schemas.badge import BadgeCreate, BadgeUpdate
from models.badge import Badge
from fastapi import HTTPException

def test_create_badge(monkeypatch):  
    db = MagicMock()
    data = BadgeCreate(badge_id="john", user_id=2, active=True)  

    fake_badge = Badge(id=1, badge_id="john", user_id=2, active=True)
    monkeypatch.setattr(  # ← mock manquant sur save
        "repositories.badge_repository.BadgeRepository.save",
        lambda db, badge: fake_badge
    )

    badge = BadgeService.create_badge(db, data)
    assert badge.badge_id == "john"
    assert badge.user_id == 2   
    assert badge.active == True

def test_delete_badge_success(monkeypatch):
    db = MagicMock()
    badge = Badge(id=1, badge_id="john", user_id=2, active=True)  
    monkeypatch.setattr(
        "repositories.badge_repository.BadgeRepository.find_by_id",
        lambda db, id: badge
    )
    monkeypatch.setattr(
        "repositories.badge_repository.BadgeRepository.delete",
        lambda db, badge: None
    )
    BadgeService.delete_badge(db, 1)

def test_delete_badge_not_found(monkeypatch):
    db = MagicMock()
    monkeypatch.setattr(
        "repositories.badge_repository.BadgeRepository.find_by_id",
        lambda db, id: None
    )
    with pytest.raises(HTTPException) as exc:
        BadgeService.delete_badge(db, 1)
    assert exc.value.status_code == 404

def test_update_badge_success(monkeypatch):
    db = MagicMock()
    badge = Badge(id=1, badge_id="john", user_id=2, active=True)
    updated_badge = Badge(id=1, badge_id="john", user_id=2, active=False)
    data = BadgeUpdate(active=False)

    monkeypatch.setattr(
        "repositories.badge_repository.BadgeRepository.find_by_id",
        lambda db, id: badge
    )
    monkeypatch.setattr(
        "repositories.badge_repository.BadgeRepository.update",
        lambda db, badge, active: updated_badge
    )

    result = BadgeService.update_badge(db, 1, data)
    assert result.active == False

def test_update_badge_not_found(monkeypatch):
    db = MagicMock()
    monkeypatch.setattr(
        "repositories.badge_repository.BadgeRepository.find_by_id",
        lambda db, id: None
    )
    with pytest.raises(HTTPException) as exc:
        BadgeService.update_badge(db, 999, BadgeUpdate(active=True))
    assert exc.value.status_code == 404