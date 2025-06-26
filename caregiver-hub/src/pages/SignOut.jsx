import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const StyledBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: '2rem',
});

export default function SignOut() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <StyledBox>
      <Typography variant="h5" gutterBottom>
        Sign Out
      </Typography>
      <Typography variant="body1" gutterBottom>
        Are you sure you want to sign out?
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleSignOut}
        sx={{ mt: 2 }}
      >
        Sign Out
      </Button>
    </StyledBox>
  );
}
