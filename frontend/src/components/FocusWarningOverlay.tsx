import React, { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';

interface FocusWarningOverlayProps {
  mainContainerRef: React.RefObject<HTMLDivElement | null>;
  onFocus: () => void;
}

export const FocusWarningOverlay: React.FC<FocusWarningOverlayProps> = ({ mainContainerRef, onFocus }) => {
  const handleAnyKey = () => {
    onFocus();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleAnyKey);
    window.addEventListener('mousedown', handleAnyKey);
    return () => {
      window.removeEventListener('keydown', handleAnyKey);
      window.removeEventListener('mousedown', handleAnyKey);
    };
  }, [onFocus]);

  return (
    <Box
      position="absolute"
      top={-10}
      left={0}
      w="100%"
      h="90%"
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
        tabIndex={0}
        role="alertdialog"
        aria-modal="true"
      >
        Click or press any key to focus
      </Box>
    </Box>
  );
}; 