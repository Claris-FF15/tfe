from pydantic import BaseModel
from schemas.zone import ZoneResponse


class DoorCreate(BaseModel):
    name: str
    location: str
    active: bool = True


class DoorUpdate(BaseModel):
    name: str | None = None
    location: str | None = None
    active: bool | None = None

class DoorResponse(BaseModel):
    id: int
    name: str
    location: str
    active: bool
    zone: ZoneResponse | None = None

    class Config:
        from_attributes = True