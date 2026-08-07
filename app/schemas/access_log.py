from pydantic import BaseModel
from datetime import datetime


class AccessLogUserInfo(BaseModel):
    id: int
    first_name: str
    last_name: str

    class Config:
        from_attributes = True


class AccessLogDoorInfo(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class AccessLogResponse(BaseModel):
    id: int
    timestamp: datetime
    allowed: bool
    reason: str | None = None
    user: AccessLogUserInfo | None = None
    door: AccessLogDoorInfo | None = None

    class Config:
        from_attributes = True