from fastapi.testclient import TestClient
from main import app
from services.door_service import DoorService

client = TestClient(app)

def test_get_all_doors(monkeypatch):
    fake_doors = [
        {"id": 1, "name": "Entrée", "location": "RDC", "active": True},
        {"id": 2, "name": "Sortie", "location": "RDC", "active": True}
    ]
    monkeypatch.setattr(DoorService, "get_all", lambda db: fake_doors)

    response = client.get("/doors")
    assert response.status_code == 200
    assert len(response.json()) == 2
    assert response.json()[0]["name"] == "Entrée"

def test_create_door(monkeypatch):
    fake_door = {"id": 1, "name": "Entrée", "location": "RDC", "active": True}
    monkeypatch.setattr(DoorService, "create_door", lambda *args, **kwargs: fake_door)

    response = client.post("/doors", json={
        "name": "Entrée",
        "location": "RDC",
        "active": True
    })
    assert response.status_code == 200
    assert response.json()["name"] == "Entrée"

def test_update_door(monkeypatch):
    fake_door = {"id": 1, "name": "Entrée Principale", "location": "RDC", "active": False}
    monkeypatch.setattr(DoorService, "update_door", lambda *args, **kwargs: fake_door)

    response = client.put("/doors/1", json={"name": "Entrée Principale", "active": False})
    assert response.status_code == 200
    assert response.json()["name"] == "Entrée Principale"
    assert response.json()["active"] == False

def test_update_door_not_found(monkeypatch):
    from fastapi import HTTPException

    monkeypatch.setattr(
        DoorService, "update_door",
        lambda *args, **kwargs: (_ for _ in ()).throw(HTTPException(404, "Porte non trouvée"))
    )
    response = client.put("/doors/999", json={"active": False})
    assert response.status_code == 404
    assert response.json()["detail"] == "Porte non trouvée"

def test_delete_door(monkeypatch):
    monkeypatch.setattr(DoorService, "delete_door", lambda *args, **kwargs: None)

    response = client.delete("/doors/1")
    assert response.status_code == 204

def test_delete_door_not_found(monkeypatch):
    from fastapi import HTTPException

    monkeypatch.setattr(
        DoorService, "delete_door",
        lambda *args, **kwargs: (_ for _ in ()).throw(HTTPException(404, "Porte non trouvée"))
    )
    response = client.delete("/doors/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Porte non trouvée"