import React, { useEffect, useState, useCallback, memo } from 'react'
import {
  Box,
  Flex,
  Button,
  Icon,
  Select,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  FaAt,
  FaHashtag,
  FaClock,
  FaFont,
  FaCode,
  FaMountain,
  FaWrench,
  FaTimes,
} from 'react-icons/fa'
import Cookies from 'js-cookie'
import CustomTestModal, { type CustomTestOptions } from '../../typing-test/components/CustomTestModal'
import { getCustomTestContent } from '../../typing-test/services/tests'

// Define mode types
export type ModeKey = 'punctuation' | 'numbers' | 'time' | 'words' | 'code' | 'zen' | 'custom'

// Button configuration
const MODE_CONFIG: Record<ModeKey, { label: string; icon: React.ElementType }> = {
  punctuation: { label: 'Punctuation', icon: FaAt },
  numbers: { label: 'Numbers', icon: FaHashtag },
  time: { label: 'Time', icon: FaClock },
  words: { label: 'Words', icon: FaFont },
  code: { label: 'Code', icon: FaCode },
  zen: { label: 'Zen', icon: FaMountain },
  custom: { label: 'Custom', icon: FaWrench },
}

const MIXABLE: ModeKey[] = ['punctuation', 'numbers', 'time', 'words']
const EXCLUSIVE: ModeKey[] = ['code', 'zen', 'custom']
const TIME_OPTIONS = [15, 30, 60] as const
const WORD_OPTIONS = [10, 25, 50, 100] as const
const LANGUAGE_MAP: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
}
const LANG_COMPAT: Record<string, string> = {
  English: 'en',
  Spanish: 'es',
  French: 'fr',
  German: 'de',
}
const CODE_LANGUAGES = ['Python', 'JavaScript']

interface SubOptions {
  time: typeof TIME_OPTIONS[number]
  words: typeof WORD_OPTIONS[number]
}

interface OptionBarProps {
  modes: ModeKey[]
  setModes: (modes: ModeKey[]) => void
  subOptions: SubOptions
  setSubOptions: (opts: SubOptions) => void
  language: string
  setLanguage: (lang: string) => void
  codeLanguage: string
  setCodeLanguage: (lang: string) => void
  onStartCustomTest?: (content: string) => void
}

const OptionBar: React.FC<OptionBarProps> = memo(({
  modes,
  setModes,
  subOptions,
  setSubOptions,
  language,
  setLanguage,
  codeLanguage,
  setCodeLanguage,
  onStartCustomTest,
}) => {
  const bg = useColorModeValue('gray.800', 'gray.800')
  const activeColor = 'yellow.400'
  const inactiveColor = 'gray.400'
  const subInactiveColor = 'gray.500'

  const [isCustomOpen, setCustomOpen] = useState(false)
  const [loadingCustom, setLoadingCustom] = useState(false)
  const [errorCustom, setErrorCustom] = useState<string | null>(null)

  // Handle persisted language
  const handleLanguageChange = useCallback((iso: string) => {
    setLanguage(iso)
    Cookies.set('typingTestLanguage', iso, { expires: 365 })
  }, [setLanguage])

  useEffect(() => {
    const saved = Cookies.get('typingTestLanguage')
    if (!saved) return handleLanguageChange('en')
    if (LANGUAGE_MAP[saved]) return setLanguage(saved)
    if (LANG_COMPAT[saved]) return handleLanguageChange(LANG_COMPAT[saved])
    handleLanguageChange('en')
  }, [handleLanguageChange, setLanguage])

  const handleModeToggle = useCallback((mode: ModeKey) => {
    if (EXCLUSIVE.includes(mode)) {
      setModes([mode])
      if (mode === 'custom') setCustomOpen(true)
      return
    }
    // Mixable
    if (modes.includes(mode)) {
      // Prevent deselect both time & words
      if ((mode === 'time' && !modes.includes('words')) || (mode === 'words' && !modes.includes('time'))) {
        return
      }
      setModes(modes.filter(m => m !== mode))
    } else {
      const filtered = modes.filter(m => !EXCLUSIVE.includes(m))
      setModes([...filtered, mode])
    }
  }, [modes, setModes])

  const submitCustom = async (opts: CustomTestOptions) => {
    setLoadingCustom(true)
    setErrorCustom(null)
    try {
      const content = opts.customText
        ? opts.customText
        : (await getCustomTestContent({
            count: opts.count,
            level: opts.level,
            include_numbers: opts.include_numbers,
            include_punctuation: opts.include_punctuation,
            lang: opts.lang,
          })).content
      onStartCustomTest?.(content)
    } catch (err: any) {
      setErrorCustom(err?.response?.data?.detail || 'Error fetching custom test')
    } finally {
      setLoadingCustom(false)
    }
  }

  return (
    <>
      <Flex
        align="center"
        bg={bg}
        borderRadius="lg"
        px={4}
        py={2}
        mt={6}
        mb={4}
        boxShadow="md"
        gap={2}
        width="fit-content"
        mx="auto"
      >
        {Object.entries(MODE_CONFIG).map(([key, { label, icon }]) => (
          <Button
            key={key}
            onClick={() => handleModeToggle(key as ModeKey)}
            leftIcon={<Icon as={icon} />}
            variant="ghost"
            color={modes.includes(key as ModeKey) ? activeColor : inactiveColor}
            fontWeight={modes.includes(key as ModeKey) ? 'bold' : 'normal'}
            _hover={{ color: activeColor }}
            px={3}
            py={1}
            fontSize="md"
            transition="0.2s"
          >
            {label}
          </Button>
        ))}

        <Box overflow="hidden" transition="0.3s">
          {modes.includes('time') && (
            <Flex ml={4} gap={1}>
              {TIME_OPTIONS.map(t => (
                <Button
                  key={t}
                  onClick={() => setSubOptions({ ...subOptions, time: t })}
                  variant="ghost"
                  color={subOptions.time === t ? activeColor : subInactiveColor}
                  fontWeight={subOptions.time === t ? 'bold' : 'normal'}
                  px={2}
                >
                  {t}
                </Button>
              ))}
            </Flex>
          )}
          {modes.includes('words') && (
            <Flex ml={4} gap={1}>
              {WORD_OPTIONS.map(w => (
                <Button
                  key={w}
                  onClick={() => setSubOptions({ ...subOptions, words: w })}
                  variant="ghost"
                  color={subOptions.words === w ? activeColor : subInactiveColor}
                  fontWeight={subOptions.words === w ? 'bold' : 'normal'}
                  px={2}
                >
                  {w}
                </Button>
              ))}
            </Flex>
          )}
          {modes.includes('code') && (
            <Select
              value={codeLanguage}
              onChange={e => setCodeLanguage(e.target.value)}
              variant="unstyled"
              ml={4}
              fontWeight="bold"
              size="sm"
              width="120px"
            >
              {CODE_LANGUAGES.map(lang => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </Select>
          )}
        </Box>

        <Select
          value={language}
          onChange={e => handleLanguageChange(e.target.value)}
          size="sm"
          width="120px"
          variant="filled"
          bg={useColorModeValue('gray.100', 'gray.700')}
          _hover={{ bg: useColorModeValue('gray.200', 'gray.600') }}
          borderRadius="md"
          fontWeight="medium"
          color={useColorModeValue('gray.800', 'gray.100')}
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.600')}
          _focus={{
            borderColor: 'blue.400',
            boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)',
          }}
        >
          {Object.entries(LANGUAGE_MAP).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </Select>

        <Button variant="ghost" onClick={() => setModes([])} px={2} py={1}>
          <Icon as={FaTimes} />
        </Button>
      </Flex>

      <CustomTestModal
        isOpen={isCustomOpen}
        onClose={() => setCustomOpen(false)}
        onSubmit={submitCustom}
        isLoading={loadingCustom}
        error={errorCustom}
      />
    </>
  )
})

export default OptionBar
