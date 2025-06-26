import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';


import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  orderBy
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', user?.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedTasks = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks. Please try again.');
    }
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;

    try {
      setLoading(true);
      setError(null);

      await addDoc(collection(db, 'tasks'), {
        title: newTask,
        description: '',
        completed: false,
        createdAt: new Date(),
        userId: user?.uid,
        priority: 'medium',
        category: 'general'
      });

      setOpenDialog(false);
      setNewTask('');
      fetchTasks();
    } catch (error) {
      setError('Failed to add task. Please try again.');
      console.error('Error adding task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async (taskId, newTitle) => {
    try {
      setLoading(true);
      setError(null);

      await updateDoc(doc(db, 'tasks', taskId), {
        title: newTitle
      });

      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      setError('Failed to update task. Please try again.');
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      setLoading(true);
      setError(null);

      await deleteDoc(doc(db, 'tasks', taskId));
      fetchTasks();
    } catch (error) {
      setError('Failed to delete task. Please try again.');
      console.error('Error deleting task:', error);
    } finally {
      setLoading(false);
    }
  };

  const markTaskAsCompleted = async (taskId) => {
    try {
      setLoading(true);
      setError(null);

      await updateDoc(doc(db, 'tasks', taskId), {
        completed: true,
        completedAt: new Date()
      });

      fetchTasks();
    } catch (error) {
      setError('Failed to mark task as completed. Please try again.');
      console.error('Error marking task as completed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tasks
      </Typography>

      {/* Add Task Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            error={!!error}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddTask} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Add Task'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tasks List */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setOpenDialog(true);
              setNewTask('');
              setEditingTask(null);
            }}
          >
            Add Task
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          {tasks.map((task) => (
            <Grid xs={12} sm={6} md={4} key={task.id}>
              <Paper
                sx={{
                  p: 2,
                  height: '100%',
                  bgcolor: task.completed ? 'success.light' : 'background.paper',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', textDecoration: task.completed ? 'line-through' : 'none' }}>
                    {task.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit Task">
                      <IconButton
                        onClick={() => {
                          setNewTask(task.title);
                          setEditingTask(task.id);
                          setOpenDialog(true);
                        }}
                        disabled={loading}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Task">
                      <IconButton onClick={() => handleDeleteTask(task.id)} disabled={loading}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  {task.description}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={task.completed ? <CheckCircleIcon /> : <ErrorIcon />}
                    onClick={() => markTaskAsCompleted(task.id)}
                    disabled={loading}
                  >
                    {task.completed ? 'Completed' : 'Mark as Complete'}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
