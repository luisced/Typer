import React from 'react';
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getTheme } from './styles'
import { useCustomizationStore } from './app/store/customizationStore'
import AppRoutes from './app/router/routes'

// Create a client
const queryClient = new QueryClient()

const App: React.FC = () => {
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
