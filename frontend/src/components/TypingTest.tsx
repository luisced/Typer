import { Box, Flex, Tab, TabList, Tabs, Text } from '@chakra-ui/react'

const tabLabels = ['time', 'words', 'code', 'hardcode', 'custom', 'lan']

const TypingTest = () => {
  return (
    <Box
      bg="gray.900"
      borderRadius="2xl"
      border="1px solid"
      borderColor="gray.600"
      p={8}
      maxW="3xl"
      mx="auto"
      mt={8}
      boxShadow="2xl"
    >
      <Tabs variant="unstyled" isFitted>
        <TabList mb={6} borderRadius="md" border="1px solid" borderColor="gray.500" bg="gray.800">
          {tabLabels.map(label => (
            <Tab
              key={label}
              _selected={{ bg: 'gray.700', color: 'white' }}
              color="gray.200"
              fontWeight="semibold"
              fontFamily="heading"
              fontSize="lg"
            >
              {label}
            </Tab>
          ))}
        </TabList>
      </Tabs>
      <Box mt={8} px={2}>
        <Text fontSize="xl" color="gray.100" fontFamily="mono">
          Tempor do occaecat reprehenderit consequat aliqua ut irure dolor reprehenderit aliqua consectetur pariatur laboris labore non.
        </Text>
      </Box>
    </Box>
  )
}

export default TypingTest 