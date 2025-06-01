from fastapi import APIRouter
from .endpoints.user.router import router as user_router

api_router = APIRouter()

# Import and include other routers here
# Example:
# from app.api.v1.endpoints import users, items
# api_router.include_router(users.router, prefix="/users", tags=["users"])
# api_router.include_router(items.router, prefix="/items", tags=["items"])

api_router.include_router(user_router, prefix="/users", tags=["users"]) 