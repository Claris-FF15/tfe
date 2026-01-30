# test_db.py
from sqlalchemy import create_engine, Column, String, Integer, Boolean, DateTime, ForeignKey, inspect
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
import datetime

SQLALCHEMY_DATABASE_URL = "postgresql://postgres:example@localhost:5432/badge_db"


engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()


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


Base.metadata.create_all(bind=engine)
print("Tables créées ✅")

try:
    new_user = User(name="Clarisse")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    print("Utilisateur ajouté :", new_user.id, new_user.name)
except Exception as e:
    print("Erreur insertion :", e)
finally:
    db.close()

inspector = inspect(engine)
print("Tables existantes :", inspector.get_table_names())
