import React from 'react';
import { Box, Heading, Text, VStack, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { useTests } from '../hooks/useTests';

export const TestHistory: React.FC = () => {
  const { tests, isLoading, error } = useTests();

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

  return (
    <Box p={4}>
      <Heading mb={4}>Test History</Heading>
      <VStack spacing={4} align="stretch">
        {tests?.map((test) => (
          <Box key={test.id} p={4} borderWidth="1px" borderRadius="md">
            <Text fontWeight="bold">WPM: {test.wpm}</Text>
            <Text>Accuracy: {test.accuracy}%</Text>
            <Text>Test Type: {test.test_type}</Text>
            <Text>Duration: {test.duration} seconds</Text>
            <Text>Timestamp: {new Date(test.timestamp).toLocaleString()}</Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}; 