import os
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Translation(Base):
    __tablename__ = "translations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)  # NULL for anonymous users
    source_text = Column(Text, nullable=False)
    translated_text = Column(Text, nullable=False)
    source_language = Column(String(10), nullable=False)
    target_language = Column(String(10), nullable=False)
    translation_engine = Column(String(50), default="google")  # google, openai, local
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SupportedLanguage(Base):
    __tablename__ = "supported_languages"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, nullable=False)  # vi, en, fr, etc.
    name = Column(String(100), nullable=False)  # Vietnamese, English, French
    native_name = Column(String(100), nullable=False)  # Tiếng Việt, English, Français
    is_active = Column(Boolean, default=True)
    supports_offline = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
