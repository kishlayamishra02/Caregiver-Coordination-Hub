import {
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  Dialog,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  format,
  startOfMonth,
  addDays,
  parseISO,
  isSameDay,
  startOfDay,
  endOfDay,
  addHours,
} from 'date-fns';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  orderBy,
  deleteDoc,
} from 'firebase/firestore';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useAuth } from '../contexts/AuthContext';

export default function CalendarView({ tasks = [], setTasks }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const start = startOfMonth(new Date());
  const days = [...Array(30).keys()].map(i => addDays(start, i));

  // Fetch tasks from Firestore
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const q = query(
          collection(db, 'calendarEvents'),
          where('userId', '==', user?.uid),
          orderBy('date', 'asc'),
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
        setError('Failed to fetch tasks. Please try again later.');
      }
    };

    if (user) {
      fetchTasks();
    }
  }, [user, setTasks]);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await addDoc(collection(db, 'calendarEvents'), {
        title: newTask,
        date: format(selectedDate, 'yyyy-MM-dd'),
        createdAt: new Date(),
        userId: user?.uid,
        completed: false,
        priority: 'medium',
        category: 'general'
      });
      
      setOpenDialog(false);
      setNewTask('');
      
      // Refresh the tasks list
      const q = query(
        collection(db, 'calendarEvents'),
        where('userId', '==', user?.uid),
        orderBy('date', 'asc'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedTasks = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setTasks(fetchedTasks);
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
      
      await updateDoc(doc(db, 'calendarEvents', taskId), {
        title: newTitle
      });
      
      setEditingTask(null);
      
      // Refresh the tasks list
      const q = query(
        collection(db, 'calendarEvents'),
        where('userId', '==', user?.uid),
        orderBy('date', 'asc'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedTasks = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setTasks(fetchedTasks);
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
      
      await deleteDoc(doc(db, 'calendarEvents', taskId));
      
      // Refresh the tasks list
      const q = query(
        collection(db, 'calendarEvents'),
        where('userId', '==', user?.uid),
        orderBy('date', 'asc'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedTasks = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setTasks(fetchedTasks);
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
      
      await updateDoc(doc(db, 'calendarEvents', taskId), {
        completed: true,
        completedAt: new Date()
      });
      
      // Refresh the tasks list
      const q = query(
        collection(db, 'calendarEvents'),
        where('userId', '==', user?.uid),
        orderBy('date', 'asc'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedTasks = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setTasks(fetchedTasks);
    } catch (error) {
      setError('Failed to mark task as completed. Please try again.');
      console.error('Error marking task as completed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          fontWeight: 700,
          mb: 4,
          color: '#1976d2',
          textShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
        }}
      >
        Calendar
      </Typography>

      {/* Add Task Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setNewTask('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <Box p={3}>
          <Typography variant="h6" mb={2}>Add New Task</Typography>
          <TextField
            fullWidth
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter task title"
            sx={{ mb: 2 }}
            autoFocus
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setOpenDialog(false);
                setNewTask('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddTask}
              disabled={loading || !newTask.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
            >
              {loading ? 'Adding...' : 'Add Task'}
            </Button>
          </Box>
        </Box>
      </Dialog>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} justifyContent="center">
        {days.map((day, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                minHeight: 90,
                background: 'linear-gradient(120deg, #e3f2fd 0%, #bbdefb 100%)',
                boxShadow: '0 2px 8px 0 rgba(25, 118, 210, 0.08)',
                position: 'relative',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  transition: 'transform 0.2s ease-in-out',
                }
              }}
              onClick={() => {
                setSelectedDate(day);
                setOpenDialog(true);
              }}
            >
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600,
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon sx={{ color: '#1976d2' }} />
                  {format(day, 'MMM dd')}
                </Box>
                <Tooltip title="Add Task">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDate(day);
                      setOpenDialog(true);
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </Typography>
              
              {tasks
                .filter(t => t.date === format(day, 'yyyy-MM-dd'))
                .map((t, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: t.completed ? 'success.light' : 'primary.light',
                      opacity: t.completed ? 0.8 : 1
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        markTaskAsCompleted(t.id);
                      }}
                      sx={{ mr: 1 }}
                    >
                      {t.completed ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />}
                    </IconButton>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: t.completed ? 'success.main' : '#1976d2',
                        textDecoration: t.completed ? 'line-through' : 'none',
                        flex: 1,
                        pr: 1
                      }}
                    >
                      {t.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTask({
                              id: t.id,
                              title: t.title
                            });
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(t.id);
                          }}
                        >
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                ))}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}