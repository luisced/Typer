from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.v1.endpoints.user.models import User
from app.core.deps import get_current_user
from app.api.v1.endpoints.tests import schemas, service
from app.api.v1.endpoints.tests.utils import NLTKTextHandler
from typing import List, Optional

router = APIRouter()

# Initialize the text handler as a singleton
text_handler = NLTKTextHandler()

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

@router.get("/content", response_model=schemas.TestContent)
def get_test_content(
    mode: str,
    count: Optional[int] = None,
    level: Optional[str] = None,
    include_numbers: Optional[bool] = None,
    include_punctuation: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    Get test content based on the specified mode.
    
    :param mode: One of ["words", "sentences", "code", "zen", "custom"]
    :param count: Number of words/sentences to return
    :param level: For word mode, one of ["easy", "medium", "hard"]
    :param include_numbers: Whether to include numbers in the content
    :param include_punctuation: Whether to include punctuation in the content
    :return: Test content
    """
    test_service = service.UserTestService(db)
    return test_service.get_test_content(
        mode=mode,
        count=count,
        level=level,
        include_numbers=include_numbers or False,
        include_punctuation=include_punctuation or False
    ) 