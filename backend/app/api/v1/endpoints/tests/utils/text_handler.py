import random
import logging
from typing import List, Optional

import nltk
from nltk.tokenize import sent_tokenize
from collections import Counter

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

class NLTKTextHandler:
    """
    Handler para generar listas de palabras niveladas y oraciones realistas
    en distintos idiomas, usando corpora de NLTK o archivos externos.
    """

    def __init__(
        self,
        lang: str = "en",
        easy_count: int = 1000,
        medium_count: int = 4000,
        hard_count: int = 5000,
        include_numbers: bool = False,
        include_punctuation: bool = False,
    ) -> None:
        """
        :param lang: Idioma a utilizar ("en", "es", "fr", ...)
        :param easy_count: Cantidad de palabras más frecuentes para nivel "fácil"
        :param medium_count: Siguiente bloque para nivel "medio"
        :param hard_count: Siguiente bloque para nivel "difícil"
        :param include_numbers: Si True, se añaden tokens numéricos
        :param include_punctuation: Si True, se añade puntuación a los tokens
        """
        self.lang = lang.lower()
        self.easy_count = easy_count
        self.medium_count = medium_count
        self.hard_count = hard_count
        self.include_numbers = include_numbers
        self.include_punctuation = include_punctuation

        # Listas internas
        self.word_freq: Counter = Counter()
        self._easy_words: List[str] = []
        self._medium_words: List[str] = []
        self._hard_words: List[str] = []
        self._sentences: List[str] = []

        # Pool de números y signos (iguales a la versión en inglés)
        self._number_tokens = [str(n) for n in range(0, 10000, 7)]
        self._punctuation_marks = [",", ".", ";", ":", "!", "?", "-", "—", "¿", "¡"]

        # Ejecutar inicialización
        self._ensure_nltk_data()
        self._build_word_lists()
        self._build_sentence_list()

    def _ensure_nltk_data(self) -> None:
        """
        Descarga condicional de recursos de NLTK según el idioma.
        """
        try:
            nltk.data.find("tokenizers/punkt")
        except LookupError:
            logger.info("Downloading 'punkt' tokenizer…")
            nltk.download("punkt")

        if self.lang == "en":
            # Para inglés, usamos Brown y Gutenberg
            try:
                nltk.data.find("corpora/brown")
            except LookupError:
                logger.info("Downloading Brown corpus…")
                nltk.download("brown")
            try:
                nltk.data.find("corpora/gutenberg")
            except LookupError:
                logger.info("Downloading Gutenberg corpus…")
                nltk.download("gutenberg")

        elif self.lang == "es":
            # Para español, por ejemplo, usamos CESS-ESP
            try:
                nltk.data.find("corpora/cess_esp")
            except LookupError:
                logger.info("Downloading CESS-ESP corpus (Spanish)…")
                nltk.download("cess_esp")

            # Podemos usar UDHR para oraciones de apoyo
            try:
                nltk.data.find("corpora/udhr")
            except LookupError:
                logger.info("Downloading UDHR (Universal Declaration of Human Rights)…")
                nltk.download("udhr")

        else:
            # Cualquier otro idioma: podrías bajar 'udhr' o usar archivos externos
            try:
                nltk.data.find("corpora/udhr")
            except LookupError:
                logger.info("Downloading UDHR (general multilingual use)…")
                nltk.download("udhr")

    def _build_word_lists(self) -> None:
        """
        Construye los Contadores de palabras y listas niveladas en base al idioma.
        """
        logger.info(f"Building word list for language '{self.lang}'…")

        if self.lang == "en":
            from nltk.corpus import brown

            words = brown.words()
            filtered = (w.lower() for w in words if w.isalpha())

        elif self.lang == "es":
            from nltk.corpus import cess_esp

            # CESS-ESP ya está tokenizado, pero contiene tags morfológicos, p.ej. "la/da"
            # Extraemos solo la parte de la palabra antes de la barra
            raw_tokens = cess_esp.words()
            filtered = []
            for token in raw_tokens:
                # token puede venir como "palabra/ETIQUETA"
                if "/" in token:
                    palabra, tag = token.split("/", 1)
                else:
                    palabra = token
                # Filtramos solo alfabéticos (sin números ni barra)
                if palabra.isalpha():
                    filtered.append(palabra.lower())
            # Convertimos filtered a generador
            filtered = (w for w in filtered)

        else:
            # Caso genérico: usar UDHR (textos paralelos, o archivos externos)
            from nltk.corpus import udhr

            udhr_map = {
                "en": "English-Latin1",
                "es": "Spanish-Latin1",
                # add more as needed
            }
            udhr_file = udhr_map.get(self.lang, "English-Latin1")
            try:
                raw = udhr.raw(udhr_file)
            except (LookupError, FileNotFoundError, OSError):
                raw = udhr.raw("English-Latin1")
            # Tokenizamos por palabras simples
            tokens = nltk.word_tokenize(raw, language=self.lang)
            filtered = (w.lower() for w in tokens if w.isalpha())

        # Contamos frecuencias
        self.word_freq = Counter(filtered)

        # Tomamos los N + M + H más comunes
        slice_size = self.easy_count + self.medium_count + self.hard_count
        most_common = self.word_freq.most_common(slice_size)
        ranked_words = [w for w, _ in most_common]

        # Particiones en tres niveles
        self._easy_words = ranked_words[: self.easy_count]
        self._medium_words = ranked_words[
            self.easy_count : self.easy_count + self.medium_count
        ]
        self._hard_words = ranked_words[
            self.easy_count + self.medium_count : self.easy_count + self.medium_count + self.hard_count
        ]

        logger.info(
            f"[{self.lang}] Leveled words → "
            f"Easy: {len(self._easy_words)}, "
            f"Medium: {len(self._medium_words)}, "
            f"Hard: {len(self._hard_words)}"
        )

    def _build_sentence_list(self) -> None:
        """
        Extrae oraciones "realistas" del corpus seleccionado para el idioma.
        """
        logger.info(f"Building sentences for language '{self.lang}'…")

        if self.lang == "en":
            from nltk.corpus import gutenberg

            raw = gutenberg.raw("austen-emma.txt")
            all_sents = sent_tokenize(raw, language="english")

        elif self.lang == "es":
            # Podemos usar UDHR o un Gutenberg en español (si lo tuviéramos)
            from nltk.corpus import udhr

            try:
                raw = udhr.raw("Spanish-Latin1")
            except (LookupError, FileNotFoundError):
                raw = udhr.raw("English-Latin1")  # fallback
            all_sents = sent_tokenize(raw, language="spanish")

        else:
            # Fallback a UDHR en idioma solicitado
            from nltk.corpus import udhr

            udhr_map = {
                "en": "English-Latin1",
                "es": "Spanish-Latin1",
                # add more as needed
            }
            udhr_file = udhr_map.get(self.lang, "English-Latin1")
            try:
                raw = udhr.raw(udhr_file)
                all_sents = sent_tokenize(raw, language=self.lang)
            except Exception:
                # Si no se encuentra corpus, lista vacía
                all_sents = []

        # Filtrar oraciones de longitud "óptima" (20–120 caracteres)
        self._sentences = [s.strip() for s in all_sents if 20 <= len(s) <= 120]
        logger.info(f"[{self.lang}] Collected sentences: {len(self._sentences)}")

    def get_random_words(
        self, level: str = "easy", count: int = 25
    ) -> List[str]:
        """
        Devuelve una lista de palabras aleatorias SOLO alfabéticas del nivel pedido.
        """
        level_map = {
            "easy": self._easy_words,
            "medium": self._medium_words,
            "hard": self._hard_words,
        }
        if level not in level_map:
            raise ValueError(f"Nivel '{level}' no válido. Escoja de {list(level_map)}.")
        pool = level_map[level]
        if count > len(pool):
            raise ValueError(
                f"Solicitaste {count} palabras, pero solo hay {len(pool)} en nivel '{level}'."
            )
        return random.sample(pool, count)

    def get_random_tokens(
        self,
        level: str = "easy",
        count: int = 25,
        with_numbers: Optional[bool] = None,
        with_punctuation: Optional[bool] = None,
    ) -> List[str]:
        """
        Mezcla palabras (por nivel) con tokens numéricos y signos de puntuación opcionales.
        """
        include_nums = (with_numbers if with_numbers is not None else self.include_numbers)
        include_punct = (with_punctuation if with_punctuation is not None else self.include_punctuation)

        words = self.get_random_words(level, count)
        tokens: List[str] = []

        for w in words:
            # Agregar puntuación final aleatoria
            if include_punct and random.random() < 0.2:
                punct = random.choice(self._punctuation_marks)
                w = w + punct

            tokens.append(w)

            # Insertar token numérico aleatorio
            if include_nums and random.random() < 0.15:
                num_tok = random.choice(self._number_tokens)
                tokens.append(num_tok)

            if len(tokens) >= count:
                break

        # Asegurarse de tener exactamente 'count' tokens
        tokens = tokens[:count]
        if len(tokens) < count:
            needed = count - len(tokens)
            extra = self.get_random_words(level, needed)
            tokens.extend(extra)

        random.shuffle(tokens)
        return tokens

    def get_random_sentence(self) -> Optional[str]:
        """
        Devuelve una oración aleatoria con puntuación (o None si no hay oraciones).
        """
        if not self._sentences:
            return None
        return random.choice(self._sentences)

    def get_random_sentences(self, count: int = 5) -> List[str]:
        """
        Devuelve varias oraciones aleatorias.
        """
        if count > len(self._sentences):
            raise ValueError(f"Solicitaste {count} oraciones, pero hay solo {len(self._sentences)}.")
        return random.sample(self._sentences, count)

    def get_word_frequency(self, word: str) -> int:
        """
        Devuelve la frecuencia cruda de la palabra en el corpus seleccionado.
        """
        return self.word_freq.get(word.lower(), 0) 