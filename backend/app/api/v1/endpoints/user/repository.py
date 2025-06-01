from sqlalchemy.orm import Session
from typing import Optional, List
from app.api.v1.endpoints.user import models, schemas
from app.core.security import get_password_hash

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> Optional[models.User]:
        return self.db.query(models.User).filter(models.User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[models.User]:
        return self.db.query(models.User).filter(models.User.email == email).first()

    def get_by_username(self, username: str) -> Optional[models.User]:
        return self.db.query(models.User).filter(models.User.username == username).first()

    def create(self, user: schemas.UserCreate) -> models.User:
        db_user = models.User(
            email=user.email,
            username=user.username,
            hashed_password=get_password_hash(user.password),
            full_name=user.full_name
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def update(self, user_id: str, user: schemas.UserUpdate) -> Optional[models.User]:
        db_user = self.get_by_id(user_id)
        if not db_user:
            return None

        update_data = user.dict(exclude_unset=True)
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))

        for field, value in update_data.items():
            setattr(db_user, field, value)

        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def delete(self, user_id: str) -> bool:
        user = self.get_by_id(user_id)
        if not user:
            return False
        self.db.delete(user)
        self.db.commit()
        return True

    def create_oauth_account(self, user_id: str, oauth_data: schemas.OAuthAccountBase) -> models.OAuthAccount:
        oauth_account = models.OAuthAccount(
            user_id=user_id,
            **oauth_data.dict()
        )
        self.db.add(oauth_account)
        self.db.commit()
        self.db.refresh(oauth_account)
        return oauth_account

    def get_oauth_account(self, provider: models.OAuthProvider, provider_user_id: str) -> Optional[models.OAuthAccount]:
        return self.db.query(models.OAuthAccount).filter(
            models.OAuthAccount.provider == provider,
            models.OAuthAccount.provider_user_id == provider_user_id
        ).first() 