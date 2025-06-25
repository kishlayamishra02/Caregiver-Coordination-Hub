import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Attempting registration with:', formData.email);
      await register(formData.email, formData.password, formData.name);
      console.log('Registration successful, redirecting to dashboard');
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Box maxWidth={360} mx="auto" mt={8}>
      <Typography variant="h5" gutterBottom>
        Register
      </Typography>
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <form onSubmit={handleSubmit}>
        <TextField 
          fullWidth 
          label="Full Name" 
          margin="normal" 
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <TextField 
          fullWidth 
          label="Email" 
          margin="normal" 
          name="email"
          value={formData.email}
          onChange={handleChange}
          type="email"
          required
          disabled={loading}
        />
        <TextField 
          fullWidth 
          label="Password" 
          margin="normal" 
          name="password"
          value={formData.password}
          onChange={handleChange}
          type="password"
          required
          disabled={loading}
        />
        <Button 
          fullWidth 
          variant="contained" 
          sx={{ mt: 2 }}
          type="submit"
          disabled={loading || !formData.name.trim() || !formData.email.trim() || !formData.password.trim()}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Creating Account...
            </>
          ) : (
            'Sign Up'
          )}
        </Button>
      </form>
      <Box mt={2} textAlign="center">
        <Link to="/login" style={{ textDecoration: 'none' }}>
          Already have an account? Login
        </Link>
      </Box>
    </Box>
  );
}
