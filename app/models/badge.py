from sqlalchemy import Column, Integer, String, Boolean
from db.database import Base

class Badge(Base):
    __tablename__ = "badges"  # table name in lowercase

    id = Column(Integer, primary_key=True, index=True)
    badge_id = Column(String, nullable=False, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    active = Column(Boolean, nullable=False, default=False)