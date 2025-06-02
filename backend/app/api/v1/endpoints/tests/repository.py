from sqlalchemy.orm import Session
from . import models, schemas
from uuid import uuid4
from typing import List
from datetime import datetime

class UserTestRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_test(self, user_id: str, test: schemas.UserTestCreate) -> models.UserTest:
        db_test = models.UserTest(
            id=str(uuid4()),
            user_id=user_id,
            wpm=test.wpm,
            accuracy=test.accuracy,
            test_type=test.test_type,
            duration=test.duration,
            timestamp=test.timestamp or datetime.utcnow()
        )
        self.db.add(db_test)
        self.db.commit()
        self.db.refresh(db_test)
        for log in test.char_logs:
            db_log = models.UserTestCharLog(
                id=str(uuid4()),
                test_id=db_test.id,
                char=log.char,
                attempts=log.attempts,
                errors=log.errors,
                total_time=log.total_time
            )
            self.db.add(db_log)
        self.db.commit()
        return db_test

    def get_tests_for_user(self, user_id: str) -> List[models.UserTest]:
        return self.db.query(models.UserTest).filter(models.UserTest.user_id == user_id).order_by(models.UserTest.timestamp.desc()).all() 