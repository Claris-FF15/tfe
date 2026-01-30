from fastapi import FastAPI
from .database import engine, Base
from .routers import access  # ton router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(access.router)
