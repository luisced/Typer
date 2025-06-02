import { useState } from 'react'
import {
  Box, Flex, Text, Icon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useDisclosure, Button, Input, FormControl, FormLabel, VStack
} from '@chakra-ui/react'
import { FaUser, FaKey, FaExclamationTriangle, FaShieldAlt, FaGoogle, FaGithub, FaLock, FaSignOutAlt, FaPlug, FaRobot, FaPaintBrush } from 'react-icons/fa'

const options = [
  { key: 'account', label: 'account', icon: FaUser, active: true },
  { key: 'authentication', label: 'authentication', icon: FaKey, active: true },
  { key: 'danger', label: 'danger zone', icon: FaExclamationTriangle, active: true },
  { key: 'admin', label: 'admin', icon: FaShieldAlt, active: true },
  { key: 'ai', label: 'ai', icon: FaRobot, active: true },
  { key: 'customization', label: 'customization', icon: FaPaintBrush, active: true },
]

const SettingsSidebar = ({ selected, setSelected }: { selected: string, setSelected: (key: string) => void }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleOptionClick = (key: string, isActive: boolean) => {
    if (!isActive) return
    setSelected(key)
    if (key !== 'authentication') onOpen()
  }

  return (
    <>
      <Box bg="gray.800" borderRadius="lg" p={6} boxShadow="lg">
        <Flex direction="column" gap={3}>
          {options.map(opt => (
            <Button
              key={opt.key}
              variant="ghost"
              justifyContent="flex-start"
              leftIcon={<Icon as={opt.icon} boxSize={5} />}
              fontWeight={opt.key === selected ? 'bold' : 'normal'}
              color={opt.key === selected ? 'white' : 'gray.400'}
              fontFamily="mono"
              fontSize="xl"
              _hover={opt.active ? { color: 'white' } : {}}
              _active={{}}
              isDisabled={!opt.active}
              opacity={opt.active ? 1 : 0.5}
              onClick={() => handleOptionClick(opt.key, opt.active)}
              px={5}
              py={2}
              borderRadius="md"
              transition="all 0.2s"
              w="100%"
            >
              <Text isTruncated>{opt.label}</Text>
            </Button>
          ))}
        </Flex>
      </Box>

    </>
  )
}

export default SettingsSidebar 