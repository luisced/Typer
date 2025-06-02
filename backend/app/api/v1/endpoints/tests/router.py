from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.v1.endpoints.user.models import User
from app.core.deps import get_current_user
from app.api.v1.endpoints.tests import schemas, service
from typing import List

router = APIRouter()

@router.post("/me/typing", status_code=status.HTTP_201_CREATED, response_model=schemas.UserTestRead)
def create_user_test(
    test: schemas.UserTestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    test_service = service.UserTestService(db)
    db_test = test_service.create_test(current_user.id, test)
    return test_service.to_schema(db_test)

@router.get("/me/typing", response_model=List[schemas.UserTestRead])
def get_user_tests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    test_service = service.UserTestService(db)
    tests = test_service.get_tests_for_user(current_user.id)
    return [test_service.to_schema(t) for t in tests] 