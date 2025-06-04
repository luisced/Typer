import React from 'react';
import { Flex, Button, Icon, Text } from '@chakra-ui/react';
import { FaTrophy, FaCalendar, FaClock } from 'react-icons/fa';
import { useLeaderboard } from '../../context/LeaderboardContext';

export const LeaderboardTabs: React.FC = () => {
  const { tab, setTab } = useLeaderboard();

  const tabs = [
    { id: 'all-time', label: 'All-time', icon: FaTrophy },
    { id: 'weekly', label: 'Weekly XP', icon: FaCalendar },
    { id: 'daily', label: 'Daily', icon: FaClock },
  ];

  return (
    <Flex
      bg="gray.900"
      borderBottom="1px"
      borderColor="gray.700"
      overflowX="auto"
    >
      {tabs.map((item) => (
        <Button
          key={item.id}
          onClick={() => setTab(item.id)}
          variant="ghost"
          px={6}
          py={3}
          fontSize="sm"
          fontWeight="medium"
          whiteSpace="nowrap"
          borderBottom="2px"
          borderColor={tab === item.id ? 'blue.500' : 'transparent'}
          color={tab === item.id ? 'blue.400' : 'gray.400'}
          _hover={{
            textDecoration: 'none',
            color: tab === item.id ? 'blue.400' : 'gray.300',
            borderColor: tab === item.id ? 'blue.500' : 'gray.500',
          }}
        >
          <Icon as={item.icon} boxSize={4} mr={2} />
          {item.label}
        </Button>
      ))}
    </Flex>
  );
}; 