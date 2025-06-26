import { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

export default function TaskForm({ onAddTask }) {
  const [task, setTask] = useState({ title: '', date: '' });

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (task.title && task.date) {
      onAddTask(task);
      setTask({ title: '', date: '' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
      <TextField name="title" label="Task Title" value={task.title} onChange={handleChange} fullWidth margin="normal" />
      <TextField name="date" label="Date" type="date" value={task.date} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} margin="normal" />
      <Button type="submit" variant="contained">Add Task</Button>
    </Box>
  );
}