import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.successMessage;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with email:', email);
      await login(email, password);
      console.log('Login successful, redirecting to dashboard');
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={360} mx="auto" mt={8} component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" gutterBottom>
        Login
      </Typography>
      {successMessage && (
        <Typography color="success" variant="body2" sx={{ mb: 2 }}>
          {successMessage}
        </Typography>
      )}
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <TextField 
        fullWidth 
        label="Email" 
        margin="normal" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        type="email"
        disabled={loading}
      />
      <TextField 
        fullWidth 
        label="Password" 
        type="password" 
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={loading}
      />
      <Button 
        fullWidth 
        variant="contained" 
        sx={{ mt: 2 }} 
        type="submit"
        disabled={loading || !email.trim() || !password.trim()}
      >
        {loading ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>
      <Box mt={2} textAlign="center">
        <Link to="/register" style={{ textDecoration: 'none' }}>
          Don't have an account? Register
        </Link>
      </Box>
    </Box>
  );
}