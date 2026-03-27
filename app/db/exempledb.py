from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class User(Base):
    __tablename__ = "utilisateur"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(Boolean, nullable=False, default=False)
    badges = relationship("Badge", back_populates="user")

class Badge(Base):
    __tablename__ = "badge"
    id = Column(Integer, primary_key=True, index=True)
    badge_id = Column(String, unique=True)
    user_id = Column(Integer, ForeignKey("utilisateur.id")) 
    user = relationship("User", back_populates="badges") 

class Door(Base): 
    __tablename__ = "doors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    active = Column(Boolean, nullable=False, default=True)

class AccessLog(Base):
    __tablename__ = "access_logs"
    id = Column(Integer, primary_key=True)
    badge_id = Column(String)
    door_id = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    allowed = Column(Boolean)