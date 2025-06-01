from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.api.v1.endpoints.user import schemas, service, models
from app.core.deps import get_current_user
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

@router.post("/register", response_model=schemas.Token)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        user_service = service.UserService(db)
        db_user = user_service.create_user(user)
        return user_service.create_tokens(db_user)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
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