import React from 'react'
import { Box, Flex, Text, Badge, useColorModeValue } from '@chakra-ui/react'
import { useTests } from '../hooks/useTests'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts'

export const TypingTestResults: React.FC = () => {
  const { tests } = useTests()
  const location = useLocation()
  const navigate = useNavigate()
  const latest = location.state?.latestTest || (tests && tests[0])

  // Prepare chart data (last 7 sessions, or all if less)
  const chartData = (tests || []).slice(-7).map((test, idx) => ({
    sessionIndex: idx + 1,
    wpm: test.wpm,
    rawWpm: test.raw_wpm,
    errors: test.chars.incorrect,
    date: new Date(test.timestamp).toLocaleString(),
  }))

  const yellow = useColorModeValue('#F9C74F', '#F9C74F')
  const gray = useColorModeValue('gray.600', 'gray.600')
  const red = useColorModeValue('red.400', 'red.400')

  if (!latest) return <Box p={8}><Text>No test data found.</Text></Box>

  return (
    <Flex direction="column" align="center" justify="center" minH="100vh" bg="gray.900" color="gray.100" p={8}>
      <Flex mb={8} gap={12} align="center">
        <Box>
          <Text fontSize="2xl" color={yellow} fontWeight="bold">wpm <Badge ml={1} colorScheme="yellow">🏆</Badge></Text>
          <Text fontSize="5xl" color={yellow} fontWeight="bold">{latest.wpm}</Text>
        </Box>
        <Box>
          <Text fontSize="2xl" color={yellow} fontWeight="bold">acc</Text>
          <Text fontSize="5xl" color={yellow} fontWeight="bold">{latest.accuracy}%</Text>
        </Box>
        <Box>
          <Text fontSize="md" color="gray.400" mb={1}>test type</Text>
          <Text fontFamily="mono" color={yellow} fontSize="lg" whiteSpace="pre-line">
            {latest.test_type.split(',').join('\n')}
          </Text>
        </Box>
        <Box>
          <Text fontSize="md" color="gray.400" mb={1}>raw</Text>
          <Text fontSize="3xl" color={yellow} fontWeight="bold">{latest.raw_wpm}</Text>
        </Box>
        <Box>
          <Text fontSize="md" color="gray.400" mb={1}>characters</Text>
          <Text fontSize="3xl" color={yellow} fontWeight="bold">
            {latest.chars.correct}/{latest.chars.incorrect}/{latest.chars.extra}/{latest.chars.missed}
          </Text>
        </Box>
        <Box>
          <Text fontSize="md" color="gray.400" mb={1}>consistency</Text>
          <Text fontSize="3xl" color={yellow} fontWeight="bold">{latest.consistency}%</Text>
        </Box>
        <Box>
          <Text fontSize="md" color="gray.400" mb={1}>time</Text>
          <Text fontSize="3xl" color={yellow} fontWeight="bold">{latest.duration}s</Text>
          <Text fontSize="sm" color="gray.400">{new Date(latest.timestamp).toLocaleTimeString()}</Text>
        </Box>
      </Flex>
      <Box w="100%" maxW="1100px" bg="gray.800" p={6} borderRadius="lg">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid stroke={gray} vertical={false} />
            <XAxis
              axisLine={false}
              tickLine={false}
              dataKey="sessionIndex"
              tickFormatter={(value) => `#${value}`}
              stroke={gray}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              stroke={gray}
            />
            <Tooltip
              cursor={false}
              animationDuration={100}
              contentStyle={{
                backgroundColor: 'gray.800',
                border: 'none',
                borderRadius: '8px',
                color: 'white'
              }}
            />
            <Legend />
            <ReferenceLine
              y={100}
              stroke={gray}
              strokeDasharray="5 5"
              label={{
                position: 'top',
                value: 'Target 100 WPM',
                fill: '#bbb',
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="wpm"
              stroke={yellow}
              fill={yellow}
              fillOpacity={0.2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="rawWpm"
              stroke={gray}
              fill={gray}
              fillOpacity={0.2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="errors"
              stroke={red}
              fill={red}
              fillOpacity={0.2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
      <Box mt={8}>
        <Text as="button" color="yellow.400" fontWeight="bold" fontSize="lg" _hover={{ textDecoration: 'underline' }} onClick={() => navigate('/')}>Try Again</Text>
      </Box>
    </Flex>
  )
}

export default TypingTestResults 