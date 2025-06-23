// 📁 src/pages/NotFound.jsx
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function NotFound() {
  return (
    <Box mt={10} textAlign="center">
      <Typography variant="h2" color="error">404</Typography>
      <Typography variant="h5">Page not found, buddy!</Typography>
    </Box>
  );
}
