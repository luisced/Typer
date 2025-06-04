import React from 'react'
import { Leaderboard } from '../components/leaderboard/Leaderboard'
import { LeaderboardProvider } from '../context/LeaderboardContext'

const Scoreboard = () => {
  return (
    <LeaderboardProvider>
      <Leaderboard />
    </LeaderboardProvider>
  )
}

export default Scoreboard 