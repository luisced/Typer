import { Box, Container, Flex, Link as ChakraLink, Avatar, AvatarGroup, Text } from '@chakra-ui/react'
import { Outlet, Link as RouterLink } from 'react-router-dom'

const MainLayout = () => {
  return (
    <Flex minH="100vh" direction="column">
      <Box as="nav" bg="gray.800" py={4}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <ChakraLink as={RouterLink} to="/" fontSize="xl" fontWeight="bold" _hover={{ textDecoration: 'none' }}>
              Typer
            </ChakraLink>
            <Flex gap={4}>

              <ChakraLink as={RouterLink} to="/profile" _hover={{ textDecoration: 'none' }}>
              <AvatarGroup>
                <Avatar />
              </AvatarGroup>
              <Text>luisced</Text>
              </ChakraLink>
            </Flex>
          </Flex>
        </Container>
      </Box>

      <Box flex="1" py={8}>
        <Container maxW="container.xl">
          <Outlet />
        </Container>
      </Box>
    </Flex>
  )
}

export default MainLayout 