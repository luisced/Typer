import React from "react";
import {
  Box,
  Flex,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import KeyboardKey from "./KeyboardKey";

// Define a more compact keyboard layout focusing on main typing keys
const KEYBOARD_LAYOUT = [
  // Number row
  {
    row: "numbers",
    keys: ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
    sizes: ["1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1"] as const
  },
  // QWERTY row
  {
    row: "qwerty",
    keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]"],
    sizes: ["1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1"] as const
  },
  // ASDF row
  {
    row: "asdf",
    keys: ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'"],
    sizes: ["1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1"] as const
  },
  // ZXCV row
  {
    row: "zxcv",
    keys: ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"],
    sizes: ["1", "1", "1", "1", "1", "1", "1", "1", "1", "1"] as const
  },
  // Space row
  {
    row: "space",
    keys: [""],
    sizes: ["space"] as const
  }
];

interface CharLog {
  attempts: number;
  errors: number;
  deltas: number[];
  lastAttemptTime: number | null;
}

interface KeyboardVisualizationProps {
  charLogs?: Record<string, CharLog>;
  className?: string;
  title?: string;
  testCount?: number;
}

const KeyboardVisualization: React.FC<KeyboardVisualizationProps> = ({
  charLogs = {},
  className = "",
  title = "Keyboard Mastery Visualization",
  testCount,
}) => {
  // Color mode values
  const kbBg = useColorModeValue("#f5f5f5", "#2b2b2b");
  const keyBg = useColorModeValue("#e0e0e0", "#3c3c3c");
  const keyBorder = useColorModeValue("#b0b0b0", "#555");

  return (
    <Box className={className}>
      <Box textAlign="center" mb={4}>
        <Text 
          fontSize="lg" 
          color="gray.300" 
          fontFamily="mono"
        >
          {title}
        </Text>
        {testCount && (
          <Text 
            fontSize="sm" 
            color="gray.500" 
            fontFamily="mono"
            mt={1}
          >
            Based on {testCount} test{testCount > 1 ? 's' : ''}
          </Text>
        )}
      </Box>
      
      <Flex
        direction="column"
        gap={1.5}
        bg={kbBg}
        p={3}
        borderRadius="lg"
        boxShadow="xl"
        maxW="800px"
        w="100%"
        mx="auto"
      >
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <Flex key={rowIndex} gap={1}>
            {row.keys.map((key, keyIndex) => {
              const size = row.sizes[keyIndex];
              
              return (
                <KeyboardKey
                  key={keyIndex}
                  keyLabel={key}
                  size={size}
                  charLogs={charLogs}
                />
              );
            })}
          </Flex>
        ))}
      </Flex>
      
      {/* Legend */}
      <Flex
        justify="center"
        align="center"
        gap={6}
        mt={4}
        fontSize="sm"
        color="gray.400"
      >
        <Flex align="center" gap={2}>
          <Box w="20px" h="20px" bg="rgb(255, 0, 0)" borderRadius="sm" />
          <Text>Poor</Text>
        </Flex>
        <Flex align="center" gap={2}>
          <Box w="20px" h="20px" bg="rgb(255, 165, 0)" borderRadius="sm" />
          <Text>Average</Text>
        </Flex>
        <Flex align="center" gap={2}>
          <Box w="20px" h="20px" bg="rgb(0, 255, 0)" borderRadius="sm" />
          <Text>Excellent</Text>
        </Flex>
        <Flex align="center" gap={2}>
          <Box w="20px" h="20px" bg={keyBg} border={`1px solid ${keyBorder}`} borderRadius="sm" />
          <Text>No Data</Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default KeyboardVisualization; 