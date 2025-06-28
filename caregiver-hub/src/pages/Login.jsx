import React, { useState, useEffect, useRef } from 'react';
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
  Link
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  ArrowBack,
  Google
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

const AuthHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  '& h4': {
    fontWeight: 700,
    marginBottom: theme.spacing(1),
    color: theme.palette.text.primary
  },
  '& p': {
    color: theme.palette.text.secondary
  }
}));

const GoogleButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #4285F4 0%, #4285F4 50%, #34A853 50%, #34A853 75%, #FBBC05 75%, #FBBC05 85%, #EA4335 85%, #EA4335 100%)',
  color: 'white',
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: 8,
  transition: 'all 0.3s ease',
  '&:hover': {
    opacity: 0.9,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
  '&:disabled': {
    opacity: 0.7,
    transform: 'none',
  },
}));

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const prefillEmail = location?.state?.prefillEmail || '';
  const successMessage = location.state?.successMessage;

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef();

  useEffect(() => {
    if (prefillEmail && passwordRef.current) {
      passwordRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password, navigate);
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, rgba(236, 239, 249, 0.8) 0%, rgba(255, 255, 255, 1) 90%)',
      p: 2
    }}>
      <AuthContainer>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ position: 'absolute', left: 16, top: 16 }}
        >
          <ArrowBack />
        </IconButton>

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to continue to Caregiver Hub
          </Typography>
        </Box>

        {successMessage && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon fontSize="small" color="success" />
            <Typography variant="body2" color="success.main">
              {successMessage}
            </Typography>
          </Box>
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
            <Error fontSize="small" />
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Email Address"
            margin="normal"
            name="email"
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
            fullWidth
            label="Password"
            margin="normal"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? 'text' : 'password'}
            required
            disabled={loading}
            inputRef={passwordRef}
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
          />

          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary">
                Forgot password?
              </Typography>
            </Link>
          </Box>

          <Button
            fullWidth
            size="large"
            variant="contained"
            sx={{ mt: 3, py: 1.5 }}
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <GoogleButton
            fullWidth
            size="large"
            sx={{
              mt: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              '& .MuiButton-startIcon': {
                color: 'white',
              }
            }}
            startIcon={<Google sx={{ fontSize: 24 }} />}
            onClick={() => loginWithGoogle(navigate)}
            disabled={loading}
          >
            Continue with Google
          </GoogleButton>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ display: 'inline' }}>
              Don't have an account?{' '}
            </Typography>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                Register now
              </Typography>
            </Link>
          </Box>
        </Box>
      </AuthContainer>
    </Box>
  );
}