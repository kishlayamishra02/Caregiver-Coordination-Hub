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
  Avatar,
  Badge,
  useTheme,
  styled,
  Checkbox,
  alpha
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
  AccessTime,
  ExpandMore,
  Star,
  StarBorder
} from '@mui/icons-material';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

// Styled components for enhanced UI
const TaskCard = styled(Card)(({ theme, priority, completed }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  borderLeft: `4px solid ${theme.palette[getPriorityColor(priority)].main}`,
  boxShadow: theme.shadows[2],
  opacity: completed ? 0.85 : 1,
  background: completed 
    ? theme.palette.mode === 'dark'
      ? alpha(theme.palette.success.dark, 0.15)
      : alpha(theme.palette.success.light, 0.15)
    : theme.palette.background.paper,
  borderRadius: '12px',
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
    borderColor: theme.palette.primary.main,
    '& .task-actions': {
      opacity: 1
    }
  }
}));

const PriorityFlag = styled(Flag)(({ theme, priority }) => ({
  color: theme.palette[getPriorityColor(priority)].main,
  fontSize: '1.2rem'
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

const DueDateBox = styled(Box)(({ theme, overdue }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  padding: theme.spacing(1),
  borderRadius: '8px',
  backgroundColor: overdue 
    ? alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.2 : 0.1)
    : alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.05),
  border: `1px solid ${overdue 
    ? alpha(theme.palette.error.main, 0.3) 
    : alpha(theme.palette.primary.main, 0.2)}`,
  marginTop: theme.spacing(1),
}));

export default function TaskList({ tasks, onEdit, onDelete }) {
  const theme = useTheme();
  const [hoveredTask, setHoveredTask] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);

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

  const toggleExpand = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  return (
    <Grid container spacing={3}>
      {tasks.map((task) => {
        const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;
        const isExpanded = expandedTask === task.id;
        
        return (
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
                  alignItems="flex-start" 
                  mb={2}
                  gap={1}
                >
                  <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                    <Tooltip title={getPriorityLabel(task.priority)}>
                      <PriorityFlag priority={task.priority} />
                    </Tooltip>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed 
                          ? 'text.secondary' 
                          : theme.palette.text.primary,
                        flex: 1
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
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: '24px'
                    }}
                  />
                </Box>

                {/* Task Description */}
                {task.description && (
                  <Box 
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Box 
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1,
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
                          display: isExpanded ? 'block' : '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          flex: 1
                        }}
                      >
                        {task.description}
                      </Typography>
                    </Box>
                    {task.description.length > 100 && (
                      <IconButton
                        size="small"
                        onClick={() => toggleExpand(task.id)}
                        sx={{
                          alignSelf: 'flex-end',
                          mt: -1,
                          color: theme.palette.text.secondary
                        }}
                      >
                        <ExpandMore sx={{
                          transform: isExpanded ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.3s ease'
                        }} />
                      </IconButton>
                    )}
                  </Box>
                )}

                {/* Due Date */}
                <DueDateBox overdue={isOverdue}>
                  <CalendarToday fontSize="small" sx={{ 
                    color: isOverdue 
                      ? theme.palette.error.main 
                      : theme.palette.text.secondary 
                  }} />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: isOverdue 
                        ? theme.palette.error.main 
                        : theme.palette.text.secondary,
                      fontWeight: isOverdue ? 600 : 400
                    }}
                  >
                    Due: {formatDueDate(task.dueDate)}
                  </Typography>
                  
                  {isOverdue && (
                    <Chip
                      label="Overdue"
                      size="small"
                      color="error"
                      variant="filled"
                      icon={<AccessTime fontSize="small" />}
                      sx={{ 
                        ml: 'auto', 
                        fontSize: '0.65rem',
                        height: '20px'
                      }}
                    />
                  )}
                </DueDateBox>
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
                  transition: 'opacity 0.2s ease',
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                }}
              >
                <Tooltip title={task.completed ? 'Mark incomplete' : 'Mark complete'}>
                  <IconButton 
                    onClick={() => toggleCompletion(task)} 
                    size="small"
                    color={task.completed ? 'success' : 'default'}
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.success.main, 0.1)
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
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
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
                          backgroundColor: alpha(theme.palette.error.main, 0.1)
                        }
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={task.starred ? 'Remove star' : 'Add star'}>
                    <IconButton 
                      size="small"
                      color={task.starred ? 'warning' : 'default'}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.warning.main, 0.1)
                        }
                      }}
                    >
                      {task.starred ? (
                        <Star fontSize="small" />
                      ) : (
                        <StarBorder fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </TaskCard>
          </Grid>
        );
      })}
    </Grid>
  );
}