import { Box, Heading, Text, Stack, Button } from '@chakra-ui/react'

const Profile = () => {
  return (
    <Stack spacing={6}>
      <Heading as="h1" size="xl">
        Profile
      </Heading>
      <Box>
        <Text mb={4}>Please log in to view your profile.</Text>
        <Button colorScheme="blue">Log In</Button>
      </Box>
    </Stack>
  )
}

export default Profile 