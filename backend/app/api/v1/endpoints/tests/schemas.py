from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserTestCharLogCreate(BaseModel):
    char: str
    attempts: int
    errors: int
    total_time: int

class UserTestCreate(BaseModel):
    wpm: float
    accuracy: float
    test_type: str
    duration: int
    char_logs: List[UserTestCharLogCreate]
    timestamp: Optional[datetime] = None

class UserTestCharLogRead(UserTestCharLogCreate):
    id: str
    test_id: str

class UserTestRead(UserTestCreate):
    id: str
    user_id: str
    timestamp: datetime
    char_logs: List[UserTestCharLogRead] 