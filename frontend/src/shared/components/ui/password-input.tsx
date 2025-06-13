import { useState } from 'react'
import { Input, InputGroup, InputRightElement, IconButton, Box, Progress, Text, Flex } from '@chakra-ui/react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

export const PasswordInput = ({ value, onChange, placeholder, ...props }: any) => {
  const [visible, setVisible] = useState(false)
  return (
    <InputGroup>
      <Input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
      <InputRightElement>
        <IconButton
          aria-label={visible ? 'Hide password' : 'Show password'}
          icon={visible ? <FaEyeSlash /> : <FaEye />}
          size="sm"
          variant="ghost"
          onClick={() => setVisible(v => !v)}
          tabIndex={-1}
        />
      </InputRightElement>
    </InputGroup>
  )
}

function getStrength(password: string) {
  let score = 0
  if (password.length > 5) score++
  if (password.length > 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
const strengthColors = ['red.400', 'orange.400', 'yellow.400', 'blue.400', 'green.400', 'teal.400']

export const PasswordStrengthMeter = ({ value }: { value: string }) => {
  const score = getStrength(value)
  return (
    <Box mt={2}>
      <Progress value={(score / 5) * 100} size="sm" colorScheme={score < 2 ? 'red' : score < 4 ? 'yellow' : 'green'} borderRadius="md" />
      <Flex mt={1} justify="space-between" align="center">
        <Text fontSize="xs" color={strengthColors[score]} fontWeight="bold">
          {value ? strengthLabels[score] : ''}
        </Text>
      </Flex>
    </Box>
  )
} 