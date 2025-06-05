from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import datetime, timezone, UTC
from app.api.v1.endpoints.gamification.models import XPLog, UserGameStats
from app.api.v1.endpoints.gamification import schemas
from app.api.v1.endpoints.user.models import User


class GamificationRepository:
    def __init__(self, db: Session):
        self.db = db

    # XP Log operations
    def create_xp_log(self, xp_log_data: schemas.XPLogCreate) -> XPLog:
        """Create a new XP log entry."""
        xp_log = XPLog(**xp_log_data.model_dump())
        self.db.add(xp_log)
        self.db.commit()
        self.db.refresh(xp_log)
        return xp_log

    def get_user_xp_logs(
        self, 
        user_id: str, 
        limit: int = 50, 
        offset: int = 0
    ) -> List[XPLog]:
        """Get XP logs for a user, ordered by most recent."""
        return (
            self.db.query(XPLog)
            .filter(XPLog.user_id == user_id)
            .order_by(desc(XPLog.created_at))
            .offset(offset)
            .limit(limit)
            .all()
        )

    def get_user_total_xp(self, user_id: str) -> int:
        """Calculate total XP earned by a user."""
        result = (
            self.db.query(func.sum(XPLog.xp_earned))
            .filter(XPLog.user_id == user_id)
            .scalar()
        )
        return result or 0

    # User Game Stats operations
    def get_or_create_user_stats(self, user_id: str) -> UserGameStats:
        """Get user game stats, create if doesn't exist."""
        stats = self.db.query(UserGameStats).filter(
            UserGameStats.user_id == user_id
        ).first()
        
        if not stats:
            stats = UserGameStats(user_id=user_id)
            self.db.add(stats)
            self.db.commit()
            self.db.refresh(stats)
        
        return stats

    def update_user_stats(
        self, 
        user_id: str, 
        **updates
    ) -> UserGameStats:
        """Update user game stats."""
        stats = self.get_or_create_user_stats(user_id)
        
        for key, value in updates.items():
            if hasattr(stats, key):
                setattr(stats, key, value)
        
        self.db.commit()
        self.db.refresh(stats)
        return stats

    def update_streak(self, user_id: str, test_date: datetime) -> UserGameStats:
        """Update user's streak based on test date."""
        stats = self.get_or_create_user_stats(user_id)
        
        # Convert to UTC if timezone-aware
        if test_date.tzinfo is not None:
            test_date_utc = test_date.astimezone(timezone.utc).replace(tzinfo=None)
        else:
            test_date_utc = test_date
        
        # Check if this is a new day
        if stats.last_test_date:
            last_date_utc = stats.last_test_date
            if last_date_utc.tzinfo is not None:
                last_date_utc = last_date_utc.astimezone(timezone.utc).replace(tzinfo=None)
            
            days_diff = (test_date_utc.date() - last_date_utc.date()).days
            
            if days_diff == 0:
                # Same day, no streak change
                pass
            elif days_diff == 1:
                # Consecutive day, increment streak
                stats.current_streak += 1
                stats.max_streak = max(stats.max_streak, stats.current_streak)
            else:
                # Gap in days, reset streak
                stats.current_streak = 1
        else:
            # First test ever
            stats.current_streak = 1
            stats.max_streak = 1
        
        stats.last_test_date = test_date
        self.db.commit()
        self.db.refresh(stats)
        return stats

    def update_test_completion_stats(
        self, 
        user_id: str, 
        wpm: int, 
        accuracy: int, 
        duration_seconds: int,
        word_count: int,
        character_count: int
    ) -> UserGameStats:
        """Update stats after test completion."""
        stats = self.get_or_create_user_stats(user_id)
        
        # Increment counters
        stats.total_tests_completed += 1
        stats.total_words_typed += word_count
        stats.total_characters_typed += character_count
        stats.total_typing_time_seconds += duration_seconds
        
        # Update best records
        stats.best_wpm = max(stats.best_wpm, wpm)
        stats.best_accuracy = max(stats.best_accuracy, accuracy)
        
        self.db.commit()
        self.db.refresh(stats)
        return stats

    # User XP and Level operations
    def add_xp_to_user(self, user_id: str, xp_amount: int) -> User:
        """Add XP to user and update their total."""
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            if not hasattr(user, 'total_xp') or user.total_xp is None:
                user.total_xp = 0
            if not hasattr(user, 'level') or user.level is None:
                user.level = 1
            
            user.total_xp += xp_amount
            self.db.commit()
            self.db.refresh(user)
        return user

    def get_user_level_info(self, user_id: str) -> Optional[dict]:
        """Get comprehensive level information for a user."""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        # Ensure user has XP and level
        if not hasattr(user, 'total_xp') or user.total_xp is None:
            user.total_xp = 0
        if not hasattr(user, 'level') or user.level is None:
            user.level = 1
            self.db.commit()
            self.db.refresh(user)
        
        from app.api.v1.endpoints.gamification.service import GamificationService
        service = GamificationService(self.db)
        
        current_level = service.calculate_level_from_xp(user.total_xp)
        xp_for_current = service.get_xp_for_level(current_level)
        xp_for_next = service.get_xp_for_level(current_level + 1)
        
        return {
            "user_id": user_id,
            "current_xp": user.total_xp,
            "current_level": current_level,
            "xp_for_current_level": xp_for_current,
            "xp_for_next_level": xp_for_next,
            "xp_progress_in_level": user.total_xp - xp_for_current,
            "xp_needed_for_next": xp_for_next - user.total_xp
        } 