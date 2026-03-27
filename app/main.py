from fastapi import FastAPI
from routers.user_router import router as user_router
from routers.badge_router import router as badge_router
from routers.door_router import router as door_router
from db.database import Base, engine
from models.user import User
from models.badge import Badge
from models.door import Door

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(user_router)
app.include_router(badge_router)
app.include_router(door_router)