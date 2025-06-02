import { Box, Flex, Text, Icon, Button } from '@chakra-ui/react'
import { FaSyncAlt, FaTrash } from 'react-icons/fa'

const DangerZoneSettings = () => (
  <Box>
    {/* Reset Account */}
    <Flex align="center" mb={10} gap={4}>
      <Icon as={FaSyncAlt} color="gray.400" boxSize={5} />
      <Box flex="1">
        <Text color="gray.400" fontWeight="bold" fontSize="md" mb={0.5}>
          reset account
        </Text>
        <Text color="gray.300" fontSize="sm">
          Completely resets your account to a blank state.<br />
          <Text as="span" color="red.400">You can't undo this action!</Text>
        </Text>
      </Box>
      <Button colorScheme="red" fontFamily="mono" fontSize="md" px={10} borderRadius="md">
        reset account
      </Button>
    </Flex>
    {/* Delete Account */}
    <Flex align="center" gap={4}>
      <Icon as={FaTrash} color="gray.400" boxSize={5} />
      <Box flex="1">
        <Text color="gray.400" fontWeight="bold" fontSize="md" mb={0.5}>
          delete account
        </Text>
        <Text color="gray.300" fontSize="sm">
          Deletes your account and all data connected to it.<br />
          <Text as="span" color="red.400">You can't undo this action!</Text>
        </Text>
      </Box>
      <Button colorScheme="red" fontFamily="mono" fontSize="md" px={10} borderRadius="md">
        delete account
      </Button>
    </Flex>
  </Box>
)

export default DangerZoneSettings; 