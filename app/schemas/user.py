from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    role: str = "user"

class UserUpdateName(BaseModel):
    username: str

class UserUpdateRole(BaseModel):
    role: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        orm_mode = True
