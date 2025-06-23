import Box from '@mui/material/Box';
import Header from './Header';
import Sidebar from './Sidebar';
import Toolbar from '@mui/material/Toolbar';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';

const drawerWidth = 220;

export default function Layout() {
  const [open, setOpen] = useState(true);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <Header open={open} setOpen={setOpen} />
      <Sidebar open={open} setOpen={setOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: open ? `${drawerWidth}px` : 0,
          transition: 'margin-left 0.3s ease-in-out',
          width: `calc(100% - ${drawerWidth}px)`,
          bgcolor: '#ffffff',
          boxShadow: open ? '0 0 10px rgba(0,0,0,0.1)' : 'none',
          borderRadius: open ? '0 24px 24px 0' : '0 0 0 0',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Toolbar />
        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            height: 'calc(100vh - 64px)',
            overflow: 'auto',
            bgcolor: 'transparent',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
