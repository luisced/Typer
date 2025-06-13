import React from 'react';
import { Box, Tooltip, Flex, Icon } from '@chakra-ui/react';
import { FaAward, FaStar } from 'react-icons/fa';

interface UserBadgeProps {
  type: string;
}

export const UserBadge: React.FC<UserBadgeProps> = ({ type }) => {
  let content;
  let tooltip = '';

  switch (type) {
    case 'mythical':
      content = (
        <Flex
          alignItems="center"
          rounded="full"
          fontSize="xs"
          px={2}
          py={0.5}
          ml={2}
          bgGradient="linear(to-r, purple.500, pink.500)"
          color="white"
        >
          <Icon as={FaStar} boxSize={3} mr={1} />
          mythical
        </Flex>
      );
      tooltip = 'Mythical typist - Top 0.1% of all users';
      break;
    case '60+ Account':
      content = (
        <Flex
          alignItems="center"
          rounded="full"
          fontSize="xs"
          px={2}
          py={0.5}
          ml={2}
          bg="amber.700"
          color="amber.200"
        >
          <Icon as={FaAward} boxSize={3} mr={1} />
          60+ Account
        </Flex>
      );
      tooltip = 'User with 60+ WPM average across all tests';
      break;
    case '50+ Account':
      content = (
        <Flex
          alignItems="center"
          rounded="full"
          fontSize="xs"
          px={2}
          py={0.5}
          ml={2}
          bg="emerald.700"
          color="emerald.200"
        >
          <Icon as={FaAward} boxSize={3} mr={1} />
          50+ Account
        </Flex>
      );
      tooltip = 'User with 50+ WPM average across all tests';
      break;
    default:
      return null;
  }

  return (
    <Tooltip label={tooltip} placement="top" hasArrow>
      {content}
    </Tooltip>
  );
}; 