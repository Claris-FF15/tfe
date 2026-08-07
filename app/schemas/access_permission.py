from pydantic import BaseModel
from datetime import datetime
from schemas.door import DoorResponse


class AccessPermissionResponse(BaseModel):
    id: int
    door: DoorResponse
    created_at: datetime

    class Config:
        from_attributes = True