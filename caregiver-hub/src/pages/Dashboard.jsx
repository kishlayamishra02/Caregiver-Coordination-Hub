import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, useTheme, styled, alpha,
  Container, Tooltip, Divider, Chip, useMediaQuery, Badge
} from '@mui/material';
import {
  Task, CalendarToday, NoteAdd, Check, Warning, PriorityHigh, 
  NotificationsActive, Lightbulb, Error as ErrorIcon, CheckCircle
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, Timestamp, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const DashboardContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const DashboardHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& h3': {
    background: theme.palette.mode === 'dark' 
      ? `linear-gradient(45deg, ${theme.palette.primary.light} 30%, ${theme.palette.secondary.light} 90%)`
      : `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
  },
}));

const InsightCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  boxShadow: theme.shadows[theme.palette.mode === 'dark' ? 1 : 2],
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[theme.palette.mode === 'dark' ? 4 : 8],
    borderColor: alpha(theme.palette.primary.main, 0.5),
  },
}));

const StatCard = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3),
  gap: theme.spacing(2),
  borderRadius: '12px',
  height: '100%',
  background: theme.palette.mode === 'dark'
    ? alpha(color, 0.15)
    : alpha(color, 0.08),
  borderLeft: `4px solid ${color}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[2],
  },
}));

const SuggestionCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '12px',
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.7)
    : alpha(theme.palette.background.paper, 0.9),
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  flex: 1,
  minWidth: '250px',
  marginBottom: theme.spacing(2),
  transition: 'all 0.2s ease',
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.main, 0.2)
      : alpha(theme.palette.primary.main, 0.08),
    borderColor: theme.palette.primary.main,
  },
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: '250px',
  marginTop: theme.spacing(2),
}));

const COLORS = {
  dark: ['#BB86FC', '#03DAC6', '#FFAB00', '#CF6679'],
  light: ['#6200EE', '#03DAC6', '#FFAB00', '#B00020'],
};

export default function Dashboard() {
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    upcomingTasks: 0,
    highPriority: 0,
    notes: 0
  });
  const [taskCompletionData, setTaskCompletionData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [taskAnalytics, setTaskAnalytics] = useState({
    oldestTask: null,
    frequentPriority: null,
    suggestions: [],
    overdueTasks: [],
    upcomingTitles: []
  });

  useEffect(() => {
    let unsubscribeTasks;
    let unsubscribeNotes;

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Set loading state
      setLoading(true);
      setError('');

      // Tasks real-time updates
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid),
        orderBy('dueDate', 'asc')
      );

      unsubscribeTasks = onSnapshot(tasksQuery, async (snapshot) => {
        try {
          const now = new Date();
          const allTasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            dueDate: doc.data().dueDate?.toDate?.() || new Date(doc.data().dueDate)
          }));

          const completedTasks = allTasks.filter(t => t.completed);
          const upcomingTasks = allTasks.filter(t => !t.completed && t.dueDate >= now);
          const overdueTasks = allTasks.filter(t => !t.completed && t.dueDate < now);
          const highPriority = allTasks.filter(t => t.priority === 'high' && !t.completed);

          const priorityCounts = allTasks.reduce((acc, task) => {
            if (!task.completed) {
              acc[task.priority] = (acc[task.priority] || 0) + 1;
            }
            return acc;
          }, {});

          const oldestTask = [...allTasks]
            .filter(t => !t.completed)
            .sort((a, b) => a.dueDate - b.dueDate)[0];

          const frequentPriority = Object.entries(priorityCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

          // Notes real-time updates
          const notesQuery = query(
            collection(db, 'notes'),
            where('userId', '==', user.uid)
          );

          unsubscribeNotes = onSnapshot(notesQuery, (snapshot) => {
            const suggestions = [];
            if (overdueTasks.length > 0) {
              suggestions.push(`You have ${overdueTasks.length} overdue tasks. Tackle these first!`);
            }
            if (highPriority.length > 0) {
              suggestions.push(`Focus on ${highPriority.length} high priority tasks today.`);
            }
            if (upcomingTasks.length > 3) {
              suggestions.push(`Plan ahead - you have ${upcomingTasks.length} tasks coming up.`);
            }
            if (completedTasks.length === 0 && allTasks.length > 0) {
              suggestions.push(`Get started! Mark your first task complete.`);
            }

            setStats({
              totalTasks: allTasks.length,
              completedTasks: completedTasks.length,
              upcomingTasks: upcomingTasks.length,
              highPriority: highPriority.length,
              notes: snapshot.size
            });

            setTaskCompletionData([
              { name: 'Completed', value: completedTasks.length },
              { name: 'Upcoming', value: upcomingTasks.length },
              { name: 'Overdue', value: overdueTasks.length }
            ]);

            setPriorityData(Object.entries(priorityCounts).map(([name, value]) => ({ name, value })));

            setTaskAnalytics({
              oldestTask,
              frequentPriority,
              suggestions,
              overdueTasks,
              upcomingTitles: upcomingTasks.map(t => t.title)
            });

            setLoading(false);
          }, (error) => {
            setError('Failed to fetch notes: ' + error.message);
            setLoading(false);
          });
        } catch (error) {
          setError('Failed to fetch tasks: ' + error.message);
          setLoading(false);
        }
      }, (error) => {
        setError('Failed to fetch tasks: ' + error.message);
        setLoading(false);
      });

      return () => {
        if (unsubscribeTasks) unsubscribeTasks();
        if (unsubscribeNotes) unsubscribeNotes();
      };
    } catch (error) {
      setError('Failed to initialize dashboard: ' + error.message);
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <DashboardContainer maxWidth={false}>
      <DashboardHeader>
        <Typography variant="h3" fontWeight={800} gutterBottom sx={{ fontFamily: 'Poppins, sans-serif' }}>
          Caregiver Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400 }}>
          Smart insights to help you manage care tasks efficiently
        </Typography>
      </DashboardHeader>
      
      {/* Stat boxes */}
      <Grid container spacing={3} mb={4}>
        {[
          { 
            label: 'Total Tasks', 
            icon: <Task />, 
            value: stats.totalTasks, 
            color: theme.palette.primary.main 
          },
          { 
            label: 'Total Notes', 
            icon: <NoteAdd />, 
            value: stats.notes, 
            color: theme.palette.info.main 
          },
          { 
            label: 'Completed', 
            icon: <Check />, 
            value: stats.completedTasks, 
            color: theme.palette.success.main 
          },
          { 
            label: 'Upcoming', 
            icon: <CalendarToday />, 
            value: stats.upcomingTasks, 
            color: theme.palette.warning.main 
          },
          { 
            label: 'High Priority', 
            icon: <PriorityHigh />, 
            value: stats.highPriority, 
            color: theme.palette.error.main 
          }
        ].map(stat => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={stat.label} sx={{ display: 'flex' }}>
            <StatCard color={stat.color}>
              <Badge
                badgeContent={stat.value}
                color="default"
                overlap="circular"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: stat.color,
                    color: theme.palette.getContrastText(stat.color),
                    fontWeight: 'bold',
                  },
                }}
              >
                <Avatar sx={{ 
                  bgcolor: alpha(stat.color, 0.2), 
                  color: stat.color,
                  width: 48,
                  height: 48
                }}>
                  {stat.icon}
                </Avatar>
              </Badge>
              <Box>
                <Typography variant="h4" fontWeight={700}>{stat.value}</Typography>
                <Typography variant="subtitle2" color="text.secondary">{stat.label}</Typography>
              </Box>
            </StatCard>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Task Status Overview */}
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <InsightCard>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                📊 Task Status Overview
              </Typography>
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskCompletionData}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={alpha(theme.palette.divider, 0.5)} 
                    />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: theme.palette.text.secondary }}
                    />
                    <YAxis 
                      tick={{ fill: theme.palette.text.secondary }}
                    />
                    <ReTooltip 
                      contentStyle={{
                        background: theme.palette.background.paper,
                        borderColor: theme.palette.divider,
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {taskCompletionData.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={
                            idx === 0 ? theme.palette.success.main :
                            idx === 1 ? theme.palette.info.main :
                            theme.palette.error.main
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </InsightCard>
        </Grid>

        {/* Priority Distribution */}
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <InsightCard>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                🎯 Priority Distribution
              </Typography>
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {priorityData.map((_, i) => (
                        <Cell 
                          key={i} 
                          fill={COLORS[theme.palette.mode][i % COLORS.dark.length]} 
                        />
                      ))}
                    </Pie>
                    <Legend />
                    <ReTooltip 
                      contentStyle={{
                        background: theme.palette.background.paper,
                        borderColor: theme.palette.divider,
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </InsightCard>
        </Grid>

        {/* Insights */}
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <InsightCard>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                🔍 Task Insights
              </Typography>
              
              <Box sx={{ 
                p: 2, 
                bgcolor: alpha(theme.palette.primary.main, 0.08), 
                borderRadius: 2, 
                mb: 2,
                borderLeft: `4px solid ${theme.palette.primary.main}`
              }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Most Frequent Priority
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {taskAnalytics.frequentPriority ? (
                    <Chip
                      label={taskAnalytics.frequentPriority}
                      color={
                        taskAnalytics.frequentPriority === 'high' ? 'error' :
                        taskAnalytics.frequentPriority === 'medium' ? 'warning' : 'success'
                      }
                      sx={{ fontWeight: 600 }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No priority data available
                    </Typography>
                  )}
                </Typography>
              </Box>
              
              <Box sx={{ 
                p: 2, 
                bgcolor: alpha(theme.palette.warning.main, 0.08), 
                borderRadius: 2,
                borderLeft: `4px solid ${theme.palette.warning.main}`
              }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Oldest Incomplete Task
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {taskAnalytics.oldestTask ? (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {taskAnalytics.oldestTask.priority === 'high' && (
                          <ErrorIcon color="error" fontSize="small" />
                        )}
                        {taskAnalytics.oldestTask.title}
                      </Box>
                      <Typography 
                        variant="caption" 
                        color={taskAnalytics.oldestTask.dueDate < new Date() ? 'error' : 'text.secondary'} 
                        display="block"
                        sx={{ mt: 0.5 }}
                      >
                        Due: {format(taskAnalytics.oldestTask.dueDate, 'MMM dd, yyyy')}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No incomplete tasks
                    </Typography>
                  )}
                </Typography>
              </Box>
            </CardContent>
          </InsightCard>
        </Grid>

        {/* Suggestions Panel */}
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <InsightCard>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                💡 Suggestions Panel
              </Typography>
              
              {taskAnalytics.suggestions.length > 0 ? (
                taskAnalytics.suggestions.map((text, i) => (
                  <SuggestionCard key={i}>
                    <Avatar sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1), 
                      color: theme.palette.primary.main,
                      width: 32,
                      height: 32
                    }}>
                      <Lightbulb fontSize="small" />
                    </Avatar>
                    <Typography variant="body2">{text}</Typography>
                  </SuggestionCard>
                ))
              ) : (
                <Box sx={{ 
                  p: 2, 
                  bgcolor: alpha(theme.palette.success.main, 0.08), 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  borderLeft: `4px solid ${theme.palette.success.main}`
                }}>
                  <CheckCircle color="success" />
                  <Typography variant="body2">
                    Great job! No urgent suggestions at this time.
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ 
                p: 2, 
                bgcolor: alpha(theme.palette.error.main, 0.08), 
                borderRadius: 2,
                mb: 2,
                borderLeft: `4px solid ${theme.palette.error.main}`
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ErrorIcon color="error" fontSize="small" /> Overdue Tasks
                  </Typography>
                  <Chip
                    label={taskAnalytics.overdueTasks.length}
                    color={taskAnalytics.overdueTasks.length > 0 ? 'error' : 'default'}
                    variant="outlined"
                  />
                </Box>
                {taskAnalytics.overdueTasks.length > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {taskAnalytics.overdueTasks.slice(0, 3).map(t => t.title).join(', ')}
                    {taskAnalytics.overdueTasks.length > 3 && '...'}
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ 
                p: 2, 
                bgcolor: alpha(theme.palette.warning.main, 0.08), 
                borderRadius: 2,
                borderLeft: `4px solid ${theme.palette.warning.main}`
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday color="warning" fontSize="small" /> This Week's Tasks
                  </Typography>
                  <Chip
                    label={taskAnalytics.upcomingTitles.length}
                    color={taskAnalytics.upcomingTitles.length > 0 ? 'warning' : 'default'}
                    variant="outlined"
                  />
                </Box>
                {taskAnalytics.upcomingTitles.length > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {taskAnalytics.upcomingTitles.slice(0, 3).join(', ')}
                    {taskAnalytics.upcomingTitles.length > 3 && '...'}
                  </Typography>
                )}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                p: 2,
                bgcolor: alpha(theme.palette.info.main, 0.08),
                borderRadius: 2,
                borderLeft: `4px solid ${theme.palette.info.main}`
              }}>
                <NotificationsActive color="info" />
                <Typography variant="body2">
                  Review high priority tasks every morning for better productivity.
                </Typography>
              </Box>
            </CardContent>
          </InsightCard>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
}