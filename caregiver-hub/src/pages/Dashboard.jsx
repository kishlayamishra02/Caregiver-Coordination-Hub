import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Box, Grid, Typography, Avatar, useTheme, styled, alpha,
  Divider, Chip, useMediaQuery, Badge, Skeleton, LinearProgress, Alert, Card, CardContent
} from '@mui/material';
import {
  Task, CalendarToday, NoteAdd, Check, PriorityHigh, 
  NotificationsActive, Lightbulb, CheckCircle,
  TrendingUp, AccessTime, DoneAll, Star, Error as ErrorIcon
} from '@mui/icons-material';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip
} from 'recharts';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { initializeReminderService } from '../services/reminderService';

const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  paddingLeft: 0,
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.default, 0.9)
    : alpha(theme.palette.background.default, 0.98),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const DashboardHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& h3': {
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 800,
    fontSize: '2.4rem',
    marginBottom: theme.spacing(1),
  },
}));

const InsightCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
  },
}));

const StatCard = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2.5),
  gap: theme.spacing(2),
  borderRadius: 14,
  height: '100%',
  background: alpha(color, 0.1),
  borderLeft: `4px solid ${color}`,
}));

const ChartContainer = styled(Box)(() => ({
  height: 280,
  position: 'relative',
  marginTop: 12,
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '6px',
  borderRadius: 4,
  background: alpha(theme.palette.divider, 0.2),
  overflow: 'hidden',
  marginTop: theme.spacing(1),
}));

const SuggestionCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: 12,
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  background: theme.palette.background.paper,
  marginBottom: theme.spacing(2),
}));

const InsightBox = styled(Box)(({ theme, color }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  marginBottom: theme.spacing(2),
  borderLeft: `4px solid ${color}`,
  backgroundColor: alpha(color, 0.08),
}));

const COLORS = {
  dark: ['#BB86FC', '#03DAC6', '#FFAB00', '#CF6679'],
  light: ['#6200EE', '#03DAC6', '#FFAB00', '#B00020'],
};

export default function Dashboard() {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    upcomingTasks: 0,
    highPriority: 0,
    notes: 0
  });
  const [priorityData, setPriorityData] = useState([]);
  const [taskAnalytics, setTaskAnalytics] = useState({
    frequentPriority: null,
    weeklyTrend: [],
    suggestions: [],
    overdueTasks: [],
    upcomingTitles: [],
    oldestTask: null,
    completionRate: 0
  });

  useEffect(() => {
    const init = async () => {
      try {
        await initializeReminderService();
      } catch (e) {
        console.error(e);
        setError('Failed to initialize services');
      }
    };
    if (user) init();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const taskQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('dueDate', 'asc')
    );

    const unsub = onSnapshot(taskQuery, (snapshot) => {
      const now = new Date();
      const tasks = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          dueDate: data.dueDate?.toDate?.() || new Date(),
          completedAt: data.completedAt?.toDate?.(),
          createdAt: data.createdAt?.toDate?.(),
        };
      });

      const completed = tasks.filter(t => t.completed);
      const upcoming = tasks.filter(t => !t.completed && t.dueDate >= now);
      const overdue = tasks.filter(t => !t.completed && t.dueDate < now);
      const highPriority = tasks.filter(t => t.priority === 'high');

      const counts = tasks.reduce((acc, t) => {
        if (!t.completed) {
          acc[t.priority] = (acc[t.priority] || 0) + 1;
        }
        return acc;
      }, {});

      const frequent = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
      const oldestTask = [...tasks].filter(t => !t.completed).sort((a, b) => a.dueDate - b.dueDate)[0];
      const completionRate = tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0;

      const weeklyTrend = Array(7).fill(0).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - 6 + i);
        d.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setDate(d.getDate() + 1);
        return {
          day: format(d, 'EEE'),
          completed: completed.filter(t => t.completedAt >= d && t.completedAt < end).length,
          created: tasks.filter(t => t.createdAt >= d && t.createdAt < end).length
        };
      });

      const suggestions = [
        ...(overdue.length ? [`You have ${overdue.length} overdue tasks`] : []),
        ...(highPriority.length ? [`${highPriority.length} high priority tasks need attention`] : []),
        ...(upcoming.length > 3 ? [`Plan ahead for ${upcoming.length} upcoming tasks`] : []),
        ...(completed.length === 0 && tasks.length > 0 ? ['Get started with your first task'] : [])
      ];

      setStats({
        totalTasks: tasks.length,
        completedTasks: completed.length,
        upcomingTasks: upcoming.length,
        highPriority: highPriority.length,
        notes: 0 // Static for now
      });

      setTaskAnalytics({
        frequentPriority: frequent,
        weeklyTrend,
        suggestions,
        overdueTasks: overdue,
        upcomingTitles: upcoming.map(t => t.title),
        oldestTask,
        completionRate
      });

      setPriorityData(Object.entries(counts).map(([k, v]) => ({ name: k, value: v })));
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  if (loading) return (
    <DashboardContainer>
      <Grid container spacing={3}>
        {[...Array(5)].map((_, i) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={i}>
            <Skeleton variant="rounded" height={110} />
          </Grid>
        ))}
        {[...Array(4)].map((_, i) => (
          <Grid item xs={12} md={6} key={i}>
            <Skeleton variant="rounded" height={380} />
          </Grid>
        ))}
      </Grid>
    </DashboardContainer>
  );

  if (error) return (
    <DashboardContainer>
      <Alert severity="error" sx={{ my: 4 }}>
        {error}
      </Alert>
    </DashboardContainer>
  );

  return (
    <DashboardContainer>
      <DashboardHeader>
        <Typography variant="h3">Care Coordination Dashboard</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {format(new Date(), 'EEEE, MMM d')} • {stats.completedTasks} tasks completed
        </Typography>
      </DashboardHeader>

      <Grid container spacing={3}>
        {[
          { 
            label: 'Total Tasks', 
            icon: <Task />, 
            value: stats.totalTasks, 
            color: theme.palette.primary.main,
            trend: stats.totalTasks > taskAnalytics.weeklyTrend.reduce((sum, day) => sum + day.created, 0) / 7 ? 'up' : 'down'
          },
          { 
            label: 'Completed', 
            icon: <Check />, 
            value: stats.completedTasks, 
            color: theme.palette.success.main,
            progress: taskAnalytics.completionRate
          },
          { 
            label: 'Upcoming', 
            icon: <CalendarToday />, 
            value: stats.upcomingTasks, 
            color: theme.palette.warning.main,
            trend: stats.upcomingTasks > 5 ? 'up' : 'down'
          },
          { 
            label: 'High Priority', 
            icon: <PriorityHigh />, 
            value: stats.highPriority, 
            color: theme.palette.error.main
          },
          { 
            label: 'Notes', 
            icon: <NoteAdd />, 
            value: stats.notes, 
            color: theme.palette.info.main
          }
        ].map(item => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={item.label}>
            <StatCard color={item.color}>
              <Avatar sx={{ bgcolor: alpha(item.color, 0.2), color: item.color }}>
                {item.icon}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">{item.label}</Typography>
                <Typography variant="h5">{item.value}</Typography>
                {item.progress !== undefined && (
                  <>
                    <ProgressContainer>
                      <LinearProgress 
                        variant="determinate" 
                        value={item.progress} 
                        sx={{
                          backgroundColor: alpha(item.color, 0.2),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: item.color
                          }
                        }}
                      />
                    </ProgressContainer>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(item.progress)}% completed
                    </Typography>
                  </>
                )}
                {item.trend && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUp 
                      fontSize="small" 
                      color={item.trend === 'up' ? 'success' : 'error'} 
                      sx={{ transform: item.trend === 'down' ? 'rotate(180deg)' : 'none' }} 
                    />
                    <Typography variant="caption" color={item.trend === 'up' ? 'success.main' : 'error.main'}>
                      {item.trend === 'up' ? 'Increasing' : 'Decreasing'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </StatCard>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={6}>
          <InsightCard>
            <CardContent>
              <Typography variant="h6">📈 Weekly Activity</Typography>
              <ChartContainer>
                <ResponsiveContainer>
                  <AreaChart data={taskAnalytics.weeklyTrend}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ReTooltip />
                    <Area 
                      dataKey="completed" 
                      stroke={theme.palette.success.main} 
                      fill="url(#colorCompleted)" 
                      name="Completed"
                    />
                    <Area 
                      dataKey="created" 
                      stroke={theme.palette.primary.main} 
                      fill="url(#colorCreated)" 
                      name="Created"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </InsightCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <InsightCard>
            <CardContent>
              <Typography variant="h6">🎯 Priority Breakdown</Typography>
              <ChartContainer>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie 
                      data={priorityData} 
                      dataKey="value" 
                      nameKey="name" 
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {priorityData.map((_, i) => (
                        <Cell key={i} fill={COLORS[theme.palette.mode][i % 4]} />
                      ))}
                    </Pie>
                    <Legend />
                    <ReTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </InsightCard>
        </Grid>
      </Grid>

      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={6}>
          <InsightCard>
            <CardContent>
              <Typography variant="h6">🔍 Task Insights</Typography>
              
              <InsightBox color={theme.palette.primary.main}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Star color="primary" />
                  <Typography variant="subtitle2">Most Common Priority</Typography>
                </Box>
                {taskAnalytics.frequentPriority ? (
                  <Chip
                    label={taskAnalytics.frequentPriority}
                    color={
                      taskAnalytics.frequentPriority === 'high' ? 'error' :
                      taskAnalytics.frequentPriority === 'medium' ? 'warning' : 'success'
                    }
                    size="small"
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">No data</Typography>
                )}
              </InsightBox>
              
              <InsightBox color={theme.palette.warning.main}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <AccessTime color="warning" />
                  <Typography variant="subtitle2">Oldest Task</Typography>
                </Box>
                {taskAnalytics.oldestTask ? (
                  <>
                    <Typography variant="body2" fontWeight={500}>
                      {taskAnalytics.oldestTask.title}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color={taskAnalytics.oldestTask.dueDate < new Date() ? 'error' : 'text.secondary'}
                    >
                      Due: {format(taskAnalytics.oldestTask.dueDate, 'MMM d')}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">No incomplete tasks</Typography>
                )}
              </InsightBox>
              
              <InsightBox color={theme.palette.success.main}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <DoneAll color="success" />
                  <Typography variant="subtitle2">Completion Rate</Typography>
                </Box>
                <Typography variant="h6">{Math.round(taskAnalytics.completionRate)}%</Typography>
                <ProgressContainer>
                  <LinearProgress 
                    variant="determinate" 
                    value={taskAnalytics.completionRate} 
                    sx={{
                      backgroundColor: alpha(theme.palette.success.main, 0.2),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.success.main
                      }
                    }}
                  />
                </ProgressContainer>
              </InsightBox>
            </CardContent>
          </InsightCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <InsightCard>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">💡 Care Recommendations</Typography>
                <Chip label={`${taskAnalytics.suggestions.length} suggestions`} size="small" />
              </Box>
              
              {taskAnalytics.suggestions.length > 0 ? (
                <Grid container spacing={2}>
                  {taskAnalytics.suggestions.map((suggestion, i) => (
                    <Grid item xs={12} key={i}>
                      <SuggestionCard>
                        <Avatar sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.1), 
                          color: theme.palette.primary.main,
                          width: 32,
                          height: 32
                        }}>
                          <Lightbulb fontSize="small" />
                        </Avatar>
                        <Typography variant="body2">{suggestion}</Typography>
                      </SuggestionCard>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center" 
                  justifyContent="center" 
                  p={3}
                  textAlign="center"
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.08),
                    borderRadius: 2,
                    border: `1px dashed ${alpha(theme.palette.success.main, 0.3)}`
                  }}
                >
                  <CheckCircle color="success" sx={{ fontSize: '2.5rem', mb: 1 }} />
                  <Typography variant="body1" fontWeight={500}>All caught up!</Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    No recommendations at this time
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 3 }} />
              
              <Box display="flex" justifyContent="space-between">
                <InsightBox color={theme.palette.error.main} sx={{ flex: 1, mr: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <ErrorIcon color="error" fontSize="small" />
                    <Typography variant="subtitle2">Overdue Tasks</Typography>
                  </Box>
                  <Typography variant="h6">{taskAnalytics.overdueTasks.length}</Typography>
                  {taskAnalytics.overdueTasks.length > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      {taskAnalytics.overdueTasks.slice(0, 2).map(t => t.title).join(', ')}
                      {taskAnalytics.overdueTasks.length > 2 && '...'}
                    </Typography>
                  )}
                </InsightBox>
                
                <InsightBox color={theme.palette.warning.main} sx={{ flex: 1, ml: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <CalendarToday color="warning" fontSize="small" />
                    <Typography variant="subtitle2">Upcoming Tasks</Typography>
                  </Box>
                  <Typography variant="h6">{taskAnalytics.upcomingTitles.length}</Typography>
                  {taskAnalytics.upcomingTitles.length > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      {taskAnalytics.upcomingTitles.slice(0, 2).join(', ')}
                      {taskAnalytics.upcomingTitles.length > 2 && '...'}
                    </Typography>
                  )}
                </InsightBox>
              </Box>
              
              <Box 
                mt={3} 
                p={2} 
                borderRadius={2}
                sx={{
                  bgcolor: alpha(theme.palette.info.main, 0.08),
                  borderLeft: `4px solid ${theme.palette.info.main}`
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <NotificationsActive color="info" />
                  <Typography variant="body2">
                    Review high priority tasks every morning for better productivity.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </InsightCard>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
}