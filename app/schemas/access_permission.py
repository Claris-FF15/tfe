from pydantic import BaseModel
from datetime import datetime
from schemas.door import DoorResponse


class AccessPermissionResponse(BaseModel):
    id: int
    door: DoorResponse
    created_at: datetime

    class Config:
        from_attributes = True


class DoorAuthorizedUserInfo(BaseModel):
    id: int
    first_name: str
    last_name: str

    class Config:
        from_attributes = True


class DoorAuthorizedUser(BaseModel):
    id: int
    user: DoorAuthorizedUserInfo
    created_at: datetime

    class Config:
        from_attributes = True