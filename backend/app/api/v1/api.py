from fastapi import APIRouter
from app.api.v1.endpoints.user.router import router as user_router
from app.api.v1.endpoints.tests.router import router as tests_router

api_router = APIRouter()

# Import and include other routers here
# Example:
# from app.api.v1.endpoints import users, items
# api_router.include_router(users.router, prefix="/users", tags=["users"])
# api_router.include_router(items.router, prefix="/items", tags=["items"])

api_router.include_router(user_router, prefix="/users", tags=["users"])
api_router.include_router(tests_router, prefix="/tests", tags=["tests"]) 