from fastapi import FastAPI
from routers.user_router import router as user_router
from db.database import Base, engine  # ton engine SQLAlchemy
from models.user import User
from models.badge import Badge

app = FastAPI()

# Crée toutes les tables au démarrage si elles n'existent pas
Base.metadata.create_all(bind=engine)

app.include_router(user_router)