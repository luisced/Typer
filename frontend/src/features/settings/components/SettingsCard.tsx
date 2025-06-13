import { Box, Select, Input, FormControl, FormLabel, VStack, Text } from '@chakra-ui/react'

const SettingsCard = ({
  model,
  setModel,
  apiKey,
  setApiKey,
}: {
  model: string
  setModel: (m: string) => void
  apiKey: string
  setApiKey: (k: string) => void
}) => (
  <Box
    bg="gray.800"
    borderRadius="lg"
    border="1px solid"
    borderColor="gray.600"
    p={6}
    maxW="md"
    mx="auto"
    boxShadow="lg"
  >
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel color="gray.300">AI Model</FormLabel>
        <Select
          value={model}
          onChange={e => setModel(e.target.value)}
          bg="gray.700"
          color="gray.100"
          borderColor="gray.600"
        >
          <option value="deepseek">DeepSeek</option>
          <option value="openai">OpenAI</option>
          <option value="openai-compatible">OpenAI-Compatible</option>
          <option value="gemini">Google Gemini</option>
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel color="gray.300">API Key (optional)</FormLabel>
        <Input
          type="password"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder="Enter your API key..."
          bg="gray.700"
          color="gray.100"
          borderColor="gray.600"
        />
      </FormControl>
      <Text fontSize="sm" color="gray.500">
        Your API key is only used locally and never sent to our servers.
      </Text>
    </VStack>
  </Box>
)

export default SettingsCard 