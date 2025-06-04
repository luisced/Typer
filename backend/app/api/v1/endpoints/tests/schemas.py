from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class UserTestCharLogCreate(BaseModel):
    char: str
    attempts: int
    errors: int
    total_time: int

class UserTestCreate(BaseModel):
    wpm: float
    raw_wpm: float
    accuracy: float
    consistency: float
    test_type: str
    duration: int
    char_logs: List[UserTestCharLogCreate]
    timestamp: Optional[datetime] = None
    chars: Dict[str, int]
    restarts: int = 0

class UserTestCharLogRead(UserTestCharLogCreate):
    id: str
    test_id: str

class UserTestRead(UserTestCreate):
    id: str
    user_id: str
    timestamp: datetime
    char_logs: List[UserTestCharLogRead]

class TestContent(BaseModel):
    content: str
    type: str  # "words" or "sentences" 