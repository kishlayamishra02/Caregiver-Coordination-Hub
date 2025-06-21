import Box from '@mui/material/Box';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <Box display="flex">
      <Sidebar />
      <Box flexGrow={1}>
        <Header />
        <Box p={2}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}