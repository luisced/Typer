import React, { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';

interface FocusWarningOverlayProps {
  mainContainerRef: React.RefObject<HTMLDivElement | null>;
  onFocus: () => void;
}

export const FocusWarningOverlay: React.FC<FocusWarningOverlayProps> = ({ mainContainerRef, onFocus }) => {
  const handleAnyKey = (e: KeyboardEvent | MouseEvent) => {
    // Check if the click/keypress is within the OptionBar
    const optionBar = document.querySelector('[data-option-bar="true"]');
    if (optionBar?.contains(e.target as Node)) {
      return; // Don't trigger focus if clicking OptionBar
    }
    
    // For all other areas, trigger the focus
    onFocus();
  };

  useEffect(() => {
    // Add event listeners to the window to catch all interactions
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
      pointerEvents="none" // Make the overlay non-interactive
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
        fontFamily="monospace"
        pointerEvents="auto" // Make only the message box interactive
        cursor="pointer"
        _hover={{ color: 'yellow.200' }}
        transition="color 0.2s ease"
      >
        Click or press any key to focus
      </Box>
    </Box>
  );
}; 