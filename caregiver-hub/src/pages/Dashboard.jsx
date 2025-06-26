import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  useTheme,
  styled,
  alpha,
  Container,
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
  Task,
  Event,
  NoteAdd,
  TrendingUp,
  Check,
} from '@mui/icons-material';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: '0.3s',
  padding: theme.spacing(2),
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}));

const StatCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  gap: theme.spacing(2),
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
    const fetchStats = async () => {
      try {
        const tasksSnapshot = await getDocs(collection(db, 'tasks'));
        const totalTasks = tasksSnapshot.size;

        const completedTasksQuery = query(
          collection(db, 'tasks'),
          where('status', '==', 'completed')
        );
        const completedTasksSnapshot = await getDocs(completedTasksQuery);
        const completedTasks = completedTasksSnapshot.size;

        const eventsQuery = query(
          collection(db, 'events'),
          where('date', '>=', new Date())
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const upcomingEvents = eventsSnapshot.size;

        const notesSnapshot = await getDocs(collection(db, 'notes'));
        const notes = notesSnapshot.size;

        setStats({ totalTasks, completedTasks, upcomingEvents, notes });

        setTaskCompletionData([
          { name: 'Completed', value: completedTasks },
          { name: 'Pending', value: totalTasks - completedTasks },
        ]);

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
    <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Overview of your caregiver coordination
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {[{
          label: 'Total Tasks',
          icon: <Task />,
          value: stats.totalTasks,
          color: theme.palette.success.main
        }, {
          label: 'Completed Tasks',
          icon: <TrendingUp />,
          value: stats.completedTasks,
          color: theme.palette.primary.main
        }, {
          label: 'Upcoming Events',
          icon: <Event />,
          value: stats.upcomingEvents,
          color: theme.palette.warning.main
        }, {
          label: 'Notes',
          icon: <NoteAdd />,
          value: stats.notes,
          color: theme.palette.info.main
        }].map(({ label, icon, value, color }) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <StyledCard>
              <StatCard>
                <Avatar sx={{ bgcolor: color, width: 48, height: 48, fontSize: 28 }}>
                  {icon}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">{label}</Typography>
                  <Typography variant="h5">{value}</Typography>
                </Box>
              </StatCard>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Recent Tasks */}
        <Grid item xs={12} md={8}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Tasks
              </Typography>
              {recentTasks.map(task => (
                <Box
                  key={task.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                    p: 2,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
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
                    <Typography variant="subtitle1">{task.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {task.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Task Completion Chart */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Task Completion
              </Typography>
              <Box sx={{ height: 280 }}>
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
    </Container>
  );
}
