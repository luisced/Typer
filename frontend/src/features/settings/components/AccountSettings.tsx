import { Box, Flex, VStack, Divider, Text, Alert, AlertIcon } from '@chakra-ui/react'
import { ProfileCard } from '@/features/profile'
import { TestHistory } from '@/features/leaderboard'
import { BadgeGrid } from '@/features/profile'
import { KeyboardVisualization } from '@/features/typing-test'
import { useGamification } from '@/features/profile'
import { useTests } from '@/features/typing-test'
import { aggregateCharLogs } from '@/features/typing-test/utils/aggregateCharLogs'

const AccountSettings = ({ user }: { user?: any }) => {
  const { badges, loading: gamificationLoading, error: gamificationError } = useGamification({ enabled: true, autoFetch: true });
  const { tests, isLoading: testsLoading } = useTests();

  // Aggregate character logs from all tests
  const aggregatedCharLogs = tests ? aggregateCharLogs(tests) : {};

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
      {/* Keyboard Mastery Section */}
      {tests && tests.length > 0 && (
        <Box
          bg="gray.800"
          borderRadius="lg"
          p={8}
          w="100%"
          boxShadow="lg"
        >
          <KeyboardVisualization 
            charLogs={aggregatedCharLogs}
            title="Overall Keyboard Mastery"
            testCount={tests.length}
          />
        </Box>
      )}
      <TestHistory />
    </Flex>
  )
}

export default AccountSettings; 