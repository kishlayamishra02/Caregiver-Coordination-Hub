import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Toolbar,
  Avatar,
  Typography,
  Box,
  styled,
  alpha
} from '@mui/material';
import {
  Dashboard,
  CalendarToday,
  Checklist,
  Note,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
  Settings,
  Person
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 240;

const items = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Calendar', icon: <CalendarToday />, path: '/calendar' },
  { text: 'Tasks', icon: <Checklist />, path: '/tasks' },
  { text: 'Notes', icon: <Note />, path: '/notes' },
  { text: 'Profile', icon: <Person />, path: '/profile' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    background: theme.palette.mode === 'dark'
      ? `linear-gradient(195deg, ${theme.palette.background.paper}, ${alpha(theme.palette.background.default, 0.95)})`
      : `linear-gradient(195deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#fff',
    borderRight: 'none',
    boxShadow: theme.shadows[10],
    overflowX: 'hidden',
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  letterSpacing: '1px',
  marginLeft: '8px',
  color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#fff',
}));

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  borderRadius: '12px',
  margin: theme.spacing(0.5, 1.5),
  padding: theme.spacing(1, 2),
  color: selected 
    ? theme.palette.primary.main 
    : theme.palette.mode === 'dark' 
      ? theme.palette.text.primary 
      : '#fff',
  backgroundColor: selected 
    ? theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.9)
      : '#fff'
    : 'transparent',
  '&:hover': {
    backgroundColor: selected 
      ? theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.paper, 0.9)
        : '#fff'
      : alpha(theme.palette.mode === 'dark' ? '#fff' : '#000', 0.1),
    transform: 'translateX(4px)',
  },
  transition: 'all 0.3s ease',
}));

export default function Sidebar({ open }) {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout(navigate);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <StyledDrawer variant="permanent" open>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Toolbar>
          <LogoContainer>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: theme.palette.mode === 'dark' ? theme.palette.primary.main : '#fff',
                color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
                boxShadow: theme.shadows[2],
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: theme.shadows[4],
                }
              }}
            >
              CH
            </Avatar>
            <LogoText variant="h6">Caregiver Hub</LogoText>
          </LogoContainer>
        </Toolbar>

        <Divider sx={{ 
          borderColor: alpha(theme.palette.mode === 'dark' ? '#fff' : '#000', 0.2), 
          my: 1,
          mx: 2
        }} />

        <List sx={{ flex: 1 }}>
          {items.map((item) => (
            <StyledListItem
              key={item.text}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path 
                  ? theme.palette.primary.main 
                  : theme.palette.mode === 'dark' 
                    ? theme.palette.text.primary 
                    : '#fff',
                minWidth: '40px'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: location.pathname === item.path ? 700 : 500,
                  }
                }}
              />
            </StyledListItem>
          ))}
        </List>

        <Box sx={{ p: 2 }}>
          <StyledListItem
            onClick={handleSignOut}
            sx={{
              color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#fff',
              backgroundColor: alpha(theme.palette.mode === 'dark' ? '#fff' : '#000', 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.mode === 'dark' ? '#fff' : '#000', 0.2),
                color: theme.palette.error.main,
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: 'inherit',
              minWidth: '40px' 
            }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Sign Out" />
          </StyledListItem>
        </Box>
      </Box>
    </StyledDrawer>
  );
}