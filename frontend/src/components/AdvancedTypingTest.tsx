import React, { useRef, useState, useEffect, useCallback } from 'react'
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
import { saveTest } from '../api/tests'
import { useNavigate } from 'react-router-dom'
import { Cursor } from './Cursor'
import type { CursorVariant } from './Cursor'
import { FocusWarningOverlay } from './FocusWarningOverlay'

const punctuationSample =
  "Hello, world! How are you? Let's test: commas, periods. Semicolons; colons: dashes - and more!"
const numberSample =
  "In 2023, the population was 7.9 billion. 1, 2, 3, 4, 5... The code 123-456-7890 is a phone number."
const codeSamples: Record<string, string> = {
  Python: `def greet(name):\n    print(f\"Hello, {name}!\")\n\ngreet(\"World\")`,
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
  const [userInput, setUserInput] = useState<string>('')
  const [isActive, setIsActive] = useState<boolean>(false)
  const [showResults, setShowResults] = useState<boolean>(false)
  const [topic, setTopic] = useState<string>('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [finished, setFinished] = useState<boolean>(false)
  const [customText, setCustomText] = useState<string>('')
  const [isZenMode, setIsZenMode] = useState<boolean>(false)
  const [duration, setDuration] = useState<number>(0)
  const [restarts, setRestarts] = useState<number>(0)
  const [consistency, setConsistency] = useState<number>(0)
  const [charStats, setCharStats] = useState<Array<{ char: string; correct: boolean; time: number }>>([])
  const [keystrokes, setKeystrokes] = useState<{ correct: number; incorrect: number }>({ correct: 0, incorrect: 0 })
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState<number | null>(null)
  const [charLogs, setCharLogs] = useState<Record<string, {
    attempts: number;
    errors: number;
    total_time: number;
    last_attempt_time: number | null;
  }>>({})
  const toast = useToast()
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [testResult, setTestResult] = useState<any>(null)
  const [isFocusWarning, setIsFocusWarning] = useState(false)
  const mainContainerRef = useRef<HTMLDivElement>(null)

  // Ref for the text container
  const textContainerRef = useRef<HTMLDivElement>(null)

  // Generate random words, optionally with punctuation/numbers
  const generateWords = (count: number, withPunctuation = false, withNumbers = false) => {
    let words: string[] = []
    const punctuations = [',', '.', ';', ':', '!', '?']
    for (let i = 0; i < count; i++) {
      let word = wordBank[Math.floor(Math.random() * wordBank.length)]
      if (withNumbers && Math.random() < 0.15) {
        word = String(Math.floor(Math.random() * 10000))
      }
      if (withPunctuation && Math.random() < 0.2) {
        word += punctuations[Math.floor(Math.random() * punctuations.length)]
      }
      words.push(word)
    }
    return words.join(' ')
  }

  // Update text/timer on mode/subOption/codeLanguage change
  useEffect(() => {
    setUserInput('')
    setIsActive(false)
    setShowResults(false)
    setStartTime(null)
    setFinished(false)
    setIsZenMode(modes.includes('zen'))

    const withPunctuation = modes.includes('punctuation')
    const withNumbers = modes.includes('numbers')

    if (modes.includes('code')) {
      setText(codeSamples[codeLanguage] || codeSamples['Python'])
      setTimer(DEFAULT_TIME)
    } else if (modes.includes('zen')) {
      setText(sampleTexts[Math.floor(Math.random() * sampleTexts.length)])
      setTimer(Infinity)
    } else if (modes.includes('custom')) {
      setText(customText)
      setTimer(DEFAULT_TIME)
    } else if (modes.includes('words') && modes.includes('time')) {
      setText(generateWords(subOptions.words, withPunctuation, withNumbers))
      setTimer(subOptions.time)
    } else if (modes.includes('words')) {
      setText(generateWords(subOptions.words, withPunctuation, withNumbers))
      setTimer(Infinity)
    } else if (modes.includes('time')) {
      setText(generateWords(200, withPunctuation, withNumbers))
      setTimer(subOptions.time)
    } else if (modes.includes('punctuation')) {
      setText(punctuationSample)
      setTimer(DEFAULT_TIME)
    } else if (modes.includes('numbers')) {
      setText(numberSample)
      setTimer(DEFAULT_TIME)
    } else {
      setText(sampleTexts[Math.floor(Math.random() * sampleTexts.length)])
      setTimer(DEFAULT_TIME)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modes, subOptions, codeLanguage])

  // Update text when customText changes in custom mode
  useEffect(() => {
    if (modes.includes('custom')) {
      setText(customText)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customText])

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

  // Decrement timer every second (unless in zen mode or already finished)
  useEffect(() => {
    if (!isActive || finished || modes.includes('zen')) return
    if (timer === 0) {
      if (!finished) {
        endTest()
      }
      return
    }
    const interval = setInterval(() => {
      setTimer(timer - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isActive, timer, finished, modes])

  const inputRef = useRef<HTMLInputElement>(null)

  // Handle user typing in the hidden input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive && !finished) {
      setIsActive(true)
      const now = Date.now()
      setStartTime(now)
      setLastKeystrokeTime(now)
      // Start duration tracking for words-only mode
      if (modes.includes('words') && !modes.includes('time')) {
        setDuration(0)
      }
    }
    if (finished) return
    const value = e.target.value
    // Prevent typing beyond the length of `text`
    if (value.length > text.length) return

    // Track keystroke timing for consistency
    const now = Date.now()
    if (lastKeystrokeTime) {
      setKeystrokes(prev => ({
        correct: prev.correct + (text[value.length - 1] === text[value.length - 2] ? 1 : 0),
        incorrect: prev.incorrect + (text[value.length - 1] !== text[value.length - 2] ? 1 : 0)
      }))
    }
    setLastKeystrokeTime(now)

    // Track character-level statistics
    const currentChar = text[value.length - 1]
    if (currentChar) {
      setCharStats(prev => [...prev, { char: currentChar, correct: value[value.length - 1] === currentChar, time: now - (startTime || Date.now()) }])
      setCharLogs(prev => {
        const charLog = prev[currentChar] || {
          attempts: 0,
          errors: 0,
          total_time: 0,
          last_attempt_time: null
        }
        
        const isCorrect = value[value.length - 1] === currentChar
        const timeSinceLastAttempt = charLog.last_attempt_time ? now - charLog.last_attempt_time : 0
        
        return {
          ...prev,
          [currentChar]: {
            attempts: charLog.attempts + 1,
            errors: charLog.errors + (isCorrect ? 0 : 1),
            total_time: charLog.total_time + timeSinceLastAttempt,
            last_attempt_time: now
          }
        }
      })
    }

    setUserInput(value)
    setIsFocusWarning(false)
  }

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

  // Recompute WPM, accuracy, and check for test completion
  useEffect(() => {
    let correct = 0
    let err = 0
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === text[i]) correct++
      else err++
    }
    setAccuracy(userInput.length ? Math.round((correct / userInput.length) * 100) : 100)
    if (isActive && startTime) {
      const elapsed = (Date.now() - startTime) / 60000
      setWpm(elapsed > 0 ? Math.round((correct / 5) / elapsed) : 0)
    }
    // If fully typed and not in zen mode, end the test
    if (
      userInput.length === text.length &&
      !modes.includes('zen') &&
      !finished &&
      isActive
    ) {
      endTest()
    }
  }, [userInput, text, isActive, startTime, modes, finished])

  // Calculate consistency based on keystroke timing
  const calculateConsistency = (keystrokes: { correct: number; incorrect: number }): number => {
    const total = keystrokes.correct + keystrokes.incorrect
    if (total < 2) return 0;
    const withinRange = Math.abs(keystrokes.correct - keystrokes.incorrect) / total <= 0.2
    return withinRange ? 100 : 0;
  };

  const endTest = async () => {
    setFinished(true)
    setIsActive(false)
    
    // Calculate final duration
    const finalDuration = modes.includes('time') 
      ? subOptions.time 
      : modes.includes('words') 
        ? duration 
        : DEFAULT_TIME

    // Calculate raw WPM (all characters / 5 / minutes)
    const rawWpm = startTime 
      ? Math.round((userInput.length / 5) / (finalDuration / 60) * 100) / 100
      : 0

    // Calculate character statistics
    let correct = 0
    let incorrect = 0
    let extra = 0
    let missed = 0

    for (let i = 0; i < Math.max(text.length, userInput.length); i++) {
      if (i >= text.length) {
        extra++ // User typed more than the text
      } else if (i >= userInput.length) {
        missed++ // User didn't type enough
      } else if (userInput[i] === text[i]) {
        correct++
      } else {
        incorrect++
      }
    }

    // Calculate consistency
    const consistencyScore = calculateConsistency(keystrokes)

    // Format character logs for API
    const formattedCharLogs = Object.entries(charLogs).map(([char, stats]) => ({
      char,
      attempts: stats.attempts,
      errors: stats.errors,
      total_time: stats.total_time
    }))

    const result: TestResult = {
      wpm: rawWpm,
      accuracy: Math.round((correct / userInput.length) * 100),
      time: finalDuration,
      keystrokes,
      charStats,
    };

    try {
      const saved = await saveTest({
        wpm: rawWpm,
        raw_wpm: rawWpm,
        accuracy: Math.round((correct / userInput.length) * 100),
        consistency: consistencyScore,
        test_type: modes.join(','),
        duration: finalDuration,
        char_logs: formattedCharLogs,
        timestamp: new Date().toISOString(),
        chars: {
          correct,
          incorrect,
          extra,
          missed
        },
        restarts
      })
      setTestResult(result)
      onOpen()
    } catch (error) {
      toast({
        title: 'Error saving test results',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Reset everything and pick a new passage/words based on modes
  const handleReset = useCallback(() => {
    setRestarts(prev => prev + 1)
    if (modes.includes('punctuation')) {
      setText(punctuationSample)
      setTimer(DEFAULT_TIME)
    } else if (modes.includes('numbers')) {
      setText(numberSample)
      setTimer(DEFAULT_TIME)
    } else if (modes.includes('words') && modes.includes('time')) {
      setText(generateWords(subOptions.words))
      setTimer(subOptions.time)
    } else if (modes.includes('words')) {
      setText(generateWords(subOptions.words))
      setTimer(Infinity)
    } else if (modes.includes('time')) {
      setText(generateWords(200))
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
    setUserInput('')
    setWpm(0)
    setAccuracy(100)
    setIsActive(false)
    setShowResults(false)
    setStartTime(null)
    setFinished(false)
    setCharStats([])
    setKeystrokes({ correct: 0, incorrect: 0 })
    setCharLogs({}) // Reset character logs
    // Refocus after a short delay
    setTimeout(() => inputRef.current?.focus(), 100)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modes, subOptions, codeLanguage, customText])

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
      setIsActive(true)
      setStartTime(Date.now())
    }
    inputRef.current?.focus()
  }

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
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE/Edge
              '&::-webkit-scrollbar': { display: 'none' }, // Chrome/Safari
              WebkitUserSelect: 'none', // Safari
              MozUserSelect: 'none', // Firefox
              msUserSelect: 'none', // IE/Edge
              pointerEvents: 'none', // Prevent manual scrolling
            }}
          >
            {renderText()}
          </Box>
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
 