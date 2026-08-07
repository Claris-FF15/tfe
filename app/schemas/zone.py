from pydantic import BaseModel


class ZoneResponse(BaseModel):
    id: int
    name: str
    description: str | None = None

    class Config:
        from_attributes = True