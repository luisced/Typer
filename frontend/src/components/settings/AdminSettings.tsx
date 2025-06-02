import { useState } from 'react'
import {
  Box, Flex, Text, Input, Button, Table, Thead, Tbody, Tr, Th, Td, IconButton, Tag, Switch, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Select, VStack, Divider, FormLabel
} from '@chakra-ui/react'
import { FaUserEdit, FaBan, FaTrash, FaEye, FaUserShield, FaCheck, FaTimes } from 'react-icons/fa'

const mockUsers = [
  { id: 1, username: 'admin', email: 'admin@email.com', role: 'admin', status: 'active', created: '2024-06-01' },
  { id: 2, username: 'johndoe', email: 'john@email.com', role: 'user', status: 'active', created: '2024-06-02' },
  { id: 3, username: 'banneduser', email: 'banned@email.com', role: 'user', status: 'banned', created: '2024-06-03' },
]

const mockRoles = ['admin', 'user', 'moderator']
const mockLogs = [
  { id: 1, action: 'Banned user johndoe', date: '2024-06-10' },
  { id: 2, action: 'Deleted user banneduser', date: '2024-06-09' },
  { id: 3, action: 'Changed role for johndoe to moderator', date: '2024-06-08' },
]

const AdminSettings = () => {
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [siteSettings, setSiteSettings] = useState({ maintenance: false, registration: true })

  const filteredUsers = mockUsers.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <VStack align="stretch" spacing={10}>
      {/* User Management */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>User Management</Text>
        <Flex mb={4} gap={4}>
          <Input
            placeholder="Search by username or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
            maxW="300px"
          />
        </Flex>
        <Table variant="simple" size="md" bg="gray.800" borderRadius="lg">
          <Thead>
            <Tr>
              <Th>Username</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Created At</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredUsers.map(user => (
              <Tr key={user.id}>
                <Td>{user.username}</Td>
                <Td>{user.email}</Td>
                <Td><Tag colorScheme={user.role === 'admin' ? 'purple' : user.role === 'moderator' ? 'blue' : 'gray'}>{user.role}</Tag></Td>
                <Td><Tag colorScheme={user.status === 'banned' ? 'red' : 'green'}>{user.status}</Tag></Td>
                <Td>{user.created}</Td>
                <Td>
                  <IconButton aria-label="View" icon={<FaEye />} size="sm" mr={1} />
                  <IconButton aria-label="Edit" icon={<FaUserEdit />} size="sm" mr={1} onClick={() => { setSelectedUser(user); setEditModalOpen(true); }} />
                  <IconButton aria-label={user.status === 'banned' ? 'Unban' : 'Ban'} icon={<FaBan />} size="sm" colorScheme={user.status === 'banned' ? 'green' : 'red'} mr={1} />
                  <IconButton aria-label="Delete" icon={<FaTrash />} size="sm" colorScheme="red" onClick={() => { setSelectedUser(user); setDeleteModalOpen(true); }} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      {/* Edit User Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800" color="gray.100">
          <ModalHeader>Edit User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <VStack spacing={4} align="stretch">
                <Text>Username: {selectedUser.username}</Text>
                <Text>Email: {selectedUser.email}</Text>
                <FormLabel>Role</FormLabel>
                <Select value={selectedUser.role}>
                  {mockRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </Select>
                <Button leftIcon={<FaUserShield />} colorScheme="blue">Update Role</Button>
                <Button leftIcon={<FaCheck />} colorScheme="green">Reset Password</Button>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      {/* Delete User Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.800" color="gray.100">
          <ModalHeader>Delete User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <Text>Are you sure you want to delete <b>{selectedUser.username}</b>? This action cannot be undone.</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setDeleteModalOpen(false)} mr={3}>Cancel</Button>
            <Button colorScheme="red">Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Divider />
      {/* Role Management */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>Role Management</Text>
        <Flex gap={4} align="center">
          {mockRoles.map(role => (
            <Tag key={role} colorScheme={role === 'admin' ? 'purple' : role === 'moderator' ? 'blue' : 'gray'} fontSize="lg">{role}</Tag>
          ))}
          <Button size="sm" colorScheme="blue" ml={4}>Add Role</Button>
        </Flex>
      </Box>
      <Divider />
      {/* Site Settings */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>Site Settings</Text>
        <Flex gap={8} align="center">
          <Flex align="center" gap={2}>
            <Text>Maintenance Mode</Text>
            <Switch isChecked={siteSettings.maintenance} onChange={e => setSiteSettings(s => ({ ...s, maintenance: e.target.checked }))} />
          </Flex>
          <Flex align="center" gap={2}>
            <Text>Registration Open</Text>
            <Switch isChecked={siteSettings.registration} onChange={e => setSiteSettings(s => ({ ...s, registration: e.target.checked }))} />
          </Flex>
        </Flex>
      </Box>
      <Divider />
      {/* Audit Log */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>Audit Log</Text>
        <VStack align="stretch" spacing={2}>
          {mockLogs.map(log => (
            <Text key={log.id} color="gray.400">{log.date}: {log.action}</Text>
          ))}
        </VStack>
      </Box>
    </VStack>
  )
}

export default AdminSettings; 