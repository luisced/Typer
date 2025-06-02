from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, JSON
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
    timestamp = Column(DateTime, default=lambda: datetime.now(UTC))
    chars = Column(JSON, nullable=False)  
    restarts = Column(Integer, nullable=False, default=0)  
    char_logs = relationship("UserTestCharLog", back_populates="test", cascade="all, delete-orphan")

class UserTestCharLog(Base):
    __tablename__ = "user_test_char_logs"
    id = Column(String, primary_key=True, index=True)
    test_id = Column(String, ForeignKey("user_tests.id"), nullable=False, index=True)
    char = Column(String, nullable=False)
    attempts = Column(Integer, nullable=False)
    errors = Column(Integer, nullable=False)
    total_time = Column(Integer, nullable=False)  # ms
    test = relationship("UserTest", back_populates="char_logs") 