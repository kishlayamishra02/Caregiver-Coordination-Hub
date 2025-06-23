import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Avatar,
  Paper,
  useTheme,
  styled,
  alpha,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  Today,
  Event,
  Task,
  NoteAdd,
  TrendingUp,
  TrendingDown,
  Person,
  CalendarToday,
  Description,
} from '@mui/icons-material';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: '0.3s',
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}));

const StatCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  p: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    upcomingEvents: 0,
    notes: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [taskCompletionData, setTaskCompletionData] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    // Fetch statistics
    const fetchStats = async () => {
      try {
        // Get total tasks
        const tasksSnapshot = await getDocs(collection(db, 'tasks'));
        const totalTasks = tasksSnapshot.size;
        
        // Get completed tasks
        const completedTasksQuery = query(
          collection(db, 'tasks'),
          where('status', '==', 'completed')
        );
        const completedTasksSnapshot = await getDocs(completedTasksQuery);
        const completedTasks = completedTasksSnapshot.size;

        // Get upcoming events
        const eventsQuery = query(
          collection(db, 'events'),
          where('date', '>=', new Date())
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const upcomingEvents = eventsSnapshot.size;

        // Get notes
        const notesSnapshot = await getDocs(collection(db, 'notes'));
        const notes = notesSnapshot.size;

        setStats({
          totalTasks,
          completedTasks,
          upcomingEvents,
          notes,
        });

        // Prepare task completion data for chart
        const completionData = [
          { name: 'Completed', value: completedTasks },
          { name: 'Pending', value: totalTasks - completedTasks },
        ];
        setTaskCompletionData(completionData);

        // Get recent tasks
        const recentTasksQuery = query(
          collection(db, 'tasks'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentTasksSnapshot = await getDocs(recentTasksQuery);
        setRecentTasks(recentTasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box>
      {/* Header with quick actions */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4" component="h1" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Overview of your caregiver coordination
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Stats cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <StatCard>
              <Avatar
                sx={{
                  bgcolor: theme.palette.success.main,
                  color: theme.palette.success.contrastText,
                }}
              >
                <Task />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Tasks</Typography>
                <Typography variant="h4" gutterBottom>
                  {stats.totalTasks}
                </Typography>
              </Box>
            </StatCard>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <StatCard>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                }}
              >
                <TrendingUp />
              </Avatar>
              <Box>
                <Typography variant="h6">Completed Tasks</Typography>
                <Typography variant="h4" gutterBottom>
                  {stats.completedTasks}
                </Typography>
              </Box>
            </StatCard>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <StatCard>
              <Avatar
                sx={{
                  bgcolor: theme.palette.warning.main,
                  color: theme.palette.warning.contrastText,
                }}
              >
                <Event />
              </Avatar>
              <Box>
                <Typography variant="h6">Upcoming Events</Typography>
                <Typography variant="h4" gutterBottom>
                  {stats.upcomingEvents}
                </Typography>
              </Box>
            </StatCard>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <StatCard>
              <Avatar
                sx={{
                  bgcolor: theme.palette.info.main,
                  color: theme.palette.info.contrastText,
                }}
              >
                <NoteAdd />
              </Avatar>
              <Box>
                <Typography variant="h6">Notes</Typography>
                <Typography variant="h4" gutterBottom>
                  {stats.notes}
                </Typography>
              </Box>
            </StatCard>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Recent tasks */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Tasks
              </Typography>
              {recentTasks.map((task) => (
                <Box
                  key={task.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    mb: 2,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: task.status === 'completed'
                        ? theme.palette.success.main
                        : theme.palette.primary.main,
                    }}
                  >
                    {task.status === 'completed' ? <Check /> : <Task />}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {task.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {task.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Task completion chart */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Task Completion
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskCompletionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
}