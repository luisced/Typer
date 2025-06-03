from typing import Optional, List, Set
from sqlalchemy.orm import Session
from app.api.v1.endpoints.user import models, schemas, repository
from app.core.security import verify_password, create_access_token, create_refresh_token, get_password_hash
from datetime import datetime, timedelta, UTC
from fastapi import HTTPException, status   
from jose import jwt, JWTError
from app.core.config import settings
from app.api.v1.endpoints.user.repository import UserRepository
import uuid

class UserService:
    def __init__(self, db: Session):
        self.repository = UserRepository(db)
        self.db = db

    def authenticate(self, username: str, password: str) -> Optional[models.User]:
        # Try to find user by email first
        user = self.repository.get_by_email(username)
        if not user:
            # If not found by email, try username
            user = self.repository.get_by_username(username)
        
        if not user or not user.hashed_password:
            return None
        if not user.verify_password(password):
            return None
        return user

    def create_user(self, user_in: schemas.UserCreate) -> models.User:
        """
        Create a new user.  If email/username is taken, raise ValueError.
        Otherwise return the newly created User model.
        """
        try:
            db_user = self.repository.create(user_in)
            return db_user

        except ValueError as e:
            raise ValueError(str(e))

        except Exception as e:
           
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error while creating user"
            )

    def get_user(self, user_id: str) -> Optional[models.User]:
        return self.repository.get_by_id(user_id)

    def update_user(self, user_id: str, user: schemas.UserUpdate) -> Optional[models.User]:
        # Check if email is being changed and is already taken
        if user.email:
            existing_user = self.repository.get_by_email(user.email)
            if existing_user and existing_user.id != user_id:
                raise ValueError("Email already registered")
                
        # Check if username is being changed and is already taken
        if user.username:
            existing_user = self.repository.get_by_username(user.username)
            if existing_user and existing_user.id != user_id:
                raise ValueError("Username already taken")
                
        return self.repository.update(user_id, user)

    def delete_user(self, user_id: str) -> bool:
        return self.repository.delete(user_id)

    def create_oauth_account(self, user_id: str, oauth_data: schemas.OAuthAccountBase) -> models.OAuthAccount:
        return self.repository.create_oauth_account(user_id, oauth_data)

    def get_oauth_account(self, provider: models.OAuthProvider, provider_user_id: str) -> Optional[models.OAuthAccount]:
        return self.repository.get_oauth_account(provider, provider_user_id)

    def create_tokens(self, user: models.User) -> dict:
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        
        # Update last login
        user.last_login = datetime.now(UTC)
        self.db.commit()
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
        
    def get_user_roles(self, user_id: str) -> Set[models.RoleType]:
        return self.repository.get_user_roles(user_id)
        
    def assign_role(self, user_id: str, role_type: models.RoleType) -> None:
        # Get the user and current user roles
        user = self.repository.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        # Get current roles
        current_roles = self.get_user_roles(user_id)
        
        # Check if trying to assign a higher role
        if role_type == models.RoleType.ADMIN and models.RoleType.ADMIN not in current_roles:
            # Only allow if the user already has admin role
            if not self.is_admin(user_id):
                raise ValueError("Cannot assign admin role to yourself")
        
        # Assign the role
        self.repository.assign_role(user_id, role_type)
        
    def remove_role(self, user_id: str, role_type: models.RoleType) -> None:
        self.repository.remove_role(user_id, role_type)
        
    def is_admin(self, user_id: str) -> bool:
        roles = self.get_user_roles(user_id)
        return models.RoleType.ADMIN in roles

    def refresh_token(self, refresh_token: str) -> dict:
        try:
            # Decode the refresh token
            payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                raise ValueError("Invalid refresh token")
            
            # Get the user
            user = self.get_user(user_id)
            if not user:
                raise ValueError("User not found")
                
            # Create new tokens
            return self.create_tokens(user)
        except JWTError:
            raise ValueError("Invalid refresh token")

    def get_leaderboard(self, time_mode: str, period: str, limit: int, offset: int) -> List[schemas.LeaderboardUser]:
        """
        Get leaderboard data with user statistics.
        
        Args:
            time_mode: The time mode for the test (e.g., "15", "60")
            period: The time period for the leaderboard (e.g., "all-time", "weekly", "daily")
            limit: Number of results to return
            offset: Number of results to skip
            
        Returns:
            List of users with their leaderboard statistics
        """
        users_with_stats = self.repository.get_users_with_stats(time_mode, period, limit, offset)
        
        leaderboard_users = []
        for i, result in enumerate(users_with_stats, start=1):
            user, avg_wpm, avg_accuracy, avg_raw_wpm, avg_consistency, last_test_date, test_count, rank_percentile = result
            
            # Calculate rank based on percentile
            rank = int(rank_percentile * 100) if rank_percentile is not None else i
            
            # Format date and time
            if last_test_date:
                date = last_test_date.strftime("%Y-%m-%d")
                time = last_test_date.strftime("%H:%M")
            else:
                date = "N/A"
                time = "N/A"
            
            # Get user badges (you can implement your own badge logic here)
            badges = []
            if avg_wpm and avg_wpm > 100:
                badges.append("speedster")
            if avg_accuracy and avg_accuracy > 98:
                badges.append("accurate")
            if avg_consistency and avg_consistency > 95:
                badges.append("consistent")
            
            leaderboard_users.append(
                schemas.LeaderboardUser(
                    id=user.id,
                    rank=rank,
                    name=user.username,
                    badges=badges,
                    wpm=float(avg_wpm) if avg_wpm else 0,
                    accuracy=float(avg_accuracy) if avg_accuracy else 0,
                    raw=float(avg_raw_wpm) if avg_raw_wpm else 0,
                    consistency=float(avg_consistency) if avg_consistency else 0,
                    date=date,
                    time=time
                )
            )
        
        return leaderboard_users 

    def get_user_customization(self, user_id: int) -> models.UserCustomization:
        """Get user customization settings."""
        customization = self.db.query(models.UserCustomization).filter(
            models.UserCustomization.user_id == user_id
        ).first()
        
        if not customization:
            # Create default customization if none exists
            customization = models.UserCustomization(
                id=str(uuid.uuid4()),  # Explicitly set the ID
                user_id=user_id,
                theme="dark",
                accent="blue",
                cursor="block",
                cursor_blink=True,
                char_fill="solid",
                sounds=True,
                sound_set="mechanical",
                volume=0.5,
                font="mono",
                font_size=16,
                key_highlight=True,
                on_screen_keyboard=False,
                animations=True,
                show_stats=True,
                show_progress=True
            )
            self.db.add(customization)
            self.db.commit()
            self.db.refresh(customization)
        
        return customization

    def update_user_customization(
        self, 
        user_id: int, 
        customization: schemas.UserCustomizationUpdate
    ) -> models.UserCustomization:
        """Update user customization settings."""
        db_customization = self.get_user_customization(user_id)
        
        # Update only the fields that are provided
        for field, value in customization.dict(exclude_unset=True).items():
            setattr(db_customization, field, value)
        
        db_customization.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(db_customization)
        
        return db_customization 