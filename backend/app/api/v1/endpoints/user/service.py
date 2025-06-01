from typing import Optional, List, Set
from sqlalchemy.orm import Session
from app.api.v1.endpoints.user import models, schemas, repository
from app.core.security import verify_password, create_access_token, create_refresh_token
from datetime import datetime, timedelta, UTC
import uuid

class UserService:
    def __init__(self, db: Session):
        self.repository = repository.UserRepository(db)
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

    def create_user(self, user: schemas.UserCreate) -> models.User:
        # Check if user with email exists
        if self.repository.get_by_email(user.email):
            raise ValueError("Email already registered")
            
        # Check if username is taken
        if self.repository.get_by_username(user.username):
            raise ValueError("Username already taken")
            
        # Create user
        db_user = self.repository.create(user)
        
        # Assign default role
        self.repository.assign_role(db_user.id, models.RoleType.USER)
        
        return db_user

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
        self.repository.assign_role(user_id, role_type)
        
    def remove_role(self, user_id: str, role_type: models.RoleType) -> None:
        self.repository.remove_role(user_id, role_type)
        
    def is_admin(self, user_id: str) -> bool:
        roles = self.get_user_roles(user_id)
        return models.RoleType.ADMIN in roles 