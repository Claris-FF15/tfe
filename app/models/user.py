from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from db.database import Base
import datetime


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    password = Column(Text, nullable=False)
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    role_id = Column(Integer, ForeignKey("role.id"), index=True)

    role = relationship("Role", back_populates="users")
    badges = relationship("Badge", back_populates="user")
    access_permissions = relationship("AccessPermission", back_populates="user")
    access_logs = relationship("AccessLog", back_populates="user")