from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from db.database import Base
import datetime


class AccessPermission(Base):
    __tablename__ = "access_permission"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    door_id = Column(Integer, ForeignKey("door.id"), index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="access_permissions")
    door = relationship("Door", back_populates="access_permissions")