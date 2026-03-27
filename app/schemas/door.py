from pydantic import BaseModel

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

    class Config:
        from_attributes = True