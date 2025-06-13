import { useState } from 'react'
import { Box, VStack, FormControl, FormLabel, Select, Input, Button, Text } from '@chakra-ui/react'

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'claude', label: 'Claude' },
  { value: 'openai-compatible', label: 'OpenAI Compatible' },
]

const AISettings = () => {
  const [provider, setProvider] = useState('openai')
  const [apiKey, setApiKey] = useState('')
  const [serverUrl, setServerUrl] = useState('')

  return (
    <Box maxW="md" mx="auto" bg="gray.800" borderRadius="lg" p={8} boxShadow="lg">
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">AI Provider Settings</Text>
        <FormControl>
          <FormLabel>Provider</FormLabel>
          <Select value={provider} onChange={e => setProvider(e.target.value)} bg="gray.700" color="gray.100">
            {PROVIDERS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>API Key</FormLabel>
          <Input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Enter your API key..."
            bg="gray.700"
            color="gray.100"
          />
        </FormControl>
        {provider === 'openai-compatible' && (
          <FormControl>
            <FormLabel>Server URL</FormLabel>
            <Input
              value={serverUrl}
              onChange={e => setServerUrl(e.target.value)}
              placeholder="https://your-openai-compatible-server.com"
              bg="gray.700"
              color="gray.100"
            />
          </FormControl>
        )}
        <Button colorScheme="blue" fontFamily="mono" fontSize="md">
          Save
        </Button>
      </VStack>
    </Box>
  )
}

export default AISettings; 