import React from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Alert,
  AlertIcon,
  Text,
  Badge,
  useColorModeValue
} from '@chakra-ui/react';
import { useTests } from '../hooks/useTests';

export const TestHistory: React.FC = () => {
  const { tests, isLoading, error } = useTests();
  const headerBg = useColorModeValue('gray.700', 'gray.700');
  const rowBg = useColorModeValue('gray.800', 'gray.800');
  const hoverBg = useColorModeValue('gray.750', 'gray.750');

  if (isLoading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Error loading test history: {error.message}
      </Alert>
    );
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTestTypeBadge = (type: string) => {
    const types = type.split(',');
    return types.map((t, i) => (
      <Badge key={i} colorScheme="blue" mr={1} mb={1}>
        {t}
      </Badge>
    ));
  };

  return (
    <Box p={4}>
      <Heading mb={6} size="lg">Test History</Heading>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr bg={headerBg}>
              <Th color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Date</Th>
              <Th color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider">WPM</Th>
              <Th color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Raw WPM</Th>
              <Th color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Accuracy</Th>
              <Th color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Consistency</Th>
              <Th color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Duration</Th>
              <Th color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Type</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tests?.map((test) => (
              <Tr 
                key={test.id} 
                bg={rowBg}
                _hover={{ bg: hoverBg }}
                transition="background-color 0.2s"
              >
                <Td>
                  <Text fontSize="sm" color="gray.300">
                    {new Date(test.timestamp).toLocaleString()}
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="lg" fontWeight="bold" color="white">
                    {test.wpm}
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="sm" color="gray.400">
                    {test.raw_wpm}
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="sm" color={test.accuracy >= 95 ? 'green.400' : test.accuracy >= 90 ? 'yellow.400' : 'red.400'}>
                    {test.accuracy}%
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="sm" color={test.consistency >= 95 ? 'green.400' : test.consistency >= 90 ? 'yellow.400' : 'red.400'}>
                    {test.consistency.toFixed(1)}%
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="sm" color="gray.400">
                    {formatDuration(test.duration)}
                  </Text>
                </Td>
                <Td>
                  <Box>
                    {getTestTypeBadge(test.test_type)}
                  </Box>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}; 