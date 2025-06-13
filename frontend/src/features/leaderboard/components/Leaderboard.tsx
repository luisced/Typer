import React from 'react';
import { Box, Container, Text } from '@chakra-ui/react';
import { LeaderboardHeader } from './LeaderboardHeader';
import { LeaderboardTable } from './LeaderboardTable';
import { LeaderboardTabs } from './LeaderboardTabs';
import { LeaderboardFilters } from './LeaderboardFilters';

export const Leaderboard: React.FC = () => {
  return (
    <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} py={8}>
      <LeaderboardHeader />
      <Box
        mt={6}
        bgGradient="linear(to-br, gray.800 80%, gray.900 100%)"
        style={{ backdropFilter: 'blur(6px)' }}
        rounded="2xl"
        shadow="2xl"
        borderWidth="1.5px"
        borderColor="gray.700"
        overflow="hidden"
      >
        <LeaderboardTabs />
        <Box p={{ base: 4, sm: 6 }}>
          <LeaderboardFilters />
          <Box mt={4} overflow="hidden">
            <LeaderboardTable />
          </Box>
        </Box>
      </Box>
      <Box mt={4} textAlign="center">
        <Text fontSize="sm" color="gray.400">
          Next update in: 09:23
        </Text>
      </Box>
    </Container>
  );
}; 