from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, JSON, CheckConstraint, Index
from sqlalchemy.orm import relationship
from datetime import datetime, UTC
from app.db.base import Base

class UserTest(Base):
    __tablename__ = "user_tests"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    wpm = Column(Float, nullable=False)
    raw_wpm = Column(Float, nullable=False) 
    accuracy = Column(Float, nullable=False)
    consistency = Column(Float, nullable=False) 
    test_type = Column(String, nullable=False)
    duration = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(UTC), index=True)
    chars = Column(JSON, nullable=False)  
    restarts = Column(Integer, nullable=False, default=0)  
    char_logs = relationship("UserTestCharLog", back_populates="test", cascade="all, delete-orphan")

    # Add constraints
    __table_args__ = (
        CheckConstraint('wpm >= 0', name='check_wpm_positive'),
        CheckConstraint('raw_wpm >= 0', name='check_raw_wpm_positive'),
        CheckConstraint('accuracy >= 0 AND accuracy <= 100', name='check_accuracy_range'),
        CheckConstraint('consistency >= 0 AND consistency <= 100', name='check_consistency_range'),
        CheckConstraint('duration > 0', name='check_duration_positive'),
        CheckConstraint('restarts >= 0', name='check_restarts_positive'),
    )

class UserTestCharLog(Base):
    __tablename__ = "user_test_char_logs"
    id = Column(String, primary_key=True, index=True)
    test_id = Column(String, ForeignKey("user_tests.id"), nullable=False, index=True)
    char = Column(String, nullable=False)
    attempts = Column(Integer, nullable=False)
    errors = Column(Integer, nullable=False)
    total_time = Column(Integer, nullable=False)  # ms
    test = relationship("UserTest", back_populates="char_logs") 

    # Add constraints and indexes
    __table_args__ = (
        CheckConstraint('attempts >= 0', name='check_attempts_positive'),
        CheckConstraint('errors >= 0', name='check_errors_positive'),
        CheckConstraint('total_time >= 0', name='check_total_time_positive'),
        CheckConstraint('attempts >= errors', name='check_attempts_gte_errors'),
        Index('ix_user_test_char_logs_test_char', 'test_id', 'char'),  # Composite index for faster lookups
    ) 