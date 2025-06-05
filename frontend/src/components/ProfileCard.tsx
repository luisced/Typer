import { Box, Flex, Avatar, Text, Progress } from '@chakra-ui/react'
import { useTests } from '../hooks/useTests'

const ProfileCard = ({ user }: { user?: any }) => {
  const { tests } = useTests()

  // Calculate stats from test history
  const stats = {
    testsStarted: tests?.length || 0,
    testsCompleted: tests?.length || 0,
    timeTyping: tests?.length ? tests.reduce((acc, t) => acc + t.duration, 0) : 0
  }

  // Format time typing into HH:MM:SS
  const formatTimeTyping = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate level progress
  const level = user?.current_level || 1
  const progress = user?.xp_progress_in_level || 0
  const nextLevel = user?.xp_for_next_level || 100

  return (
    <Box
      bg="gray.800"
      borderRadius="lg"
      p={8}
      w="100%"
      maxW="1500px"
      boxShadow="lg"
    >
      <Flex align="center" gap={8}>
        {/* Avatar and user info */}
        <Flex direction="column" align="center" minW="180px">
          <Avatar size="2xl" name={user?.username || 'User'} />
          <Text fontSize="3xl" fontWeight="bold" color="gray.100" mt={2} letterSpacing={2} fontFamily="mono">
            {user?.username || 'Username'}
          </Text>
          <Text color="gray.500" fontSize="sm" mt={-1} mb={2}>
            {user?.email || 'Email'}
          </Text>
          <Text color="gray.500" fontSize="sm" mt={-1} mb={2}>
            Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
          </Text>
          <Flex align="center" w="100%" gap={2}>
            <Text color="gray.400" fontSize="md">Level {level}</Text>
            <Progress 
              value={(progress / nextLevel) * 100} 
              size="sm" 
              flex={1} 
              bg="gray.700" 
              colorScheme="blue" 
              borderRadius="full" 
            />
            <Text color="gray.400" fontSize="sm">{progress}/{nextLevel} XP</Text>
          </Flex>
        </Flex>
        {/* Divider */}
        <Box h="120px" w="2px" bg="gray.700" borderRadius="full" mx={8} />
        {/* Stats */}
        <Flex flex={1} justify="space-between" align="center" gap={8}>
          <Box textAlign="center">
            <Text color="gray.500" fontSize="md">tests started</Text>
            <Text color="gray.100" fontSize="3xl" fontFamily="mono" fontWeight="bold">{stats.testsStarted}</Text>
          </Box>
          <Box textAlign="center">
            <Text color="gray.500" fontSize="md">tests completed</Text>
            <Text color="gray.100" fontSize="3xl" fontFamily="mono" fontWeight="bold">{stats.testsCompleted}</Text>
          </Box>
          <Box textAlign="center">
            <Text color="gray.500" fontSize="md">time typing</Text>
            <Text color="gray.100" fontSize="3xl" fontFamily="mono" fontWeight="bold">{formatTimeTyping(stats.timeTyping)}</Text>
          </Box>
        </Flex>
      </Flex>
    </Box>
  )
}

export default ProfileCard 