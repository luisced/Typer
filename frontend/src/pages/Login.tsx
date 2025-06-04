import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Heading,
  VStack,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
  Text,
  Link,
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const Login: React.FC = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username) {
      setErrors((prev) => ({ ...prev, username: 'Username or email is required' }));
      return;
    }
    if (!form.password) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('username', form.username);
      params.append('password', form.password);
      const res = await axios.post(`${API_URL}/users/login`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const { access_token, refresh_token } = res.data;
      Cookies.set('access_token', access_token, { expires: 7 });
      Cookies.set('refresh_token', refresh_token, { expires: 7 });
      toast({ title: 'Login successful!', status: 'success', duration: 2000, isClosable: true });
      navigate('/');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Login failed';
      toast({ title: 'Error', description: msg, status: 'error', duration: 4000, isClosable: true });
      setErrors((prev) => ({ ...prev, password: msg }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={12} p={8} bg="gray.800" rounded="xl" boxShadow="xl">
      <Heading mb={6} textAlign="center" color="white">Sign In</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={!!errors.username}>
            <FormLabel color="gray.200">Username or Email</FormLabel>
            <Input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username or email"
              bg="gray.700"
              color="white"
              _placeholder={{ color: 'gray.400' }}
            />
            <FormErrorMessage>{errors.username}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.password}>
            <FormLabel color="gray.200">Password</FormLabel>
            <InputGroup>
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                bg="gray.700"
                color="white"
                _placeholder={{ color: 'gray.400' }}
              />
              <InputRightElement>
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowPassword((v) => !v)}
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>
          <Button type="submit" colorScheme="blue" size="lg" w="full" mt={2} isLoading={loading}>
            Sign In
          </Button>
        </VStack>
      </form>
      <Text color="gray.300" mt={4} textAlign="center">
        Don't have an account?{' '}
        <Link as={RouterLink} to="/register" color="blue.400" fontWeight="bold">
          Register
        </Link>
      </Text>
    </Box>
  );
};

export default Login;
