import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'white',
      },
      a: {
        color: 'blue.400',
        _hover: {
          textDecoration: 'underline',
        },
      },
    },
  },
})

export default theme 