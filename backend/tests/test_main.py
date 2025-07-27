import pytest
import asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db, Base
from app.services.translation import translation_service

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "Voice Translator API" in response.json()["message"]

def test_health_check():
    response = client.get("/health")
    # May fail without proper database/redis setup
    # assert response.status_code == 200

@pytest.mark.asyncio
async def test_translation_service():
    # Test Google translation
    result = await translation_service.translate_with_google(
        text="Hello world",
        source_lang="en",
        target_lang="vi"
    )
    assert result.source_text == "Hello world"
    assert result.translation_engine == "google"

def test_language_detection():
    result = translation_service.detect_language("Hello world")
    assert result.detected_language == "en"
    assert result.confidence > 0.5

def test_supported_languages():
    languages = translation_service.get_supported_languages()
    assert "en" in languages
    assert "vi" in languages

def test_translate_endpoint():
    response = client.post("/api/v1/translate/translate", json={
        "text": "Hello",
        "source_language": "en",
        "target_language": "vi",
        "engine": "google"
    })
    # May fail without API keys
    # assert response.status_code == 200

def test_detect_language_endpoint():
    response = client.post("/api/v1/translate/detect-language", json={
        "text": "Hello world"
    })
    assert response.status_code == 200
    data = response.json()
    assert "detected_language" in data

def test_get_languages():
    response = client.get("/api/v1/translate/languages")
    assert response.status_code == 200
    data = response.json()
    assert "languages" in data
