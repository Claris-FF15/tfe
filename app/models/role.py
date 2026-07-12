from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship
from db.database import Base


class Role(Base):
    __tablename__ = "role"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)

    users = relationship("User", back_populates="role")