import math
from typing import Dict, Tuple, Optional
from sqlalchemy.orm import Session
from datetime import datetime
from app.api.v1.endpoints.gamification.repository import GamificationRepository
from app.api.v1.endpoints.gamification import schemas


class GamificationService:
    def __init__(self, db: Session):
        self.repository = GamificationRepository(db)
        self.db = db

    # Level progression table (total XP required for each level)
    LEVEL_XP_TABLE = [
        0,      # Level 1: 0 XP
        100,    # Level 2: 100 XP
        250,    # Level 3: 250 XP
        450,    # Level 4: 450 XP
        700,    # Level 5: 700 XP
        1000,   # Level 6: 1000 XP
        1350,   # Level 7: 1350 XP
        1750,   # Level 8: 1750 XP
        2200,   # Level 9: 2200 XP
        2700,   # Level 10: 2700 XP
        3300,   # Level 11: 3300 XP
        4000,   # Level 12: 4000 XP
        4800,   # Level 13: 4800 XP
        5700,   # Level 14: 5700 XP
        6700,   # Level 15: 6700 XP
        7800,   # Level 16: 7800 XP
        9000,   # Level 17: 9000 XP
        10300,  # Level 18: 10300 XP
        11700,  # Level 19: 11700 XP
        13200,  # Level 20: 13200 XP
        15000,  # Level 21: 15000 XP
        17000,  # Level 22: 17000 XP
        19500,  # Level 23: 19500 XP
        22500,  # Level 24: 22500 XP
        26000,  # Level 25: 26000 XP
        30000,  # Level 26: 30000 XP
        35000,  # Level 27: 35000 XP
        41000,  # Level 28: 41000 XP
        48000,  # Level 29: 48000 XP
        56000,  # Level 30: 56000 XP
        65000,  # Level 31-40 continue exponential growth
        75000, 85000, 96000, 108000, 121000, 135000, 150000, 166000, 183000,
        201000,  # Level 40
        225000, 250000, 275000, 300000, 330000, 365000, 405000, 450000, 500000,
        555000   # Level 50: 555000 XP (endgame)
    ]
    
    def get_xp_for_level(self, level: int) -> int:
        """Get total XP required to reach a specific level."""
        if level <= 0:
            return 0
        if level <= len(self.LEVEL_XP_TABLE):
            return self.LEVEL_XP_TABLE[level - 1]
        
        # For levels beyond our table, use exponential growth
        base_xp = self.LEVEL_XP_TABLE[-1]
        extra_levels = level - len(self.LEVEL_XP_TABLE)
        return base_xp + (extra_levels * 75000)  # 75k XP per level beyond 50

    def calculate_level_from_xp(self, total_xp: int) -> int:
        """Calculate user's level based on total XP."""
        for level in range(1, len(self.LEVEL_XP_TABLE) + 1):
            if total_xp < self.get_xp_for_level(level + 1):
                return level
        
        # For XP beyond our table
        excess_xp = total_xp - self.LEVEL_XP_TABLE[-1]
        extra_levels = excess_xp // 75000
        return len(self.LEVEL_XP_TABLE) + extra_levels

    def calculate_xp_from_test(
        self,
        wpm: int,
        accuracy: float,
        difficulty: str,
        total_characters: int,
        current_streak: int
    ) -> schemas.XPBreakdown:
        """
        Calculate XP breakdown from a completed test using the refined formula.
        """
        # Base XP
        base_xp = 10
        
        # WPM Bonus (capped at 120 WPM, 0.8 multiplier)
        clamped_wpm = min(wpm, 120)
        wpm_bonus = math.floor(clamped_wpm * 0.8)
        
        # Accuracy Bonus (every 5% gives +2 XP)
        accuracy_bonus = math.floor(accuracy / 5) * 2
        
        # Difficulty Bonus
        difficulty_map = {"easy": 0, "medium": 10, "hard": 20}
        difficulty_bonus = difficulty_map.get(difficulty.lower(), 0)
        
        # Length Bonus (every 100 characters gives +1 XP)
        length_bonus = math.floor(total_characters / 100)
        
        # Streak Bonus (+5 XP per consecutive day)
        streak_bonus = current_streak * 5 if current_streak > 0 else 0
        
        # Calculate total
        total_xp = (
            base_xp + 
            wpm_bonus + 
            accuracy_bonus + 
            difficulty_bonus + 
            length_bonus + 
            streak_bonus
        )
        
        return schemas.XPBreakdown(
            base_xp=base_xp,
            wpm_bonus=wpm_bonus,
            accuracy_bonus=accuracy_bonus,
            difficulty_bonus=difficulty_bonus,
            length_bonus=length_bonus,
            streak_bonus=streak_bonus,
            total_xp=total_xp
        )

    def process_test_completion(
        self,
        user_id: str,
        test_id: int,
        wpm: int,
        accuracy: float,
        difficulty: str,
        duration_seconds: int,
        word_count: int,
        character_count: int,
        test_date: datetime
    ) -> schemas.LevelUpResponse:
        """
        Process a completed test and award XP, update stats, and check for level up.
        """
        # Get or update user's streak
        stats = self.repository.update_streak(user_id, test_date)
        
        # Update test completion stats
        self.repository.update_test_completion_stats(
            user_id=user_id,
            wpm=wpm,
            accuracy=int(accuracy),
            duration_seconds=duration_seconds,
            word_count=word_count,
            character_count=character_count
        )
        
        # Calculate XP
        xp_breakdown = self.calculate_xp_from_test(
            wpm=wpm,
            accuracy=accuracy,
            difficulty=difficulty,
            total_characters=character_count,
            current_streak=stats.current_streak
        )
        
        # Get user's level before XP award
        level_info_before = self.repository.get_user_level_info(user_id)
        old_level = level_info_before["current_level"]
        
        # Award XP to user
        self.repository.add_xp_to_user(user_id, xp_breakdown.total_xp)
        
        # Create XP log
        xp_log_data = schemas.XPLogCreate(
            user_id=user_id,
            test_id=test_id,
            xp_earned=xp_breakdown.total_xp,
            base_xp=xp_breakdown.base_xp,
            wpm_bonus=xp_breakdown.wpm_bonus,
            accuracy_bonus=xp_breakdown.accuracy_bonus,
            difficulty_bonus=xp_breakdown.difficulty_bonus,
            length_bonus=xp_breakdown.length_bonus,
            streak_bonus=xp_breakdown.streak_bonus,
            reason="test_completion",
            details=f"Test ID: {test_id}, WPM: {wpm}, Accuracy: {accuracy:.1f}%"
        )
        self.repository.create_xp_log(xp_log_data)
        
        # Get user's level after XP award
        level_info_after = self.repository.get_user_level_info(user_id)
        new_level = level_info_after["current_level"]
        
        # Check if user leveled up
        leveled_up = new_level > old_level
        
        return schemas.LevelUpResponse(
            leveled_up=leveled_up,
            old_level=old_level,
            new_level=new_level,
            xp_breakdown=xp_breakdown,
            user_level_info=schemas.UserLevelInfo(**level_info_after)
        )

    def get_user_gamification_summary(self, user_id: str) -> schemas.UserGamificationSummary:
        """Get complete gamification summary for a user."""
        # Get level info
        level_info_dict = self.repository.get_user_level_info(user_id)
        if not level_info_dict:
            raise ValueError(f"User {user_id} not found")
        
        level_info = schemas.UserLevelInfo(**level_info_dict)
        
        # Get game stats
        game_stats = self.repository.get_or_create_user_stats(user_id)
        game_stats_schema = schemas.UserGameStatsRead.model_validate(game_stats)
        
        # Get recent XP logs
        recent_logs = self.repository.get_user_xp_logs(user_id, limit=10)
        recent_logs_schema = [schemas.XPLogRead.model_validate(log) for log in recent_logs]
        
        return schemas.UserGamificationSummary(
            level_info=level_info,
            game_stats=game_stats_schema,
            recent_xp_logs=recent_logs_schema
        ) 