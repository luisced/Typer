import { Flex, Box, Text } from '@chakra-ui/react';

interface StatsProps {
  wpm: number;
  accuracy: number;
  timer: number;
  modes: string[];
  writtenWords: number;
  totalWords: number;
}

const Stats: React.FC<StatsProps> = ({ wpm, accuracy, timer, modes, writtenWords, totalWords }) => (
  <Flex justify="center" align="center" gap={8} mt={2} mb={12}>
    <Box textAlign="center" minW="100px">
      <Text fontSize="sm" color="gray.500">WPM</Text>
      <Text fontSize="2xl" fontWeight="bold" color="white">{wpm}</Text>
    </Box>
    <Box textAlign="center" minW="100px">
      <Text fontSize="sm" color="gray.500">Accuracy</Text>
      <Text fontSize="2xl" fontWeight="bold" color="white">{accuracy}%</Text>
    </Box>
    <Box textAlign="center" minW="100px">
      <Text fontSize="sm" color="gray.500">Words</Text>
      <Text fontSize="2xl" fontWeight="bold" color="white">{writtenWords}/{totalWords}</Text>
    </Box>
    {!modes.includes('zen') && modes.includes('time') && (
      <Box textAlign="center" minW="100px">
        <Text fontSize="sm" color="gray.500">Time</Text>
        <Text fontSize="2xl" fontWeight="bold" color="white">{timer === Infinity ? '' : `${timer}s`}</Text>
      </Box>
    )}
    {modes.includes('zen') && (
      <Box textAlign="center" minW="100px">
        <Text fontSize="sm" color="gray.500">Mode</Text>
        <Text fontSize="2xl" fontWeight="bold" color="yellow.300">ZEN</Text>
      </Box>
    )}
  </Flex>
);

export default Stats; 