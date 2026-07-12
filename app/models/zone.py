from sqlalchemy import Column, String, Integer, Text
from sqlalchemy.orm import relationship
from db.database import Base


class Zone(Base):
    __tablename__ = "zone"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)

    doors = relationship("Door", back_populates="zone")