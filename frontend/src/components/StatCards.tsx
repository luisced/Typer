import { SimpleGrid, Box, Text, Icon, useColorModeValue } from '@chakra-ui/react'
import { FaTrophy, FaClock, FaKeyboard, FaChartLine } from 'react-icons/fa'
import { useTests } from '../hooks/useTests'

const StatCards = () => {
  const { tests, isLoading } = useTests()
  const cardBg = useColorModeValue('gray.700', 'gray.700')

  // Calculate stats from test history
  const stats = {
    bestWpm: tests?.length ? Math.max(...tests.map(t => t.wpm)) : 0,
    avgWpm: tests?.length ? Math.round(tests.reduce((acc, t) => acc + t.wpm, 0) / tests.length) : 0,
    testsTaken: tests?.length || 0,
    timeTyping: tests?.length ? tests.reduce((acc, t) => acc + t.duration, 0) : 0
  }

  // Format time typing into hours and minutes
  const formatTimeTyping = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const statItems = [
    { title: 'Best WPM', value: stats.bestWpm.toString(), icon: FaTrophy },
    { title: 'Average WPM', value: stats.avgWpm.toString(), icon: FaChartLine },
    { title: 'Tests Taken', value: stats.testsTaken.toString(), icon: FaKeyboard },
    { title: 'Time Typing', value: formatTimeTyping(stats.timeTyping), icon: FaClock },
  ]

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
      {statItems.map((stat, index) => (
        <Box
          key={index}
          bg={cardBg}
          px={10}
          py={7}
          borderRadius="2xl"
          boxShadow="0 4px 24px 0 rgba(0,0,0,0.10)"
          display="flex"
          alignItems="center"
          gap={5}
          minW="220px"
        >
          <Icon as={stat.icon} boxSize={9} color="blue.400" mr={2} />
          <Box>
            <Text fontSize="md" color="gray.400" mb={1} fontWeight="medium">{stat.title}</Text>
            <Text fontSize="2.2rem" fontWeight="bold" color="white" lineHeight={1}>{stat.value}</Text>
          </Box>
        </Box>
      ))}
    </SimpleGrid>
  )
}

export default StatCards 