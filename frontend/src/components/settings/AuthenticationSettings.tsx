import { useState } from 'react'
import { Box, Flex, Text, Icon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Button, Input, FormControl, FormLabel, VStack, InputGroup, InputRightElement, IconButton } from '@chakra-ui/react'
import { FaGoogle, FaGithub, FaLock, FaSignOutAlt, FaPlug, FaEye, FaEyeSlash } from 'react-icons/fa'
import { PasswordInput, PasswordStrengthMeter } from "../ui/password-input"

const OAUTH_PROVIDERS = {
  google: { label: 'Google', icon: FaGoogle },
  github: { label: 'GitHub', icon: FaGithub },
  oauth3: { label: 'OAuth 3', icon: FaPlug },
}

type OAuthProviderKey = keyof typeof OAUTH_PROVIDERS

const AuthenticationSettings = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showOAuthModal, setShowOAuthModal] = useState<OAuthProviderKey | null>(null)
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false })
  const [oauthForm, setOAuthForm] = useState({ clientId: '', clientSecret: '', redirectUri: '' })

  const handleOAuthOpen = (provider: OAuthProviderKey) => {
    setShowOAuthModal(provider)
    setOAuthForm({ clientId: '', clientSecret: '', redirectUri: '' })
  }

  const togglePassword = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <Box>
      {/* Password Auth */}
      <Flex align="center" mb={6} gap={4}>
        <Icon as={FaLock} color="gray.400" boxSize={5} />
        <Box flex="1">
          <Text color="gray.400" fontWeight="bold" fontSize="md" mb={0.5}>
            password authentication settings
          </Text>
          <Text color="gray.300" fontSize="sm">
            Change your password.
          </Text>
        </Box>
        <Button fontFamily="mono" fontSize="sm" px={6} onClick={() => setShowPasswordModal(true)}>
          change password
        </Button>
      </Flex>
      {/* Google Auth */}
      <Flex align="center" mb={6} gap={4}>
        <Icon as={FaGoogle} color="gray.400" boxSize={5} />
        <Box flex="1">
          <Text color="gray.400" fontWeight="bold" fontSize="md" mb={0.5}>
            google authentication settings
          </Text>
          <Text color="gray.300" fontSize="sm">
            Add or remove Google authentication.
          </Text>
        </Box>
        <Button fontFamily="mono" fontSize="sm" px={6} onClick={() => handleOAuthOpen('google')}>
          add google authentication
        </Button>
      </Flex>
      {/* GitHub Auth */}
      <Flex align="center" mb={6} gap={4}>
        <Icon as={FaGithub} color="gray.400" boxSize={5} />
        <Box flex="1">
          <Text color="gray.400" fontWeight="bold" fontSize="md" mb={0.5}>
            github authentication settings
          </Text>
          <Text color="gray.300" fontSize="sm">
            Add or remove GitHub authentication.
          </Text>
        </Box>
        <Button fontFamily="mono" fontSize="sm" px={6} onClick={() => handleOAuthOpen('github')}>
          add github authentication
        </Button>
      </Flex>
      {/* OAuth 3 Auth */}
      <Flex align="center" mb={6} gap={4}>
        <Icon as={FaPlug} color="gray.400" boxSize={5} />
        <Box flex="1">
          <Text color="gray.400" fontWeight="bold" fontSize="md" mb={0.5}>
            oauth 3 authentication settings
          </Text>
          <Text color="gray.300" fontSize="sm">
            Add or remove OAuth 3 authentication.
          </Text>
        </Box>
        <Button fontFamily="mono" fontSize="sm" px={6} onClick={() => handleOAuthOpen('oauth3')}>
          add oauth 3 authentication
        </Button>
      </Flex>
      {/* Revoke All Tokens */}
      <Flex align="center" mt={8} gap={4}>
        <Icon as={FaSignOutAlt} color="red.400" boxSize={5} />
        <Box flex="1">
          <Text color="red.400" fontWeight="bold" fontSize="md" mb={0.5}>
            revoke all tokens
          </Text>
          <Text color="gray.300" fontSize="sm">
            Revokes all tokens connected to your account. Do this if you think someone else has access to your account.<br />
            <Text as="span" color="red.400">This will log you out of all devices.</Text>
          </Text>
        </Box>
        <Button fontFamily="mono" fontSize="sm" px={6} colorScheme="red">
          revoke all tokens
        </Button>
      </Flex>
      {/* Password Auth Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800" color="gray.100">
          <ModalHeader>Change Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Current Password</FormLabel>
                <PasswordInput
                  value={passwordForm.current}
                  onChange={e => setPasswordForm(f => ({ ...f, current: e.target.value }))}
                  placeholder="Enter current password"
                />
              </FormControl>
              <FormControl>
                <FormLabel>New Password</FormLabel>
                <PasswordInput
                  value={passwordForm.new}
                  onChange={e => setPasswordForm(f => ({ ...f, new: e.target.value }))}
                  placeholder="Enter new password"
                />
                <PasswordStrengthMeter value={passwordForm.new} />
              </FormControl>
              <FormControl>
                <FormLabel>Confirm New Password</FormLabel>
                <PasswordInput
                  value={passwordForm.confirm}
                  onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
                  placeholder="Confirm new password"
                />
              </FormControl>
              <Button colorScheme="blue" fontFamily="mono" fontSize="md">
                Save
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      {/* OAuth Modal (shared for Google, GitHub, OAuth 3) */}
      <Modal isOpen={!!showOAuthModal} onClose={() => setShowOAuthModal(null)} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800" color="gray.100">
          <ModalHeader>
            Add {showOAuthModal ? OAUTH_PROVIDERS[showOAuthModal].label : ''} Authentication
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Client ID</FormLabel>
                <Input
                  placeholder="Enter client ID"
                  value={oauthForm.clientId}
                  onChange={e => setOAuthForm(f => ({ ...f, clientId: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Client Secret</FormLabel>
                <Input
                  placeholder="Enter client secret"
                  value={oauthForm.clientSecret}
                  onChange={e => setOAuthForm(f => ({ ...f, clientSecret: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Redirect URI</FormLabel>
                <Input
                  placeholder="Enter redirect URI"
                  value={oauthForm.redirectUri}
                  onChange={e => setOAuthForm(f => ({ ...f, redirectUri: e.target.value }))}
                />
              </FormControl>
              <Button colorScheme="blue" fontFamily="mono" fontSize="md">
                Save
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      {/* Sign Out Button */}
      <Flex justify="flex-end" mt={8}>
        <Button colorScheme="red" w="190px" onClick={() => {
          import('js-cookie').then(Cookies => {
            Cookies.default.remove('access_token');
            Cookies.default.remove('refresh_token');
            window.location.href = '/login';
          });
        }}>
          Sign Out
        </Button>
      </Flex>
    </Box>
  )
}

export default AuthenticationSettings; 