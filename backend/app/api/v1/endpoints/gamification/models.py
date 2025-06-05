from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime, UTC
from app.db.base import Base


class XPLog(Base):
    """
    Track individual XP gains to provide transparency and history.
    """
    __tablename__ = "xp_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    test_id = Column(String, ForeignKey("user_tests.id"), nullable=True, index=True)  # Changed from Integer to String for UUID
    
    # XP breakdown
    xp_earned = Column(Integer, nullable=False)
    base_xp = Column(Integer, default=0)
    wpm_bonus = Column(Integer, default=0)
    accuracy_bonus = Column(Integer, default=0)
    difficulty_bonus = Column(Integer, default=0)
    length_bonus = Column(Integer, default=0)
    streak_bonus = Column(Integer, default=0)
    
    # Context
    reason = Column(String(100), nullable=False)  # e.g., "test_completion", "daily_bonus"
    details = Column(Text, nullable=True)  # JSON string for additional details
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    
    # Relationships
    user = relationship("User", back_populates="xp_logs")
    test = relationship("UserTest", back_populates="xp_logs")


class UserGameStats(Base):
    """
    Additional gamification statistics for users.
    """
    __tablename__ = "user_game_stats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    
    # Streak tracking
    current_streak = Column(Integer, default=0)
    max_streak = Column(Integer, default=0)
    last_test_date = Column(DateTime, nullable=True)
    
    # Achievement tracking
    total_tests_completed = Column(Integer, default=0)
    total_words_typed = Column(Integer, default=0)
    total_characters_typed = Column(Integer, default=0)
    
    # Best records
    best_wpm = Column(Integer, default=0)
    best_accuracy = Column(Integer, default=0)
    
    # Time tracking
    total_typing_time_seconds = Column(Integer, default=0)  # Total time spent typing
    
    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))
    
    # Relationships
    user = relationship("User", back_populates="game_stats") 