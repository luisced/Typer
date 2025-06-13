import { Box, SimpleGrid, Text, VStack, HStack, Badge as ChakraBadge, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import Badge from './Badge';
import type { BadgeWithEarnedStatus } from '@/shared/utils/api';

interface BadgeGridProps {
  badges: BadgeWithEarnedStatus[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  showStats?: boolean;
}

const BadgeGrid = ({ badges, loading, error, title = "Badges", showStats = true }: BadgeGridProps) => {
  if (loading) {
    return (
      <VStack spacing={4} py={8}>
        <Spinner size="lg" color="blue.500" />
        <Text color="gray.400">Loading badges...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error" bg="red.900" color="white" borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  const earnedBadges = badges.filter(badge => badge.earned);
  const totalBadges = badges.length;

  // Group badges by tier for better organization
  const badgesByTier = badges.reduce((acc, badge) => {
    const tier = badge.tier.toLowerCase();
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(badge);
    return acc;
  }, {} as Record<string, BadgeWithEarnedStatus[]>);

  const tierOrder = ['legendary', 'rare', 'uncommon', 'common'];
  const tierColors = {
    legendary: 'purple.400',
    rare: 'blue.400',
    uncommon: 'green.400',
    common: 'gray.400'
  };

  return (
    <Box>
      {/* Header */}
      <VStack spacing={4} align="start" mb={6}>
        <HStack justify="space-between" w="100%">
          <Text fontSize="2xl" fontWeight="bold" color="white">
            {title}
          </Text>
          {showStats && (
            <HStack spacing={4}>
              <ChakraBadge colorScheme="blue" variant="solid" fontSize="sm" px={3} py={1}>
                {earnedBadges.length}/{totalBadges} Earned
              </ChakraBadge>
              <Text color="gray.400" fontSize="sm">
                {Math.round((earnedBadges.length / totalBadges) * 100)}% Complete
              </Text>
            </HStack>
          )}
        </HStack>
      </VStack>

      {/* Badges organized by tier */}
      <VStack spacing={8} align="start">
        {tierOrder.map(tier => {
          const tierBadges = badgesByTier[tier];
          if (!tierBadges || tierBadges.length === 0) return null;

          const tierEarned = tierBadges.filter(b => b.earned).length;

          return (
            <Box key={tier} w="100%">
              <HStack mb={4} spacing={3}>
                <Text 
                  fontSize="lg" 
                  fontWeight="bold" 
                  color={tierColors[tier as keyof typeof tierColors]}
                  textTransform="capitalize"
                >
                  {tier}
                </Text>
                <ChakraBadge 
                  colorScheme={tier === 'legendary' ? 'purple' : tier === 'rare' ? 'blue' : tier === 'uncommon' ? 'green' : 'gray'} 
                  variant="outline"
                  fontSize="xs"
                >
                  {tierEarned}/{tierBadges.length}
                </ChakraBadge>
              </HStack>
              
              <SimpleGrid 
                columns={{ base: 3, sm: 4, md: 6, lg: 8, xl: 10 }} 
                spacing={4}
                w="100%"
              >
                {tierBadges.map(badge => (
                  <Badge key={badge.id} badge={badge} size="md" />
                ))}
              </SimpleGrid>
            </Box>
          );
        })}
      </VStack>

      {/* Empty state */}
      {badges.length === 0 && (
        <VStack spacing={4} py={12} color="gray.500">
          <Text fontSize="6xl">🏆</Text>
          <Text fontSize="lg" fontWeight="bold">No badges available</Text>
          <Text fontSize="sm" textAlign="center" maxW="300px">
            Complete typing tests to start earning badges and show off your achievements!
          </Text>
        </VStack>
      )}
    </Box>
  );
};

export default BadgeGrid; 