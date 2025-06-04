import random
import logging
from typing import List, Optional

import nltk
from nltk.corpus import brown, gutenberg
from nltk.tokenize import sent_tokenize
from collections import Counter

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class NLTKTextHandler:
    """
    Handler for generating leveled word lists and realistic sentences with optional
    numbers/punctuation using NLTK corpora.
    
    Features:
    - Builds frequency-based word lists (easy, medium, hard) from the Brown corpus.
    - Extracts sentence samples from the Gutenberg corpus.
    - Provides methods to fetch random words by difficulty and random sentences.
    """

    def __init__(
        self,
        easy_count: int = 1000,
        medium_count: int = 4000,
        hard_count: int = 5000,
        include_numbers: bool = False,
        include_punctuation: bool = False,
    ) -> None:
        """
        Initialize the handler. Downloads required corpora (if not already present),
        computes word frequencies from Brown, and partitions into leveled lists.

        :param easy_count: Number of most frequent words to consider "easy".
        :param medium_count: Next chunk size for "medium" words.
        :param hard_count: Next chunk size for "hard" words.
        :param include_numbers: if True, numeric tokens (e.g. "1234") will be added to the pool
        :param include_punctuation: if True, punctuation marks will be injected after words
        """
        self.easy_count = easy_count
        self.medium_count = medium_count
        self.hard_count = hard_count
        self.include_numbers = include_numbers
        self.include_punctuation = include_punctuation

        self._ensure_nltk_data()
        self.word_freq: Counter = Counter()
        self._easy_words: List[str] = []
        self._medium_words: List[str] = []
        self._hard_words: List[str] = []
        self._sentences: List[str] = []

        self._build_word_lists()
        self._build_sentence_list()

        # Pre-generate a small pool of "number tokens" (e.g. "42", "2025", "7")
        self._number_tokens: List[str] = [str(n) for n in range(0, 10000, 7)]  # every 7th number up to 10000

        # Common punctuation marks to append or stand alone
        self._punctuation_marks: List[str] = [",", ".", ";", ":", "!", "?", "-", "—"]

    def _ensure_nltk_data(self) -> None:
        """Download necessary NLTK corpora/tokenizers if not already present."""
        try:
            nltk.data.find("corpora/brown")
        except LookupError:
            logger.info("Downloading Brown corpus...")
            nltk.download("brown")

        try:
            nltk.data.find("tokenizers/punkt")
        except LookupError:
            logger.info("Downloading Punkt tokenizer...")
            nltk.download("punkt")

        try:
            nltk.data.find("tokenizers/punkt_tab")
        except LookupError:
            logger.info("Downloading Punkt tokenizer tables...")
            nltk.download("punkt_tab")

        try:
            nltk.data.find("corpora/gutenberg")
        except LookupError:
            logger.info("Downloading Gutenberg corpus...")
            nltk.download("gutenberg")

    def _build_word_lists(self) -> None:
        """
        Tokenize all alphabetic words in the Brown corpus, compute frequencies,
        and partition into easy, medium, and hard lists.
        """
        logger.info("Building word frequency distribution from Brown corpus...")
        words = brown.words()
        # Filter to alphabetic words and lowercase them
        filtered = (w.lower() for w in words if w.isalpha())
        self.word_freq = Counter(filtered)

        logger.info("Partitioning words into difficulty levels...")
        most_common = self.word_freq.most_common(
            self.easy_count + self.medium_count + self.hard_count
        )
        # Extract only the words in order of descending frequency
        sorted_words = [word for word, _ in most_common]

        # Partition
        start = 0
        end = self.easy_count
        self._easy_words = sorted_words[start:end]

        start = end
        end = start + self.medium_count
        self._medium_words = sorted_words[start:end]

        start = end
        end = start + self.hard_count
        self._hard_words = sorted_words[start:end]

        logger.info(
            f"Easy words: {len(self._easy_words)}, "
            f"Medium words: {len(self._medium_words)}, "
            f"Hard words: {len(self._hard_words)}"
        )

    def _build_sentence_list(self) -> None:
        """
        Extract and filter sentences from a Gutenberg text (e.g., 'austen-emma.txt').
        Stores sentences of moderate length for realistic typing practice.
        """
        logger.info("Building sentence list from Gutenberg corpus...")
        raw_text = gutenberg.raw("austen-emma.txt")
        all_sentences = sent_tokenize(raw_text)

        # Filter sentences by character length (e.g., 20–120 characters)
        self._sentences = [
            s.strip() for s in all_sentences if 20 <= len(s) <= 120
        ]
        logger.info(f"Collected {len(self._sentences)} suitable sentences.")

    def get_random_words(
        self, 
        level: str = "easy", 
        count: int = 25,
        include_numbers: Optional[bool] = None,
        include_punctuation: Optional[bool] = None
    ) -> List[str]:
        """
        Return a random sample of words at the requested difficulty.
        
        :param level: "easy" | "medium" | "hard"
        :param count: how many words
        :param include_numbers: override instance setting for numbers
        :param include_punctuation: override instance setting for punctuation
        :return: List of words, optionally with numbers and punctuation
        """
        level_map = {"easy": self._easy_words, "medium": self._medium_words, "hard": self._hard_words}
        if level not in level_map:
            raise ValueError(f"Invalid level '{level}'. Choose from {list(level_map.keys())}.")
        
        pool = level_map[level]
        if count > len(pool):
            raise ValueError(f"Requested {count} words, but only {len(pool)} available for level '{level}'.")
        
        # Get base words
        words = random.sample(pool, count)
        
        # Apply numbers if requested
        if include_numbers if include_numbers is not None else self.include_numbers:
            # Replace ~15% of words with numbers
            num_replacements = max(1, int(count * 0.15))
            indices = random.sample(range(count), num_replacements)
            for idx in indices:
                words[idx] = random.choice(self._number_tokens)
        
        # Apply punctuation if requested
        if include_punctuation if include_punctuation is not None else self.include_punctuation:
            # Add punctuation to ~20% of words
            punc_count = max(1, int(count * 0.2))
            indices = random.sample(range(count), punc_count)
            for idx in indices:
                words[idx] += random.choice(self._punctuation_marks)
        
        return words

    def get_random_sentence(self) -> Optional[str]:
        """
        Return a single random sentence from the Gutenberg-derived list.
        :return: A sentence or None if no sentences are available.
        """
        if not self._sentences:
            return None
        return random.choice(self._sentences)

    def get_random_sentences(
        self, 
        count: int = 5,
        include_numbers: Optional[bool] = None,
        include_punctuation: Optional[bool] = None
    ) -> List[str]:
        """
        Return a list of random sentences.

        :param count: Number of sentences to return
        :param include_numbers: override instance setting for numbers
        :param include_punctuation: override instance setting for punctuation
        :return: List of random sentences
        :raises ValueError: If count exceeds available sentences
        """
        if count > len(self._sentences):
            raise ValueError(
                f"Requested {count} sentences, but only {len(self._sentences)} available."
            )
        
        sentences = random.sample(self._sentences, count)
        
        # Apply numbers if requested
        if include_numbers if include_numbers is not None else self.include_numbers:
            for i, sentence in enumerate(sentences):
                # Replace ~10% of words with numbers
                words = sentence.split()
                num_replacements = max(1, int(len(words) * 0.1))
                indices = random.sample(range(len(words)), num_replacements)
                for idx in indices:
                    words[idx] = random.choice(self._number_tokens)
                sentences[i] = " ".join(words)
        
        # Note: We don't modify punctuation for sentences as they already have natural punctuation
        
        return sentences

    def get_word_frequency(self, word: str) -> int:
        """
        Return the raw frequency count of a given word in the Brown corpus.

        :param word: The word to query
        :return: Frequency count (0 if word not found)
        """
        return self.word_freq.get(word.lower(), 0) 