from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.api.v1.endpoints.user import schemas, service
from app.core.deps import get_current_user
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

@router.post("/register", response_model=schemas.UserInDB)
def register_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    user_service = service.UserService(db)
    try:
        return user_service.create_user(user)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
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
def read_user_me(
    current_user: schemas.UserInDB = Depends(get_current_user)
):
    return current_user

@router.put("/me", response_model=schemas.UserInDB)
def update_user_me(
    user: schemas.UserUpdate,
    current_user: schemas.UserInDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_service = service.UserService(db)
    try:
        updated_user = user_service.update_user(current_user.id, user)
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        return updated_user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_me(
    current_user: schemas.UserInDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_service = service.UserService(db)
    if not user_service.delete_user(current_user.id):
        raise HTTPException(status_code=404, detail="User not found") 