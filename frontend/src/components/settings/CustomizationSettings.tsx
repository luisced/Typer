import { useCustomizationStore } from '../../store/customizationStore'
import {
  Box, VStack, FormControl, FormLabel, Select, Input, Button, Text, Switch, Slider, SliderTrack, SliderFilledTrack, SliderThumb, HStack, RadioGroup, Radio, Grid, GridItem, Heading, Divider, Tooltip, Flex
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
    { value: 'classic-dark', label: 'Classic Dark', color: '#1c1c1a', description: 'A timeless dark theme' },
    { value: 'moon-light', label: 'Moon Light', color: '#fff', description: 'Clean and bright' },
    { value: 'octagon', label: 'Octagon', color: 'var(--chakra-colors-gray-900)', description: 'Modern dark theme' },
    { value: 'custom', label: 'Custom', color: config.accent, description: 'Your custom theme' },
  ]

  return (
    <Box maxW="4xl" mx="auto" bg="gray.800" borderRadius="lg" p={8} boxShadow="lg">
      <VStack spacing={8} align="stretch">
        <Heading size="lg" mb={4}>Customization</Heading>
        
        <Grid templateColumns="repeat(2, 1fr)" gap={8}>
          {/* Left Column */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Theme Section */}
              <Box>
                <Heading size="md" mb={4}>Theme</Heading>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  {themeSwatches.map(opt => (
                    <Tooltip key={opt.value} label={opt.description} placement="top">
                      <Box
                        as="button"
                        aria-label={opt.label}
                        borderRadius="lg"
                        p={4}
                        bg={opt.color}
                        border={config.theme === opt.value ? '3px solid #FFD700' : '2px solid #444'}
                        boxShadow={config.theme === opt.value ? '0 0 0 2px #FFD700' : 'none'}
                        transition="all 0.2s"
                        outline="none"
                        _focus={{ boxShadow: '0 0 0 2px #3182ce' }}
                        onClick={() => setConfig({ theme: opt.value })}
                        position="relative"
                        cursor="pointer"
                        h="100px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text color={opt.value === 'moon-light' ? 'gray.800' : 'white'} fontWeight="bold">
                          {opt.label}
                        </Text>
                        {opt.value === 'custom' && (
                          <Box
                            position="absolute"
                            bottom={2}
                            right={2}
                            w="16px"
                            h="16px"
                            borderRadius="full"
                            bg={config.accent}
                            border="2px solid #fff"
                          />
                        )}
                      </Box>
                    </Tooltip>
                  ))}
                </Grid>
                {config.theme === 'custom' && (
                  <FormControl mt={4}>
                    <FormLabel>Accent Color</FormLabel>
                    <HStack>
                      <Input 
                        type="color" 
                        value={config.accent} 
                        onChange={e => setConfig({ accent: e.target.value })} 
                        w="60px" 
                        h="40px" 
                        p={0} 
                        border="none" 
                        bg="transparent" 
                      />
                      <Text color="gray.400">{config.accent}</Text>
                    </HStack>
                  </FormControl>
                )}
              </Box>

              {/* Cursor Section */}
              <Box>
                <Heading size="md" mb={4}>Cursor</Heading>
                <VStack align="stretch" spacing={4}>
                  <RadioGroup value={config.cursor} onChange={v => setConfig({ cursor: v })}>
                    <HStack spacing={6}>
                      {cursorOptions.map(opt => (
                        <Radio key={opt.value} value={opt.value} size="lg">{opt.label}</Radio>
                      ))}
                    </HStack>
                  </RadioGroup>
                  <HStack>
                    <Switch 
                      isChecked={config.cursorBlink} 
                      onChange={e => setConfig({ cursorBlink: e.target.checked })}
                      size="lg"
                    />
                    <Text>Cursor Blinks</Text>
                  </HStack>
                </VStack>
              </Box>

              {/* Font Section */}
              <Box>
                <Heading size="md" mb={4}>Font</Heading>
                <VStack align="stretch" spacing={4}>
                  <FormControl>
                    <FormLabel>Font Family</FormLabel>
                    <Select 
                      value={config.font} 
                      onChange={e => setConfig({ font: e.target.value })}
                      size="lg"
                      bg="gray.700" 
                      color="gray.100"
                    >
                      {fontFamilies.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Font Size</FormLabel>
                    <HStack>
                      <Slider 
                        value={config.fontSize} 
                        onChange={v => setConfig({ fontSize: v })} 
                        min={12} 
                        max={32} 
                        step={1} 
                        colorScheme="blue"
                        flex={1}
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                      <Text w="40px" textAlign="right">{config.fontSize}px</Text>
                    </HStack>
                  </FormControl>
                </VStack>
              </Box>
            </VStack>
          </GridItem>

          {/* Right Column */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Sound Section */}
              <Box>
                <Heading size="md" mb={4}>Sound</Heading>
                <VStack align="stretch" spacing={4}>
                  <HStack>
                    <Switch 
                      isChecked={config.sounds} 
                      onChange={e => setConfig({ sounds: e.target.checked })}
                      size="lg"
                    />
                    <Text>Typing Sounds</Text>
                  </HStack>
                  {config.sounds && (
                    <>
                      <FormControl>
                        <FormLabel>Sound Set</FormLabel>
                        <Select 
                          value={config.soundSet} 
                          onChange={e => setConfig({ soundSet: e.target.value })}
                          size="lg"
                          bg="gray.700" 
                          color="gray.100"
                        >
                          {soundSets.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Volume</FormLabel>
                        <HStack>
                          <Slider 
                            value={config.volume} 
                            onChange={v => setConfig({ volume: v })} 
                            min={0} 
                            max={100} 
                            step={1} 
                            colorScheme="blue"
                            flex={1}
                          >
                            <SliderTrack>
                              <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb />
                          </Slider>
                          <Text w="40px" textAlign="right">{config.volume}%</Text>
                        </HStack>
                      </FormControl>
                    </>
                  )}
                </VStack>
              </Box>

              {/* Display Options */}
              <Box>
                <Heading size="md" mb={4}>Display Options</Heading>
                <VStack align="stretch" spacing={4}>
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      isChecked={config.charFill} 
                      onChange={e => setConfig({ charFill: e.target.checked })}
                      size="lg"
                      mr={3}
                    />
                    <FormLabel mb={0}>Fill character as you type</FormLabel>
                  </FormControl>
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      isChecked={config.keyHighlight} 
                      onChange={e => setConfig({ keyHighlight: e.target.checked })}
                      size="lg"
                      mr={3}
                    />
                    <FormLabel mb={0}>Highlight next key</FormLabel>
                  </FormControl>
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      isChecked={config.onScreenKeyboard} 
                      onChange={e => setConfig({ onScreenKeyboard: e.target.checked })}
                      size="lg"
                      mr={3}
                    />
                    <FormLabel mb={0}>Show on-screen keyboard</FormLabel>
                  </FormControl>
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      isChecked={config.animations} 
                      onChange={e => setConfig({ animations: e.target.checked })}
                      size="lg"
                      mr={3}
                    />
                    <FormLabel mb={0}>Enable UI animations</FormLabel>
                  </FormControl>
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      isChecked={config.showStats} 
                      onChange={e => setConfig({ showStats: e.target.checked })}
                      size="lg"
                      mr={3}
                    />
                    <FormLabel mb={0}>Show stats during test</FormLabel>
                  </FormControl>
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      isChecked={config.showProgress} 
                      onChange={e => setConfig({ showProgress: e.target.checked })}
                      size="lg"
                      mr={3}
                    />
                    <FormLabel mb={0}>Show progress bar</FormLabel>
                  </FormControl>
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>

        <Divider my={4} />

        {/* Reset Button */}
        <Flex justify="flex-end">
          <Button 
            colorScheme="gray" 
            onClick={resetConfig} 
            fontFamily="mono" 
            fontSize="md"
            size="lg"
            px={8}
          >
            Reset to Default
          </Button>
        </Flex>
      </VStack>
    </Box>
  )
}

export default CustomizationSettings; 