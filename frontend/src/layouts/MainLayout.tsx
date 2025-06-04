import { Box, Container, Flex, Link as ChakraLink, Avatar, AvatarGroup, Text, Icon, useColorModeValue } from '@chakra-ui/react'
import { Outlet, Link as RouterLink } from 'react-router-dom'
import { FaKeyboard, FaTrophy, FaUserCircle } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '../utils/api'

const MainLayout = () => {
  const navBg = useColorModeValue('rgba(255,255,255,0.85)', 'rgba(31,41,55,0.85)')
  const navBorder = useColorModeValue('gray.200', 'gray.700')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser()
        setUser(res.data)
      } catch (err) {
        console.error('Error fetching user:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  return (
    <Flex minH="100vh" direction="column">
      <Box
        as="nav"
        py={3}
        bg={navBg}
        style={{ backdropFilter: 'blur(12px)' }}
        borderBottomWidth="1.5px"
        borderColor={navBorder}
        boxShadow="0 2px 16px 0 rgba(0,0,0,0.08)"
        zIndex={10}
        position="sticky"
        top={0}
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <ChakraLink
              as={RouterLink}
              to="/"
              fontSize="2xl"
              fontWeight="bold"
              display="flex"
              alignItems="center"
              gap={2}
              _hover={{ textDecoration: 'none', color: 'blue.400' }}
            >
              <Icon as={FaKeyboard} boxSize={7} color="blue.400" />
              Typer
            </ChakraLink>
            <Flex gap={4} align="center">
              <ChakraLink
                as={RouterLink}
                to="/scoreboard"
                display="flex"
                alignItems="center"
                gap={2}
                px={3}
                py={2}
                rounded="lg"
                fontWeight="medium"
                color="gray.200"
                _hover={{ bg: 'blue.900', color: 'blue.300', textDecoration: 'none' }}
                transition="all 0.2s"
              >
                <Icon as={FaTrophy} boxSize={5} />
                <Text>Scoreboard</Text>
              </ChakraLink>
              <ChakraLink
                as={RouterLink}
                to="/profile"
                display="flex"
                alignItems="center"
                gap={2}
                px={3}
                py={2}
                rounded="lg"
                fontWeight="medium"
                color="gray.200"
                _hover={{ bg: 'blue.900', color: 'blue.300', textDecoration: 'none' }}
                transition="all 0.2s"
              >
                <Icon as={FaUserCircle} boxSize={5} />
                <Text>{loading ? '...' : user?.username || 'Guest'}</Text>
              </ChakraLink>
            </Flex>
          </Flex>
        </Container>
      </Box>

      <Box flex="1" py={8}>
        <Container maxW="2000px">
          <Outlet />
        </Container>
      </Box>
    </Flex>
  )
}

export default MainLayout 