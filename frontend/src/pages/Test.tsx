import { Box, Heading, Text, Textarea, Stack } from '@chakra-ui/react'

const Test = () => {
  return (
    <Stack spacing={6}>
      <Heading as="h1" size="xl">
        Typing Test
      </Heading>
      <Box>
        <Text mb={4}>
          Type the following text as quickly and accurately as possible:
        </Text>
        <Text p={4} bg="gray.800" borderRadius="md" mb={4}>
          The quick brown fox jumps over the lazy dog. This is a sample text for typing practice.
        </Text>
        <Textarea
          placeholder="Start typing here..."
          size="lg"
          rows={4}
          bg="gray.800"
          color="white"
          _placeholder={{ color: 'gray.400' }}
        />
      </Box>
    </Stack>
  )
}

export default Test 