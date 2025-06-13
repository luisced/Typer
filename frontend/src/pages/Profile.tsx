import React, { useState, useEffect } from 'react'
import { Box, Flex, Spinner, Alert, AlertIcon } from '@chakra-ui/react'
import { SettingsSidebar } from '@/features/settings'
import { AccountSettings } from '@/features/settings'
import { AuthenticationSettings } from '@/features/settings'
import { DangerZoneSettings } from '@/features/settings'
import { AdminSettings } from '@/features/settings'
import { AISettings } from '@/features/settings'
import { CustomizationSettings } from '@/features/settings'
import { getCurrentUser } from '@/shared/utils/api'

const Profile = () => {
  const [selected, setSelected] = useState('account')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getCurrentUser()
        setUser(res.data)
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Could not fetch user data')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  if (loading) return <Spinner size="lg" color="blue.400" mt={12} />
  if (error) return <Alert status="error" rounded="md" mt={12}><AlertIcon />{error}</Alert>

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
          <AccountSettings user={user} />
        )}
      </Flex>
    </Flex>
  )
}

export default Profile 