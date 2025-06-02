import { useState } from 'react'
import { Box, Flex, Text, Icon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useDisclosure, Button } from '@chakra-ui/react'
import { FaUser, FaKey, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa'

const options = [
  { key: 'account', label: 'account', icon: FaUser, active: true },
  { key: 'authentication', label: 'authentication', icon: FaKey, active: false },
  { key: 'danger', label: 'danger zone', icon: FaExclamationTriangle, active: false },
  { key: 'admin', label: 'admin', icon: FaShieldAlt, active: false },
]

const SettingsSidebar = () => {
  const [selected, setSelected] = useState('account')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleOptionClick = (key: string, isActive: boolean) => {
    if (!isActive) return
    setSelected(key)
    onOpen()
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
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800" color="gray.100">
          <ModalHeader textTransform="capitalize">{selected}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>This is the <b>{selected}</b> settings tab.</Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default SettingsSidebar 