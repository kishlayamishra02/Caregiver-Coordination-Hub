import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Box,
  Tooltip,
  Badge,
  useTheme,
  useMediaQuery,
  Stack,
  alpha,
  styled
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  DarkMode,
  LightMode,
  Help,
  Person,
} from '@mui/icons-material';
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../contexts/ThemeContext';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(12px)',
  boxShadow: 'none',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  color: theme.palette.text.primary,
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard,
  }),
  zIndex: theme.zIndex.drawer + 1,
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  letterSpacing: '1px',
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`
    : `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent',
}));

export default function Header({ onToggleSidebar, open }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useThemeContext();
  const [notifications] = useState([]);

  return (
    <StyledAppBar position="fixed">
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        px: 3,
      }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                color: 'white',
                mr: 1.5
              }}
            >
              CH
            </Avatar>
            <LogoText variant="h6">
              Caregiver Hub
            </LogoText>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit" 
              size="large"
              sx={{
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              <Badge badgeContent={notifications.length} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title={darkMode ? 'Light mode' : 'Dark mode'}>
            <IconButton 
              color="inherit" 
              size="large"
              onClick={toggleTheme}
              sx={{
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Help">
            <IconButton 
              color="inherit" 
              size="large"
              sx={{
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              <Help />
            </IconButton>
          </Tooltip>

          <Tooltip title="Profile">
            <IconButton
              size="large"
              onClick={() => navigate('/profile')}
              sx={{
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              <Avatar
                alt={user?.email || 'Profile'}
                src={user?.photoURL}
                sx={{ 
                  width: 32, 
                  height: 32,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    borderColor: theme.palette.primary.main,
                  }
                }}
              />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </StyledAppBar>
  );
}