from sqlalchemy import Column, Integer, String
from core.database import Base

class Badge(Base):
    __tablename__ = "Badges"

    id = Column(Integer, primary_key=True, index=True)
    badge_id = Column(String, nullable=False)
    user_id = Column(Interger, nullable=False)
    active = Column(Boolean, nullable=False, default=False)