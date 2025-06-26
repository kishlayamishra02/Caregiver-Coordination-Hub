import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Box, Button, Typography } from '@mui/material';

export default function TestAuth() {
  const { user, login, register, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login('test@example.com', 'password123');
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message);
    }
  };

  const handleRegister = async () => {
    try {
      await register('test@example.com', 'password123');
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      alert(error.message);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Firebase Authentication Test
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        Current User: {user ? user.email : 'Not logged in'}
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Button variant="contained" onClick={handleLogin} sx={{ mr: 2 }}>
          Login
        </Button>
        <Button variant="contained" onClick={handleRegister} sx={{ mr: 2 }}>
          Register
        </Button>
        <Button variant="contained" onClick={handleLogout} color="error">
          Logout
        </Button>
      </Box>
    </Box>
  );
}
