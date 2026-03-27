import pytest
from unittest.mock import MagicMock
from services.door_service import DoorService
from schemas.door import DoorCreate, DoorUpdate
from models.door import Door
from fastapi import HTTPException

def test_get_all_doors(monkeypatch):
    db = MagicMock()
    fake_doors = [
        Door(id=1, name="Entrée", location="RDC", active=True),
        Door(id=2, name="Sortie", location="RDC", active=True)
    ]
    monkeypatch.setattr(
        "repositories.door_repository.DoorRepository.find_all",
        lambda db: fake_doors
    )
    result = DoorService.get_all(db)
    assert len(result) == 2
    assert result[0].name == "Entrée"

def test_create_door(monkeypatch):
    db = MagicMock()
    data = DoorCreate(name="Entrée", location="RDC", active=True)
    fake_door = Door(id=1, name="Entrée", location="RDC", active=True)

    monkeypatch.setattr(
        "repositories.door_repository.DoorRepository.save",
        lambda db, door: fake_door
    )
    result = DoorService.create_door(db, data)
    assert result.name == "Entrée"
    assert result.location == "RDC"
    assert result.active == True

def test_update_door_success(monkeypatch):
    db = MagicMock()
    door = Door(id=1, name="Entrée", location="RDC", active=True)
    updated_door = Door(id=1, name="Entrée Principale", location="RDC", active=False)
    data = DoorUpdate(name="Entrée Principale", active=False)

    monkeypatch.setattr(
        "repositories.door_repository.DoorRepository.find_by_id",
        lambda db, id: door
    )
    monkeypatch.setattr(
        "repositories.door_repository.DoorRepository.update",
        lambda db, door, data: updated_door
    )
    result = DoorService.update_door(db, 1, data)
    assert result.name == "Entrée Principale"
    assert result.active == False

def test_update_door_not_found(monkeypatch):
    db = MagicMock()
    monkeypatch.setattr(
        "repositories.door_repository.DoorRepository.find_by_id",
        lambda db, id: None
    )
    with pytest.raises(HTTPException) as exc:
        DoorService.update_door(db, 999, DoorUpdate(active=False))
    assert exc.value.status_code == 404

def test_delete_door_success(monkeypatch):
    db = MagicMock()
    door = Door(id=1, name="Entrée", location="RDC", active=True)

    monkeypatch.setattr(
        "repositories.door_repository.DoorRepository.find_by_id",
        lambda db, id: door
    )
    monkeypatch.setattr(
        "repositories.door_repository.DoorRepository.delete",
        lambda db, door: None
    )
    DoorService.delete_door(db, 1)

def test_delete_door_not_found(monkeypatch):
    db = MagicMock()
    monkeypatch.setattr(
        "repositories.door_repository.DoorRepository.find_by_id",
        lambda db, id: None
    )
    with pytest.raises(HTTPException) as exc:
        DoorService.delete_door(db, 999)
    assert exc.value.status_code == 404