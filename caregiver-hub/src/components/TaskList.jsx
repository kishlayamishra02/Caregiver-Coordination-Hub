import { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Chip,
  Tooltip,
  Checkbox,
  Avatar,
  Badge,
  useTheme,
  styled
} from '@mui/material';
import {
  Edit,
  Delete,
  PriorityHigh,
  Error,
  CheckCircle,
  TaskAlt,
  RadioButtonUnchecked,
  MoreVert,
  Flag,
  CalendarToday,
  Notes,
  DoneAll,
  AccessTime
} from '@mui/icons-material';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

// Styled components for enhanced UI
const TaskCard = styled(Card)(({ theme, priority, completed }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'all 0.3s ease',
  borderLeft: `4px solid ${theme.palette[getPriorityColor(priority)].main}`,
  boxShadow: theme.shadows[2],
  opacity: completed ? 0.85 : 1,
  background: completed ? theme.palette.action.hover : theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
    '& .task-actions': {
      opacity: 1
    }
  }
}));

const PriorityFlag = styled(Flag)(({ theme, priority }) => ({
  color: theme.palette[getPriorityColor(priority)].main,
  fontSize: '1rem'
}));

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'success';
    default: return 'info';
  }
};

const getPriorityLabel = (priority) => {
  switch (priority) {
    case 'high': return 'High Priority';
    case 'medium': return 'Medium Priority';
    case 'low': return 'Low Priority';
    default: return 'No Priority';
  }
};

export default function TaskList({ tasks, onEdit, onDelete }) {
  const theme = useTheme();
  const [hoveredTask, setHoveredTask] = useState(null);

  const toggleCompletion = async (task) => {
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        completed: !task.completed,
        updatedAt: new Date()
      });
    } catch (err) {
      console.error('Error updating completion:', err);
    }
  };

  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' })
      });
    }
  };

  return (
    <Grid container spacing={3}>
      {tasks.map((task) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={task.id}>
          <TaskCard 
            priority={task.priority}
            completed={task.completed}
            onMouseEnter={() => setHoveredTask(task.id)}
            onMouseLeave={() => setHoveredTask(null)}
          >
            <CardContent sx={{ pb: 1 }}>
              {/* Task Header */}
              <Box 
  display="flex" 
  justifyContent="space-between" 
  alignItems="center" 
  mb={2}
  gap={2}
  flexWrap="wrap"
>

                <Box display="flex" alignItems="center" gap={1.5}>
                  <Tooltip title={getPriorityLabel(task.priority)}>
                    <PriorityFlag priority={task.priority} />
                  </Tooltip>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      textDecoration: task.completed ? 'line-through' : 'none',
                      color: task.completed ? 'text.secondary' : 'text.primary'
                    }}
                  >
                    {task.title}
                  </Typography>
                </Box>
                
                <Chip
                  label={task.priority}
                  size="small"
                  variant="outlined"
                  color={getPriorityColor(task.priority)}
                  sx={{ 
                    textTransform: 'capitalize',
                    borderRadius: '6px',
                    fontWeight: 500
                  }}
                />
              </Box>

              {/* Task Description */}
              {task.description && (
                <Box 
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    mb: 2,
                    pt: 0.5
                  }}
                >
                  <Notes fontSize="small" sx={{ 
                    color: 'text.secondary',
                    mt: '2px'
                  }} />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {task.description}
                  </Typography>
                </Box>
              )}

              {/* Due Date */}
              <Box 
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mt: 2,
                  pt: 1,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}
              >
                <CalendarToday fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Due: {formatDueDate(task.dueDate)}
                </Typography>
                
                {new Date(task.dueDate) < new Date() && !task.completed && (
                  <Chip
                    label="Overdue"
                    size="small"
                    color="error"
                    variant="outlined"
                    icon={<AccessTime fontSize="small" />}
                    sx={{ ml: 'auto', fontSize: '0.65rem' }}
                  />
                )}
              </Box>
            </CardContent>

            {/* Task Actions */}
            <Box 
              className="task-actions"
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 2,
                pb: 1.5,
                pt: 0.5,
                opacity: hoveredTask === task.id ? 1 : 0.7,
                transition: 'opacity 0.2s ease'
              }}
            >
              <Tooltip title={task.completed ? 'Mark incomplete' : 'Mark complete'}>
                <IconButton 
                  onClick={() => toggleCompletion(task)} 
                  size="small"
                  color={task.completed ? 'success' : 'default'}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.success.lighter
                    }
                  }}
                >
                  {task.completed ? (
                    <DoneAll fontSize="small" />
                  ) : (
                    <RadioButtonUnchecked fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              
              <Box display="flex" gap={0.5}>
                <Tooltip title="Edit task">
                  <IconButton 
                    onClick={() => onEdit(task)} 
                    size="small"
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.primary.lighter
                      }
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Delete task">
                  <IconButton 
                    onClick={() => onDelete(task.id)} 
                    size="small"
                    color="error"
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.error.lighter
                      }
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </TaskCard>
        </Grid>
      ))}
    </Grid>
  );
}