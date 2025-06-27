import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { 
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Container,
  Grid,
  Alert
} from '@mui/material';
import { createTask, getTasks, updateTask, deleteTask } from '../services/taskService';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const Tasks = () => {
  const { user, loading } = useAuth();
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

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Tasks</Typography>
                <Button
                  variant="contained"
                  onClick={() => setOpenForm(true)}
                  sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
                >
                  Add Task
                </Button>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TaskList
                tasks={tasks}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            </Paper>
          </Grid>
        </Grid>

        <TaskForm
          open={openForm}
          onClose={() => {
            setOpenForm(false);
            setEditingTask(null);
          }}
          task={editingTask}
          onSubmit={editingTask ? () => handleEditTask(editingTask) : handleAddTask}
        />
      </Box>
    </Container>
  );
};

export default Tasks;
