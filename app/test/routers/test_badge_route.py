from fastapi.testclient import TestClient
from main import app
from unittest.mock import MagicMock
from services.badge_service import BadgeService

def test_create_badge_api(monkeypath):
    fake_badge = {
        "id": 1,
        "badge_id": "fre-123"
        "user_id": "2"
        "active": True
    }

    monkeypath.setattr(
        BadgeService,
        "create_badge",
        lambda *args, **kwags: fake_badge
    )

    response = client.post("/badges", json={
        "badge_id": "fre-123"
        "active": True
    })

    assert response.status_code == 200
    assert response.json()["badge_id"]== "fre-123"

def test_delete_badge_api(monkeypath):
    monkeypath.setattr(
        BadgeService,
        "delete_badge",
        lambda *args, **kwargs: None
    )
    
    response = client.delete("/badges/1")
    assert response.status_code == 204