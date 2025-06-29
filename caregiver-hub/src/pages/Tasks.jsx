import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { 
  Box,
  Button,
  Paper,
  CircularProgress,
  Container,
  Grid,
  Alert,
  Typography,
  useTheme
} from '@mui/material';
import { createTask, getTasks, updateTask, deleteTask } from '../services/taskService';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const Tasks = () => {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && user) {
      loadTasks();
      // Set up real-time updates
      const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const updatedTasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate?.toDate ? doc.data().dueDate.toDate() : doc.data().dueDate
        }));
        setTasks(updatedTasks);
      }, (error) => {
        console.error('Error with real-time updates:', error);
        setError('Failed to set up real-time updates');
      });

      return () => unsubscribe();
    }
  }, [user, loading]);

  const loadTasks = async () => {
    setLoadingTasks(true);
    setError(null);
    
    try {
      if (user) {
        const userTasks = await getTasks(user.uid);
        setTasks(userTasks);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      if (user) {
        await createTask({
          ...taskData,
          userId: user.uid
        });
        setOpenForm(false);
      } else {
        setError('Please log in to create tasks.');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditTask = async (task) => {
    setEditingTask(task);
    setOpenForm(true);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      if (user) {
        await deleteTask(taskId);
      } else {
        setError('Please log in to delete tasks.');
      }
    } catch (error) {
      setError(error.message);
    }
  };

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
        <Typography variant="h2">Tasks</Typography>
        <Typography variant="subtitle1">Manage your caregiver tasks and responsibilities</Typography>
      </Box>
      
      <Container maxWidth="lg">
        {loadingTasks ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Box mb={4}>
              <Button
                variant="contained"
                onClick={() => setOpenForm(true)}
              >
                Add Task
              </Button>
            </Box>
            <TaskList tasks={tasks} onEdit={handleEditTask} onDelete={handleDeleteTask} />
          </>
        )}
      </Container>

      <TaskForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSubmit={editingTask ? handleEditTask : handleAddTask}
      />
    </>
  );
};

export default Tasks;
