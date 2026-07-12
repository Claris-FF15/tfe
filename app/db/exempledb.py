from sqlalchemy import Column, String, Integer, BigInteger, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from .database import Base
import datetime


class Role(Base):
    __tablename__ = "role"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    password = Column(Text, nullable=False)
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    role_id = Column(Integer, ForeignKey("role.id"), index=True)

    role = relationship("Role", back_populates="users")
    badges = relationship("Badge", back_populates="user")
    access_permissions = relationship("AccessPermission", back_populates="user")
    access_logs = relationship("AccessLog", back_populates="user")


class Badge(Base):
    __tablename__ = "badge"
    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(50), nullable=False)
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)

    user = relationship("User", back_populates="badges")
    access_logs = relationship("AccessLog", back_populates="badge")


class Zone(Base):
    __tablename__ = "zone"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)

    doors = relationship("Door", back_populates="zone")


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


class AccessPermission(Base):
    __tablename__ = "access_permission"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    door_id = Column(Integer, ForeignKey("door.id"), index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="access_permissions")
    door = relationship("Door", back_populates="access_permissions")


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