import { useState, useEffect } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import OptionBar from '../components/OptionBar'
import Stats from '../components/Stats'
import AdvancedTypingTest from '../components/AdvancedTypingTest'
import { useCustomizationStore } from '../store/customizationStore'
import { getCurrentUser } from '../utils/api'
import Cookies from 'js-cookie'

const DEFAULT_TIME = 15
const DEFAULT_WORDS = 10

const getInitialLanguage = () => {
  const saved = Cookies.get('typingTestLanguage');
  if (saved && ['en', 'es', 'fr', 'de'].includes(saved)) return saved;
  return 'en';
};

const Home: React.FC = () => {
  const [modes, setModes] = useState<string[]>(['words'])
  const [subOptions, setSubOptions] = useState<{ time: number; words: number }>({
    time: DEFAULT_TIME,
    words: DEFAULT_WORDS,
  })
  const [language, setLanguage] = useState(getInitialLanguage())
  const [codeLanguage, setCodeLanguage] = useState('Python')
  // Stats state for demo (could be lifted up from AdvancedTypingTest if needed)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [timer, setTimer] = useState(DEFAULT_TIME)
  const [writtenWords, setWrittenWords] = useState(0)
  const [totalWords, setTotalWords] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customTestContent, setCustomTestContent] = useState<string>('')

  const { config: customization } = useCustomizationStore()

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getCurrentUser()
        setUser(res.data)
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Could not fetch user data')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleStartCustomTest = (content: string) => {
    setCustomTestContent(content)
  }

  return (
    <Flex direction="column" bg="transparent" align="center" justify="flex-start" px={2}>
      <OptionBar
        modes={modes}
        setModes={setModes}
        subOptions={subOptions}
        setSubOptions={setSubOptions}
        language={language}
        setLanguage={setLanguage}
        codeLanguage={codeLanguage}
        setCodeLanguage={setCodeLanguage}
        onStartCustomTest={handleStartCustomTest}
      />
      <Stats wpm={wpm} accuracy={accuracy} timer={timer} modes={modes} writtenWords={writtenWords} totalWords={totalWords} />
      <Box >
        <Flex minH="60vh" align="center" justify="center">
          <AdvancedTypingTest
            modes={modes}
            setModes={setModes}
            subOptions={subOptions}
            setSubOptions={setSubOptions}
            language={language}
            setLanguage={setLanguage}
            codeLanguage={codeLanguage}
            setCodeLanguage={setCodeLanguage}
            wpm={wpm}
            setWpm={setWpm}
            accuracy={accuracy}
            setAccuracy={setAccuracy}
            timer={timer}
            setTimer={setTimer}
            setWrittenWords={setWrittenWords}
            setTotalWords={setTotalWords}
            customization={customization}
            customTestContent={customTestContent}
          />
        </Flex>
      </Box>
    </Flex>
  )
}

export default Home 