import React, { useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Flex,
  Icon,
  Text,
  Progress,
  Button,
  ButtonGroup,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaCrown, FaChevronUp, FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { UserAvatar } from './UserAvatar';
import { UserBadge } from './UserBadge';
import { mockLeaderboardData } from '../../data/mockData';

const glow = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

export const LeaderboardTable: React.FC = () => {
  const [sortField, setSortField] = useState('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <Icon as={FaChevronUp} boxSize={4} ml={1} />
    ) : (
      <Icon as={FaChevronDown} boxSize={4} ml={1} />
    );
  };

  return (
    <Box>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th w="12" color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider">#</Th>
              <Th color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider">User</Th>
              <Th
                color="gray.400"
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="wider"
                cursor="pointer"
                onClick={() => handleSort('wpm')}
              >
                <Flex align="center">
                  WPM {getSortIcon('wpm')}
                </Flex>
              </Th>
              <Th
                color="gray.400"
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="wider"
                cursor="pointer"
                onClick={() => handleSort('accuracy')}
              >
                <Flex align="center">
                  Accuracy {getSortIcon('accuracy')}
                </Flex>
              </Th>
              <Th
                color="gray.400"
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="wider"
                cursor="pointer"
                onClick={() => handleSort('raw')}
              >
                <Flex align="center">
                  Raw {getSortIcon('raw')}
                </Flex>
              </Th>
              <Th
                color="gray.400"
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="wider"
                cursor="pointer"
                onClick={() => handleSort('consistency')}
              >
                <Flex align="center">
                  Consistency {getSortIcon('consistency')}
                </Flex>
              </Th>
              <Th color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Date</Th>
            </Tr>
          </Thead>
          <Tbody>
            {mockLeaderboardData.map((user) => (
              <Tr
                key={user.id}
                sx={
                  user.rank === 1
                    ? {
                        /* Gradiente con transiciones muy suaves y un background-size mayor */
                        background: `
                          linear-gradient(
                            90deg,
                            #fbbf24 0%,
                            #fbbf24 10%,
                            #a78bfa 30%,
                            #f472b6 60%,
                            #fbbf24 90%,
                            #fbbf24 100%
                          )
                        `,
                        /* Background-size más amplio para movimientos lentos */
                        backgroundSize: '300% 100%',
                        /*
                          Animación más larga (8s), con easing suave.
                          El keyframe ahora tiene 0%, 50%, 100% para recorrer y volver.
                        */
                        animation: `${glow} 8s cubic-bezier(0.25, 0.1, 0.25, 1) infinite`,
                        boxShadow: '0 0 16px 4px #fbbf24AA',
                      }
                    : {}
                }
                _hover={{ bg: user.rank === 1 ? undefined : 'gray.700' }}
                transition="background-color 0.2s"
              >
                <Td>
                  {user.rank === 1 ? (
                    <Flex justify="center">
                      <Icon as={FaCrown} boxSize={5} color="amber.400" />
                    </Flex>
                  ) : (
                    user.rank
                  )}
                </Td>
                <Td>
                  <Flex align="center">
                    <UserAvatar user={user} />
                    <Box ml={3}>
                      <Flex align="center">
                        <Text fontWeight="medium">{user.name}</Text>
                        {user.badges.map((badge, index) => (
                          <UserBadge key={index} type={badge} />
                        ))}
                      </Flex>
                    </Box>
                  </Flex>
                </Td>
                <Td fontFamily="mono" fontSize="sm" fontWeight="medium">
                  {user.wpm.toFixed(2)}
                </Td>
                <Td fontFamily="mono" fontSize="sm">
                  <Text color={user.accuracy === 100 ? 'green.400' : 'inherit'}>
                    {user.accuracy.toFixed(2)}%
                  </Text>
                </Td>
                <Td fontFamily="mono" fontSize="sm" fontWeight="medium">
                  {user.raw.toFixed(2)}
                </Td>
                <Td fontFamily="mono" fontSize="sm">
                  <Flex align="center">
                    <Box w="16" bg="gray.700" rounded="full" h="1.5" mr={2}>
                      <Progress
                        value={user.consistency}
                        size="xs"
                        colorScheme="blue"
                        rounded="full"
                      />
                    </Box>
                    {user.consistency.toFixed(2)}%
                  </Flex>
                </Td>
                <Td fontSize="xs" color="gray.400">
                  <Box>
                    <Text>{user.date}</Text>
                    <Text>{user.time}</Text>
                  </Box>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Flex justify="space-between" align="center" mt={6} fontSize="sm">
        <Text color="gray.400">
          Showing <Text as="span" fontWeight="medium">1</Text> to{' '}
          <Text as="span" fontWeight="medium">15</Text> of{' '}
          <Text as="span" fontWeight="medium">100</Text> results
        </Text>
        <ButtonGroup size="sm" spacing={2}>
          <Button variant="outline" colorScheme="gray">
            <Icon as={FaChevronLeft} />
          </Button>
          <Button variant="outline" colorScheme="gray">
            <Icon as={FaChevronRight} />
          </Button>
        </ButtonGroup>
      </Flex>
    </Box>
  );
};
