import { Box, Flex, Avatar, Text, Progress } from '@chakra-ui/react'

const ProfileCard = () => (
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
        <Avatar size="2xl" name="luisced" />
        <Text fontSize="3xl" fontWeight="bold" color="gray.100" mt={2} letterSpacing={2} fontFamily="mono">
          luisced
        </Text>
        <Text color="gray.500" fontSize="sm" mt={-1} mb={2}>
          Joined 01 Jun 2025
        </Text>
        <Flex align="center" w="100%" gap={2}>
          <Text color="gray.400" fontSize="md">1</Text>
          <Progress value={0} size="sm" flex={1} bg="gray.700" colorScheme="gray" borderRadius="full" />
          <Text color="gray.400" fontSize="sm">0/100</Text>
        </Flex>
      </Flex>
      {/* Divider */}
      <Box h="120px" w="2px" bg="gray.700" borderRadius="full" mx={8} />
      {/* Stats */}
      <Flex flex={1} justify="space-between" align="center" gap={8}>
        <Box textAlign="center">
          <Text color="gray.500" fontSize="md">tests started</Text>
          <Text color="gray.100" fontSize="3xl" fontFamily="mono" fontWeight="bold">0</Text>
        </Box>
        <Box textAlign="center">
          <Text color="gray.500" fontSize="md">tests completed</Text>
          <Text color="gray.100" fontSize="3xl" fontFamily="mono" fontWeight="bold">0</Text>
        </Box>
        <Box textAlign="center">
          <Text color="gray.500" fontSize="md">time typing</Text>
          <Text color="gray.100" fontSize="3xl" fontFamily="mono" fontWeight="bold">00:00:00</Text>
        </Box>
      </Flex>
    </Flex>
  </Box>
)

export default ProfileCard 