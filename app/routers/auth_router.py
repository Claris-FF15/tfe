from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from services.user_service import UserService
from schemas.user import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    token = UserService.authenticate(db, data)
    return TokenResponse(access_token=token)