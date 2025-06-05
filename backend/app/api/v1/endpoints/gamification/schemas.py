from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class XPBreakdown(BaseModel):
    """
    Breakdown of XP earned from a single action.
    """
    base_xp: int
    wpm_bonus: int
    accuracy_bonus: int
    difficulty_bonus: int
    length_bonus: int
    streak_bonus: int
    total_xp: int


class UserLevelInfo(BaseModel):
    """
    User's current level and XP information.
    """
    user_id: str
    current_xp: int
    current_level: int
    xp_for_current_level: int  # XP required to reach current level
    xp_for_next_level: int     # XP required to reach next level
    xp_progress_in_level: int  # XP earned within current level
    xp_needed_for_next: int    # XP still needed for next level


class UserGameStatsRead(BaseModel):
    """
    User's gamification statistics.
    """
    user_id: str
    current_streak: int
    max_streak: int
    last_test_date: Optional[datetime]
    total_tests_completed: int
    total_words_typed: int
    total_characters_typed: int
    best_wpm: int
    best_accuracy: int
    total_typing_time_seconds: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class XPLogRead(BaseModel):
    """
    XP log entry for reading.
    """
    id: int
    user_id: str
    test_id: Optional[str]
    xp_earned: int
    base_xp: int
    wpm_bonus: int
    accuracy_bonus: int
    difficulty_bonus: int
    length_bonus: int
    streak_bonus: int
    reason: str
    details: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class XPLogCreate(BaseModel):
    """
    Data for creating an XP log entry.
    """
    user_id: str
    test_id: Optional[str] = None
    xp_earned: int
    base_xp: int = 0
    wpm_bonus: int = 0
    accuracy_bonus: int = 0
    difficulty_bonus: int = 0
    length_bonus: int = 0
    streak_bonus: int = 0
    reason: str
    details: Optional[str] = None


class LevelUpResponse(BaseModel):
    """
    Response when user levels up.
    """
    leveled_up: bool
    old_level: int
    new_level: int
    xp_breakdown: XPBreakdown
    user_level_info: UserLevelInfo


class UserGamificationSummary(BaseModel):
    """
    Complete gamification summary for a user.
    """
    level_info: UserLevelInfo
    game_stats: UserGameStatsRead
    recent_xp_logs: List[XPLogRead] 