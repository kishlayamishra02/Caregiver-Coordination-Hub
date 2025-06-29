import { useAuth } from '../contexts/AuthContext';
import CalendarView from '../components/CalendarView';
import { Box, Typography, useTheme } from '@mui/material';

export default function Calendar() {
  const { user } = useAuth();
  const theme = useTheme();

  if (!user) {
    return <div>Loading user...</div>;
  }

  return (
    <>
      <Box sx={{ 
        mb: 4,
        '& h2': {
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800,
          fontSize: '2.4rem',
          lineHeight: 1.2,
          marginBottom: theme.spacing(1),
          fontFamily: '"Times New Roman", Times, serif',
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
        },
        '& p': {
          fontSize: '1.1rem',
          color: theme.palette.text.secondary,
          fontWeight: 500,
          marginBottom: theme.spacing(2),
          fontFamily: '"Times New Roman", Times, serif',
          lineHeight: 1.6,
        }
      }}>
        <Typography variant="h2">Calendar</Typography>
        <Typography variant="subtitle1">View and manage your caregiver schedule</Typography>
      </Box>
      <CalendarView />
    </>
  );
}
