from pydantic import BaseModel
from datetime import datetime

class BadgeCreate(BaseModel):
    uid: str
    user_id: int | None = None
    active: bool = True

class BadgeUpdate(BaseModel):
    active: bool | None = None
    user_id: int | None = None

class BadgeResponse(BaseModel):
    id: int
    uid: str
    user_id: int | None
    active: bool
    last_activity: datetime | None = None

    class Config:
        from_attributes = True