from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Translation schemas
class TranslationRequest(BaseModel):
    text: str
    source_language: str
    target_language: str
    engine: Optional[str] = "google"  # google, openai, local

class TranslationResponse(BaseModel):
    id: Optional[int] = None
    source_text: str
    translated_text: str
    source_language: str
    target_language: str
    translation_engine: str
    confidence: Optional[float] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Language schemas
class LanguageResponse(BaseModel):
    code: str
    name: str
    native_name: str
    supports_offline: bool
    
    class Config:
        from_attributes = True

# Detection schema
class LanguageDetectionResponse(BaseModel):
    detected_language: str
    confidence: float

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
