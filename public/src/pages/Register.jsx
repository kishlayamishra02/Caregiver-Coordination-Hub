import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <Box maxWidth={360} mx="auto" mt={8}>
      <Typography variant="h5" gutterBottom>Register</Typography>
      <TextField fullWidth label="Name" margin="normal" />
      <TextField fullWidth label="Email" margin="normal" />
      <TextField fullWidth label="Password" type="password" margin="normal" />
      <Button fullWidth variant="contained" sx={{ mt: 2 }}>Sign Up</Button>
      <Box mt={1}>
        <Link to="/login">Already have an account? Login</Link>
      </Box>
    </Box>
  );
}