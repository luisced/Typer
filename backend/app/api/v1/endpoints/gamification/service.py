import math
from typing import Dict, Tuple, Optional, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from datetime import datetime, UTC, timedelta
from app.api.v1.endpoints.gamification.repository import GamificationRepository
from app.api.v1.endpoints.gamification import schemas
from .models import XPLog, UserGameStats, Badge, UserBadge
from app.api.v1.endpoints.user.models import User


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
        
        # Check and award badges
        new_badges = self.check_and_award_badges(user_id, test_id)
        
        return schemas.LevelUpResponse(
            leveled_up=leveled_up,
            old_level=old_level,
            new_level=new_level,
            xp_breakdown=xp_breakdown,
            user_level_info=schemas.UserLevelInfo(**level_info_after),
            new_badges=new_badges
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
        
        # Get recent badges (last 5 earned)
        user_badges = self.db.query(UserBadge).filter(
            UserBadge.user_id == user_id
        ).order_by(UserBadge.earned_at.desc()).limit(5).all()
        
        recent_badges = []
        for ub in user_badges:
            badge = self.db.query(Badge).filter(Badge.id == ub.badge_id).first()
            if badge:
                recent_badges.append(schemas.UserBadgeRead(
                    badge=schemas.BadgeRead.model_validate(badge),
                    earned_at=ub.earned_at
                ))
        
        # Get total badge count
        badge_count = self.db.query(UserBadge).filter(UserBadge.user_id == user_id).count()
        
        return schemas.UserGamificationSummary(
            level_info=level_info,
            game_stats=game_stats_schema,
            recent_xp_logs=recent_logs_schema,
            recent_badges=recent_badges,
            badge_count=badge_count
        )

    # Badge-related methods
    def check_and_award_badges(self, user_id: str, test_id: Optional[str] = None) -> List[schemas.UserBadgeRead]:
        """Check all badge criteria and award new badges."""
        new_badges = []
        
        # Get user stats
        user = self.db.query(User).filter(User.id == user_id).first()
        game_stats = self.db.query(UserGameStats).filter(UserGameStats.user_id == user_id).first()
        
        if not user or not game_stats:
            return new_badges
        
        # Check each badge type
        new_badges.extend(self._check_test_count_badges(user_id, game_stats))
        new_badges.extend(self._check_speed_badges(user_id, game_stats))
        new_badges.extend(self._check_accuracy_badges(user_id, game_stats))
        new_badges.extend(self._check_streak_badges(user_id, game_stats))
        new_badges.extend(self._check_xp_level_badges(user_id, user))
        
        return new_badges

    def _check_test_count_badges(self, user_id: str, game_stats: UserGameStats) -> List[schemas.UserBadgeRead]:
        """Check badges based on test completion count."""
        badges_to_check = [
            ("first_test", 1),
            ("novice_typist", 10),
            ("experienced_typist", 50),
            ("expert_typist", 100),
            ("master_typist", 500),
            ("legendary_typist", 1000),
        ]
        
        return self._award_badges_by_criteria(user_id, badges_to_check, game_stats.total_tests_completed)

    def _check_speed_badges(self, user_id: str, game_stats: UserGameStats) -> List[schemas.UserBadgeRead]:
        """Check badges based on speed achievements."""
        badges_to_check = [
            ("speed_30", 30),
            ("speed_50", 50),
            ("speed_70", 70),
            ("speed_100", 100),
            ("speed_demon", 120),
        ]
        
        return self._award_badges_by_criteria(user_id, badges_to_check, game_stats.best_wpm)

    def _check_accuracy_badges(self, user_id: str, game_stats: UserGameStats) -> List[schemas.UserBadgeRead]:
        """Check badges based on accuracy achievements."""
        badges_to_check = [
            ("accuracy_95", 95),
            ("accuracy_98", 98),
            ("accuracy_99", 99),
            ("perfect_accuracy", 100),
        ]
        
        return self._award_badges_by_criteria(user_id, badges_to_check, game_stats.best_accuracy)

    def _check_streak_badges(self, user_id: str, game_stats: UserGameStats) -> List[schemas.UserBadgeRead]:
        """Check badges based on streak achievements."""
        badges_to_check = [
            ("streak_3", 3),
            ("streak_7", 7),
            ("streak_14", 14),
            ("streak_30", 30)
        ]
        
        return self._award_badges_by_criteria(user_id, badges_to_check, game_stats.max_streak)

    def _check_xp_level_badges(self, user_id: str, user: User) -> List[schemas.UserBadgeRead]:
        """Check badges based on XP and level achievements."""
        xp_badges = [
            ("xp_1000", 1000),
            ("xp_5000", 5000),
            ("xp_10000", 10000),
            ("xp_25000", 25000)
        ]
        
        level_badges = [
            ("level_5", 5),
            ("level_10", 10),
            ("level_20", 20),
            ("level_50", 50)
        ]
        
        new_badges = []
        new_badges.extend(self._award_badges_by_criteria(user_id, xp_badges, user.total_xp or 0))
        new_badges.extend(self._award_badges_by_criteria(user_id, level_badges, user.level or 1))
        
        return new_badges

    def _award_badges_by_criteria(self, user_id: str, badges_to_check: List[tuple], current_value: int) -> List[schemas.UserBadgeRead]:
        """Helper method to award badges based on numeric criteria."""
        new_badges = []
        
        for badge_code, threshold in badges_to_check:
            if current_value >= threshold:
                badge = self._award_badge_if_not_exists(user_id, badge_code)
                if badge:
                    new_badges.append(badge)
        
        return new_badges

    def _award_badge_if_not_exists(self, user_id: str, badge_code: str) -> Optional[schemas.UserBadgeRead]:
        """Award a badge if the user doesn't already have it."""
        # Check if badge exists
        badge = self.db.query(Badge).filter(Badge.code == badge_code).first()
        if not badge:
            return None
        
        # Check if user already has this badge
        existing_user_badge = self.db.query(UserBadge).filter(
            and_(UserBadge.user_id == user_id, UserBadge.badge_id == badge.id)
        ).first()
        
        if existing_user_badge:
            return None
        
        # Award the badge
        user_badge = UserBadge(
            user_id=user_id,
            badge_id=badge.id,
            earned_at=datetime.now(UTC)
        )
        self.db.add(user_badge)
        self.db.commit()  # Commit the badge award
        self.db.refresh(user_badge)
        
        return schemas.UserBadgeRead(
            badge=schemas.BadgeRead.model_validate(badge),
            earned_at=user_badge.earned_at
        )

    def get_all_badges_for_user(self, user_id: str) -> List[schemas.BadgeWithEarnedStatus]:
        """Get all badges with earned status for a user."""
        # Get all badges
        all_badges = self.db.query(Badge).all()
        
        # Get user's earned badges
        user_badges = self.db.query(UserBadge).filter(UserBadge.user_id == user_id).all()
        user_badge_dict = {ub.badge_id: ub.earned_at for ub in user_badges}
        
        result = []
        for badge in all_badges:
            earned_at = user_badge_dict.get(badge.id)
            result.append(schemas.BadgeWithEarnedStatus(
                id=badge.id,
                code=badge.code,
                name=badge.name,
                description=badge.description,
                tier=badge.tier,
                icon_url=badge.icon_url,
                earned=earned_at is not None,
                earned_at=earned_at
            ))
        
        return result

    def create_badge(self, badge_code: str, name: str, description: str, tier: str, icon_url: Optional[str] = None) -> Badge:
        """Create a new badge."""
        badge = Badge(
            code=badge_code,
            name=name,
            description=description,
            tier=tier,
            icon_url=icon_url
        )
        self.db.add(badge)
        self.db.commit()
        return badge

    def initialize_default_badges(self):
        """Initialize default badges if they don't exist."""
        default_badges = [
            # Test count badges
            ("first_test", "First Steps", "Complete your very first typing test", "Common", "🎯"),
            ("novice_typist", "Novice Typist", "Complete 10 typing tests", "Common", "📝"),
            ("experienced_typist", "Experienced Typist", "Complete 50 typing tests", "Uncommon", "⌨️"),
            ("expert_typist", "Expert Typist", "Complete 100 typing tests", "Rare", "🎖️"),
            ("master_typist", "Master Typist", "Complete 500 typing tests", "Rare", "👑"),
            ("legendary_typist", "Legendary Typist", "Complete 1000 typing tests", "Legendary", "🏆"),
            
            # Speed badges
            ("speed_30", "Getting Faster", "Achieve 30+ WPM", "Common", "🚀"),
            ("speed_50", "Speed Demon", "Achieve 50+ WPM", "Uncommon", "⚡"),
            ("speed_70", "Lightning Fingers", "Achieve 70+ WPM", "Rare", "⚡⚡"),
            ("speed_100", "Supersonic", "Achieve 100+ WPM", "Rare", "💨"),
            ("speed_demon", "Speed of Light", "Achieve 120+ WPM", "Legendary", "🌟"),
            
            # Accuracy badges
            ("accuracy_95", "Accurate Typist", "Achieve 95%+ accuracy", "Common", "🎯"),
            ("accuracy_98", "Precision Master", "Achieve 98%+ accuracy", "Uncommon", "🔍"),
            ("accuracy_99", "Near Perfect", "Achieve 99%+ accuracy", "Rare", "💎"),
            ("perfect_accuracy", "Perfectionist", "Achieve 100% accuracy", "Legendary", "⭐"),
            
            # Streak badges
            ("streak_3", "Getting Consistent", "Maintain a 3-day streak", "Common", "🔥"),
            ("streak_7", "Week Warrior", "Maintain a 7-day streak", "Uncommon", "🔥🔥"),
            ("streak_14", "Dedicated Typist", "Maintain a 14-day streak", "Rare", "🔥🔥🔥"),
            ("streak_30", "Unstoppable", "Maintain a 30-day streak", "Legendary", "🔥👑"),
            
            # XP badges
            ("xp_1000", "XP Collector", "Earn 1,000 total XP", "Common", "⭐"),
            ("xp_5000", "XP Hunter", "Earn 5,000 total XP", "Uncommon", "🌟"),
            ("xp_10000", "XP Master", "Earn 10,000 total XP", "Rare", "💫"),
            ("xp_25000", "XP Legend", "Earn 25,000 total XP", "Legendary", "✨"),
            
            # Level badges
            ("level_5", "Rising Star", "Reach level 5", "Common", "📈"),
            ("level_10", "Skilled Typist", "Reach level 10", "Uncommon", "📊"),
            ("level_20", "Advanced Typist", "Reach level 20", "Rare", "📋"),
            ("level_50", "Typing Master", "Reach level 50", "Legendary", "🏅")
        ]
        
        for badge_code, name, description, tier, icon_url in default_badges:
            existing = self.db.query(Badge).filter(Badge.code == badge_code).first()
            if not existing:
                self.create_badge(badge_code, name, description, tier, icon_url) 