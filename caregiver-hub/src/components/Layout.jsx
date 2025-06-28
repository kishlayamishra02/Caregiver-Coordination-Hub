import Box from '@mui/material/Box';
import Header from './Header';
import Sidebar from './Sidebar';
import Toolbar from '@mui/material/Toolbar';
import { Outlet } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 240;

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  width: '100vw',
  overflow: 'hidden',
  background: theme.palette.background.default,
}));

const MainContent = styled(Box)(({ theme }) => ({
  component: 'main',
  flexGrow: 1,
  padding: theme.spacing(3),
  marginLeft: 0,
  minHeight: '100vh',
  background: theme.palette.background.default,
}));

export default function Layout() {
  const theme = useTheme();

  return (
    <StyledBox>
      <Sidebar open />
      <MainContent>
        <Header />
        <Toolbar />
        <Outlet />
      </MainContent>
    </StyledBox>
  );
}