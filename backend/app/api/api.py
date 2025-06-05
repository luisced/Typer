from fastapi import APIRouter
from app.api.v1.endpoints.user.router import router as user_router
from app.api.v1.endpoints.tests.router import router as tests_router
from app.api.v1.endpoints.gamification.router import router as gamification_router

api_router = APIRouter()


api_router.include_router(user_router, prefix="/users", tags=["users"])
api_router.include_router(tests_router, prefix="/tests", tags=["tests"])
api_router.include_router(gamification_router, prefix="/gamification", tags=["gamification"]) 