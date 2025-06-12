from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class XPBreakdown(BaseModel):
    """
    Breakdown of XP earned from a single action.
    """
    base_xp: int = Field(..., description="Base XP for test completion")
    wpm_bonus: int = Field(default=0, description="Bonus XP for WPM performance")
    accuracy_bonus: int = Field(default=0, description="Bonus XP for accuracy")
    difficulty_bonus: int = Field(default=0, description="Bonus XP for difficulty level")
    length_bonus: int = Field(default=0, description="Bonus XP for test length")
    streak_bonus: int = Field(default=0, description="Bonus XP for maintaining streak")
    total_xp: int = Field(..., description="Total XP earned")


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
    test_id: Optional[str] = None
    xp_earned: int
    base_xp: int
    wpm_bonus: int
    accuracy_bonus: int
    difficulty_bonus: int
    length_bonus: int
    streak_bonus: int
    reason: str
    details: Optional[str] = None
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


class BadgeRead(BaseModel):
    """Badge information schema."""
    id: int
    code: str
    name: str
    description: str
    tier: str  # "Common", "Uncommon", "Rare", "Legendary"
    icon_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserBadgeRead(BaseModel):
    """User badge relationship schema."""
    badge: BadgeRead
    earned_at: datetime

    class Config:
        from_attributes = True


class BadgeWithEarnedStatus(BaseModel):
    """Badge with earned status for display."""
    id: int
    code: str
    name: str
    description: str
    tier: str
    icon_url: Optional[str] = None
    earned: bool
    earned_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LevelUpResponse(BaseModel):
    """Response for level up events."""
    leveled_up: bool
    old_level: int
    new_level: int
    xp_breakdown: XPBreakdown
    user_level_info: UserLevelInfo
    new_badges: List[UserBadgeRead] = Field(default_factory=list, description="Newly earned badges")

    class Config:
        from_attributes = True


class UserGamificationSummary(BaseModel):
    """
    Complete gamification summary for a user.
    """
    level_info: UserLevelInfo
    game_stats: UserGameStatsRead
    recent_xp_logs: List[XPLogRead] 
    recent_badges: List[UserBadgeRead] = Field(default_factory=list, description="Last 5 badges earned")
    badge_count: int = Field(..., description="Total number of badges earned")

    class Config:
        from_attributes = True


class BadgeCreate(BaseModel):
    """Schema for creating a new badge."""
    code: str = Field(..., description="Unique badge code")
    name: str = Field(..., description="Badge display name")
    description: str = Field(..., description="Badge description")
    tier: str = Field(..., description="Badge tier")
    icon_url: Optional[str] = None


class BadgeUpdate(BaseModel):
    """Schema for updating badge information."""
    name: Optional[str] = None
    description: Optional[str] = None
    tier: Optional[str] = None
    icon_url: Optional[str] = None 