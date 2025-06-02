import React, { useRef, useState, useEffect, useCallback } from 'react'
import {
  Box, Button, Flex, Input, Text, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Textarea
} from '@chakra-ui/react'
import OptionBar from './OptionBar'
import CodeEditor from './CodeEditor'

const punctuationSample = "Hello, world! How are you? Let's test: commas, periods. Semicolons; colons: dashes - and more!"
const numberSample = "In 2023, the population was 7.9 billion. 1, 2, 3, 4, 5... The code 123-456-7890 is a phone number."
const codeSamples: Record<string, string> = {
  Python: `def greet(name):\n    print(f\"Hello, {name}!\")\n\ngreet(\"World\")`,
  JavaScript: `function greet(name) {\n  console.log('Hello, ' + name + '!');\n}\ngreet('World');`
}
const wordBank = [
  "life", "world", "take", "week", "said", "are", "by", "light", "back", "us", "three", "come", "has", "hot", "point", "round", "new", "build", "could", "give", "how", "these", "want", "fire", "from", "would", "spell", "book", "high", "help"
]
const sampleTexts = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.",
  "Programming is the art of telling another human being what one wants the computer to do.",
  "Simplicity is the ultimate sophistication. Less is more. Good design is invisible.",
  "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune.",
  "The journey of a thousand miles begins with a single step. An investment in knowledge pays the best interest."
]

const DEFAULT_TIME = 60

const AdvancedTypingTest = () => {
  // OptionBar state
  const [modes, setModes] = useState<string[]>(['words'])
  const [subOption, setSubOption] = useState(10)
  const [language, setLanguage] = useState('English')
  const [codeLanguage, setCodeLanguage] = useState('Python')

  // Typing test state
  const [text, setText] = useState('')
  const [userInput, setUserInput] = useState('')
  const [timer, setTimer] = useState(DEFAULT_TIME)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [errors, setErrors] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [topic, setTopic] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)
  const [customText, setCustomText] = useState('')
  const [isZenMode, setIsZenMode] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  // Generate random words
  const generateWords = (count: number) => {
    let words = []
    for (let i = 0; i < count; i++) {
      words.push(wordBank[Math.floor(Math.random() * wordBank.length)])
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
    
    if (modes.includes('punctuation')) {
      setText(punctuationSample)
      setTimer(DEFAULT_TIME)
    } else if (modes.includes('numbers')) {
      setText(numberSample)
      setTimer(DEFAULT_TIME)
    } else if (modes.includes('words')) {
      setText(generateWords(subOption))
      setTimer(DEFAULT_TIME)
    } else if (modes.includes('time')) {
      setText(sampleTexts[Math.floor(Math.random() * sampleTexts.length)])
      setTimer(subOption)
    } else if (modes.includes('code')) {
      setText(codeSamples[codeLanguage] || codeSamples['Python'])
      setTimer(DEFAULT_TIME)
    } else if (modes.includes('zen')) {
      setText(sampleTexts[Math.floor(Math.random() * sampleTexts.length)])
      setTimer(Infinity) // Infinite time for zen mode
    } else if (modes.includes('custom')) {
      setText(customText)
      setTimer(DEFAULT_TIME)
    }
    // eslint-disable-next-line
  }, [modes, subOption, codeLanguage])

  // Update text when customText changes in custom mode
  useEffect(() => {
    if (modes.includes('custom')) {
      setText(customText)
    }
    // eslint-disable-next-line
  }, [customText])

  // Keyboard shortcuts
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

  useEffect(() => {
    if (isActive) inputRef.current?.focus()
  }, [isActive])

  // Timer effect (skip for zen mode)
  useEffect(() => {
    if (!isActive || finished || modes.includes('zen')) return
    if (timer === 0) {
      endTest()
      return
    }
    const interval = setInterval(() => {
      setTimer(t => t - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isActive, timer, finished, modes])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive && !finished) {
      setIsActive(true)
      setStartTime(Date.now())
    }
    if (finished) return
    const value = e.target.value
    if (value.length > text.length) return
    setUserInput(value)
  }

  useEffect(() => {
    let correct = 0
    let err = 0
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === text[i]) correct++
      else err++
    }
    setErrors(err)
    setAccuracy(userInput.length ? Math.round((correct / userInput.length) * 100) : 100)
    if (isActive && startTime) {
      const elapsed = (Date.now() - startTime) / 60000
      setWpm(elapsed > 0 ? Math.round((correct / 5) / elapsed) : 0)
    }
    // End test if completed (not in zen mode)
    if (userInput.length === text.length && text.length > 0 && !finished && !modes.includes('zen')) {
      endTest()
    }
  }, [userInput, text, isActive, startTime, finished, modes])

  const endTest = useCallback(() => {
    setIsActive(false)
    setFinished(true)
    setShowResults(true)
  }, [])

  const handleReset = useCallback(() => {
    if (modes.includes('punctuation')) {
      setText(punctuationSample)
      setTimer(DEFAULT_TIME)
    } else if (modes.includes('numbers')) {
      setText(numberSample)
      setTimer(DEFAULT_TIME)
    } else if (modes.includes('words')) {
      setText(generateWords(subOption))
      setTimer(DEFAULT_TIME)
    } else if (modes.includes('time')) {
      setText(sampleTexts[Math.floor(Math.random() * sampleTexts.length)])
      setTimer(subOption)
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
    setErrors(0)
    setIsActive(false)
    setShowResults(false)
    setStartTime(null)
    setFinished(false)
    setTimeout(() => inputRef.current?.focus(), 100)
    // eslint-disable-next-line
  }, [modes, subOption, codeLanguage, customText])

  const handleGenerateAI = () => {
    toast({ title: 'AI text generation not implemented yet', status: 'info' })
  }

  const renderText = () => {
    return text.split('').map((char, idx) => {
      let color = 'gray.600'
      let fontWeight = 'normal'
      if (userInput[idx]) {
        color = userInput[idx] === char ? 'white' : 'red.400'
        fontWeight = userInput[idx] === char ? 'bold' : 'bold'
      }
      if (idx === userInput.length) {
        fontWeight = 'bold'
        color = 'yellow.300'
      }
      return (
        <Text as="span" key={idx} color={color} fontWeight={fontWeight} fontSize={{ base: '2xl', md: '3xl' }} position="relative" transition="color 0.1s">
          {char}
          {/* Cursor - blinks only when not active */}
          {idx === userInput.length && (
            <Box 
              as="span" 
              w="2px" 
              h="1.2em" 
              bg="yellow.300" 
              position="absolute" 
              left={0} 
              top={0} 
              animation={!isActive ? "blink 1s step-end infinite" : "none"}
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

  return (
    <Flex direction="column" minH="100vh" bg="gray.900" align="center" justify="center" px={2}>
      {/* Option Bar */}
      <OptionBar
        modes={modes}
        setModes={setModes}
        subOption={subOption}
        setSubOption={setSubOption}
        language={language}
        setLanguage={setLanguage}
        codeLanguage={codeLanguage}
        setCodeLanguage={setCodeLanguage}
      />
      
      {/* Stats Area */}
      <Flex justify="center" align="center" gap={8} mt={2} mb={12}>
        <Box textAlign="center" minW="100px">
          <Text fontSize="sm" color="gray.500">WPM</Text>
          <Text fontSize="2xl" fontWeight="bold" color="white">{wpm}</Text>
        </Box>
        <Box textAlign="center" minW="100px">
          <Text fontSize="sm" color="gray.500">Accuracy</Text>
          <Text fontSize="2xl" fontWeight="bold" color="white">{accuracy}%</Text>
        </Box>
        {!modes.includes('zen') && (
          <Box textAlign="center" minW="100px">
            <Text fontSize="sm" color="gray.500">Time</Text>
            <Text fontSize="2xl" fontWeight="bold" color="white">{timer}s</Text>
          </Box>
        )}
        {modes.includes('zen') && (
          <Box textAlign="center" minW="100px">
            <Text fontSize="sm" color="gray.500">Mode</Text>
            <Text fontSize="2xl" fontWeight="bold" color="yellow.300">ZEN</Text>
          </Box>
        )}
      </Flex>
      
      {/* Text Display Area */}
      <Flex
        align="center"
        justify="center"
        flex="1"
        width="100%"
        onClick={handleTextClick}
        tabIndex={0}
        style={{ cursor: 'pointer' }}
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
        {modes.includes('words') && (
          <Box
            fontFamily="mono"
            fontSize={{ base: '2xl', md: '3xl' }}
            color="gray.600"
            textAlign="center"
            maxW="900px"
            width="100%"
            minH="180px"
            px={{ base: 2, md: 8 }}
            py={4}
            letterSpacing="1px"
            lineHeight={1.8}
            userSelect="none"
          >
            {renderText()}
          </Box>
        )}
      </Flex>
      
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
      
      {/* Custom text input for custom mode */}
      {modes.includes('custom') && (
        <Flex align="center" justify="center" mt={4} mb={2}>
          <Textarea
            value={customText}
            onChange={e => setCustomText(e.target.value)}
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
      
      {/* Controls Area */}
      <Flex gap={2} align="center" mt={8} mb={8}>
        <Input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="Enter a topic for AI text..."
          bg="gray.800"
          color="gray.100"
          borderColor="gray.700"
          _placeholder={{ color: 'gray.500' }}
          maxW="300px"
        />
        <Button onClick={handleGenerateAI} colorScheme="yellow" variant="solid" fontWeight="bold">
          Generate Text
        </Button>
        <Button onClick={handleReset} colorScheme="gray" variant="ghost" fontWeight="bold">
          Reset
        </Button>
      </Flex>
      
      {/* Results Popup */}
      <Modal isOpen={showResults} onClose={() => setShowResults(false)} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800" color="gray.100" borderRadius="lg" border="1px solid" borderColor="gray.600">
          <ModalHeader textAlign="center">TEST COMPLETE!</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="xl" mb={2}>WPM: <b>{wpm}</b></Text>
            <Text fontSize="xl" mb={2}>Accuracy: <b>{accuracy}%</b></Text>
            <Text fontSize="xl" mb={2}>Characters Typed: <b>{userInput.length}</b></Text>
            <Text fontSize="xl" mb={2}>Errors: <b>{errors}</b></Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="yellow" onClick={handleReset} fontWeight="bold">Try Another Text</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  )
}

export default AdvancedTypingTest 