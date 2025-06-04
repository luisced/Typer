import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  useDisclosure
} from '@chakra-ui/react'
import CodeEditor from './CodeEditor'
import { FaRedo } from 'react-icons/fa'
import type { CustomizationConfig } from '../store/customizationStore'
import { saveTest, getTestContent } from '../api/tests'
import { useNavigate } from 'react-router-dom'
import { Cursor } from './Cursor'
import type { CursorVariant } from './Cursor'
import { FocusWarningOverlay } from './FocusWarningOverlay'
import { calcGrossWpm, calcNetWpm, calcAccuracy } from '../utils/typing'
import { useTypingEngine } from '../hooks/useTypingEngine'

const punctuationSample =
  "Hello, world! How are you? Let's test: commas, periods. Semicolons; colons: dashes - and more!"
const numberSample =
  "In 2023, the population was 7.9 billion. 1, 2, 3, 4, 5... The code 123-456-7890 is a phone number."
const codeSamples: Record<string, string> = {
  Python: `def greet(name):\n    print(f"Hello, {name}!")\n\ngreet("World")`,
  JavaScript: `function greet(name) {\n  console.log('Hello, ' + name + '!');\n}\ngreet('World');`
}
const wordBank = [
  "life", "world", "take", "week", "said", "are", "by", "light", "back", "us",
  "three", "come", "has", "hot", "point", "round", "new", "build", "could",
  "give", "how", "these", "want", "fire", "from", "would", "spell", "book",
  "high", "help"
]
const sampleTexts = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.",
  "Programming is the art of telling another human being what one wants the computer to do.",
  "Simplicity is the ultimate sophistication. Less is more. Good design is invisible.",
  "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune.",
  "The journey of a thousand miles begins with a single step. An investment in knowledge pays the best interest."
]

const DEFAULT_TIME = 60

interface AdvancedTypingTestProps {
  modes: string[];
  setModes: (m: string[]) => void;
  subOptions: { time: number; words: number };
  setSubOptions: (opts: { time: number; words: number }) => void;
  language: string;
  setLanguage: (l: string) => void;
  codeLanguage: string;
  setCodeLanguage: (l: string) => void;
  wpm: number;
  setWpm: (w: number) => void;
  accuracy: number;
  setAccuracy: (a: number) => void;
  timer: number;
  setTimer: (t: number) => void;
  setWrittenWords: (n: number) => void;
  setTotalWords: (n: number) => void;
  customization: CustomizationConfig;
}

interface TestResult {
  wpm: number;
  accuracy: number;
  time: number;
  keystrokes: {
    correct: number;
    incorrect: number;
  };
  charStats: Array<{
    char: string;
    correct: boolean;
    time: number;
  }>;
}

const AdvancedTypingTest: React.FC<AdvancedTypingTestProps> = ({
  modes,
  setModes,
  subOptions,
  setSubOptions,
  language,
  setLanguage,
  codeLanguage,
  setCodeLanguage,
  wpm,
  setWpm,
  accuracy,
  setAccuracy,
  timer,
  setTimer,
  setWrittenWords,
  setTotalWords,
  customization,
}) => {
  // Typing test state
  const [text, setText] = useState<string>('')
  const [showResults, setShowResults] = useState<boolean>(false)
  const [topic, setTopic] = useState<string>('')
  const [finished, setFinished] = useState<boolean>(false)
  const [customText, setCustomText] = useState<string>('')
  const [isZenMode, setIsZenMode] = useState<boolean>(false)
  const [duration, setDuration] = useState<number>(0)
  const [restarts, setRestarts] = useState<number>(0)
  const [consistency, setConsistency] = useState<number>(0)
  const [testResult, setTestResult] = useState<any>(null)
  const [isFocusWarning, setIsFocusWarning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const mainContainerRef = useRef<HTMLDivElement>(null)
  const textContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [mode, setMode] = useState<'words' | 'time' | 'code' | 'zen' | 'custom' | 'punctuation' | 'numbers'>('words')
  const [wordCount, setWordCount] = useState<number>(25)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(false)
  const [includePunctuation, setIncludePunctuation] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0)
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(0)
  const [words, setWords] = useState<string[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [errorCount, setErrorCount] = useState<number>(0)
  const [inputValue, setInputValue] = useState<string>('')

  // Use the typing engine hook
  const {
    userInput,
    isActive,
    finished: typingFinished,
    startTime: typingStartTime,
    keystrokes: typingKeystrokes,
    charLogs: typingCharLogs,
    stats,
    grossWpm,
    netWpm,
    handleInput,
    reset: resetTypingEngine,
    endTest: endTypingTest
  } = useTypingEngine(text);

  // Fetch test content based on modes
  const fetchTestContent = async () => {
    try {
      setIsLoading(true)
      let content: string[] = []

      // Determine the mode based on the active modes
      let mode: 'words' | 'sentences' | 'code' | 'zen' | 'custom' = 'words'
      if (modes.includes('code')) {
        mode = 'code'
      } else if (modes.includes('zen')) {
        mode = 'zen'
      } else if (modes.includes('custom')) {
        mode = 'custom'
      } else if (modes.includes('words')) {
        mode = 'words'
      }

      // Get content based on mode
      const response = await getTestContent(
        mode,
        modes.includes('words') ? subOptions.words : 1,
        difficulty,
        modes.includes('numbers'),
        modes.includes('punctuation')
      )
      content = Array.isArray(response.content) ? response.content : [response.content]

      setText(content.join(' '))
      setCurrentWordIndex(0)
      setCurrentCharIndex(0)
      setStartTime(Date.now())
      setEndTime(null)
      setWpm(0)
      setAccuracy(0)
      setErrorCount(0)
      setShowResults(false)
      setInputValue('')
      setWords(content)
    } catch (error) {
      console.error('Error fetching test content:', error)
      setError('Failed to load test content. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Update text/timer on mode/subOption/codeLanguage change
  useEffect(() => {
    if (modes.includes('code')) {
      setText(codeSamples[codeLanguage] || codeSamples['Python'])
      setTimer(DEFAULT_TIME)
    } else if (modes.includes('zen')) {
      fetchTestContent()
      setTimer(Infinity)
    } else if (modes.includes('custom')) {
      setText(customText)
      setTimer(DEFAULT_TIME)
    } else if (modes.includes('words') && modes.includes('time')) {
      fetchTestContent()
      setTimer(subOptions.time)
    } else if (modes.includes('words')) {
      fetchTestContent()
      setTimer(Infinity)
    } else if (modes.includes('time')) {
      fetchTestContent()
      setTimer(subOptions.time)
    } else if (modes.includes('punctuation')) {
      fetchTestContent()
      setTimer(DEFAULT_TIME)
    } else if (modes.includes('numbers')) {
      fetchTestContent()
      setTimer(DEFAULT_TIME)
    } else {
      fetchTestContent()
      setTimer(DEFAULT_TIME)
    }
  }, [modes, subOptions, codeLanguage, customText, setTimer])

  // Update text when customText changes in custom mode
  useEffect(() => {
    if (modes.includes('custom')) {
      setText(customText);
    }
  }, [modes, customText]);

  // Scroll the active character into view only when it goes below the visible area
  useEffect(() => {
    if (!textContainerRef.current) return
    const idx = userInput.length
    // If no input yet, reset scroll to top
    if (idx < 0) {
      textContainerRef.current.scrollTop = 0
      return
    }
    const activeSpan = textContainerRef.current.querySelector(
      `[data-index="${idx}"]`
    ) as HTMLElement
    if (!activeSpan) return
    activeSpan.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [userInput])

  // Keyboard shortcuts (focus input, reset on Enter, hide results on Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement !== inputRef.current && !showResults) {
        inputRef.current?.focus()
      }
      if (showResults && e.key === 'Enter') {
        handleReset()
      }
      if (showResults && e.key === 'Escape') {
        setShowResults(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showResults])

  // Always focus the hidden input when test becomes active
  useEffect(() => {
    if (isActive) inputRef.current?.focus()
  }, [isActive])

  // Timer effect with functional update
  useEffect(() => {
    if (!isActive || finished || modes.includes('zen')) return;
    if (timer === 0) {
      if (!finished) {
        endTest();
      }
      return;
    }
    const interval = setInterval(() => {
      setTimer(timer - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, timer, finished, modes]);

  // Check for test completion conditions
  useEffect(() => {
    if (finished || !isActive) return;

    const isComplete = 
      // Time mode: timer reaches 0
      (modes.includes('time') && timer === 0) ||
      // Words mode: all words typed
      (modes.includes('words') && userInput.length >= text.length) ||
      // Custom mode: all text typed
      (modes.includes('custom') && userInput.length >= text.length) ||
      // Code mode: all code typed
      (modes.includes('code') && userInput.length >= text.length);

    if (isComplete) {
      endTest();
    }
  }, [finished, isActive, modes, timer, userInput.length, text.length]);

  // Update duration for words-only mode
  useEffect(() => {
    if (!isActive || finished || !modes.includes('words') || modes.includes('time')) return
    
    const interval = setInterval(() => {
      if (startTime) {
        setDuration(Math.floor((Date.now() - startTime) / 1000))
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isActive, finished, modes, startTime])

  // Update parent component with WPM and accuracy
  useEffect(() => {
    const rawWpm = Math.round(grossWpm);
    const accuracy = Number((stats.currentCorrect / (stats.currentCorrect + stats.currentIncorrect) * 100).toFixed(2));
    const netWpm = Math.round(rawWpm * accuracy / 100);
    setWpm(netWpm);
    setAccuracy(accuracy);
  }, [grossWpm, stats, setWpm, setAccuracy]);

  // Calculate consistency based on keystroke timing
  const calculateConsistency = (keystrokes: { correct: number; incorrect: number }): number => {
    const total = keystrokes.correct + keystrokes.incorrect;
    if (total === 0) return 0;
    return Math.round((keystrokes.correct / total) * 100);
  };

  const endTest = async () => {
    if (finished) return; // Guard against double-submission
    endTypingTest();
    setFinished(true);
    
    // Calculate final duration
    const finalDuration = modes.includes('time') 
      ? subOptions.time 
      : modes.includes('words') 
        ? duration 
        : DEFAULT_TIME;

    // Calculate consistency
    const consistencyScore = calculateConsistency(typingKeystrokes);

    // Calculate final stats
    const rawWpm = Math.round(grossWpm);
    const finalAccuracy = Number((stats.currentCorrect / (stats.currentCorrect + stats.currentIncorrect) * 100).toFixed(2));
    const finalWpm = Math.round(rawWpm * finalAccuracy / 100);

    // Format character logs for API
    const formattedCharLogs = Object.entries(typingCharLogs).map(([char, log]) => ({
      char,
      attempts: log.attempts,
      errors: log.errors,
      total_time: log.deltas.reduce((sum, delta) => sum + delta, 0)
    }));

    const result: TestResult = {
      wpm: finalWpm,
      accuracy: finalAccuracy,
      time: finalDuration,
      keystrokes: typingKeystrokes,
      charStats: Object.entries(typingCharLogs).map(([char, log]) => ({
        char,
        correct: log.attempts - log.errors > 0,
        time: log.deltas[log.deltas.length - 1] || 0
      }))
    };

    try {
      const saved = await saveTest({
        wpm: finalWpm,
        raw_wpm: rawWpm,
        accuracy: finalAccuracy,
        consistency: consistencyScore,
        test_type: modes.join(','),
        duration: finalDuration,
        char_logs: formattedCharLogs,
        timestamp: new Date().toISOString(),
        chars: stats,
        restarts
      });
      setTestResult(result);
      onOpen();
      navigate('/results');
    } catch (error) {
      toast({
        title: 'Error saving test results',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Reset everything and pick a new passage/words based on modes
  const handleReset = useCallback(() => {
    setRestarts(prev => prev + 1);
    resetTypingEngine();
    if (modes.includes('punctuation')) {
      setText(punctuationSample)
      setTimer(DEFAULT_TIME)
    } else if (modes.includes('numbers')) {
      setText(numberSample)
      setTimer(DEFAULT_TIME)
    } else if (modes.includes('words') && modes.includes('time')) {
      fetchTestContent()
      setTimer(subOptions.time)
    } else if (modes.includes('words')) {
      fetchTestContent()
      setTimer(Infinity)
    } else if (modes.includes('time')) {
      fetchTestContent()
      setTimer(subOptions.time)
    } else if (modes.includes('code')) {
      setText(codeSamples[codeLanguage] || codeSamples['Python'])
      setTimer(DEFAULT_TIME)
    } else if (modes.includes('zen')) {
      setText(sampleTexts[Math.floor(Math.random() * sampleTexts.length)])
      setTimer(Infinity)
    } else if (modes.includes('custom')) {
      setText(customText)
      setTimer(DEFAULT_TIME)
    }
    setWpm(0)
    setAccuracy(100)
    setShowResults(false)
    setFinished(false)
    // Refocus after a short delay
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [modes, subOptions, codeLanguage, customText, resetTypingEngine, setWpm, setAccuracy, setTimer]);

  // Renders each character in its own <Text as="span"> with data-index
  const renderText = () => {
    return text.split('').map((char, idx) => {
      let color = 'gray.600'
      let fontWeight: 'normal' | 'bold' = 'normal'
      let bg = 'transparent'
      if (userInput[idx]) {
        color = userInput[idx] === char ? 'white' : 'red.400'
        fontWeight = 'bold'
        if (customization.charFill && userInput[idx] === char) {
          bg = 'transparent'
        } else if (customization.charFill && userInput[idx] !== char) {
          bg = 'red.900'
        }
      }
      if (idx === userInput.length) {
        fontWeight = 'bold'
        color = 'yellow.300'
      }
      return (
        <Text
          as="span"
          key={idx}
          data-index={idx}
          color={color}
          fontWeight={fontWeight}
          fontSize={{ base: customization.fontSize || '2xl', md: customization.fontSize || '3xl' }}
          fontFamily={customization.font || 'mono'}
          bg={bg}
          position="relative"
          transition="color 0.1s, background 0.1s"
        >
          {char}
          {/* Cursor: only on the current character */}
          {idx === userInput.length && (
            <Cursor
              variant={customization.cursor as CursorVariant}
              isActive={isActive}
              blink={customization.cursorBlink}
            />
          )}
        </Text>
      )
    })
  }

  const handleTextClick = () => {
    if (!isActive && !finished) {
      handleInput(''); // This will initialize the typing engine
    }
    inputRef.current?.focus();
  };

  const getLanguageForHighlighting = () => {
    return codeLanguage.toLowerCase() === 'javascript' ? 'javascript' : 'python'
  }

  // Calculate written and total words and update parent
  useEffect(() => {
    const written = userInput.trim().split(/\s+/).filter(Boolean).length;
    const total = text.trim().split(/\s+/).filter(Boolean).length;
    setWrittenWords(written);
    setTotalWords(total);
  }, [userInput, text, setWrittenWords, setTotalWords]);

  // Focus warning logic
  useEffect(() => {
    const handleFocus = () => setIsFocusWarning(false);
    const handleBlur = () => setIsFocusWarning(true);
    const node = mainContainerRef.current;
    if (node) {
      node.addEventListener('focusin', handleFocus);
      node.addEventListener('focusout', handleBlur);
    }
    return () => {
      if (node) {
        node.removeEventListener('focusin', handleFocus);
        node.removeEventListener('focusout', handleBlur);
      }
    };
  }, []);

  useEffect(() => {
    // Show warning on mount if not focused
    setTimeout(() => {
      if (document.activeElement !== inputRef.current) {
        setIsFocusWarning(true);
      }
    }, 200);
  }, []);

  // Handle user typing in the hidden input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (finished) return;
    handleInput(e.target.value);
    setIsFocusWarning(false);
  };

  return (
    <Flex 
      direction="column"  
      bg="transparent" 
      align="center" 
      justify="center" 
      px={2}
      userSelect="none"
      ref={mainContainerRef}
      tabIndex={-1}
      position="relative"
      onFocusCapture={() => setIsFocusWarning(false)}
      onBlurCapture={() => setIsFocusWarning(true)}
    >
      {/* Focus Warning Overlay */}
      {isFocusWarning && (
        <FocusWarningOverlay
          mainContainerRef={mainContainerRef}
          onFocus={() => {
            setIsFocusWarning(false);
            inputRef.current?.focus();
          }}
        />
      )}
      <Flex
        align="center"
        justify="center"
        flex="1"
        width="100%"
        onClick={handleTextClick}
        tabIndex={0}
        style={{ cursor: 'default' }}
        userSelect="none"
      >
        {isLoading ? (
          <Text>Loading test content...</Text>
        ) : (
          <>
            {modes.includes('code') && (
              <CodeEditor
                code={text}
                language={getLanguageForHighlighting()}
                userInput={userInput}
                isActive={isActive || userInput.length === 0}
                onClick={handleTextClick}
              />
            )}
            {(modes.includes('words') || modes.includes('time')) && (
              <Box
                ref={textContainerRef}
                fontFamily={customization.font || 'mono'}
                fontSize={customization.fontSize ? `${customization.fontSize}px` : { base: '2xl', md: '3xl' }}
                color="gray.600"
                textAlign="left"
                width="100%"
                overflowY="hidden"
                px={{ base: 2, md: 8 }}
                py={4}
                letterSpacing="1px"
                maxW="1200px"
                maxHeight="190px" 
                lineHeight={2}
                userSelect="none"
                whiteSpace="pre-wrap"
                wordBreak="break-word"
                bg="transparent"
                cursor="default"
                sx={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  '&::-webkit-scrollbar': { display: 'none' },
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  pointerEvents: 'none',
                }}
              >
                {renderText()}
              </Box>
            )}
          </>
        )}
      </Flex>

      {/* Restart Test Icon with Hover Banner */}
      <Box position="relative" mt={8} mb={4} display="flex" justifyContent="center">
        <Button
          as="button"
          onClick={handleReset}
          p={2}
          borderRadius="full"
          bg="transparent"
          _hover={{ bg: 'gray.700' }}
          transition="all 0.2s ease"
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
          role="group"
          isDisabled={isLoading}
        >
          <FaRedo size={24} color="gray.400" />
          <Box
            position="absolute"
            bottom="-30px"
            left="50%"
            transform="translateX(-50%)"
            bg="gray.800"
            color="gray.100"
            px={3}
            py={1}
            borderRadius="md"
            fontSize="sm"
            fontWeight="bold"
            opacity={0}
            transition="opacity 0.2s ease"
            pointerEvents="none"
            whiteSpace="nowrap"
            _groupHover={{ opacity: 1 }}
            style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
          >
            Restart Test
          </Box>
        </Button>
      </Box>

      {/* Hidden Input */}
      <Input
        ref={inputRef}
        value={userInput}
        onChange={handleInputChange}
        position="absolute"
        opacity={0}
        width="1px"
        height="1px"
        top="-9999px"
        left="-9999px"
        tabIndex={-1}
        autoFocus
      />

      {/* Custom text input for "custom" mode */}
      {modes.includes('custom') && (
        <Flex align="center" justify="center" mt={4} mb={2}>
          <Textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Paste or type your custom text or code here..."
            bg="gray.800"
            color="gray.100"
            borderColor="gray.700"
            fontFamily="mono"
            fontSize="lg"
            maxW="700px"
            minH="100px"
            resize="vertical"
          />
        </Flex>
      )}
    </Flex>
  )
}

export default AdvancedTypingTest
 