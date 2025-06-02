import { Flex } from '@chakra-ui/react'
import ProfileCard from '../ProfileCard'
import StatCards from '../StatCards'
import BadgesSection from '../BadgesSection'

const AccountSettings = () => (
  <Flex direction="column" gap={6}>
    <ProfileCard />
    <StatCards />
    <BadgesSection />
  </Flex>
)

export default AccountSettings; 