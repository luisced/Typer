from sqlalchemy.orm import Session
from typing import Optional, List, Set
from app.api.v1.endpoints.user import models, schemas
from app.core.security import get_password_hash
import uuid
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from datetime import datetime, UTC, timedelta
from app.api.v1.endpoints.tests.models import UserTest
import logging

logger = logging.getLogger(__name__)

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
        """
        Create a new user.  If this is the first user, assign ADMIN role;
        otherwise assign USER role.  Raise ValueError on duplicates or other issues.
        """
        # 1. Check for existing email
        if self.get_by_email(user.email):
            raise ValueError(f"Email '{user.email}' is already registered")

        # 2. Check for existing username
        if self.get_by_username(user.username):
            raise ValueError(f"Username '{user.username}' is already taken")

        # 3. Decide if this is the very first user (makes them superuser/admin)
        is_first_user = self.is_first_user()

        try:
            # 4. Create the User object
            db_user = models.User(
                id=str(uuid.uuid4()),
                email=user.email,
                username=user.username,
                hashed_password=get_password_hash(user.password),
                full_name=user.full_name,
                is_superuser=is_first_user,
                is_active=True,
            )
            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)

            # 5. Assign Roles
            if is_first_user:
                # Create (or retrieve) an “ADMIN” role
                admin_role = (
                    self.db.query(models.Role)
                    .filter(models.Role.name == models.RoleType.ADMIN)
                    .first()
                )
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
                # Create (or retrieve) a “USER” role
                user_role = (
                    self.db.query(models.Role)
                    .filter(models.Role.name == models.RoleType.USER)
                    .first()
                )
                if not user_role:
                    user_role = models.Role(
                        id=str(uuid.uuid4()),
                        name=models.RoleType.USER,
                        description="Regular user role"
                    )
                    self.db.add(user_role)
                    self.db.commit()
                db_user.roles.append(user_role)

            # 6. Final commit after appending roles
            self.db.commit()
            return db_user

        except IntegrityError as e:
            # Roll back and raise a ValueError with a friendly message
            self.db.rollback()
            err_msg = str(e.orig).lower()
            if 'ix_users_email' in err_msg or 'unique constraint' in err_msg and 'email' in err_msg:
                raise ValueError(f"Email '{user.email}' is already registered")
            if 'ix_users_username' in err_msg or 'unique constraint' in err_msg and 'username' in err_msg:
                raise ValueError(f"Username '{user.username}' is already taken")
            raise ValueError("An unexpected error occurred while creating the user")

        except Exception as e:
            # Any other exception—roll back and re‐raise as ValueError
            self.db.rollback()
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

    def get_users_with_stats(
        self,
        time_mode: str,
        period: str,
        limit: int,
        offset: int,
        username: Optional[str] = None,
        test_length: Optional[int] = None,
        language: Optional[str] = None,
        min_tests: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[models.User]:
        """
        Get users with their typing statistics for the leaderboard.
        
        Args:
            time_mode: The time mode for the test (e.g., "15", "60", "words", "all")
            period: The time period for the leaderboard (e.g., "all-time", "weekly", "daily")
            limit: Number of results to return
            offset: Number of results to skip
            username: Filter by username (partial match)
            test_length: Filter by test length (number of words/chars)
            language: Filter by language
            min_tests: Minimum number of tests required
            start_date: Custom start date for period filter
            end_date: Custom end date for period filter
            
        Returns:
            List of users with their typing statistics
        """
        try:
            logger.info(f"Fetching leaderboard data with filters: time_mode={time_mode}, period={period}, "
                       f"username={username}, test_length={test_length}, language={language}, "
                       f"min_tests={min_tests}, start_date={start_date}, end_date={end_date}")
            
            # Check if we have any test data
            test_count = self.db.query(UserTest).count()
            logger.info(f"Total number of test records in database: {test_count}")
            
            if test_count == 0:
                logger.warning("No test data found in database")
                return []
            
            # Base query to get users with their test results
            query = self.db.query(
                models.User,
                func.avg(UserTest.wpm).label('avg_wpm'),
                func.avg(UserTest.accuracy).label('avg_accuracy'),
                func.avg(UserTest.raw_wpm).label('avg_raw_wpm'),
                func.avg(UserTest.consistency).label('avg_consistency'),
                func.max(UserTest.timestamp).label('last_test_date'),
                func.count(UserTest.id).label('test_count'),
                func.percent_rank().over(order_by=func.avg(UserTest.wpm).desc()).label('rank_percentile')
            ).join(
                UserTest,
                models.User.id == UserTest.user_id
            )

            # Apply filters
            if time_mode != "all":
                query = query.filter(UserTest.test_type == time_mode)

            if username:
                query = query.filter(models.User.username.ilike(f"%{username}%"))

            if test_length:
                query = query.filter(UserTest.duration == test_length)

            if language:
                query = query.filter(UserTest.language == language)

            # Time period filter
            if period == "weekly":
                query = query.filter(
                    UserTest.timestamp >= datetime.now(UTC) - timedelta(days=7)
                )
            elif period == "daily":
                query = query.filter(
                    UserTest.timestamp >= datetime.now(UTC) - timedelta(days=1)
                )
            elif period == "custom" and start_date and end_date:
                query = query.filter(
                    UserTest.timestamp.between(start_date, end_date)
                )

            # Group by user and apply minimum tests filter
            query = query.group_by(models.User.id)
            
            if min_tests:
                query = query.having(func.count(UserTest.id) >= min_tests)

            # Order by average WPM
            query = query.order_by(func.avg(UserTest.wpm).desc())

            # Add pagination
            query = query.offset(offset).limit(limit)

            # Execute query and log results
            results = query.all()
            logger.info(f"Found {len(results)} users for leaderboard")
            return results
            
        except Exception as e:
            logger.error(f"Error fetching leaderboard data: {str(e)}", exc_info=True)
            raise 