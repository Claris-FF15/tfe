from pydantic import BaseModel
from datetime import datetime


class AccessLogResponse(BaseModel):
    id: int
    door_id: int | None
    timestamp: datetime
    allowed: bool
    reason: str | None = None

    class Config:
        from_attributes = True