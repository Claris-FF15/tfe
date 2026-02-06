import pytest
from unittest.mock import MagicMock
from services.badge_service import BadgeService
from schemas.badge import BadgeCreate
from models.badge import Badge
from fastapi import HTTPException

def test_create_badge():
    db = MagicMock()

    data = BadgeCreate(badge_id="john", user_id="2", active=True)
    badge = BadgeService.create_badge(db, data)

    assert badge.badge_id == "john"
    assert badge.user_id == "2"
    assert badge.active == True 

def test_delete_badge_success(monkeypatch):
    db = MagicMock()
    badge = Badge(id=1, badge_id="john", user_id="2", active=True )

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

# add update later 