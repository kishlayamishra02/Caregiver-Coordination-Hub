import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Tooltip,
  Badge,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  DarkMode,
  LightMode,
  Settings,
  Help,
  Logout,
  Person,
  Info,
  BugReport,
  Support,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useThemeContext } from '../contexts/ThemeContext';

export default function Header({ open, setOpen }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useThemeContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  // Profile page route
  const handleProfile = () => {
    handleClose();
    navigate('/dashboard/profile');
  };

  // Settings page route
  const handleSettings = () => {
    handleClose();
    navigate('/dashboard/settings');
  };

  // Help dialog
  const handleHelp = () => {
    handleClose();
    setHelpDialogOpen(true);
  };

  const handleHelpClose = () => {
    setHelpDialogOpen(false);
  };

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Create a compound index for userId and createdAt
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', user?.uid),
          orderBy('createdAt', 'desc'),
          limit(10) // Limit the number of notifications fetched
        );
        const querySnapshot = await getDocs(q);
        const notifications = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        setNotifications(notifications);
        setUnreadCount(notifications.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: open ? 'width 0.3s ease-in-out' : 'width 0.3s ease-in-out',
        width: open ? `calc(100% - ${220}px)` : '100%',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setOpen(!open)}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                  color: 'white',
                }}
              >
                CH
              </Avatar>
              Caregiver Hub
            </Box>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Notifications">
            <IconButton color="inherit" size="large">
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Theme">
            <IconButton 
              color="inherit" 
              size="large"
              onClick={handleThemeToggle}
            >
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Help">
            <IconButton 
              color="inherit" 
              size="large"
              onClick={handleHelp}
            >
              <Help />
            </IconButton>
          </Tooltip>

          <Box>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar
                alt={user?.email || 'Profile'}
                src={user?.photoURL}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              sx={{
                '& .MuiMenuItem-root': {
                  minWidth: 160,
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                  },
                },
              }}
            >
              <MenuItem onClick={handleProfile}>
                <Person sx={{ mr: 1 }} />
                <Typography textAlign="center">Profile</Typography>
              </MenuItem>
              <MenuItem onClick={handleSettings}>
                <Settings sx={{ mr: 1 }} />
                <Typography textAlign="center">Settings</Typography>
              </MenuItem>
              <MenuItem onClick={handleHelp}>
                <Help sx={{ mr: 1 }} />
                <Typography textAlign="center">Help</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
      <Dialog
        open={helpDialogOpen}
        onClose={handleHelpClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Need Help?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Getting Started
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Caregiver Hub is your one-stop platform for managing caregiving tasks, scheduling, and communication.
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Features
              </Typography>
              <ul>
                <li>Task Management</li>
                <li>Calendar Scheduling</li>
                <li>Family Notes</li>
                <li>Real-time Notifications</li>
              </ul>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Support
              </Typography>
              <Typography variant="body2" color="text.secondary">
                For technical issues or feedback, please contact our support team.
              </Typography>
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleHelpClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};
