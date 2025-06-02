import { Box, Flex, Button, Icon, Select, useColorModeValue, Collapse } from '@chakra-ui/react'
import { FaAt, FaHashtag, FaClock, FaFont, FaCode, FaMountain, FaWrench, FaTimes } from 'react-icons/fa'

const mainOptions = [
  { key: 'punctuation', label: 'punctuation', icon: FaAt },
  { key: 'numbers', label: 'numbers', icon: FaHashtag },
  { key: 'time', label: 'time', icon: FaClock },
  { key: 'words', label: 'words', icon: FaFont },
  { key: 'code', label: 'code', icon: FaCode },
  { key: 'zen', label: 'zen', icon: FaMountain },
  { key: 'custom', label: 'custom', icon: FaWrench },
]

// Options that can be mixed together
const mixableOptions = ['punctuation', 'numbers', 'time', 'words']
// Options that are exclusive (can't be mixed)
const exclusiveOptions = ['code', 'zen', 'custom']

const timeOptions = [15, 30, 60]
const wordOptions = [10, 25, 50, 100]
const languageOptions = ['English', 'Spanish', 'French', 'German']
const codeLanguages = ['Python', 'JavaScript']

const OptionBar = ({
  modes, setModes, subOption, setSubOption, language, setLanguage, codeLanguage, setCodeLanguage
}: {
  modes: string[]
  setModes: (m: string[]) => void
  subOption: number | null
  setSubOption: (n: number) => void
  language: string
  setLanguage: (l: string) => void
  codeLanguage: string
  setCodeLanguage: (l: string) => void
}) => {
  const bg = useColorModeValue('gray.800', 'gray.800')
  const activeColor = 'yellow.400'
  const inactiveColor = 'gray.400'
  const subInactive = 'gray.500'

  const handleModeClick = (mode: string) => {
    if (exclusiveOptions.includes(mode)) {
      // Exclusive modes replace all other modes
      setModes([mode])
    } else {
      // Mixable modes can be toggled
      if (modes.includes(mode)) {
        // Remove the mode
        setModes(modes.filter(m => m !== mode))
      } else {
        // Add the mode, but remove any exclusive modes first
        const filteredModes = modes.filter(m => !exclusiveOptions.includes(m))
        setModes([...filteredModes, mode])
      }
    }
  }

  return (
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
      transition="all 0.3s ease"
    >
      {mainOptions.map(opt => (
        <Button
          key={opt.key}
          onClick={() => handleModeClick(opt.key)}
          leftIcon={<Icon as={opt.icon} />}
          variant="ghost"
          color={modes.includes(opt.key) ? activeColor : inactiveColor}
          fontWeight={modes.includes(opt.key) ? 'bold' : 'normal'}
          _hover={{ color: activeColor, bg: 'gray.700' }}
          _active={{ bg: 'gray.700' }}
          px={3}
          py={1}
          fontSize="md"
          transition="all 0.2s ease"
        >
          {opt.label}
        </Button>
      ))}
      
      {/* Sub-options with smooth transitions */}
      <Box transition="all 0.3s ease" overflow="hidden">
        {/* Sub-options for time/words */}
        {modes.includes('time') && (
          <Flex gap={1} ml={4} animation="fadeIn 0.3s ease">
            {timeOptions.map(t => (
              <Button
                key={t}
                onClick={() => setSubOption(t)}
                variant="ghost"
                color={subOption === t ? activeColor : subInactive}
                fontWeight={subOption === t ? 'bold' : 'normal'}
                fontSize="md"
                px={2}
                py={1}
                transition="all 0.2s ease"
              >
                {t}
              </Button>
            ))}
          </Flex>
        )}
        {modes.includes('words') && (
          <Flex gap={1} ml={4} animation="fadeIn 0.3s ease">
            {wordOptions.map(w => (
              <Button
                key={w}
                onClick={() => setSubOption(w)}
                variant="ghost"
                color={subOption === w ? activeColor : subInactive}
                fontWeight={subOption === w ? 'bold' : 'normal'}
                fontSize="md"
                px={2}
                py={1}
                transition="all 0.2s ease"
              >
                {w}
              </Button>
            ))}
          </Flex>
        )}
        {/* Sub-options for code */}
        {modes.includes('code') && (
          <Select
            value={codeLanguage}
            onChange={e => setCodeLanguage(e.target.value)}
            bg="gray.900"
            color="yellow.400"
            border="none"
            fontWeight="bold"
            fontSize="md"
            width="auto"
            ml={4}
            _focus={{ outline: 'none' }}
            transition="all 0.2s ease"
          >
            {codeLanguages.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </Select>
        )}
      </Box>
      
      {/* Language picker */}
      <Select
        value={language}
        onChange={e => setLanguage(e.target.value)}
        bg="gray.900"
        color="gray.300"
        border="none"
        fontWeight="bold"
        fontSize="md"
        width="auto"
        ml={4}
        _focus={{ outline: 'none' }}
        transition="all 0.2s ease"
      >
        {languageOptions.map(l => (
          <option key={l} value={l}>{l}</option>
        ))}
      </Select>
      <Button variant="ghost" color={inactiveColor} px={2} py={1} ml={2} fontSize="lg" transition="all 0.2s ease">
        <Icon as={FaTimes} />
      </Button>
    </Flex>
  )
}

export default OptionBar 