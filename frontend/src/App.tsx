import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getTheme } from './theme'
import { useCustomizationStore } from './store/customizationStore'
import AppRoutes from './routes'

// Create a client
const queryClient = new QueryClient()

function App() {
  const { config } = useCustomizationStore()
  const theme = getTheme(config.theme, config.accent)
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ChakraProvider>
    </QueryClientProvider>
  )
}

export default App
