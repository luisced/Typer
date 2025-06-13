import React from 'react';
import { Flex, Box, Heading, Text, Icon } from '@chakra-ui/react';
import { FaKeyboard } from 'react-icons/fa';
import { useLeaderboard } from '../../../app/providers/LeaderboardContext';

export const LeaderboardHeader: React.FC = () => {
  const { currentTimeMode } = useLeaderboard();

  return (
    <Flex
      direction={{ base: 'column', sm: 'row' }}
      align={{ base: 'start', sm: 'center' }}
      justify="space-between"
    >
      <Flex align="center">
        <Box
          h={10}
          w={10}
          bg="blue.600"
          rounded="lg"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mr={3}
        >
          <Icon as={FaKeyboard} boxSize={6} color="white" />
        </Box>
        <Box>
          <Heading size={{ base: 'lg', sm: 'xl' }} color="white">
            All-time English Time {currentTimeMode} Leaderboard
          </Heading>
          <Text color="gray.400" fontSize="sm" mt={1}>
            Showcasing the fastest typists from around the world
          </Text>
        </Box>
      </Flex>

    </Flex>
  );
}; 