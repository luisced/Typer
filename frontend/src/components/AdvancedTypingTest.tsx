import React, { useRef, useState, useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  useToast,
  useDisclosure,
  SkeletonText,
} from '@chakra-ui/react'
import CodeEditor from './CodeEditor'
import { FaRedo } from 'react-icons/fa'
import type { CustomizationConfig } from '../store/customizationStore'
import { saveTest, getTestContent } from '../api/tests'
import { useNavigate } from 'react-router-dom'
import { Cursor } from './Cursor'
import type { CursorVariant } from './Cursor'
import { FocusWarningOverlay } from './FocusWarningOverlay'
import { useTypingEngine } from '../hooks/useTypingEngine'

const codeSamples: Record<string, string> = {
  Python: `def greet(name):\n    print(f"Hello, {name}!")\n\ngreet("World")`,
  JavaScript: `function greet(name) {\n  console.log('Hello, ' + name + '!');\n}\ngreet('World');`,
}

const DEFAULT_TIME = 60

interface AdvancedTypingTestProps {
  modes: string[]
  setModes: (m: string[]) => void
  subOptions: { time: number; words: number }
  setSubOptions: (opts: { time: number; words: number }) => void
  language: string
  setLanguage: (l: string) => void
  codeLanguage: string
  setCodeLanguage: (l: string) => void
  wpm: number
  setWpm: (w: number) => void
  accuracy: number
  setAccuracy: (a: number) => void
  timer: number
  setTimer: (t: number) => void
  setWrittenWords: (n: number) => void
  setTotalWords: (n: number) => void
  customization: CustomizationConfig
}

interface TestResult {
  wpm: number
  accuracy: number
  time: number
  keystrokes: {
    correct: number
    incorrect: number
  }
  charStats: Array<{
    char: string
    correct: boolean
    time: number
  }>
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
  // Track whether the first content fetch has occurred
  const initialRequestMade = useRef(false)

  // Typing test state
  const [text, setText] = useState<string>('')
  const [showResults, setShowResults] = useState<boolean>(false)
  const [finished, setFinished] = useState<boolean>(false)
  const [customText, setCustomText] = useState<string>('')
  const [duration, setDuration] = useState<number>(0)
  const [restarts, setRestarts] = useState<number>(0)
  const [testResult, setTestResult] = useState<any>(null)
  const [isFocusWarning, setIsFocusWarning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const mainContainerRef = useRef<HTMLDivElement>(null)
  const textContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const toast = useToast()
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Typing engine hook provides userInput, isActive, stats, etc.
  const {
    userInput,
    isActive,
    finished: typingFinished,
    keystrokes: typingKeystrokes,
    charLogs: typingCharLogs,
    stats,
    grossWpm,
    handleInput,
    reset: resetTypingEngine,
    endTest: endTypingTest,
    startTime: typingStartTime,
  } = useTypingEngine(text)

  // Calculate consistency
  const calculateConsistency = (keys: { correct: number; incorrect: number }) => {
    const total = keys.correct + keys.incorrect
    if (total === 0) return 0
    return Math.round((keys.correct / total) * 100)
  }

  // === endTest needs to be declared before any useEffect that references it ===
  const endTest = useCallback(async () => {
    if (finished) return
    endTypingTest()
    setFinished(true)

    const finalDuration = modes.includes('time')
      ? subOptions.time
      : modes.includes('words')
      ? duration
      : DEFAULT_TIME

    const consistencyScore = calculateConsistency(typingKeystrokes)

    const rawWpm = Math.round(grossWpm)
    const correct = stats.currentCorrect
    const incorrect = stats.currentIncorrect
    const acc = Number(((correct / (correct + incorrect || 1)) * 100).toFixed(2))
    const net = Math.round((rawWpm * acc) / 100)

    const formattedCharLogs = Object.entries(typingCharLogs).map(
      ([char, log]) => ({
        char,
        attempts: log.attempts,
        errors: log.errors,
        total_time: log.deltas.reduce((sum, delta) => sum + delta, 0),
      })
    )

    const result: TestResult = {
      wpm: net,
      accuracy: acc,
      time: finalDuration,
      keystrokes: typingKeystrokes,
      charStats: Object.entries(typingCharLogs).map(([char, log]) => ({
        char,
        correct: log.attempts - log.errors > 0,
        time: log.deltas[log.deltas.length - 1] || 0,
      })),
    }

    try {
      await saveTest({
        wpm: net,
        raw_wpm: rawWpm,
        accuracy: acc,
        consistency: consistencyScore,
        test_type: modes.join(','),
        duration: finalDuration,
        char_logs: formattedCharLogs,
        timestamp: new Date().toISOString(),
        chars: {
          correct,
          incorrect,
          extra: stats.extra || 0,
          missed: stats.missed || 0,
        },
        restarts,
        language: language || 'en',
      })
      setTestResult(result)
      onOpen()
      navigate('/results')
    } catch (err) {
      toast({
        title: 'Error saving test results',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }, [
    finished,
    endTypingTest,
    grossWpm,
    stats,
    typingKeystrokes,
    typingCharLogs,
    modes,
    subOptions,
    duration,
    restarts,
    language,
    navigate,
    onOpen,
    toast,
  ])

  // === handleReset must be declared before any useEffect that uses it ===
  const handleReset = useCallback(() => {
    setRestarts((r) => r + 1)
    resetTypingEngine()
    initialRequestMade.current = false
    if (shouldFetchTestContent()) {
      fetchTestContent()
    }
    setWpm(0)
    setAccuracy(100)
    setShowResults(false)
    setFinished(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [
    resetTypingEngine,
    modes,
    subOptions,
    codeLanguage,
    customText,
    setWpm,
    setAccuracy,
    language,
  ])

  // === shouldFetchTestContent and fetchTestContent can stay below ===
  const shouldFetchTestContent = () => {
    // If "code" mode, set text directly and no fetch
    if (modes.includes('code')) {
      setText(codeSamples[codeLanguage] || codeSamples['Python'])
      setTimer(DEFAULT_TIME)
      return false
    }

    // If "custom", text = customText, no fetch
    if (modes.includes('custom')) {
      setText(customText)
      setTimer(DEFAULT_TIME)
      return false
    }

    // Otherwise we do need to fetch
    if (modes.includes('zen')) {
      setTimer(Infinity)
      return true
    }
    if (modes.includes('words') && modes.includes('time')) {
      setTimer(subOptions.time)
      return true
    }
    if (modes.includes('words')) {
      setTimer(Infinity)
      return true
    }
    if (modes.includes('time')) {
      setTimer(subOptions.time)
      return true
    }
    if (modes.includes('punctuation') || modes.includes('numbers')) {
      setTimer(DEFAULT_TIME)
      return true
    }
    // fallback
    setTimer(DEFAULT_TIME)
    return true
  }

  const fetchTestContent = async () => {
    try {
      setIsLoading(true)
      let content: string[] = []

      // Determine mode param for API
      let modeParam: 'words' | 'sentences' | 'code' | 'zen' | 'custom' = 'words'
      if (modes.includes('code')) modeParam = 'code'
      else if (modes.includes('zen')) modeParam = 'zen'
      else if (modes.includes('custom')) modeParam = 'custom'
      else if (modes.includes('words')) modeParam = 'words'

      // Determine wordCount logic
      const isWords = modes.includes('words')
      const isTime = modes.includes('time')
      const onlyTime = isTime && !isWords
      const wordCountParam = onlyTime ? 200 : subOptions.words

      // Use `language` prop (ISO code)
      const langCode = language || 'en'

      // Call API
      const response = await getTestContent(
        modeParam,
        wordCountParam,
        'medium',
        modes.includes('numbers'),
        modes.includes('punctuation'),
        langCode
      )

      content = Array.isArray(response.content)
        ? response.content
        : [response.content]

      // Set up text and reset states
      setText(content.join(' '))
      setTimer((prev) => prev) // timer was set in shouldFetchTestContent
      setFinished(false)
      setIsLoading(false)
      setShowResults(false)
      setDuration(0)
      setWpm(0)
      setAccuracy(100)
      setWrittenWords(0)
      setTotalWords(0)
      resetTypingEngine()
    } catch (err) {
      console.error('Error fetching test content:', err)
      setIsLoading(false)
      toast({
        title: 'Failed to load text',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // On mount and whenever dependencies change, decide whether to fetch
  useEffect(() => {
    // Avoid double-fetching on first render
    if (!initialRequestMade.current) {
      initialRequestMade.current = true
      if (shouldFetchTestContent()) {
        fetchTestContent()
      }
    } else {
      // Subsequent changes (language, modes, subOptions, etc.)
      if (shouldFetchTestContent()) {
        fetchTestContent()
      }
    }
    // We purposefully do not include setTimer in dependencies to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modes, subOptions, codeLanguage, customText, language])

  // Scroll the active character into view
  useEffect(() => {
    if (!textContainerRef.current) return
    const idx = userInput.length
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

  // Keyboard shortcuts for focus and reset
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
  }, [showResults, handleReset])

  // Always focus hidden input when test becomes active
  useEffect(() => {
    if (isActive) inputRef.current?.focus()
  }, [isActive])

  // Timer effect
  useEffect(() => {
    if (!isActive || finished || modes.includes('zen')) return
    if (timer === 0) {
      if (!finished) endTest()
      return
    }
    const interval = setInterval(() => {
      setTimer((t) => t - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isActive, timer, finished, modes, endTest])

  // Check for completion (words/time/custom/code)
  useEffect(() => {
    if (finished || !isActive) return
    const isComplete =
      (modes.includes('time') && timer === 0) ||
      (modes.includes('words') && userInput.length >= text.length) ||
      (modes.includes('custom') && userInput.length >= text.length) ||
      (modes.includes('code') && userInput.length >= text.length)

    if (isComplete) endTest()
  }, [finished, isActive, modes, timer, userInput.length, text.length, endTest])

  // Update duration in words‐only mode
  useEffect(() => {
    if (!isActive || finished || !modes.includes('words') || modes.includes('time'))
      return

    const interval = setInterval(() => {
      if (typingStartTime) {
        setDuration(Math.floor((Date.now() - typingStartTime) / 1000))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, finished, modes, typingStartTime])

  // Update parent wpm & accuracy
  useEffect(() => {
    const rawWpm = Math.round(grossWpm)
    const correct = stats.currentCorrect
    const incorrect = stats.currentIncorrect
    const acc = Number(((correct / (correct + incorrect || 1)) * 100).toFixed(2))
    const net = Math.round((rawWpm * acc) / 100)
    setWpm(net)
    setAccuracy(acc)
  }, [grossWpm, stats, setWpm, setAccuracy])

  // Render each character as a span
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
          fontSize={{
            base: customization.fontSize || '2xl',
            md: customization.fontSize || '3xl',
          }}
          fontFamily={customization.font || 'mono'}
          bg={bg}
          position="relative"
          transition="color 0.1s, background 0.1s"
        >
          {char}
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

  // Clicking on text area focuses input
  const handleTextClick = () => {
    if (!isActive && !finished) {
      handleInput('')
    }
    inputRef.current?.focus()
  }

  // Update written vs total words
  useEffect(() => {
    const written = userInput.trim().split(/\s+/).filter(Boolean).length
    const total = text.trim().split(/\s+/).filter(Boolean).length
    setWrittenWords(written)
    setTotalWords(total)
  }, [userInput, text, setWrittenWords, setTotalWords])

  // Show/hide focus-warning overlay on window blur/focus
  useEffect(() => {
    const onWindowBlur = () => setIsFocusWarning(true)
    const onWindowFocus = () => setIsFocusWarning(false)
    window.addEventListener('blur', onWindowBlur)
    window.addEventListener('focus', onWindowFocus)
    return () => {
      window.removeEventListener('blur', onWindowBlur)
      window.removeEventListener('focus', onWindowFocus)
    }
  }, [])

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
      width="100%"
      maxW="2000px"
      mx="auto"
    >
      {/* Focus Warning Overlay */}
      {isFocusWarning && (
        <FocusWarningOverlay
          mainContainerRef={mainContainerRef}
          onFocus={() => {
            setIsFocusWarning(false)
            inputRef.current?.focus()
          }}
        />
      )}

      {/* Text / Code Area */}
      <Flex
        align="center"
        justify="center"
        flex="1"
        width="100%"
        maxW="2000px"
        mx="auto"
        onClick={handleTextClick}
        tabIndex={0}
        style={{ cursor: 'default' }}
        userSelect="none"
      >
        <Box
          width="100%"
          maxW="2000px"
          px={{ base: 2, md: 8 }}
          mx="auto"
          height="190px" /* fixed height to prevent overlap */
        >
          {(() => {
            // number of skeleton lines based on word count
            let noOfLines = 1
            if ([25, 50, 100].includes(subOptions.words)) noOfLines = 3

            return (
              <SkeletonText
                noOfLines={noOfLines}
                spacing="4"
                isLoaded={!isLoading}
                skeletonHeight="32px"
                width="100%"
                height="190px" /* same fixed height */
              >
                {modes.includes('code') ? (
                  <CodeEditor
                    code={text}
                    language={
                      codeLanguage.toLowerCase() === 'javascript'
                        ? 'javascript'
                        : 'python'
                    }
                    userInput={userInput}
                    isActive={isActive || userInput.length === 0}
                    onClick={handleTextClick}
                  />
                ) : (
                  <Box
                    ref={textContainerRef}
                    data-typing-area="true"
                    fontFamily={customization.font || 'mono'}
                    fontSize={
                      customization.fontSize
                        ? `${customization.fontSize}px`
                        : { base: '2xl', md: '3xl' }
                    }
                    color="gray.600"
                    textAlign="left"
                    width="100%"
                    overflowY="hidden"
                    letterSpacing="1px"
                    maxW="100%"
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
              </SkeletonText>
            )
          })()}
        </Box>
      </Flex>

      {/* Restart Button (pushed below the 190px block) */}
      <Box
        position="relative"
        mt={4} /* smaller top margin so it sits just below */
        mb={4}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
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

      {/* Hidden Input Field */}
      <Input
        ref={inputRef}
        value={userInput}
        onChange={(e) => {
          if (finished) return
          handleInput(e.target.value)
        }}
        position="absolute"
        opacity={0}
        width="1px"
        height="1px"
        top="-9999px"
        left="-9999px"
        tabIndex={-1}
        autoFocus
      />
    </Flex>
  )
}

export default AdvancedTypingTest
