from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from .models import OAuthProvider, RoleType

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(min_length=8)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(default=None, min_length=3, max_length=50)
    full_name: Optional[str] = None
    password: Optional[str] = Field(default=None, min_length=8)

class OAuthAccountBase(BaseModel):
    provider: OAuthProvider
    provider_user_id: str
    access_token: str
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None

class UserProfileBase(BaseModel):
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(UserProfileBase):
    pass

class UserInDB(UserBase):
    id: str
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    profile: Optional[UserProfileBase] = None
    oauth_accounts: List[OAuthAccountBase] = []

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: Optional[str] = None

class TokenPayload(BaseModel):
    sub: str
    exp: datetime 

class LeaderboardUser(BaseModel):
    id: str
    rank: int
    name: str
    badges: List[str]
    wpm: float
    accuracy: float
    raw: float
    consistency: float
    date: str
    time: str

    class Config:
        from_attributes = True

class UserCustomizationBase(BaseModel):
    theme: str = "system"
    accent: str = "#3182ce"
    cursor: str = "bar"
    cursor_blink: bool = True
    char_fill: bool = False
    sounds: bool = True
    sound_set: str = "classic"
    volume: int = 50
    font: str = "monospace"
    font_size: int = 18
    key_highlight: bool = False
    on_screen_keyboard: bool = False
    animations: bool = True
    show_stats: bool = True
    show_progress: bool = True

class UserCustomizationCreate(UserCustomizationBase):
    pass

class UserCustomizationUpdate(UserCustomizationBase):
    theme: Optional[str] = None
    accent: Optional[str] = None
    cursor: Optional[str] = None
    cursor_blink: Optional[bool] = None
    char_fill: Optional[bool] = None
    sounds: Optional[bool] = None
    sound_set: Optional[str] = None
    volume: Optional[int] = None
    font: Optional[str] = None
    font_size: Optional[int] = None
    key_highlight: Optional[bool] = None
    on_screen_keyboard: Optional[bool] = None
    animations: Optional[bool] = None
    show_stats: Optional[bool] = None
    show_progress: Optional[bool] = None

class UserCustomizationInDB(UserCustomizationBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 