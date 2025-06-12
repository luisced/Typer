from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.api import api_router
from app.core.database import Base, engine
from app.api.v1.endpoints.gamification.service import GamificationService
from app.db.session import SessionLocal

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for the Typer application",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def startup_event():
    """Initialize application data on startup."""
    db = SessionLocal()
    try:
        # Initialize default badges
        gamification_service = GamificationService(db)
        gamification_service.initialize_default_badges()
    finally:
        db.close()

@app.get("/")
async def root():
    return {
        "message": "Welcome to Typer API",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 