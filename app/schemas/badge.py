from pydantic import BaseModel

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

    class Config:
        from_attributes = True