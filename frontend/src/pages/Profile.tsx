import { Flex } from '@chakra-ui/react'
import ProfileCard from '../components/ProfileCard'
import StatCards from '../components/StatCards'
import BadgesSection from '../components/BadgesSection'
import SettingsSidebar from '../components/SettingsSidebar'

const Profile = () => {
  return (
    <Flex gap={6}>
      <SettingsSidebar />
      <Flex direction="column" gap={6} flex="1">
        <ProfileCard />
        <StatCards />
        <BadgesSection />
      </Flex>
    </Flex>
  )
}

export default Profile 