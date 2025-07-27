from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import TranslationRequest, TranslationResponse, LanguageDetectionResponse
from app.services.translation import translation_service
from app.models import Translation
from typing import Optional, List

router = APIRouter()
security = HTTPBearer(auto_error=False)

@router.post("/translate", response_model=TranslationResponse)
async def translate_text(
    request: TranslationRequest,
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """Translate text"""
    try:
        # Choose translation engine
        if request.engine == "google":
            result = await translation_service.translate_with_google(
                request.text, 
                request.source_language, 
                request.target_language
            )
        elif request.engine == "openai":
            result = await translation_service.translate_with_openai(
                request.text, 
                request.source_language, 
                request.target_language
            )
        else:
            result = await translation_service.translate_with_google(
                request.text, 
                request.source_language, 
                request.target_language
            )
        
        # Save to database
        db_translation = Translation(
            user_id=None,  # TODO: Get from auth
            source_text=result.source_text,
            translated_text=result.translated_text,
            source_language=result.source_language,
            target_language=result.target_language,
            translation_engine=result.translation_engine
        )
        db.add(db_translation)
        db.commit()
        db.refresh(db_translation)
        
        result.id = db_translation.id
        result.created_at = db_translation.created_at
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/detect-language", response_model=LanguageDetectionResponse)
async def detect_language(request: dict):
    """Detect language of text"""
    try:
        text = request.get("text", "")
        if not text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text is required"
            )
        
        result = translation_service.detect_language(text)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/languages")
async def get_supported_languages():
    """Get supported languages"""
    try:
        languages = translation_service.get_supported_languages()
        return {"languages": languages}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/history")
async def get_translation_history(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get translation history"""
    try:
        translations = db.query(Translation).offset(skip).limit(limit).all()
        return {"translations": translations}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
