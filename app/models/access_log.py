from sqlalchemy import Column, String, Integer, BigInteger, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from db.database import Base
import datetime


class AccessLog(Base):
    __tablename__ = "access_log"
    id = Column(BigInteger, primary_key=True, index=True)
    badge_id = Column(Integer, ForeignKey("badge.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    door_id = Column(Integer, ForeignKey("door.id"), index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    allowed = Column(Boolean)
    reason = Column(Text)

    badge = relationship("Badge", back_populates="access_logs")
    user = relationship("User", back_populates="access_logs")
    door = relationship("Door", back_populates="access_logs")