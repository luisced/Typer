import { Box, Flex, Text } from '@chakra-ui/react'

const BadgesSection = () => (
  <Box w="100%" maxW="1500px" bg="gray.800" borderRadius="lg" p={8} boxShadow="md" mt={2}>
    <Text color="gray.400" fontSize="lg" mb={4} fontWeight="bold" letterSpacing={1}>
      Badges
    </Text>
    <Flex gap={6} flexWrap="wrap" align="center">
      {/* Example badges, replace with real ones as needed */}
      <Box bg="gray.700" color="yellow.300" px={4} py={2} borderRadius="full" fontWeight="bold" fontSize="md" boxShadow="sm">
        🏅 First Test
      </Box>
      <Box bg="gray.700" color="blue.300" px={4} py={2} borderRadius="full" fontWeight="bold" fontSize="md" boxShadow="sm">
        ⏱️ Speedster
      </Box>
      <Box bg="gray.700" color="green.300" px={4} py={2} borderRadius="full" fontWeight="bold" fontSize="md" boxShadow="sm">
        💯 Accuracy
      </Box>
      <Box bg="gray.700" color="pink.300" px={4} py={2} borderRadius="full" fontWeight="bold" fontSize="md" boxShadow="sm">
        🏆 100 Tests
      </Box>
    </Flex>
  </Box>
)

export default BadgesSection 