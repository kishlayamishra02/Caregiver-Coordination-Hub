import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <Box maxWidth={360} mx="auto" mt={8}>
      <Typography variant="h5" gutterBottom>Login</Typography>
      <TextField fullWidth label="Email" margin="normal" />
      <TextField fullWidth label="Password" type="password" margin="normal" />
      <Button fullWidth variant="contained" sx={{ mt: 2 }}>Sign In</Button>
      <Box mt={1}>
        <Link to="/register">Don't have an account? Register</Link>
      </Box>
    </Box>
  );
}