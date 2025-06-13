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
  Spinner,
  Alert,
  AlertIcon,
  Select,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  HStack,
  VStack,
  FormControl,
  FormLabel,
  Checkbox,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaCrown, FaChevronUp, FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { UserAvatar } from './UserAvatar';
import { UserBadge } from './UserBadge';
import { useLeaderboard } from '../../../app/providers/LeaderboardContext';
import UserComparison from './UserComparison';

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
  const {
    users,
    loading,
    error,
    totalUsers,
    currentPage,
    setCurrentPage,
    timeMode,
    setTimeMode,
    username,
    setUsername,
    testLength,
    setTestLength,
    language,
    setLanguage,
    minTests,
    setMinTests,
    startDate,
    setStartDate,
    endDate,
    setEndDate
  } = useLeaderboard();

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  // Filter options
  const modeOptions = [
    { label: 'All Modes', value: 'all' },
    { label: '15s', value: '15' },
    { label: '60s', value: '60' },
    { label: 'Words', value: 'words' },
  ];

  const languageOptions = [
    { label: 'All Languages', value: 'all' },
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    // Add more languages as needed
  ];

  const testLengthOptions = [
    { label: 'Any Length', value: null },
    { label: '10 Words', value: 10 },
    { label: '25 Words', value: 25 },
    { label: '50 Words', value: 50 },
    { label: '100 Words', value: 100 },
  ];

  const handleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCompare = () => {
    onOpen();
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px">
        <AlertIcon boxSize="40px" mr={0} />
        <Text mt={4}>{error}</Text>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Filters Section */}
      <VStack spacing={4} align="stretch" mb={6}>
        <HStack spacing={4}>
          {/* Mode Filter */}
          <FormControl>
            <FormLabel>Mode</FormLabel>
            <Select value={timeMode} onChange={e => setTimeMode(e.target.value)}>
              {modeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </FormControl>

          {/* Language Filter */}
          <FormControl>
            <FormLabel>Language</FormLabel>
            <Select value={language} onChange={e => setLanguage(e.target.value)}>
              {languageOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </FormControl>

          {/* Test Length Filter */}
          <FormControl>
            <FormLabel>Test Length</FormLabel>
            <Select
              value={testLength || ''}
              onChange={e => setTestLength(e.target.value ? Number(e.target.value) : null)}
            >
              {testLengthOptions.map(option => (
                <option key={option.value || 'any'} value={option.value || ''}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Minimum Tests Filter */}
          <FormControl>
            <FormLabel>Min Tests</FormLabel>
            <NumberInput
              min={1}
              value={minTests}
              onChange={(_, value) => setMinTests(value)}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </HStack>

        <HStack spacing={4}>
          {/* Username Search */}
          <FormControl>
            <FormLabel>Search Username</FormLabel>
            <Input
              placeholder="Search by username..."
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </FormControl>

          {/* Date Range Filters */}
          <FormControl>
            <FormLabel>Start Date</FormLabel>
            <Input
              type="date"
              value={startDate || ''}
              onChange={e => setStartDate(e.target.value || null)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>End Date</FormLabel>
            <Input
              type="date"
              value={endDate || ''}
              onChange={e => setEndDate(e.target.value || null)}
            />
          </FormControl>
        </HStack>
      </VStack>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th w="8"></Th>
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
            {users.map((user) => (
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
                  <Checkbox
                    isChecked={selectedUserIds.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    colorScheme="blue"
                    aria-label={`Select ${user.name}`}
                  />
                </Td>
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

      {/* Compare Button */}
      {selectedUserIds.length >= 2 && (
        <Flex justify="flex-end" mt={4}>
          <Button colorScheme="blue" onClick={handleCompare}>
            Compare ({selectedUserIds.length})
          </Button>
        </Flex>
      )}

      {/* Comparison Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent bg="gray.900">
          <ModalHeader>Compare Users</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <UserComparison userIds={selectedUserIds} onClose={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Flex justify="space-between" align="center" mt={6} fontSize="sm">
        <Text color="gray.400">
          Showing <Text as="span" fontWeight="medium">{(currentPage - 1) * 15 + 1}</Text> to{' '}
          <Text as="span" fontWeight="medium">{Math.min(currentPage * 15, totalUsers)}</Text> of{' '}
          <Text as="span" fontWeight="medium">{totalUsers}</Text> results
        </Text>
        <ButtonGroup size="sm" spacing={2}>
          <Button
            variant="outline"
            colorScheme="gray"
            onClick={() => setCurrentPage(currentPage - 1)}
            isDisabled={currentPage === 1}
          >
            <Icon as={FaChevronLeft} />
          </Button>
          <Button
            variant="outline"
            colorScheme="gray"
            onClick={() => setCurrentPage(currentPage + 1)}
            isDisabled={currentPage * 15 >= totalUsers}
          >
            <Icon as={FaChevronRight} />
          </Button>
        </ButtonGroup>
      </Flex>
    </Box>
  );
};
