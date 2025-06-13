import { Routes, Route } from 'react-router-dom'
import MainLayout from '../../shared/components/layout/MainLayout'
import Home from '../../pages/Home'
import Profile from '../../pages/Profile'
import { SettingsCard } from '../../features/settings'
import Scoreboard from '../../pages/Scoreboard'
import Register from '../../pages/Register'
import Login from '../../pages/Login'
import { TypingTestResults } from '../../features/typing-test'
import { useState, useEffect } from 'react'
import { Box, Text, useToast } from '@chakra-ui/react'
import { getCurrentUser } from '../../shared/utils/api'

const AppRoutes = () => {
  const [model, setModel] = useState('gemini')
  const [apiKey, setApiKey] = useState('')
  const [isBanned, setIsBanned] = useState(false)
  const toast = useToast()

  useEffect(() => {
    const checkBanStatus = async () => {
      try {
        const res = await getCurrentUser()
        if (res.data.isBanned) {
          setIsBanned(true)
          toast({
            title: 'Account Banned',
            description: 'Your account has been banned. Please contact support.',
            status: 'error',
            duration: null,
            isClosable: true,
          })
        }
      } catch (err) {
        console.error('Error checking ban status:', err)
      }
    }
    checkBanStatus()
  }, [toast])

  return (
    <>
      {isBanned && (
        <Box bg="red.500" color="white" p={4} textAlign="center">
          <Text fontWeight="bold">Your account has been banned. Please contact support.</Text>
        </Box>
      )}
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<SettingsCard model={model} setModel={setModel} apiKey={apiKey} setApiKey={setApiKey} />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/results" element={<TypingTestResults />} />
        </Route>
      </Routes>
    </>
  )
}

export default AppRoutes 