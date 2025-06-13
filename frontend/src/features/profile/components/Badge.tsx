import { Box, Text, Tooltip, VStack } from '@chakra-ui/react';
import type { BadgeWithEarnedStatus } from '../utils/api';

interface BadgeProps {
  badge: BadgeWithEarnedStatus;
  size?: 'sm' | 'md' | 'lg';
}

const getTierGradient = (tier: string, earned: boolean) => {
  if (!earned) {
    return 'linear-gradient(to bottom right, #4a5568 0%, #2d3748 100%)';
  }
  
  switch (tier.toLowerCase()) {
    case 'common':
      return 'linear-gradient(to bottom right, #E0E0E0 0%, #BDBDBD 100%)';
    case 'uncommon':
      return 'linear-gradient(to bottom right, #4CAF50 0%, #2E7D32 100%)';
    case 'rare':
      return 'linear-gradient(to bottom right, #2196F3 0%, #1565C0 100%)';
    case 'legendary':
      return 'linear-gradient(to bottom right, #9C27B0 0%, #4A148C 100%)';
    default:
      return 'linear-gradient(to bottom right, #E0E0E0 0%, #BDBDBD 100%)';
  }
};

const getTierColor = (tier: string, earned: boolean) => {
  if (!earned) return '#718096';
  
  switch (tier.toLowerCase()) {
    case 'common':
      return '#9E9E9E';
    case 'uncommon':
      return '#388E3C';
    case 'rare':
      return '#1976D2';
    case 'legendary':
      return '#7B1FA2';
    default:
      return '#9E9E9E';
  }
};

const getTierGlow = (tier: string, earned: boolean) => {
  if (!earned) return 'none';
  
  switch (tier.toLowerCase()) {
    case 'common':
      return '0 0 15px rgba(158, 158, 158, 0.4)';
    case 'uncommon':
      return '0 0 20px rgba(56, 142, 60, 0.5)';
    case 'rare':
      return '0 0 25px rgba(25, 118, 210, 0.6)';
    case 'legendary':
      return '0 0 30px rgba(123, 31, 162, 0.7)';
    default:
      return 'none';
  }
};

const Badge = ({ badge, size = 'md' }: BadgeProps) => {
  const sizeMap = {
    sm: { 
      hexagon: { w: '50px', h: '75px' },
      circle: { w: '40px', h: '40px' },
      icon: '20px',
      ribbon: { w: '70px', h: '20px', fontSize: '10px', bottom: '8px' }
    },
    md: { 
      hexagon: { w: '64px', h: '96px' },
      circle: { w: '50px', h: '50px' },
      icon: '24px',
      ribbon: { w: '85px', h: '24px', fontSize: '12px', bottom: '10px' }
    },
    lg: { 
      hexagon: { w: '80px', h: '120px' },
      circle: { w: '60px', h: '60px' },
      icon: '28px',
      ribbon: { w: '100px', h: '28px', fontSize: '14px', bottom: '12px' }
    }
  };

  const currentSize = sizeMap[size];
  const tierGradient = getTierGradient(badge.tier, badge.earned);
  const tierColor = getTierColor(badge.tier, badge.earned);
  const tierGlow = getTierGlow(badge.tier, badge.earned);

  return (
    <Tooltip
      label={
        <VStack spacing={1} align="start">
          <Text fontWeight="bold" color={tierColor}>
            {badge.name}
          </Text>
          <Text fontSize="sm">{badge.description}</Text>
          <Text fontSize="xs" color="gray.400">
            {badge.tier} • {badge.earned ? `Earned ${new Date(badge.earned_at!).toLocaleDateString()}` : 'Not earned'}
          </Text>
        </VStack>
      }
      placement="top"
      hasArrow
      bg="gray.800"
      color="white"
      borderRadius="md"
      p={3}
    >
      <Box
        position="relative"
        display="inline-block"
        margin="1.5em 1em"
        cursor="pointer"
        transition="all 0.2s ease"
        _hover={{
          transform: 'translateY(-4px)',
          filter: badge.earned ? 'brightness(1.1)' : 'brightness(1.05)'
        }}
      >
        {/* Hexagon Badge */}
        <Box
          position="relative"
          width={currentSize.hexagon.w}
          height={currentSize.hexagon.h}
          borderRadius="10px"
          background={tierGradient}
          opacity={badge.earned ? 1 : 0.6}
          boxShadow={tierGlow}
          _before={{
            content: '""',
            position: 'absolute',
            width: 'inherit',
            height: 'inherit',
            borderRadius: 'inherit',
            background: 'inherit',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: 'auto',
            transform: 'rotate(60deg)',
          }}
          _after={{
            content: '""',
            position: 'absolute',
            width: 'inherit',
            height: 'inherit',
            borderRadius: 'inherit',
            background: 'inherit',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: 'auto',
            transform: 'rotate(-60deg)',
          }}
        >
          {/* Circle with Icon */}
          <Box
            position="absolute"
            width={currentSize.circle.w}
            height={currentSize.circle.h}
            background="white"
            borderRadius="50%"
            top="0"
            left="0"
            right="0"
            bottom="0"
            margin="auto"
            zIndex={10}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color={tierColor}
            fontSize={currentSize.icon}
            fontWeight="bold"
          >
            {badge.icon_url}
          </Box>

          {/* Ribbon with Badge Name */}
          <Box
            position="absolute"
            borderRadius="4px"
            padding="4px 8px"
            width={currentSize.ribbon.w}
            height={currentSize.ribbon.h}
            zIndex={11}
            color="white"
            bottom={currentSize.ribbon.bottom}
            left="50%"
            marginLeft={`-${parseInt(currentSize.ribbon.w) / 2}px`}
            fontSize={currentSize.ribbon.fontSize}
            fontWeight="bold"
            textAlign="center"
            lineHeight="1.2"
            background="linear-gradient(to bottom right, #555 0%, #333 100%)"
            boxShadow="0 1px 2px rgba(0, 0, 0, 0.27)"
            textShadow="0 1px 1px rgba(0, 0, 0, 0.3)"
            textTransform="uppercase"
            letterSpacing="0.5px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
          >
            <Text
              fontSize="inherit"
              fontWeight="inherit"
              color="inherit"
              textAlign="center"
              lineHeight="1"
              isTruncated
              maxWidth="100%"
            >
              {badge.name.length > 8 ? badge.name.substring(0, 8) : badge.name}
            </Text>
          </Box>
        </Box>
      </Box>
    </Tooltip>
  );
};

export default Badge; 