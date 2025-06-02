import { Flex } from '@chakra-ui/react'
import ProfileCard from '../ProfileCard'
import StatCards from '../StatCards'
import BadgesSection from '../BadgesSection'

const AccountSettings = ({ user }: { user?: any }) => (
  <Flex direction="column" gap={6}>
    <ProfileCard user={user} />
    <StatCards />
    <BadgesSection />
  </Flex>
)

export default AccountSettings; 