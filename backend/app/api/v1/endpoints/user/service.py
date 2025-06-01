from typing import Optional, List
from sqlalchemy.orm import Session
from app.api.v1.endpoints.user import models, schemas, repository
from app.core.security import verify_password, create_access_token, create_refresh_token
from datetime import datetime, timedelta
import uuid

class UserService:
    def __init__(self, db: Session):
        self.repository = repository.UserRepository(db)

    def authenticate(self, email: str, password: str) -> Optional[models.User]:
        user = self.repository.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user

    def create_user(self, user: schemas.UserCreate) -> models.User:
        # Check if user with email or username already exists
        if self.repository.get_by_email(user.email):
            raise ValueError("Email already registered")
        if self.repository.get_by_username(user.username):
            raise ValueError("Username already taken")
        
        # Create user with UUID
        db_user = self.repository.create(user)
        return db_user

    def get_user(self, user_id: str) -> Optional[models.User]:
        return self.repository.get_by_id(user_id)

    def update_user(self, user_id: str, user: schemas.UserUpdate) -> Optional[models.User]:
        # Check if new email or username is already taken
        if user.email:
            existing_user = self.repository.get_by_email(user.email)
            if existing_user and existing_user.id != user_id:
                raise ValueError("Email already registered")
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

    def create_tokens(self, user: models.User) -> schemas.Token:
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        return schemas.Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        ) 