from sqlalchemy.orm import Session
from typing import Optional, List, Set
from app.api.v1.endpoints.user import models, schemas
from app.core.security import get_password_hash
import uuid
from sqlalchemy.exc import IntegrityError

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def is_first_user(self) -> bool:
        """Check if this is the first user being created."""
        return self.db.query(models.User).count() == 0

    def get_by_id(self, user_id: str) -> Optional[models.User]:
        return self.db.query(models.User).filter(models.User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[models.User]:
        return self.db.query(models.User).filter(models.User.email == email).first()

    def get_by_username(self, username: str) -> Optional[models.User]:
        return self.db.query(models.User).filter(models.User.username == username).first()

    def create(self, user: schemas.UserCreate) -> models.User:
        # Check for existing email
        if self.get_by_email(user.email):
            raise ValueError(f"Email {user.email} is already registered")
            
        # Check for existing username
        if self.get_by_username(user.username):
            raise ValueError(f"Username {user.username} is already taken")
            
        # Check if this is the first user
        is_first_user = self.is_first_user()
        
        try:
            db_user = models.User(
                id=str(uuid.uuid4()),
                email=user.email,
                username=user.username,
                hashed_password=get_password_hash(user.password),
                full_name=user.full_name,
                is_superuser=is_first_user,
                is_active=True
            )
            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)
            
            # Create and assign roles
            if is_first_user:
                # Create admin role if it doesn't exist
                admin_role = self.db.query(models.Role).filter(models.Role.name == models.RoleType.ADMIN).first()
                if not admin_role:
                    admin_role = models.Role(
                        id=str(uuid.uuid4()),
                        name=models.RoleType.ADMIN,
                        description="Administrator role"
                    )
                    self.db.add(admin_role)
                    self.db.commit()
                db_user.roles.append(admin_role)
            else:
                # Create user role if it doesn't exist
                user_role = self.db.query(models.Role).filter(models.Role.name == models.RoleType.USER).first()
                if not user_role:
                    user_role = models.Role(
                        id=str(uuid.uuid4()),
                        name=models.RoleType.USER,
                        description="Regular user role"
                    )
                    self.db.add(user_role)
                    self.db.commit()
                db_user.roles.append(user_role)
                
            self.db.commit()
            return db_user
            
        except IntegrityError as e:
            self.db.rollback()
            if "ix_users_email" in str(e):
                raise ValueError(f"Email {user.email} is already registered")
            elif "ix_users_username" in str(e):
                raise ValueError(f"Username {user.username} is already taken")
            else:
                raise ValueError("An error occurred while creating the user")

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
            id=str(uuid.uuid4()),
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
        
    def get_user_roles(self, user_id: str) -> Set[models.RoleType]:
        user = self.get_by_id(user_id)
        if not user:
            return set()
        return {role.name for role in user.roles}
        
    def assign_role(self, user_id: str, role_type: models.RoleType) -> None:
        user = self.get_by_id(user_id)
        if not user:
            return
            
        # Get or create the role
        role = self.db.query(models.Role).filter(models.Role.name == role_type).first()
        if not role:
            role = models.Role(
                id=str(uuid.uuid4()),
                name=role_type,
                description=f"Role for {role_type.value}"
            )
            self.db.add(role)
            self.db.commit()
            
        # Assign role to user if not already assigned
        if role not in user.roles:
            user.roles.append(role)
            self.db.commit()
            
    def remove_role(self, user_id: str, role_type: models.RoleType) -> None:
        user = self.get_by_id(user_id)
        if not user:
            return
            
        role = self.db.query(models.Role).filter(models.Role.name == role_type).first()
        if role and role in user.roles:
            user.roles.remove(role)
            self.db.commit() 