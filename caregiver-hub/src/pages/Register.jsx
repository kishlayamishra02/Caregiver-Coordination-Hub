import React, { useState, useEffect, useRef } from 'react';
import { Circle } from '@mui/icons-material';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress, 
  Paper,
  Divider,
  IconButton,
  InputAdornment,
  Alert
} from '@mui/material';
import { 
  Link, 
  useNavigate,
  useLocation 
} from 'react-router-dom';
import { 
  Person, 
  Email, 
  Lock, 
  Visibility, 
  VisibilityOff,
  ArrowBack
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { styled } from '@mui/material/styles';

const AuthContainer = styled(Paper)(({ theme }) => ({
  maxWidth: 450,
  margin: 'auto',
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[6],
  background: theme.palette.background.paper,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  }
}));

const PasswordRequirement = styled(Typography)(({ valid, theme }) => ({
  fontSize: '0.75rem',
  color: valid ? theme.palette.success.main : theme.palette.text.secondary,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  '& svg': {
    fontSize: '0.9rem'
  }
}));

export default function Register() {
  const location = useLocation();
  const navigate = useNavigate();
  const { register } = useAuth();

  const prefillEmail = location?.state?.prefillEmail || '';
  const redirectMessage = location?.state?.redirectMessage || '';

  const [email, setEmail] = useState(prefillEmail);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const nameInputRef = useRef(null);

  useEffect(() => {
    // Auto-focus name field on mount
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
    // Auto-focus name field if redirected
    if (redirectMessage) {
      nameInputRef.current?.focus();
    }
  }, [redirectMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim() || !confirmPassword.trim() || !name.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(email, password, name, navigate); // ✅ plain string
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 10% 20%, rgba(236, 239, 249, 0.8) 0%, rgba(255, 255, 255, 1) 90%)', p: 2 }}>
      <AuthContainer>
        <IconButton 
          onClick={() => navigate(-1)} 
          sx={{ position: 'absolute', left: 16, top: 16 }}
        >
          <ArrowBack />
        </IconButton>

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary">
                Sign in
              </Typography>
            </Link>
          </Typography>
        </Box>

        {redirectMessage && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {redirectMessage}
          </Alert>
        )}

        {error && (
          <Typography 
            color="error.main" 
            variant="body2" 
            sx={{ 
              mb: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'error.lighter',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Circle fontSize="small" />
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Full Name"
            margin="normal"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Email Address"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            id="password"
            fullWidth
            label="Password"
            margin="normal"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? 'text' : 'password'}
            required
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={!!password && password.length < 6}
            helperText={!!password && password.length < 6 ? 'At least 6 characters' : ''}
          />

          <Box sx={{ mb: 2, pl: 1 }}>
            <PasswordRequirement valid={password.length >= 6}>
              {password.length >= 6 ? <Circle fontSize="small" /> : <Circle fontSize="small" />}
              At least 6 characters
            </PasswordRequirement>
          </Box>

          <TextField
            fullWidth
            label="Confirm Password"
            margin="normal"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type={showConfirmPassword ? 'text' : 'password'}
            required
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={!!confirmPassword && password !== confirmPassword}
            helperText={!!confirmPassword && password !== confirmPassword ? 'Passwords do not match' : ''}
          />

          <Button
            fullWidth
            size="large"
            variant="contained"
            sx={{ mt: 3, py: 1.5 }}
            type="submit"
            disabled={loading || !email.trim() || !password.trim() || !confirmPassword.trim() || !name.trim() || password !== confirmPassword}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Registering...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ display: 'inline' }}>
              Already have an account?{' '}
            </Typography>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                Sign in
              </Typography>
            </Link>
          </Box>
        </Box>
      </AuthContainer>
    </Box>
  );
}