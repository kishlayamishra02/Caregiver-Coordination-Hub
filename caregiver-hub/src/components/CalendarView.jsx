import {
  Paper, Typography, Grid, Box,
  Button, useTheme, styled
} from '@mui/material';
import {
  format, startOfMonth, addDays, isSameDay, isToday, isTomorrow, isPast, isWeekend, addMonths
} from 'date-fns';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, query, where, getDocs, orderBy, Timestamp
} from 'firebase/firestore';
import {
  Event as EventIcon,
  DoneAll, RadioButtonUnchecked, Error as PriorityError,
  Star as StarIcon, StarBorder as StarBorderIcon,
  ChevronLeft, ChevronRight
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const CalendarDay = styled(Paper)(({ theme, istoday, istomorrow, isweekend, ispast, hastasks }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  minHeight: '160px',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  backgroundColor: istoday 
    ? theme.palette.mode === 'dark' 
      ? 'rgba(156, 39, 176, 0.15)'  // Lighter purple for dark mode
      : 'rgba(156, 39, 176, 0.05)'  // Very subtle purple for light mode
    : istomorrow
      ? theme.palette.mode === 'dark'
        ? theme.palette.grey[800]
        : theme.palette.grey[100]
      : isweekend
        ? theme.palette.mode === 'dark'
          ? theme.palette.grey[900]
          : theme.palette.grey[50]
        : theme.palette.background.paper,
  border: istoday 
    ? `2px solid ${theme.palette.primary.main}`
    : `1px solid ${theme.palette.divider}`,
  boxShadow: istoday ? theme.shadows[2] : theme.shadows[1],
  opacity: ispast && !istoday ? 0.8 : 1,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: istoday ? theme.shadows[6] : theme.shadows[4],
  },
}));

const TaskItem = styled(Box)(({ theme, completed, priority }) => {
  const priorityColor = priority === 'high' ? 'error' : 
                       priority === 'medium' ? 'warning' : 
                       priority === 'low' ? 'success' : 'info';
  
  return {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: completed
      ? theme.palette.mode === 'dark'
        ? theme.palette.success.dark
        : theme.palette.success.light
      : theme.palette.mode === 'dark'
        ? theme.palette[priorityColor].dark
        : theme.palette[priorityColor].light,
    borderLeft: `3px solid ${
      completed 
        ? theme.palette.success.main 
        : theme.palette[priorityColor].main
    }`,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  };
});

export default function CalendarView() {
  const { user } = useAuth();
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);

  if (!user) {
    return <div>Loading user...</div>;
  }

  const days = [...Array(35)].map((_, i) => addDays(startOfMonth(currentMonth), i));

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const startDate = startOfMonth(currentMonth);
      const endDate = addDays(startDate, 35);

      try {
        // Fetch tasks
        const tq = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid),
          where('dueDate', '>=', Timestamp.fromDate(startDate)),
          where('dueDate', '<=', Timestamp.fromDate(endDate)),
          orderBy('dueDate')
        );
        const taskSnap = await getDocs(tq);
        setTasks(taskSnap.docs.map(d => ({ id: d.id, ...d.data(), dueDate: d.data().dueDate.toDate() })));

        // Fetch notes
        const nq = query(
          collection(db, 'notes'),
          where('userId', '==', user.uid),
          where('createdAt', '>=', Timestamp.fromDate(startDate)),
          where('createdAt', '<=', Timestamp.fromDate(endDate)),
          orderBy('createdAt')
        );
        const noteSnap = await getDocs(nq);
        setNotes(noteSnap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt.toDate() })));
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [user, currentMonth]);

  const toggleComplete = async (item, collectionName) => {
    await updateDoc(doc(db, collectionName, item.id), { 
      completed: !item.completed, 
      updatedAt: Timestamp.now() 
    });
    if (collectionName === 'tasks') {
      setTasks(prev => prev.map(t => t.id === item.id ? { ...t, completed: !t.completed } : t));
    } else {
      setNotes(prev => prev.map(n => n.id === item.id ? { ...n, completed: !n.completed } : n));
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1800, margin: '0 auto' }}>
      {/* Month Navigation */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h3" sx={{ 
          fontWeight: 700,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.2
        }}>
          {format(currentMonth, 'MMMM yyyy')}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            startIcon={<ChevronLeft />}
            onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
          >
            Previous
          </Button>
          <Button 
            variant="contained"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button 
            variant="outlined" 
            endIcon={<ChevronRight />}
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            Next
          </Button>
        </Box>
      </Box>

      {/* Weekday Headers */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => (
          <Grid item xs key={day} sx={{ textAlign: 'center' }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600,
                color: theme.palette.text.secondary
              }}
            >
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Days Grid */}
      <Grid container spacing={2}>
        {days.map((day, i) => {
          const dayTasks = tasks.filter(t => isSameDay(t.dueDate, day));
          const dayNotes = notes.filter(n => isSameDay(n.createdAt, day));
          const hasItems = dayTasks.length + dayNotes.length > 0;
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={12/7} key={i}>
              <CalendarDay
                istoday={isToday(day)}
                istomorrow={isTomorrow(day)}
                isweekend={isWeekend(day)}
                ispast={isPast(day) && !isToday(day)}
                hastasks={hasItems}
              >
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1
                }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 600,
                      color: isToday(day) 
                        ? theme.palette.primary.main 
                        : theme.palette.text.primary
                    }}
                  >
                    {isToday(day) ? 'Today' : format(day, 'd')}
                  </Typography>
                  {hasItems && (
                    <Box sx={{ 
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem'
                    }}>
                      {dayTasks.length + dayNotes.length}
                    </Box>
                  )}
                </Box>

                <Box sx={{ 
                  flex: 1,
                  overflowY: 'auto',
                  pr: 0.5,
                  '&::-webkit-scrollbar': {
                    width: 4,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.divider,
                    borderRadius: 2,
                  },
                }}>
                  {dayTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      completed={task.completed}
                      priority={task.priority}
                      onClick={() => toggleComplete(task, 'tasks')}
                    >
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        flex: 1,
                        overflow: 'hidden'
                      }}>
                        {task.completed ? (
                          <DoneAll fontSize="small" color="success" />
                        ) : (
                          <RadioButtonUnchecked fontSize="small" />
                        )}
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            ml: 1,
                            textDecoration: task.completed ? 'line-through' : 'none',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {task.title}
                        </Typography>
                      </Box>
                      {task.priority === 'high' && (
                        <PriorityError fontSize="small" color="error" />
                      )}
                    </TaskItem>
                  ))}

                  {dayNotes.map(note => (
                    <TaskItem
                      key={note.id}
                      completed={note.completed}
                      priority="info"
                      onClick={() => toggleComplete(note, 'notes')}
                    >
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        flex: 1,
                        overflow: 'hidden'
                      }}>
                        {note.completed ? (
                          <StarIcon fontSize="small" color="info" />
                        ) : (
                          <StarBorderIcon fontSize="small" color="info" />
                        )}
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            ml: 1,
                            textDecoration: note.completed ? 'line-through' : 'none',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {note.title}
                        </Typography>
                      </Box>
                    </TaskItem>
                  ))}

                  {!hasItems && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 2,
                        textAlign: 'center',
                        color: theme.palette.text.secondary,
                        fontStyle: 'italic'
                      }}
                    >
                      No tasks or notes
                    </Typography>
                  )}
                </Box>
              </CalendarDay>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}