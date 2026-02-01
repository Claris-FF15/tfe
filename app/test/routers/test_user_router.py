from fastapi.testclient import TestClient
from main import app
from unittest.mock import MagicMock
from services.user_service import UserService

def test_create_user_api(monkeypatch):
    fake_user = {
        "id": 1,
        "username": "john",
        "role": "user"
    }

    monkeypatch.setattr(
        UserService,
        "create_user",
        lambda *args, **kwargs: fake_user
    )

    response = client.post("/users", json={
        "username": "john",
        "role": "user"
    })

    assert response.status_code == 200
    assert response.json()["username"] == "john"

def test_delete_user_api(monkeypatch):
    monkeypatch.setattr(
        UserService,
        "delete_user",
        lambda *args, **kwargs: None
    )

    response = client.delete("/users/1")
    assert response.status_code == 204
