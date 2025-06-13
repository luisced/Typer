import React from 'react'
import { Box } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'

export type CursorVariant = 'bar' | 'underscore' | 'block'

interface CursorProps {
  variant: CursorVariant
  isActive: boolean
  blink: boolean
}

const fadeInOut = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
`

export const Cursor: React.FC<CursorProps> = ({ variant, isActive, blink }) => {
  const getCursorStyles = () => {
    switch (variant) {
      case 'bar':
        return {
          w: '3px',
          h: '1.1em',
          left: -1,
          top: 0,
        }
      case 'underscore':
        return {
          w: '0.6em',
          h: '2px',
          left: 0,
          bottom: -2,
        }
      case 'block':
        return {
          w: '0.65em',
          h: '1.2em',
          left: 0,
          top: 0,
          opacity: 0.5,
        }
      default:
        return {}
    }
  }

  const styles = getCursorStyles()

  return (
    <Box
      as="span"
      bg="yellow.300"
      position="absolute"
      animation={!isActive && blink ? `${fadeInOut} 1.2s ease-in-out infinite` : 'none'}
      transition="left 0.5s cubic-bezier(.4,0,.2,1), top 0.28s cubic-bezier(.4,0,.2,1), background 0.2s"
      willChange="left, top, opacity"
      {...styles}
    />
  )
} 