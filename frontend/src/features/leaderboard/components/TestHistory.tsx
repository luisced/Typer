import React, { useState } from 'react';
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
  useColorModeValue,
  Flex,
  Button,
  Select,
  HStack
} from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTests } from '../hooks/useTests';

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

// Language mapping for display
const languageMap: Record<string, string> = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German'
};

export const TestHistory: React.FC = () => {
  const { tests, isLoading, error } = useTests();
  const headerBg = useColorModeValue('gray.700', 'gray.700');
  const rowBg = useColorModeValue('gray.800', 'gray.800');
  const hoverBg = useColorModeValue('gray.750', 'gray.750');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  const getLanguageBadge = (lang: string) => {
    const displayName = languageMap[lang] || lang;
    return (
      <Badge colorScheme="purple" mr={1}>
        {displayName}
      </Badge>
    );
  };

  // Pagination calculations
  const totalPages = Math.ceil((tests?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTests = tests?.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = Number(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
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
              <Th color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Language</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentTests?.map((test) => (
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
                <Td>
                  <Box>
                    {getLanguageBadge(test.language)}
                  </Box>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Pagination Controls */}
      <Flex justify="space-between" align="center" mt={4}>
        <HStack spacing={2}>
          <Text fontSize="sm" color="gray.400">
            Items per page:
          </Text>
          <Select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            size="sm"
            w="70px"
            bg="gray.700"
            color="gray.100"
          >
            {ITEMS_PER_PAGE_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <Text fontSize="sm" color="gray.400">
            {startIndex + 1}-{Math.min(endIndex, tests?.length || 0)} of {tests?.length || 0}
          </Text>
        </HStack>

        <HStack spacing={2}>
          <Button
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            isDisabled={currentPage === 1}
            leftIcon={<FaChevronLeft />}
            bg="gray.700"
            _hover={{ bg: 'gray.600' }}
          >
            Previous
          </Button>
          <Button
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            isDisabled={currentPage === totalPages}
            rightIcon={<FaChevronRight />}
            bg="gray.700"
            _hover={{ bg: 'gray.600' }}
          >
            Next
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
}; 