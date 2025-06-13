import { useState, useEffect } from 'react'
import {
  Box, Flex, Text, Input, Button, Table, Thead, Tbody, Tr, Th, Td, IconButton, Tag, Switch, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Select, VStack, Divider, FormLabel, Spinner, useToast
} from '@chakra-ui/react'
import { FaUserEdit, FaBan, FaTrash, FaEye, FaUserShield, FaCheck, FaTimes } from 'react-icons/fa'
import {
  listUsers, getUserById, updateUser, deleteUser, banUser, unbanUser, assignUserRole, removeUserRole, getAuditLogs, getSiteSettings, updateSiteSettings
} from '../../utils/api'

const AdminSettings = () => {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [siteSettings, setSiteSettings] = useState({ maintenance_mode: false, registration_open: true })
  const [logs, setLogs] = useState<any[]>([])
  const [roles, setRoles] = useState<string[]>(['admin', 'user', 'moderator'])
  const toast = useToast()

  // Fetch users
  useEffect(() => {
    setLoading(true)
    listUsers()
      .then(res => setUsers(res.data))
      .catch(err => setError('Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  // Fetch site settings
  useEffect(() => {
    getSiteSettings()
      .then(res => setSiteSettings(res.data))
      .catch(() => {})
  }, [])

  // Fetch audit logs
  useEffect(() => {
    getAuditLogs()
      .then(res => setLogs(res.data))
      .catch(() => {})
  }, [])

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  // User actions
  const handleBanUnban = async (user: any) => {
    try {
      if (user.is_active) {
        await banUser(user.id)
        toast({ title: 'User banned', status: 'success' })
      } else {
        await unbanUser(user.id)
        toast({ title: 'User unbanned', status: 'success' })
      }
      // Refresh users
      const res = await listUsers()
      setUsers(res.data)
    } catch {
      toast({ title: 'Failed to update user status', status: 'error' })
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    try {
      await deleteUser(selectedUser.id)
      toast({ title: 'User deleted', status: 'success' })
      setDeleteModalOpen(false)
      setSelectedUser(null)
      // Refresh users
      const res = await listUsers()
      setUsers(res.data)
    } catch {
      toast({ title: 'Failed to delete user', status: 'error' })
    }
  }

  const handleRoleChange = async (user: any, newRole: string) => {
    try {
      await assignUserRole(user.id, newRole)
      toast({ title: `Role updated to ${newRole}`, status: 'success' })
      // Refresh users
      const res = await listUsers()
      setUsers(res.data)
    } catch {
      toast({ title: 'Failed to update role', status: 'error' })
    }
  }

  const handleSiteSettingChange = async (key: string, value: boolean) => {
    try {
      const newSettings = { ...siteSettings, [key]: value }
      await updateSiteSettings(newSettings)
      setSiteSettings(newSettings)
      toast({ title: 'Site settings updated', status: 'success' })
    } catch {
      toast({ title: 'Failed to update site settings', status: 'error' })
    }
  }

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
        {loading ? (
          <Flex justify="center" align="center" h="100px"><Spinner /></Flex>
        ) : error ? (
          <Text color="red.400">{error}</Text>
        ) : (
          <Table variant="simple" size="md" bg="gray.800" borderRadius="lg">
            <Thead>
              <Tr>
                <Th>Username</Th>
                <Th>Email</Th>
                <Th>Role(s)</Th>
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
                  <Td>
                    {user.roles && user.roles.length > 0 ? user.roles.map((role: any) => (
                      <Tag key={role.id || role.name} colorScheme={role.name === 'admin' ? 'purple' : role.name === 'moderator' ? 'blue' : 'gray'} mr={1}>{role.name}</Tag>
                    )) : <Tag colorScheme="gray">user</Tag>}
                  </Td>
                  <Td><Tag colorScheme={user.is_active ? 'green' : 'red'}>{user.is_active ? 'active' : 'banned'}</Tag></Td>
                  <Td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</Td>
                  <Td>
                    <IconButton aria-label="View" icon={<FaEye />} size="sm" mr={1} onClick={async () => {
                      const res = await getUserById(user.id); setSelectedUser(res.data); setEditModalOpen(true);
                    }} />
                    <IconButton aria-label="Edit" icon={<FaUserEdit />} size="sm" mr={1} onClick={async () => {
                      const res = await getUserById(user.id); setSelectedUser(res.data); setEditModalOpen(true);
                    }} />
                    <IconButton aria-label={user.is_active ? 'Ban' : 'Unban'} icon={<FaBan />} size="sm" colorScheme={user.is_active ? 'red' : 'green'} mr={1} onClick={() => handleBanUnban(user)} />
                    <IconButton aria-label="Delete" icon={<FaTrash />} size="sm" colorScheme="red" onClick={() => { setSelectedUser(user); setDeleteModalOpen(true); }} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
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
                <Select value={selectedUser.roles?.[0]?.name || 'user'} onChange={e => handleRoleChange(selectedUser, e.target.value)}>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </Select>
                {/* Add more editable fields as needed */}
                {/* <Button leftIcon={<FaUserShield />} colorScheme="blue">Update Role</Button> */}
                {/* <Button leftIcon={<FaCheck />} colorScheme="green">Reset Password</Button> */}
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
            <Button colorScheme="red" onClick={handleDelete}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Site Settings */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>Site Settings</Text>
        <Flex gap={8} align="center">
          <Flex align="center" gap={2}>
            <Text>Maintenance Mode</Text>
            <Switch isChecked={siteSettings.maintenance_mode} onChange={e => handleSiteSettingChange('maintenance_mode', e.target.checked)} />
          </Flex>
          <Flex align="center" gap={2}>
            <Text>Registration Open</Text>
            <Switch isChecked={siteSettings.registration_open} onChange={e => handleSiteSettingChange('registration_open', e.target.checked)} />
          </Flex>
        </Flex>
      </Box>
      <Divider />
      {/* Audit Log */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>Audit Log</Text>
        <VStack align="stretch" spacing={2}>
          {logs.map(log => (
            <Text key={log.id || log.date} color="gray.400">{log.date || log.timestamp}: {log.action}</Text>
          ))}
        </VStack>
      </Box>
    </VStack>
  )
}

export default AdminSettings; 