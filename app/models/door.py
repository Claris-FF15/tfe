# models/door.py
from sqlalchemy import Column, Integer, String, Boolean
from db.database import Base

class Door(Base):
    __tablename__ = "doors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    active = Column(Boolean, nullable=False, default=True)