from app.api.v1.endpoints.tests.repository import UserTestRepository
from app.api.v1.endpoints.tests import schemas, models
from app.api.v1.endpoints.tests.utils import NLTKTextHandler
from app.api.v1.endpoints.gamification.service import GamificationService
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
import datetime
import logging

logger = logging.getLogger(__name__)

class UserTestService:
    # Cache for text handlers by language to avoid rebuilding corpora on every request
    _text_handlers: Dict[str, NLTKTextHandler] = {}

    def __init__(self, db: Session):
        self.repository = UserTestRepository(db)
        self.db = db

    def _get_text_handler(self, lang: str) -> NLTKTextHandler:
        """Get or create a cached text handler for the specified language."""
        if lang not in self._text_handlers:
            self._text_handlers[lang] = NLTKTextHandler(lang=lang)
        return self._text_handlers[lang]

    def create_test(self, user_id: str, test: schemas.UserTestCreate) -> models.UserTest:
        created_test = self.repository.create_test(user_id, test)
        
        # Process gamification rewards
        self._process_gamification_rewards(user_id, created_test, test)
        
        return created_test
    
    def _process_gamification_rewards(self, user_id: str, test: models.UserTest, test_data: schemas.UserTestCreate):
        """Process gamification rewards for a completed test."""
        try:
            logger.info(f"Processing gamification rewards for user {user_id}, test {test.id}")
            gamification_service = GamificationService(self.db)
            
            # Determine difficulty based on test parameters
            difficulty = self._determine_test_difficulty(test_data)
            logger.info(f"Test difficulty: {difficulty}")
            
            # Calculate word count and character count from char_logs
            word_count = len(test_data.char_logs)  # Each char_log represents a character typed
            character_count = sum(1 for log in test_data.char_logs if log.errors == 0)  # Count only correctly typed characters
            logger.info(f"Word count: {word_count}, Character count: {character_count}")
            
            # Process the test completion and award XP
            level_up_response = gamification_service.process_test_completion(
                user_id=user_id,
                test_id=test.id,
                wpm=int(test.wpm),
                accuracy=test.accuracy,
                difficulty=difficulty,
                duration_seconds=test.duration,
                word_count=word_count,
                character_count=character_count,
                test_date=test.timestamp or datetime.datetime.now(datetime.timezone.utc)
            )
            
            # Log XP breakdown
            logger.info(f"XP Breakdown:")
            logger.info(f"- Base XP: {level_up_response.xp_breakdown.base_xp}")
            logger.info(f"- WPM Bonus: {level_up_response.xp_breakdown.wpm_bonus}")
            logger.info(f"- Accuracy Bonus: {level_up_response.xp_breakdown.accuracy_bonus}")
            logger.info(f"- Difficulty Bonus: {level_up_response.xp_breakdown.difficulty_bonus}")
            logger.info(f"- Length Bonus: {level_up_response.xp_breakdown.length_bonus}")
            logger.info(f"- Streak Bonus: {level_up_response.xp_breakdown.streak_bonus}")
            logger.info(f"Total XP Earned: {level_up_response.xp_breakdown.total_xp}")
            
            # Log level up information
            if level_up_response.leveled_up:
                logger.info(f"User {user_id} leveled up from {level_up_response.old_level} to {level_up_response.new_level}!")
            else:
                logger.info(f"User {user_id} XP updated - Level: {level_up_response.new_level}")
            
        except Exception as e:
            # Log the error but don't fail the test creation
            logger.error(f"Error processing gamification rewards: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
    
    def _determine_test_difficulty(self, test_data: schemas.UserTestCreate) -> str:
        """Determine test difficulty based on test parameters."""
        # This is a simple heuristic - you can make it more sophisticated
        test_type = test_data.test_type
        
        if 'hard' in test_type.lower():
            return 'hard'
        elif 'medium' in test_type.lower() or 'punctuation' in test_type.lower() or 'numbers' in test_type.lower():
            return 'medium'
        else:
            return 'easy'

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
            if include_numbers or include_punctuation:
                words = text_handler.get_random_tokens(
                    level=level,
                    count=count,
                    with_numbers=include_numbers,
                    with_punctuation=include_punctuation,
                )
            else:
                words = text_handler.get_random_words(
                    level=level,
                    count=count,
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