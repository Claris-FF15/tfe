from pydantic import BaseModel

class BadgeCreate(BaseModel):
    badge_id: str
    user_id: int
    active: bool

class BadgeUpdate(BaseModel):
    active: bool

class BadgeResponse(BaseModel):
    id: int
    badge_id: str
    user_id: int
    active: bool

    class Config:
        orm_mode = True