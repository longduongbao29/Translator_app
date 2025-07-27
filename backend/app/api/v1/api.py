from fastapi import APIRouter
from app.api.v1.endpoints import translation, auth

api_router = APIRouter()

api_router.include_router(translation.router, prefix="/translate", tags=["translation"])
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
