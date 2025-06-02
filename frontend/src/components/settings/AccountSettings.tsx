import { Flex } from '@chakra-ui/react'
import ProfileCard from '../ProfileCard'
import StatCards from '../StatCards'
import BadgesSection from '../BadgesSection'
import { TestHistory } from '../TestHistory'

const AccountSettings = ({ user }: { user?: any }) => (
  <Flex direction="column" gap={6}>
    <ProfileCard user={user} />
    <StatCards />
    <BadgesSection />
    <TestHistory />
  </Flex>
)

export default AccountSettings; 