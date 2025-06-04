from app.api.v1.endpoints.tests.repository import UserTestRepository
from app.api.v1.endpoints.tests import schemas, models
from app.api.v1.endpoints.tests.utils import NLTKTextHandler
from sqlalchemy.orm import Session
from typing import List, Optional, Dict

class UserTestService:
    # Cache for text handlers by language to avoid rebuilding corpora on every request
    _text_handlers: Dict[str, NLTKTextHandler] = {}

    def __init__(self, db: Session):
        self.repository = UserTestRepository(db)

    def _get_text_handler(self, lang: str) -> NLTKTextHandler:
        """Get or create a cached text handler for the specified language."""
        if lang not in self._text_handlers:
            self._text_handlers[lang] = NLTKTextHandler(lang=lang)
        return self._text_handlers[lang]

    def create_test(self, user_id: str, test: schemas.UserTestCreate) -> models.UserTest:
        return self.repository.create_test(user_id, test)

    def get_tests_for_user(self, user_id: str) -> List[models.UserTest]:
        return self.repository.get_tests_for_user(user_id)

    def get_test_content(
        self,
        mode: str,
        count: Optional[int] = None,
        level: Optional[str] = None,
        include_numbers: Optional[bool] = False,
        include_punctuation: Optional[bool] = False,
        lang: Optional[str] = "en"
    ) -> schemas.TestContent:
        """
        Generate test content based on the specified mode and parameters.
        
        :param mode: One of ["words", "sentences", "code", "zen", "custom"]
        :param count: Number of words/sentences to return
        :param level: For word mode, one of ["easy", "medium", "hard"]
        :param include_numbers: Whether to include numbers in the content
        :param include_punctuation: Whether to include punctuation in the content
        :param lang: Language code (e.g. 'en', 'es')
        :return: TestContent object with generated content
        :raises ValueError: If mode is invalid or parameters are invalid
        """
        # Use cached text handler instead of creating new instance every time
        text_handler = self._get_text_handler(lang or "en")
        
        if mode == "words":
            if not level:
                level = "easy"
            if not count:
                count = 25
            words = text_handler.get_random_words(
                level=level,
                count=count,
                # include_numbers and include_punctuation are not used in get_random_words
            )
            return schemas.TestContent(content=" ".join(words), type="words")
        elif mode == "sentences":
            if not count:
                count = 1
            sentences = text_handler.get_random_sentences(
                count=count
            )
            return schemas.TestContent(content=" ".join(sentences), type="sentences")
        elif mode == "code":
            # For now, use words mode with code-like content
            words = text_handler.get_random_words(
                level="hard",
                count=25
            )
            return schemas.TestContent(content=" ".join(words), type="code")
        elif mode == "zen":
            # For now, use sentences mode for zen
            sentences = text_handler.get_random_sentences(count=1)
            return schemas.TestContent(content=" ".join(sentences), type="zen")
        elif mode == "custom":
            # For now, use words mode for custom
            words = text_handler.get_random_words(
                level=level or "easy",
                count=count or 25
            )
            return schemas.TestContent(content=" ".join(words), type="custom")
        else:
            raise ValueError(f"Invalid mode: {mode}. Must be one of ['words', 'sentences', 'code', 'zen', 'custom']")

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
            language=db_test.language,
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