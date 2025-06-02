import { useCustomizationStore } from '../../store/customizationStore'
import {
  Box, VStack, FormControl, FormLabel, Select, Input, Button, Text, Switch, Slider, SliderTrack, SliderFilledTrack, SliderThumb, HStack, RadioGroup, Radio, Box as ChakraBox
} from '@chakra-ui/react'

const themeOptions = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'custom', label: 'Custom' },
]
const cursorOptions = [
  { value: 'bar', label: 'Bar |' },
  { value: 'underscore', label: 'Underscore _' },
  { value: 'block', label: 'Block █' },
]
const soundSets = [
  { value: 'classic', label: 'Classic' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'modern', label: 'Modern' },
]
const fontFamilies = [
  { value: 'monospace', label: 'Monospace' },
  { value: 'serif', label: 'Serif' },
  { value: 'sans-serif', label: 'Sans Serif' },
]

const CustomizationSettings = () => {
  const { config, setConfig, resetConfig } = useCustomizationStore()

  const themeSwatches = [
    { value: 'classic-dark', label: 'Classic Dark', color: '#1c1c1a' },
    { value: 'moon-light', label: 'Moon Light', color: '#fff' },
    { value: 'octagon', label: 'Octagon', color: 'var(--chakra-colors-gray-900)' },
    { value: 'custom', label: 'Custom', color: config.accent },
  ]

  return (
    <Box maxW="md" mx="auto" bg="gray.800" borderRadius="lg" p={8} boxShadow="lg">
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">Customization</Text>
        {/* Theme Swatch Picker */}
        <FormControl>
          <FormLabel>Theme</FormLabel>
          <HStack spacing={4} mb={2}>
            {themeSwatches.map(opt => (
              <ChakraBox
                key={opt.value}
                as="button"
                aria-label={opt.label}
                borderRadius="lg"
                boxSize="40px"
                bg={opt.color}
                border={config.theme === opt.value ? '3px solid #FFD700' : '2px solid #444'}
                boxShadow={config.theme === opt.value ? '0 0 0 2px #FFD700' : 'none'}
                transition="all 0.2s"
                outline="none"
                _focus={{ boxShadow: '0 0 0 2px #3182ce' }}
                onClick={() => setConfig({ theme: opt.value })}
                position="relative"
                cursor="pointer"
              >
                {opt.value === 'custom' && (
                  <Box
                    position="absolute"
                    bottom={1}
                    right={1}
                    w="10px"
                    h="10px"
                    borderRadius="full"
                    bg={config.accent}
                    border="1px solid #fff"
                  />
                )}
              </ChakraBox>
            ))}
          </HStack>
          {/* Keep the dropdown for accessibility/fallback */}
          <Select value={config.theme} onChange={e => setConfig({ theme: e.target.value })} bg="gray.700" color="gray.100" mt={2}>
            {themeSwatches.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </FormControl>
        {config.theme === 'custom' && (
          <FormControl>
            <FormLabel>Accent Color</FormLabel>
            <Input type="color" value={config.accent} onChange={e => setConfig({ accent: e.target.value })} w="40px" h="40px" p={0} border="none" bg="transparent" />
          </FormControl>
        )}
        {/* Cursor Style */}
        <FormControl>
          <FormLabel>Cursor Style</FormLabel>
          <RadioGroup value={config.cursor} onChange={v => setConfig({ cursor: v })}>
            <HStack spacing={6}>
              {cursorOptions.map(opt => (
                <Radio key={opt.value} value={opt.value}>{opt.label}</Radio>
              ))}
            </HStack>
          </RadioGroup>
          <HStack mt={2}>
            <Switch isChecked={config.cursorBlink} onChange={e => setConfig({ cursorBlink: e.target.checked })} />
            <Text>Cursor Blinks</Text>
          </HStack>
        </FormControl>
        {/* Character Fill */}
        <FormControl display="flex" alignItems="center">
          <Switch isChecked={config.charFill} onChange={e => setConfig({ charFill: e.target.checked })} mr={2} />
          <FormLabel mb={0}>Fill character as you type</FormLabel>
        </FormControl>
        {/* Sounds */}
        <FormControl>
          <HStack>
            <Switch isChecked={config.sounds} onChange={e => setConfig({ sounds: e.target.checked })} />
            <FormLabel mb={0}>Typing Sounds</FormLabel>
          </HStack>
          {config.sounds && (
            <>
              <FormLabel mt={2}>Sound Set</FormLabel>
              <Select value={config.soundSet} onChange={e => setConfig({ soundSet: e.target.value })} bg="gray.700" color="gray.100">
                {soundSets.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
              <FormLabel mt={2}>Volume</FormLabel>
              <Slider value={config.volume} onChange={v => setConfig({ volume: v })} min={0} max={100} step={1} colorScheme="blue">
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </>
          )}
        </FormControl>
        {/* Font */}
        <FormControl>
          <FormLabel>Font Family</FormLabel>
          <Select value={config.font} onChange={e => setConfig({ font: e.target.value })} bg="gray.700" color="gray.100">
            {fontFamilies.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
          <FormLabel mt={2}>Font Size</FormLabel>
          <Slider value={config.fontSize} onChange={v => setConfig({ fontSize: v })} min={12} max={32} step={1} colorScheme="blue">
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </FormControl>
        {/* Key Highlight & On-Screen Keyboard */}
        <FormControl display="flex" alignItems="center">
          <Switch isChecked={config.keyHighlight} onChange={e => setConfig({ keyHighlight: e.target.checked })} mr={2} />
          <FormLabel mb={0}>Highlight next key</FormLabel>
        </FormControl>
        <FormControl display="flex" alignItems="center">
          <Switch isChecked={config.onScreenKeyboard} onChange={e => setConfig({ onScreenKeyboard: e.target.checked })} mr={2} />
          <FormLabel mb={0}>Show on-screen keyboard</FormLabel>
        </FormControl>
        {/* Animations */}
        <FormControl display="flex" alignItems="center">
          <Switch isChecked={config.animations} onChange={e => setConfig({ animations: e.target.checked })} mr={2} />
          <FormLabel mb={0}>Enable UI animations</FormLabel>
        </FormControl>
        {/* Show/Hide Stats & Progress Bar */}
        <FormControl display="flex" alignItems="center">
          <Switch isChecked={config.showStats} onChange={e => setConfig({ showStats: e.target.checked })} mr={2} />
          <FormLabel mb={0}>Show stats during test</FormLabel>
        </FormControl>
        <FormControl display="flex" alignItems="center">
          <Switch isChecked={config.showProgress} onChange={e => setConfig({ showProgress: e.target.checked })} mr={2} />
          <FormLabel mb={0}>Show progress bar</FormLabel>
        </FormControl>
        {/* Reset Button */}
        <Button colorScheme="gray" onClick={resetConfig} fontFamily="mono" fontSize="md">
          Reset to Default
        </Button>
      </VStack>
    </Box>
  )
}

export default CustomizationSettings; 