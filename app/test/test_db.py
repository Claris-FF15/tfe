from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(Boolean, nullable=False, default=False)
    badges = relationship("Badge", back_populates="user")

class Badge(Base):
    __tablename__ = "badges"
    id = Column(Integer, primary_key=True, index=True)
    badge_id = Column(String, unique=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    active = Column(Boolean, default=True)
    user = relationship("User", back_populates="badges")

class AccessLog(Base):
    __tablename__ = "access_logs"
    id = Column(Integer, primary_key=True)
    badge_id = Column(String)
    door_id = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    allowed = Column(Boolean)

class Door(Base):
    __tablename__ = "doors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    active = Column(Boolean, nullable=False, default=True)

def test_create_tables():
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    assert "users" in tables
    assert "badges" in tables
    assert "access_logs" in tables
    assert "doors" in tables

def test_insert_user():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user = User(name="Clarisse")
        db.add(user)
        db.commit()
        db.refresh(user)
        assert user.id is not None
        assert user.name == "Clarisse"
    finally:
        db.close()
