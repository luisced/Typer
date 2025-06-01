import { Box, Heading, Text, Stack } from '@chakra-ui/react'

const Home = () => {
  return (
    <Stack spacing={6}>
      <Heading as="h1" size="2xl">
        Welcome to Typer
      </Heading>
      <Text fontSize="xl">
        A modern typing test application to improve your typing speed and accuracy.
      </Text>
      <Box>
        <Text>
          Get started by taking a test or creating an account to track your progress.
        </Text>
      </Box>
    </Stack>
  )
}

export default Home 