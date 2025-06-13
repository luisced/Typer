import { Box, Flex, Avatar, Text, Progress, VStack, HStack, Divider, Spinner, Alert, AlertIcon, Icon } from '@chakra-ui/react'
import { FiCheckSquare, FiClock, FiTrendingUp, FiTarget, FiZap, FiAward } from 'react-icons/fi'
import { useTests } from '@/features/typing-test/hooks/useTests'
import { useGamification } from '../hooks/useGamification'

interface ProfileCardProps {
  user?: any;
  showGamification?: boolean;
  showBadges?: boolean;
}

const ProfileCard = ({ user, showGamification = true, showBadges = true }: ProfileCardProps) => {
  const { tests } = useTests()
  const { summary, badges, loading: gamificationLoading, error: gamificationError } = useGamification({
    enabled: showGamification,
    autoFetch: showGamification
  })

  // Use gamification data if available, fallback to user data
  const gameStats = summary?.game_stats
  const levelInfo = summary?.level_info

  // Calculate stats from gamification data or test history
  const stats = {
    testsStarted: gameStats?.total_tests_completed || tests?.length || 0,
    testsCompleted: gameStats?.total_tests_completed || tests?.length || 0,
    timeTyping: gameStats?.total_typing_time_seconds || (tests?.length ? tests.reduce((acc, t) => acc + t.duration, 0) : 0),
    bestWpm: gameStats?.best_wpm || 0,
    bestAccuracy: gameStats?.best_accuracy || 0,
    currentStreak: gameStats?.current_streak || 0,
    maxStreak: gameStats?.max_streak || 0,
    totalWordsTyped: gameStats?.total_words_typed || 0,
    totalCharactersTyped: gameStats?.total_characters_typed || 0
  }

  // Format time typing into HH:MM:SS
  const formatTimeTyping = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate level progress from gamification data
  const level = levelInfo?.current_level || user?.current_level || 1
  const currentXP = levelInfo?.current_xp || user?.current_xp || 0
  const progress = levelInfo?.xp_progress_in_level || user?.xp_progress_in_level || 0
  const nextLevelXP = levelInfo?.xp_for_next_level || user?.xp_for_next_level || 100
  const xpNeeded = levelInfo?.xp_needed_for_next || (nextLevelXP - currentXP) || 100

  return (
    <VStack spacing={8} w="100%" maxW="1500px">
      {/* Main Profile Card */}
      <Box
        bg="gray.800"
        borderRadius="lg"
        p={8}
        w="100%"
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
            <VStack spacing={2} w="100%">
              <HStack w="100%" justify="space-between">
                <Text color="gray.400" fontSize="sm">Level {level}</Text>
                <Text color="gray.400" fontSize="xs">{currentXP} XP</Text>
              </HStack>
              <Progress 
                value={(progress / nextLevelXP) * 100} 
                size="sm" 
                w="100%" 
                bg="gray.700" 
                colorScheme="blue" 
                borderRadius="full" 
              />
              <Text color="gray.500" fontSize="xs" textAlign="center">
                {xpNeeded} XP to level {level + 1}
              </Text>
            </VStack>
          </Flex>
          {/* Divider */}
          <Box h="120px" w="2px" bg="gray.700" borderRadius="full" mx={8} />
          {/* Stats */}
          <Flex flex={1} justify="space-between" align="center" gap={6}>
            <VStack spacing={2} textAlign="center" p={3} borderRadius="lg" _hover={{ bg: 'gray.700' }} transition="all 0.2s">
              <Icon as={FiCheckSquare} color="blue.400" boxSize={6} />
              <Text color="gray.500" fontSize="sm" textTransform="uppercase" letterSpacing="wider">tests completed</Text>
              <Text color="gray.100" fontSize="2xl" fontFamily="mono" fontWeight="bold">{stats.testsCompleted}</Text>
            </VStack>
            <VStack spacing={2} textAlign="center" p={3} borderRadius="lg" _hover={{ bg: 'gray.700' }} transition="all 0.2s">
              <Icon as={FiClock} color="green.400" boxSize={6} />
              <Text color="gray.500" fontSize="sm" textTransform="uppercase" letterSpacing="wider">time typing</Text>
              <Text color="gray.100" fontSize="2xl" fontFamily="mono" fontWeight="bold">{formatTimeTyping(stats.timeTyping)}</Text>
            </VStack>
            <VStack spacing={2} textAlign="center" p={3} borderRadius="lg" _hover={{ bg: 'gray.700' }} transition="all 0.2s">
              <Icon as={FiTrendingUp} color="yellow.400" boxSize={6} />
              <Text color="gray.500" fontSize="sm" textTransform="uppercase" letterSpacing="wider">best WPM</Text>
              <Text color="gray.100" fontSize="2xl" fontFamily="mono" fontWeight="bold">{stats.bestWpm}</Text>
            </VStack>
            <VStack spacing={2} textAlign="center" p={3} borderRadius="lg" _hover={{ bg: 'gray.700' }} transition="all 0.2s">
              <Icon as={FiTarget} color="red.400" boxSize={6} />
              <Text color="gray.500" fontSize="sm" textTransform="uppercase" letterSpacing="wider">best accuracy</Text>
              <Text color="gray.100" fontSize="2xl" fontFamily="mono" fontWeight="bold">{stats.bestAccuracy}%</Text>
            </VStack>
            <VStack spacing={2} textAlign="center" p={3} borderRadius="lg" _hover={{ bg: 'gray.700' }} transition="all 0.2s">
              <Icon as={FiZap} color="purple.400" boxSize={6} />
              <Text color="gray.500" fontSize="sm" textTransform="uppercase" letterSpacing="wider">current streak</Text>
              <Text color="gray.100" fontSize="2xl" fontFamily="mono" fontWeight="bold">{stats.currentStreak}</Text>
            </VStack>
            <VStack spacing={2} textAlign="center" p={3} borderRadius="lg" _hover={{ bg: 'gray.700' }} transition="all 0.2s">
              <Icon as={FiAward} color="pink.400" boxSize={6} />
              <Text color="gray.500" fontSize="sm" textTransform="uppercase" letterSpacing="wider">badges earned</Text>
              <Text color="gray.100" fontSize="2xl" fontFamily="mono" fontWeight="bold">{summary?.badge_count || 0}</Text>
            </VStack>
          </Flex>
        </Flex>
      </Box>

      
    </VStack>
  )
}

export default ProfileCard 