import React from "react";
import {
  Box,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";

interface CharLog {
  attempts: number;
  errors: number;
  deltas: number[];
  lastAttemptTime: number | null;
}

interface KeyboardKeyProps {
  keyLabel: string;
  size?: "1" | "wide" | "med" | "double" | "space" | "accent";
  charLogs?: Record<string, CharLog>;
  keyChar?: string; // The actual character this key represents
}

const KeyboardKey: React.FC<KeyboardKeyProps> = ({
  keyLabel,
  size = "1",
  charLogs = {},
  keyChar,
}) => {
  // Color mode values
  const keyBg = useColorModeValue("#e0e0e0", "#3c3c3c");
  const keyText = useColorModeValue("#333", "#ddd");
  const keyBorder = useColorModeValue("#b0b0b0", "#555");
  const keyShadow = useColorModeValue("rgba(0,0,0,0.2)", "rgba(0,0,0,0.7)");
  const keyAccentBg = useColorModeValue("#ff7043", "#e65100");

  // Character mapping for special keys
  const getCharForKey = (key: string): string => {
    const keyCharMap: Record<string, string> = {
      "Space": " ",
      "Return": "\n",
      "Tab": "\t",
      "`": "`", "1": "1", "2": "2", "3": "3", "4": "4", "5": "5",
      "6": "6", "7": "7", "8": "8", "9": "9", "0": "0",
      "-": "-", "=": "=", "[": "[", "]": "]", "\\": "\\",
      ";": ";", "'": "'", ",": ",", ".": ".", "/": "/",
    };
    
    if (keyChar) return keyChar;
    if (keyCharMap[key]) return keyCharMap[key];
    return key.toLowerCase();
  };

  // Calculate mastery level for a character (0-1 scale)
  const calculateMastery = (char: string): number => {
    const charKey = char.toLowerCase();
    const log = charLogs[charKey] || charLogs[char];
    
    if (!log || log.attempts === 0) {
      return 0; // No data = no mastery
    }

    // Calculate accuracy (0-1)
    const accuracy = (log.attempts - log.errors) / log.attempts;
    
    // Calculate speed factor based on average delta time
    const avgDelta = log.deltas.length > 0 
      ? log.deltas.reduce((sum, delta) => sum + delta, 0) / log.deltas.length
      : 1000;
    
    // Normalize speed (200ms excellent, 1000ms poor)
    const speedFactor = Math.max(0, Math.min(1, (1000 - avgDelta) / 800));
    
    // Combine accuracy and speed
    const mastery = (accuracy * 0.7) + (speedFactor * 0.3);
    
    return Math.max(0, Math.min(1, mastery));
  };

  // Get color based on mastery level
  const getMasteryColor = (mastery: number): string => {
    if (mastery === 0) {
      return keyBg; // Default key color
    }
    
    // Red (poor) -> Yellow (medium) -> Green (excellent)
    if (mastery < 0.5) {
      const ratio = mastery * 2;
      const r = 255;
      const g = Math.round(165 * ratio);
      const b = 0;
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const ratio = (mastery - 0.5) * 2;
      const r = Math.round(255 * (1 - ratio));
      const g = 255;
      const b = 0;
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  // Get key size styles
  const getKeySize = (keySize: string): Record<string, any> => {
    switch (keySize) {
      case "wide":
        return { flex: "2.5" };
      case "med":
        return { flex: "1.5" };
      case "double":
        return { flex: "3" };
      case "space":
        return { flex: "10" };
      case "accent":
        return { flex: "1", bg: keyAccentBg, color: "white" };
      default:
        return { flex: "1" };
    }
  };

  // Get tooltip content
  const getTooltipContent = (key: string): string => {
    const char = getCharForKey(key);
    const log = charLogs[char.toLowerCase()] || charLogs[char];
    
    if (!log || log.attempts === 0) {
      return `${key}: No data`;
    }

    const accuracy = ((log.attempts - log.errors) / log.attempts * 100).toFixed(1);
    const avgSpeed = log.deltas.length > 0 
      ? (log.deltas.reduce((sum, delta) => sum + delta, 0) / log.deltas.length).toFixed(0)
      : "N/A";
    
    return `${key}\nAccuracy: ${accuracy}%\nAttempts: ${log.attempts}\nErrors: ${log.errors}\nAvg Speed: ${avgSpeed}ms`;
  };

  const char = getCharForKey(keyLabel);
  const mastery = calculateMastery(char);
  const masteryColor = getMasteryColor(mastery);
  const keyStyles = getKeySize(size);

  // Handle empty space key
  if (keyLabel === "") {
    return (
      <Box
        {...keyStyles}
        h="40px"
        bg="transparent"
      />
    );
  }

  return (
    <Tooltip
      label={getTooltipContent(keyLabel)}
      placement="top"
      hasArrow
      bg="gray.700"
      color="white"
      fontSize="sm"
      whiteSpace="pre-line"
    >
      <Box
        {...keyStyles}
        h="40px"
        bg={mastery > 0 ? masteryColor : (keyStyles.bg || keyBg)}
        color={mastery > 0 ? "white" : (keyStyles.color || keyText)}
        border={`1px solid ${keyBorder}`}
        borderRadius="md"
        boxShadow={`
          inset 0 -1px 0 rgba(0,0,0,0.1),
          0 2px 0 ${keyBorder},
          0 2px 4px ${keyShadow}
        `}
        display="flex"
        justifyContent="center"
        alignItems="center"
        fontFamily="SF Mono, Consolas, Menlo, monospace"
        fontSize="0.8rem"
        userSelect="none"
        cursor="default"
        transition="all 0.2s ease"
        _hover={{
          transform: "translateY(-1px)",
          boxShadow: `
            inset 0 -1px 0 rgba(0,0,0,0.1),
            0 3px 0 ${keyBorder},
            0 3px 6px ${keyShadow}
          `
        }}
      >
        {keyLabel}
      </Box>
    </Tooltip>
  );
};

export default KeyboardKey; 