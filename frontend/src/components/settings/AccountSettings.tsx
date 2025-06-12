import { Flex, Box, Alert, AlertIcon } from '@chakra-ui/react'
import ProfileCard from '../ProfileCard'
import { TestHistory } from '../TestHistory'
import BadgeGrid from '../BadgeGrid'
import { useGamification } from '../../hooks/useGamification'

const AccountSettings = ({ user }: { user?: any }) => {
  const { badges, loading: gamificationLoading, error: gamificationError } = useGamification({ enabled: true, autoFetch: true });

  return (
    <Flex direction="column" gap={6}>
      <ProfileCard user={user} showGamification={true} showBadges={false} />
      {/* Badges Section */}
      <Box
        bg="gray.800"
        borderRadius="lg"
        p={8}
        w="100%"
        boxShadow="lg"
      >
        {gamificationError ? (
          <Alert status="error" bg="red.900" color="white" borderRadius="md">
            <AlertIcon />
            Failed to load badges: {gamificationError}
          </Alert>
        ) : (
          <BadgeGrid 
            badges={badges} 
            loading={gamificationLoading} 
            error={gamificationError}
            title="Achievement Badges"
            showStats={true}
          />
        )}
      </Box>
      <TestHistory />
    </Flex>
  )
}

export default AccountSettings; 