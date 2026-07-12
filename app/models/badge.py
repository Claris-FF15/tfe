from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from db.database import Base
import datetime


class Badge(Base):
    __tablename__ = "badge"
    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(50), nullable=False)
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)

    user = relationship("User", back_populates="badges")
    access_logs = relationship("AccessLog", back_populates="badge")