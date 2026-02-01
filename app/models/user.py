from sqlalchemy import Column, Integer, String
from core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False)
        role = Column(Boolean, nullable=False, default=False)
