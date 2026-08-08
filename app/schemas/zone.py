from pydantic import BaseModel


class DoorInZone(BaseModel):
    id: int
    name: str
    location: str
    active: bool

    class Config:
        from_attributes = True


class ZoneResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    doors: list[DoorInZone] = []

    class Config:
        from_attributes = True