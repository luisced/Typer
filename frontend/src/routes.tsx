import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Test from './pages/Test'
import Profile from './pages/Profile'
import TypingTest from './components/TypingTest'
import SettingsCard from './components/SettingsCard'
import Scoreboard from './pages/Scoreboard'
import Register from './pages/Register'
import Login from './pages/Login'
import { useState } from 'react'

const AppRoutes = () => {
  const [model, setModel] = useState('gemini')
  const [apiKey, setApiKey] = useState('')
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<TypingTest />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<SettingsCard model={model} setModel={setModel} apiKey={apiKey} setApiKey={setApiKey} />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes 