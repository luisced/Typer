from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.v1.endpoints.user.models import User
from app.core.deps import get_current_user
from app.api.v1.endpoints.gamification import schemas
from app.api.v1.endpoints.gamification.service import GamificationService

router = APIRouter()


@router.get("/me/level", response_model=schemas.UserLevelInfo)
def get_my_level_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's level and XP information."""
    service = GamificationService(db)
    level_info_dict = service.repository.get_user_level_info(current_user.id)
    
    if not level_info_dict:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User level information not found"
        )
    
    return schemas.UserLevelInfo(**level_info_dict)


@router.get("/me/stats", response_model=schemas.UserGameStatsRead)
def get_my_game_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's gamification statistics."""
    service = GamificationService(db)
    stats = service.repository.get_or_create_user_stats(current_user.id)
    return schemas.UserGameStatsRead.model_validate(stats)


@router.get("/me/xp-logs", response_model=List[schemas.XPLogRead])
def get_my_xp_logs(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's XP logs."""
    if limit > 100:
        limit = 100  # Cap limit to prevent abuse
    
    service = GamificationService(db)
    logs = service.repository.get_user_xp_logs(current_user.id, limit, offset)
    return [schemas.XPLogRead.model_validate(log) for log in logs]


@router.get("/me/summary", response_model=schemas.UserGamificationSummary)
def get_my_gamification_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive gamification summary for current user."""
    service = GamificationService(db)
    try:
        return service.get_user_gamification_summary(current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/users/{user_id}/level", response_model=schemas.UserLevelInfo)
def get_user_level_info(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get any user's level and XP information (public endpoint)."""
    service = GamificationService(db)
    level_info_dict = service.repository.get_user_level_info(user_id)
    
    if not level_info_dict:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return schemas.UserLevelInfo(**level_info_dict)


@router.get("/users/{user_id}/stats", response_model=schemas.UserGameStatsRead)
def get_user_game_stats(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get any user's gamification statistics (public endpoint)."""
    service = GamificationService(db)
    stats = service.repository.get_or_create_user_stats(user_id)
    return schemas.UserGameStatsRead.model_validate(stats)


@router.get("/leaderboard/level", response_model=List[schemas.UserLevelInfo])
def get_level_leaderboard(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get leaderboard by user level."""
    if limit > 100:
        limit = 100
    
    # Note: This would require a more complex query to get top users by level/XP
    # For now, return empty list - this can be implemented later
    return []


@router.get("/levels/progression")
def get_level_progression():
    """Get the level progression table (XP requirements for each level)."""
    service = GamificationService(None)  # No DB needed for this
    
    progression = []
    for level in range(1, min(51, len(service.LEVEL_XP_TABLE) + 1)):
        xp_for_level = service.get_xp_for_level(level)
        xp_for_next = service.get_xp_for_level(level + 1)
        
        progression.append({
            "level": level,
            "total_xp_required": xp_for_level,
            "xp_for_next_level": xp_for_next - xp_for_level,
            "is_max_level": level >= len(service.LEVEL_XP_TABLE)
        })
    
    return {
        "progression": progression,
        "max_tracked_level": len(service.LEVEL_XP_TABLE),
        "xp_per_level_beyond_max": 75000
    } 