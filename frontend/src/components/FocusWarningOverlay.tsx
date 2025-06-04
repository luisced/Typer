import React, { useEffect } from 'react';
import { Box } from '@chakra-ui/react';

interface Props {
  mainContainerRef: React.RefObject<HTMLDivElement | null>;
  onFocus: () => void;
}

export const FocusWarningOverlay: React.FC<Props> = ({ mainContainerRef, onFocus }) => {
  const handleAnyInteraction = (e: MouseEvent | KeyboardEvent) => {
    if (mainContainerRef.current?.contains(e.target as Node)) {
      onFocus();
    }
  };

  useEffect(() => {
    window.addEventListener('mousedown', handleAnyInteraction);
    window.addEventListener('keydown', handleAnyInteraction);
    return () => {
      window.removeEventListener('mousedown', handleAnyInteraction);
      window.removeEventListener('keydown', handleAnyInteraction);
    };
  }, [onFocus]);

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      w="100%"
      h="100%"
      zIndex={10}
      bg="rgba(23, 25, 35, 0.5)"
      backdropFilter="blur(4px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        color="yellow.300"
        px={8}
        py={6}
        fontSize="2xl"
        fontWeight="bold"
        textAlign="center"
        cursor="pointer"
        _hover={{ color: 'yellow.200' }}
        onClick={onFocus}
      >
        Click or press any key to focus
      </Box>
    </Box>
  );
}; 