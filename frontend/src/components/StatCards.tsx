import { SimpleGrid, Box, Text, Icon, useColorModeValue } from '@chakra-ui/react'
import { FaTrophy, FaClock, FaKeyboard, FaChartLine } from 'react-icons/fa'

const stats = [
  { title: 'Best WPM', value: '120', icon: FaTrophy },
  { title: 'Average WPM', value: '95', icon: FaChartLine },
  { title: 'Tests Taken', value: '150', icon: FaKeyboard },
  { title: 'Time Typing', value: '5h 30m', icon: FaClock },
]

const StatCards = () => {
  // Use a slightly lighter dark for the card background
  const cardBg = useColorModeValue('gray.700', 'gray.700')
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
      {stats.map((stat, index) => (
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