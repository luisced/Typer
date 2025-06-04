import { extendTheme } from '@chakra-ui/react'

const classicDarkTheme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: '#1c1c1a',
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

const moonLightTheme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: '#fff',
        color: 'black',
      },
      a: {
        color: 'blue.600',
        _hover: {
          textDecoration: 'underline',
        },
      },
    },
  },
})

const octagonTheme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'var(--chakra-colors-gray-900)',
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

const customTheme = (accentColor: string) => extendTheme({
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
        color: accentColor,
        _hover: {
          textDecoration: 'underline',
        },
      },
    },
  },
})

export const getTheme = (themeName: string, accentColor: string = '#3182ce') => {
  switch (themeName) {
    case 'classic-dark':
      return classicDarkTheme
    case 'moon-light':
      return moonLightTheme
    case 'octagon':
      return octagonTheme
    case 'custom':
      return customTheme(accentColor)
    default:
      return classicDarkTheme
  }
}

export default getTheme 