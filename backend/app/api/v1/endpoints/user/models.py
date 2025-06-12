from sqlalchemy import Boolean, Column, String, DateTime, ForeignKey, Enum, Table, Integer, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, UTC
import enum
import uuid
from app.db.base import Base
from app.core.security import verify_password

class OAuthProvider(str, enum.Enum):
    GOOGLE = "google"
    GITHUB = "github"
    FACEBOOK = "facebook"
    LOCAL = "local"

class RoleType(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"

class Role(Base):
    __tablename__ = "roles"

    id = Column(String, primary_key=True, index=True)
    name = Column(Enum(RoleType), unique=True, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))

# Association tables
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", String, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("assigned_at", DateTime, default=lambda: datetime.now(UTC))
)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Nullable for OAuth users
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))
    last_login = Column(DateTime, nullable=True)
    
    # OAuth related fields
    oauth_accounts = relationship("OAuthAccount", back_populates="user", cascade="all, delete-orphan")
    
    # Profile related fields
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    # Role related fields
    roles = relationship("Role", secondary=user_roles, lazy="joined")

    # Customization related fields
    customization = relationship("UserCustomization", back_populates="user", uselist=False, cascade="all, delete-orphan")

    # Gamification related fields
    total_xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    xp_logs = relationship("XPLog", back_populates="user", cascade="all, delete-orphan")
    user_badges = relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")
    game_stats = relationship("UserGameStats", back_populates="user", uselist=False, cascade="all, delete-orphan")

    def verify_password(self, password: str) -> bool:
        """Verify the password against the hashed password."""
        if not self.hashed_password:
            return False
        return verify_password(password, self.hashed_password)

class OAuthAccount(Base):
    __tablename__ = "oauth_accounts"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider = Column(Enum(OAuthProvider), nullable=False)
    provider_user_id = Column(String, nullable=False)
    access_token = Column(String, nullable=False)
    refresh_token = Column(String, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))

    user = relationship("User", back_populates="oauth_accounts")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    avatar_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    location = Column(String, nullable=True)
    website = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))

    user = relationship("User", back_populates="profile") 

class UserCustomization(Base):
    __tablename__ = "user_customizations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    # Theme settings
    theme = Column(String, default="system")
    accent = Column(String, default="#3182ce")
    
    # Cursor settings
    cursor = Column(String, default="bar")
    cursor_blink = Column(Boolean, default=True)
    char_fill = Column(String, default="solid")
    
    # Sound settings
    sounds = Column(Boolean, default=True)
    sound_set = Column(String, default="classic")
    volume = Column(Integer, default=50)
    
    # Font settings
    font = Column(String, default="monospace")
    font_size = Column(Integer, default=18)
    
    # Display settings
    key_highlight = Column(Boolean, default=False)
    on_screen_keyboard = Column(Boolean, default=False)
    animations = Column(Boolean, default=True)
    show_stats = Column(Boolean, default=True)
    show_progress = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    updated_at = Column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))

    user = relationship("User", back_populates="customization")

class SiteSettings(Base):
    __tablename__ = "site_settings"
    id = Column(Integer, primary_key=True)
    maintenance_mode = Column(Boolean, default=False)
    registration_open = Column(Boolean, default=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True)
    action = Column(String)
    date = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"), nullable=True) 