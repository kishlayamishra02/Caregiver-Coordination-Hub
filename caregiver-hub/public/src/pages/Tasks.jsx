import { useState } from 'react';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { Typography } from '@mui/material';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const addTask = (task) => setTasks([...tasks, task]);

  return (
    <>
      <Typography variant="h5" gutterBottom>Task Scheduler</Typography>
      <TaskForm onAddTask={addTask} />
      <TaskList tasks={tasks} />
    </>
  );
}