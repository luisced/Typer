import { Box, Container, Flex, Link as ChakraLink } from '@chakra-ui/react'
import { Link as RouterLink, Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <Box minH="100vh" bg="gray.900">
      <Box as="nav" bg="gray.800" py={4}>
        <Container maxW="container.xl">
          <Flex gap={6}>
            <ChakraLink as={RouterLink} to="/" color="white">
              Home
            </ChakraLink>
            <ChakraLink as={RouterLink} to="/test" color="white">
              Test
            </ChakraLink>
            <ChakraLink as={RouterLink} to="/profile" color="white">
              Profile
            </ChakraLink>
          </Flex>
        </Container>
      </Box>
      <Container maxW="container.xl" py={8}>
        <Outlet />
      </Container>
    </Box>
  )
}

export default MainLayout 