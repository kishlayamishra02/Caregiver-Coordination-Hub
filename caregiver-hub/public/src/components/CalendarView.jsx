import { Paper, Typography, Grid } from '@mui/material';
import { format, startOfMonth, addDays, getDay } from 'date-fns';

export default function CalendarView({ tasks = [] }) {
  const start = startOfMonth(new Date());
  const days = [...Array(30).keys()].map(i => addDays(start, i));

  return (
    <>
      <Typography variant="h5" gutterBottom>Calendar View</Typography>
      <Grid container spacing={1}>
        {days.map((day, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">{format(day, 'MMM dd')}</Typography>
              {tasks.filter(t => t.date === format(day, 'yyyy-MM-dd')).map((t, i) => (
                <Typography variant="body2" key={i}>- {t.title}</Typography>
              ))}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  );
}