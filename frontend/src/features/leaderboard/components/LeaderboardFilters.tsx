import React, { useState } from 'react';
import { Flex, Button, Input, InputGroup, InputLeftElement, InputRightElement, Icon, IconButton } from '@chakra-ui/react';
import { FaClock, FaSearch, FaTimes } from 'react-icons/fa';
import { useLeaderboard } from '../../../app/providers/LeaderboardContext';

export const LeaderboardFilters: React.FC = () => {
  const { timeMode, setTimeMode } = useLeaderboard();
  const [search, setSearch] = useState('');

  const timeModes = [
    { id: '15', label: 'Time 15' },
    { id: '60', label: 'Time 60' },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    // Placeholder: call onSearch(e.target.value) if needed
  };

  const clearSearch = () => setSearch('');

  return (
    <Flex
      direction={{ base: 'column', sm: 'row' }}
      justify="space-between"
      align={{ base: 'start', sm: 'center' }}
      gap={4}
    >
      <Flex gap={2}>
        {timeModes.map((mode) => (
          <Button
            key={mode.id}
            onClick={() => setTimeMode(mode.id)}
            leftIcon={<Icon as={FaClock} />}
            size="sm"
            colorScheme={timeMode === mode.id ? 'blue' : 'gray'}
            variant={timeMode === mode.id ? 'solid' : 'outline'}
          >
            {mode.label}
          </Button>
        ))}
      </Flex>
      <InputGroup maxW={{ base: 'full', sm: '60' }} boxShadow="md">
        <InputLeftElement pointerEvents="none">
          <Icon as={FaSearch} color="gray.400" />
        </InputLeftElement>
        <Input
          value={search}
          onChange={handleSearch}
          placeholder="Search players..."
          size="md"
          bg="gray.700"
          borderColor="gray.600"
          color="white"
          rounded="full"
          _hover={{ borderColor: 'blue.400' }}
          _focus={{
            borderColor: 'blue.500',
            boxShadow: '0 0 0 2px var(--chakra-colors-blue-500)',
          }}
        />
        {search && (
          <InputRightElement>
            <IconButton
              aria-label="Clear search"
              icon={<FaTimes />}
              size="sm"
              variant="ghost"
              colorScheme="gray"
              onClick={clearSearch}
              rounded="full"
            />
          </InputRightElement>
        )}
      </InputGroup>
    </Flex>
  );
}; 