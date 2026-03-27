from fastapi.testclient import TestClient
from main import app
from services.badge_service import BadgeService

client = TestClient(app)  

def test_create_badge_api(monkeypatch):  
    fake_badge = {
        "id": 1,
        "badge_id": "fre-123",  
        "user_id": 2,           
        "active": True
    }
    monkeypatch.setattr(
        BadgeService,
        "create_badge",
        lambda *args, **kwargs: fake_badge  
    )
    response = client.post("/badges", json={
        "badge_id": "fre-123",
        "user_id": 2,  
        "active": True
    })
    assert response.status_code == 200
    assert response.json()["badge_id"] == "fre-123"

def test_delete_badge_api(monkeypatch): 
    monkeypatch.setattr(
        BadgeService,
        "delete_badge",
        lambda *args, **kwargs: None
    )
    response = client.delete("/badges/1")
    assert response.status_code == 204

def test_update_badge_api(monkeypatch):
    fake_badge = {
        "id": 1,
        "badge_id": "fre-123",
        "user_id": 2,
        "active": False  
    }
    monkeypatch.setattr(
        BadgeService,
        "update_badge",
        lambda *args, **kwargs: fake_badge
    )
    response = client.put("/badges/1", json={
        "active": False
    })
    assert response.status_code == 200
    assert response.json()["active"] == False

def test_update_badge_not_found(monkeypatch):
    from fastapi import HTTPException

    def raise_not_found(*args, **kwargs):
        raise HTTPException(status_code=404, detail="Badge non trouvé")

    monkeypatch.setattr(BadgeService, "update_badge", raise_not_found)

    response = client.put("/badges/999", json={"active": True})
    assert response.status_code == 404
    assert response.json()["detail"] == "Badge non trouvé"