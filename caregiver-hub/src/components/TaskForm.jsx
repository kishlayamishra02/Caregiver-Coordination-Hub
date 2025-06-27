import React, { useEffect, useState } from 'react';
import { 
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useAuth } from '../contexts/AuthContext';
import { createTask, updateTask } from '../services/taskService';
import { Timestamp } from 'firebase/firestore';

const TaskForm = ({ open, onClose, task = null }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: new Date(),
    priority: 'medium',
    completed: false,
  });

  // ✅ Sync with task prop
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate?.toDate
          ? task.dueDate.toDate()
          : new Date(task.dueDate || Date.now()),
        priority: task.priority || 'medium',
        completed: task.completed || false
      });
    } else {
      // Reset on fresh task
      setFormData({
        title: '',
        description: '',
        dueDate: new Date(),
        priority: 'medium',
        completed: false
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      dueDate: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!user) throw new Error('User not authenticated');

      const taskData = {
        ...formData,
        userId: user.uid,
        dueDate: Timestamp.fromDate(new Date(formData.dueDate)),
      };

      if (task) {
        await updateTask(task.id, taskData);
      } else {
        await createTask(taskData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              name="title"
              label="Task Title"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              size="small"
            />
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              size="small"
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Due Date and Time"
                value={formData.dueDate}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField {...params} fullWidth variant="outlined" size="small" />
                )}
              />
            </LocalizationProvider>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="outlined" size="small">
            Cancel
          </Button>
          <Button type="submit" variant="contained" size="small">
            {task ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskForm;
