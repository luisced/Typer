from app.api.v1.endpoints.tests.repository import UserTestRepository
from app.api.v1.endpoints.tests import schemas, models
from sqlalchemy.orm import Session
from typing import List

class UserTestService:
    def __init__(self, db: Session):
        self.repository = UserTestRepository(db)

    def create_test(self, user_id: str, test: schemas.UserTestCreate) -> models.UserTest:
        return self.repository.create_test(user_id, test)

    def get_tests_for_user(self, user_id: str) -> List[models.UserTest]:
        return self.repository.get_tests_for_user(user_id)

    def to_schema(self, db_test: models.UserTest) -> schemas.UserTestRead:
        return schemas.UserTestRead(
            id=db_test.id,
            user_id=db_test.user_id,
            wpm=db_test.wpm,
            raw_wpm=db_test.raw_wpm,
            accuracy=db_test.accuracy,
            consistency=db_test.consistency,
            test_type=db_test.test_type,
            duration=db_test.duration,
            chars=db_test.chars,
            restarts=db_test.restarts,
            timestamp=db_test.timestamp,
            char_logs=[
                schemas.UserTestCharLogRead(
                    id=log.id,
                    test_id=log.test_id,
                    char=log.char,
                    attempts=log.attempts,
                    errors=log.errors,
                    total_time=log.total_time
                ) for log in db_test.char_logs
            ]
        ) 