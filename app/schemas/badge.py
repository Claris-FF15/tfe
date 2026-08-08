from pydantic import BaseModel
from datetime import datetime

class BadgeCreate(BaseModel):
    uid: str
    user_id: int
    active: bool

class BadgeUpdate(BaseModel):
    active: bool

class BadgeResponse(BaseModel):
    id: int
    uid: str
    user_id: int
    active: bool
    last_activity: datetime | None = None

    class Config:
        from_attributes = True