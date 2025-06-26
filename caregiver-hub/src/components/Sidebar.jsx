import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Toolbar,
  Typography,
  Tooltip,
  Box,
} from '@mui/material';
import {
  Dashboard,
  CalendarToday,
  Checklist,
  Note,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 220;

const items = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Calendar', icon: <CalendarToday />, path: 'calendar' },
  { text: 'Tasks', icon: <Checklist />, path: 'tasks' },
  { text: 'Notes', icon: <Note />, path: 'notes' },
];

export default function Sidebar({ open, setOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: '#fff',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
          borderRight: 'none',
        },
      }}
    >
      <Box sx={{ width: drawerWidth }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: 2, bgcolor: 'rgba(25, 118, 210, 0.95)' }}>
          <Typography variant="h6" noWrap>
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 24, height: 24, bgcolor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Dashboard sx={{ fontSize: 16, color: '#1976d2' }} />
              </Box>
              Caregiver Hub
            </Box>
          </Typography>
          <IconButton onClick={() => setOpen(false)} sx={{ color: '#fff' }}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

        <List sx={{ p: 1 }}>
          {items.map((item) => (
            <Tooltip title={item.text} placement="right" key={item.text}>
              <ListItem
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  color: '#fff',
                  background:
                    location.pathname === item.path
                      ? 'rgba(255,255,255,0.15)'
                      : 'transparent',
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                  },
                  transition: 'background-color 0.2s ease-in-out',
                }}
              >
                <ListItemIcon sx={{ color: '#fff', minWidth: 32 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{
                    color: '#fff',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  }}
                />
              </ListItem>
            </Tooltip>
          ))}
        </List>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mt: 2 }} />

        <Box sx={{ p: 1 }}>
          <Tooltip title="Sign Out" placement="right">
            <ListItem
              onClick={handleSignOut}
              sx={{
                color: '#fff',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                },
                transition: 'background-color 0.2s ease-in-out',
              }}
            >
              <ListItemIcon sx={{ color: '#fff', minWidth: 32 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Sign Out" 
                sx={{
                  color: '#fff',
                  fontWeight: 400,
                }}
              />
            </ListItem>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
}
