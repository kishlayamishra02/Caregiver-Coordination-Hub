import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

export default function Dashboard() {
  return (
    <>
      <Typography variant="h4" gutterBottom>Dashboard Overview</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2 }}>Medication Today</Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2 }}>Upcoming Visits</Paper>
        </Grid>
      </Grid>
    </>
  );
}