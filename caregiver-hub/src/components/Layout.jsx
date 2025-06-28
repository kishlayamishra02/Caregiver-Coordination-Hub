import Box from '@mui/material/Box';
import Header from './Header';
import Sidebar from './Sidebar';
import Toolbar from '@mui/material/Toolbar';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 240;

const MainContent = styled(Box)(({ theme, open }) => ({
  flexGrow: 1,
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard,
  }),
  marginLeft: open ? `${drawerWidth}px` : 0,
  width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
  position: 'relative',
  minHeight: '100vh',
  background: theme.palette.background.default,
}));

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  width: '100vw',
  overflow: 'hidden',
  background: theme.palette.background.default,
}));

export default function Layout() {
  const theme = useTheme();
  const [open, setOpen] = useState(true);

  return (
    <StyledBox>
      <Sidebar open={open} onClose={() => setOpen(!open)} />
      <MainContent open={open}>
        <Header onToggleSidebar={() => setOpen(!open)} open={open} />
        <Toolbar /> {/* This creates space below the app bar */}
        <Box sx={{ 
          p: 3,
          height: 'calc(100vh - 64px)',
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '0.4em'
          },
          '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.1)',
            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.1)'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,.1)' 
              : 'rgba(0,0,0,.1)',
            borderRadius: '20px'
          }
        }}>
          <Outlet />
        </Box>
      </MainContent>
    </StyledBox>
  );
}