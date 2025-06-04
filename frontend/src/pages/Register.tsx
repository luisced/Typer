import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Heading,
  VStack,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { PasswordInput, PasswordStrengthMeter } from '../components/ui/password-input';
import { registerUser, getSiteSettings } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Register: React.FC = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setSettingsLoading(true);
    getSiteSettings()
      .then(res => setSiteSettings(res.data))
      .catch(() => setSiteSettings({ registration_open: true }))
      .finally(() => setSettingsLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.username) newErrors.username = 'Username is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser({
        email: form.email,
        username: form.username,
        password: form.password,
        full_name: form.full_name || form.username,
      });
      const { access_token, refresh_token } = res.data;
      Cookies.set('access_token', access_token, { 
        expires: 7,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      Cookies.set('refresh_token', refresh_token, { 
        expires: 7,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      toast({ 
        title: 'Registration successful!', 
        status: 'success', 
        duration: 2000, 
        isClosable: true,
        onCloseComplete: () => {
          navigate('/', { replace: true });
        }
      });
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Registration failed';
      toast({ title: 'Error', description: msg, status: 'error', duration: 4000, isClosable: true });
      if (typeof msg === 'string' && msg.toLowerCase().includes('email')) {
        setErrors((prev) => ({ ...prev, email: msg }));
      } else if (typeof msg === 'string' && msg.toLowerCase().includes('username')) {
        setErrors((prev) => ({ ...prev, username: msg }));
      }
    } finally {
      setLoading(false);
    }
  };

  const registrationClosed = !settingsLoading && siteSettings && siteSettings.registration_open === false;

  return (
    <Box maxW="md" mx="auto" mt={12} p={8} bg="gray.800" rounded="xl" boxShadow="xl">
      <Heading mb={6} textAlign="center" color="white">Create Account</Heading>
      {registrationClosed && (
        <Alert status="warning" mb={6} rounded="md">
          <AlertIcon />
          Registrations are currently closed. Please check back later.
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={!!errors.username} isDisabled={registrationClosed}>
            <FormLabel color="gray.200">Username</FormLabel>
            <Input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              bg="gray.700"
              color="white"
              _placeholder={{ color: 'gray.400' }}
            />
            <FormErrorMessage>{errors.username}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.email} isDisabled={registrationClosed}>
            <FormLabel color="gray.200">Email</FormLabel>
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              bg="gray.700"
              color="white"
              _placeholder={{ color: 'gray.400' }}
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>
          <FormControl isDisabled={registrationClosed}>
            <FormLabel color="gray.200">Full Name (optional)</FormLabel>
            <Input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              bg="gray.700"
              color="white"
              _placeholder={{ color: 'gray.400' }}
            />
          </FormControl>
          <FormControl isInvalid={!!errors.password} isDisabled={registrationClosed}>
            <FormLabel color="gray.200">Password</FormLabel>
            <PasswordInput
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              bg="gray.700"
              color="white"
              _placeholder={{ color: 'gray.400' }}
            />
            <PasswordStrengthMeter value={form.password} />
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.confirmPassword} isDisabled={registrationClosed}>
            <FormLabel color="gray.200">Confirm Password</FormLabel>
            <PasswordInput
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              bg="gray.700"
              color="white"
              _placeholder={{ color: 'gray.400' }}
            />
            <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
          </FormControl>
          <Button type="submit" colorScheme="blue" size="lg" w="full" mt={2} isLoading={loading} isDisabled={registrationClosed}>
            Register
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default Register; 