import React from 'react';
import { Box, Flex, Text, Divider, IconButton } from '@chakra-ui/react';
import { useLeaderboard } from '../../../app/providers/LeaderboardContext';

interface UserComparisonProps {
  userIds: string[];
  onClose: () => void;
}

const statLabels = [
  { key: 'wpm', label: 'WPM' },
  { key: 'accuracy', label: 'Accuracy (%)' },
  { key: 'raw', label: 'Raw WPM' },
  { key: 'consistency', label: 'Consistency (%)' },
] as const;

type StatKey = typeof statLabels[number]['key'];

const UserComparison: React.FC<UserComparisonProps> = ({ userIds, onClose }) => {
  const { users } = useLeaderboard();
  const selectedUsers = users.filter((u) => userIds.includes(u.id));

  return (
    <Box>
      <Flex justify="flex-end">
        <IconButton aria-label="Close" icon={<span style={{fontSize: '1.2em'}}>&times;</span>} onClick={onClose} size="sm" mb={2} />
      </Flex>
      <Flex gap={8} align="flex-start" wrap="wrap">
        {selectedUsers.map((user) => (
          <Box key={user.id} bg="gray.800" borderRadius="lg" p={6} minW="220px" boxShadow="md">
            <Text fontWeight="bold" fontSize="xl" mb={2} textAlign="center">{user.name}</Text>
            <Divider mb={2} />
            {statLabels.map(({ key, label }) => (
              <Flex key={key} justify="space-between" my={1}>
                <Text color="gray.400">{label}</Text>
                <Text fontFamily="mono" fontWeight="bold">
                  {key === 'accuracy' || key === 'consistency'
                    ? `${(user[key as StatKey] as number).toFixed(2)}%`
                    : (user[key as StatKey] as number).toFixed(2)}
                </Text>
              </Flex>
            ))}
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default UserComparison; 