import { Box, Flex, Text } from '@chakra-ui/react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import React from 'react'

interface CodeEditorProps {
  code: string
  language: string
  userInput: string
  isActive: boolean
  onClick: () => void
}

const CodeEditor = ({ code, language, userInput, isActive, onClick }: CodeEditorProps) => {
  const lines = code.split('\n')
  const userLines = userInput.split('\n')
  
  // Custom style for syntax highlighter
  const customStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: 'transparent',
      margin: 0,
      padding: 0,
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      background: 'transparent',
    }
  }

  const renderLineWithTyping = (lineIndex: number) => {
    const line = lines[lineIndex]
    const userLine = userLines[lineIndex] || ''
    
    return (
      <Flex position="relative" minH="24px">
        {/* Syntax highlighted code as background */}
        <Box position="absolute" left={0} top={0} width="100%" opacity={0.3}>
          <SyntaxHighlighter
            language={language}
            style={customStyle}
            customStyle={{
              background: 'transparent',
              padding: 0,
              margin: 0,
              fontSize: '16px',
              lineHeight: '24px',
            }}
            codeTagProps={{
              style: {
                fontSize: '16px',
                fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
              }
            }}
          >
            {line}
          </SyntaxHighlighter>
        </Box>
        
        {/* Typed characters overlay */}
        <Box position="relative" zIndex={1} fontFamily="mono" fontSize="md" lineHeight="24px">
          {line.split('').map((char, charIndex) => {
            const currentPos = userInput.length
            const lineStartPos = userInput.substring(0, userInput.lastIndexOf('\n', currentPos - 1) + 1).length
            const currentLineIndex = userInput.split('\n').length - 1
            const currentCharIndex = currentPos - lineStartPos
            
            let color = 'transparent'
            let fontWeight = 'normal'
            
            if (lineIndex < currentLineIndex || (lineIndex === currentLineIndex && charIndex < userLine.length)) {
              const typedChar = lineIndex === currentLineIndex ? userLine[charIndex] : 
                userLines[lineIndex] ? userLines[lineIndex][charIndex] : undefined
              if (typedChar === char) {
                color = 'white'
                fontWeight = 'bold'
              } else if (typedChar !== undefined) {
                color = 'red.400'
                fontWeight = 'bold'
              }
            }
            
            const isCursorPosition = lineIndex === currentLineIndex && charIndex === currentCharIndex
            
            return (
              <Text
                as="span"
                key={charIndex}
                color={color}
                fontWeight={fontWeight}
                position="relative"
                fontSize="16px"
              >
                {char === ' ' ? '\u00A0' : char}
                {/* Cursor */}
                {isCursorPosition && (
                  <Box
                    as="span"
                    w="2px"
                    h="20px"
                    bg="yellow.300"
                    position="absolute"
                    left={0}
                    top="2px"
                    animation={!isActive ? "blink 1s step-end infinite" : "none"}
                  />
                )}
              </Text>
            )
          })}
          
          {/* Cursor at end of line */}
          {(() => {
            const currentPos = userInput.length
            const lineStartPos = userInput.substring(0, userInput.lastIndexOf('\n', currentPos - 1) + 1).length
            const currentLineIndex = userInput.split('\n').length - 1
            const currentCharIndex = currentPos - lineStartPos
            
            if (lineIndex === currentLineIndex && currentCharIndex === line.length) {
              return (
                <Box
                  as="span"
                  w="2px"
                  h="20px"
                  bg="yellow.300"
                  position="relative"
                  top="2px"
                  animation={!isActive ? "blink 1s step-end infinite" : "none"}
                  ml="1px"
                  display="inline-block"
                />
              )
            }
            return null
          })()}
        </Box>
      </Flex>
    )
  }

  return (
    <Box
      bg="#1e1e1e"
      borderRadius="8px"
      overflow="hidden"
      maxW="900px"
      width="100%"
      minH="300px"
      fontFamily="mono"
      fontSize="md"
      onClick={onClick}
      cursor="pointer"
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)"
    >
      {lines.map((_, lineIndex) => (
        <Flex key={lineIndex} bg={lineIndex % 2 === 0 ? "#1e1e1e" : "#252526"}>
          {/* Line number gutter */}
          <Box
            minW="50px"
            textAlign="center"
            px={2}
            py="2px"
            color="#858585"
            fontSize="14px"
            fontFamily="mono"
            userSelect="none"
            bg="#2d2d30"
            borderRight="1px solid"
            borderColor="#3e3e42"
            lineHeight="24px"
          >
            {lineIndex + 1}
          </Box>
          
          {/* Code content */}
          <Box flex="1" px={4} py="2px">
            {renderLineWithTyping(lineIndex)}
          </Box>
        </Flex>
      ))}
    </Box>
  )
}

export default CodeEditor 