import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
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
    try {
      setLoading(true);
      setError('');
      await register(formData.email, formData.password, formData.name);
      navigate('/dashboard'); // Redirect to dashboard after successful registration
    } catch (err) {
      setError(err.message);
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
      <Typography variant="h5" gutterBottom>Register</Typography>
      {error && <Typography color="error" gutterBottom>{error}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField 
          fullWidth 
          label="Name" 
          margin="normal" 
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
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
        />
        <Button 
          fullWidth 
          variant="contained" 
          sx={{ mt: 2 }}
          type="submit"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>
      <Box mt={2}>
        <Link to="/login">Already have an account? Login</Link>
      </Box>
    </Box>
  );
}

