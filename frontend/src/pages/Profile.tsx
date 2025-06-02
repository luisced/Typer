import { useState } from 'react'
import { Flex } from '@chakra-ui/react'
import SettingsSidebar from '../components/SettingsSidebar'
import AccountSettings from '../components/settings/AccountSettings'
import AuthenticationSettings from '../components/settings/AuthenticationSettings'
import DangerZoneSettings from '../components/settings/DangerZoneSettings'
import AdminSettings from '../components/settings/AdminSettings'
import AISettings from '../components/settings/AISettings'
import CustomizationSettings from '../components/settings/CustomizationSettings'

const Profile = () => {
  const [selected, setSelected] = useState('account')
  return (
    <Flex gap={6}>
      <SettingsSidebar selected={selected} setSelected={setSelected} />
      <Flex direction="column" gap={6} flex="1">
        {selected === 'authentication' ? (
          <AuthenticationSettings />
        ) : selected === 'danger' ? (
          <DangerZoneSettings />
        ) : selected === 'admin' ? (
          <AdminSettings />
        ) : selected === 'ai' ? (
          <AISettings />
        ) : selected === 'customization' ? (
          <CustomizationSettings />
        ) : (
          <AccountSettings />
        )}
      </Flex>
    </Flex>
  )
}

export default Profile 