import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, useTheme, styled, alpha,
  Container, Button, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControlLabel, Checkbox, Alert
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { db } from '../firebase';
import {
  collection, query, where, getDocs, orderBy, addDoc, doc, updateDoc,
  deleteDoc, Timestamp, onSnapshot
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Task, Event, NoteAdd, TrendingUp, Check, Edit, Delete } from '@mui/icons-material';

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

const TaskForm = ({ open, onClose, task }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('');
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDueDate(task.dueDate ? new Date(task.dueDate.toDate?.() || task.dueDate).toISOString().slice(0, 16) : '');
      setPriority(task.priority || '');
      setCompleted(task.completed || false);
    } else {
      setTitle('');
      setDueDate('');
      setPriority('');
      setCompleted(false);
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (!title.trim()) throw new Error('Title is required');
      if (!dueDate) throw new Error('Due date is required');

      const taskData = {
        title,
        dueDate: new Date(dueDate),
        priority,
        completed,
        userId: task?.userId || user?.uid,
        updatedAt: Timestamp.now()
      };

      if (task?.id) {
        await updateDoc(doc(db, 'tasks', task.id), taskData);
      } else {
        await addDoc(collection(db, 'tasks'), {
          ...taskData,
          createdAt: Timestamp.now()
        });
      }

      onClose();
    } catch (err) {
      console.error('Task save error:', err);
      setError(err.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{task ? 'Edit Task' : 'Add Task'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth required sx={{ mb: 2 }}
          />
          <TextField
            type="datetime-local"
            label="Due Date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            fullWidth required sx={{ mb: 2 }}
          />
          <TextField
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            fullWidth sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
              />
            }
            label="Completed"
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    upcomingEvents: 0,
    notes: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [taskCompletionData, setTaskCompletionData] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const theme = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(tasksQuery, async (snapshot) => {
      const allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const completedTasks = allTasks.filter(t => t.completed).length;
      const upcomingEvents = allTasks.filter(t => {
        const d = t.dueDate?.toDate ? t.dueDate.toDate() : new Date(t.dueDate);
        return d >= new Date();
      }).length;

      const notesQuery = query(
        collection(db, 'notes'),
        where('userId', '==', user.uid)
      );
      const notesSnapshot = await getDocs(notesQuery);

      setStats({
        totalTasks: allTasks.length,
        completedTasks,
        upcomingEvents,
        notes: notesSnapshot.size
      });

      setTaskCompletionData([
        { name: 'Completed', value: completedTasks },
        { name: 'Pending', value: allTasks.length - completedTasks },
      ]);

      setRecentTasks(allTasks.slice(0, 5));
    });

    return () => unsubscribe();
  }, [user]);

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Overview of your caregiver coordination
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        {[
          { label: 'Total Tasks', icon: <Task />, value: stats.totalTasks, color: theme.palette.success.main },
          { label: 'Completed Tasks', icon: <TrendingUp />, value: stats.completedTasks, color: theme.palette.primary.main },
          { label: 'Upcoming Events', icon: <Event />, value: stats.upcomingEvents, color: theme.palette.warning.main },
          { label: 'Notes', icon: <NoteAdd />, value: stats.notes, color: theme.palette.info.main },
        ].map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <StyledCard>
              <StatCard>
                {stat.icon}
                <Box>
                  <Typography variant="h4" color={stat.color}>{stat.value}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">{stat.label}</Typography>
                </Box>
              </StatCard>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      <Grid item xs={12} md={6}>
        <StyledCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Task Completion
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskCompletionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </StyledCard>
      </Grid>

      <Grid item xs={12}>
        <StyledCard>
          <CardContent>
            <Typography variant="h6" gutterBottom>All Tasks</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setEditingTask(null);
                  setOpenForm(true);
                }}
              >
                Add Task
              </Button>
            </Box>

            <Box sx={{ mt: 2 }}>
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
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    {task.completed ? <Check /> : <Task />}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography>{task.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Priority: {task.priority}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton onClick={() => {
                      setEditingTask(task);
                      setOpenForm(true);
                    }}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteTask(task.id)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </StyledCard>
      </Grid>

      <TaskForm
        open={openForm}
        onClose={() => {
          setEditingTask(null);
          setOpenForm(false);
        }}
        task={editingTask}
      />
    </Container>
  );
}
