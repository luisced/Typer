from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.api.v1.endpoints.user import schemas, service, models
from app.core.deps import get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt, JWTError
from app.core.config import settings
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/register", response_model=schemas.Token)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        user_service = service.UserService(db)
        logger.info(f"Registering user: {user}")
        db_user = user_service.create_user(user)
        logger.info(f"User registered successfully: {db_user}")
        
        # Add detailed logging for token creation
        logger.info("Attempting to create tokens for user")
        try:
            tokens = user_service.create_tokens(db_user)
            logger.info("Tokens created successfully")
            return tokens
        except Exception as token_error:
            logger.error(f"Error creating tokens: {str(token_error)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating tokens: {str(token_error)}"
            )
        
    except ValueError as e:
        logger.error(f"Validation error during registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while registering user"
        )

@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user_service = service.UserService(db)
    user = user_service.authenticate(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_service.create_tokens(user)

@router.get("/me", response_model=schemas.UserInDB)
def read_user_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=schemas.UserInDB)
def update_user_me(
    user: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_service = service.UserService(db)
    try:
        return user_service.update_user(current_user.id, user)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_me(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_service = service.UserService(db)
    if not user_service.delete_user(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

# Role Management Endpoints
@router.get("/me/roles", response_model=List[models.RoleType])
def get_user_roles(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_service = service.UserService(db)
    return list(user_service.get_user_roles(current_user.id))

@router.post("/me/roles/{role_type}")
def assign_role(
    role_type: models.RoleType,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_service = service.UserService(db)
    try:
        user_service.assign_role(current_user.id, role_type)
        return {"message": f"Role {role_type.value} assigned successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/me/roles/{role_type}")
def remove_role(
    role_type: models.RoleType,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_service = service.UserService(db)
    user_service.remove_role(current_user.id, role_type)
    return {"message": f"Role {role_type.value} removed successfully"}

# Admin-only endpoints
@router.post("/{user_id}/roles/{role_type}")
def admin_assign_role(
    user_id: str,
    role_type: models.RoleType,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_service = service.UserService(db)
    if not user_service.is_admin(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    user_service.assign_role(user_id, role_type)
    return {"message": f"Role {role_type.value} assigned successfully to user {user_id}"}

@router.delete("/{user_id}/roles/{role_type}")
def admin_remove_role(
    user_id: str,
    role_type: models.RoleType,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_service = service.UserService(db)
    if not user_service.is_admin(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    user_service.remove_role(user_id, role_type)
    return {"message": f"Role {role_type.value} removed successfully from user {user_id}"}

@router.post("/refresh", response_model=schemas.Token)
def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    user_service = service.UserService(db)
    try:
        return user_service.refresh_token(refresh_token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/leaderboard", response_model=List[schemas.LeaderboardUser])
def get_leaderboard(
    time_mode: str = "15",
    period: str = "all-time",
    limit: int = 15,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Get the leaderboard data with optional filtering.
    
    Args:
        time_mode: The time mode for the test (e.g., "15", "60")
        period: The time period for the leaderboard (e.g., "all-time", "weekly", "daily")
        limit: Number of results to return
        offset: Number of results to skip
    """
    try:
        user_service = service.UserService(db)
        return user_service.get_leaderboard(time_mode, period, limit, offset)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching leaderboard data: {str(e)}"
        ) 