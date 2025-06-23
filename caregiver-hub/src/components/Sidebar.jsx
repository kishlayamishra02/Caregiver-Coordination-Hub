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
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 220;

const items = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Calendar', icon: <CalendarToday />, path: '/dashboard/calendar' },
  { text: 'Tasks', icon: <Checklist />, path: '/dashboard/tasks' },
  { text: 'Notes', icon: <Note />, path: '/dashboard/notes' },
];

export default function Sidebar({ open, setOpen }) {
  const location = useLocation();

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
                    color: 'inherit',
                    opacity: location.pathname === item.path ? 1 : 0.9,
                  }}
                />
              </ListItem>
            </Tooltip>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
