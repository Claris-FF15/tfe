from pydantic import BaseModel, EmailStr


class RoleResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str | None = None
    role_id: int


class UserUpdateName(BaseModel):
    first_name: str
    last_name: str


class UserUpdateRole(BaseModel):
    role_id: int


class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    active: bool
    role: RoleResponse

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserUpdateActive(BaseModel):
    active: bool