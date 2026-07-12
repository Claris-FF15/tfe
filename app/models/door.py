from sqlalchemy import Column, String, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from db.database import Base


class Door(Base):
    __tablename__ = "door"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    active = Column(Boolean, nullable=False, default=True)
    zone_id = Column(Integer, ForeignKey("zone.id"), index=True)

    zone = relationship("Zone", back_populates="doors")
    access_permissions = relationship("AccessPermission", back_populates="door")
    access_logs = relationship("AccessLog", back_populates="door")