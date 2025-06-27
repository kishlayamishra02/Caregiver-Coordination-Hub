import {
  Paper, Typography, Grid, Box,
  Dialog, TextField, IconButton, Tooltip, CircularProgress,
  Checkbox, FormControl, InputLabel, Select, MenuItem, Chip,
  Button, useTheme, styled
} from '@mui/material';
import {
  format, startOfMonth, addDays, isSameDay, isToday, isTomorrow, isPast, isWeekend, addMonths
} from 'date-fns';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, query, where, getDocs,
  addDoc, updateDoc, doc, deleteDoc, orderBy, Timestamp
} from 'firebase/firestore';
import {
  Event as EventIcon,
  DoneAll, RadioButtonUnchecked, Error as PriorityError,
  Label as LabelIcon, Star as StarIcon, StarBorder as StarBorderIcon
} from '@mui/icons-material';

// Styled components
const CalendarDay = styled(Paper)(({ theme, istoday, istomorrow, isweekend, ispast, hastasks }) => ({
  padding: theme.spacing(1),
  borderRadius: '12px',
  minHeight: '140px',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  background: istoday ? '#e3f2fd' : istomorrow ? '#f0f0f0' : isweekend ? '#fafafa' : '#fff',
  border: `1px solid ${istoday ? theme.palette.primary.main : theme.palette.divider}`,
  boxShadow: hastasks && !istoday ? theme.shadows[2] : theme.shadows[1],
  opacity: ispast && !istoday ? 0.6 : 1,
  '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[5] },
}));

const getPaletteColor = (priority) => {
  switch (priority) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'grey';
  }
};

const TaskItem = styled(Box)(({ theme, completed, priority }) => {
  const colorKey = getPaletteColor(priority);
  return {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    borderRadius: '6px',
    backgroundColor: completed
      ? theme.palette.success.light
      : theme.palette[colorKey]?.light || theme.palette.grey[200],
    borderLeft: `3px solid ${
      completed ? theme.palette.success.main : theme.palette[colorKey]?.main || theme.palette.grey[500]
    }`,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  };
});

export default function CalendarView({ user }) {
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);

  const days = [...Array(35)].map((_, i) => addDays(startOfMonth(currentMonth), i));

  useEffect(() => {
    const fetchItems = async () => {
      if (!user) return;
      const startDate = startOfMonth(currentMonth);
      const endDate = addDays(startDate, 35);

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
    };
    fetchItems();
  }, [user, currentMonth]);

  const toggleComplete = async item => {
    await updateDoc(doc(db, item.collection, item.id), { completed: !item.completed, updatedAt: Timestamp.now() });
    if (item.collection === 'tasks') {
      setTasks(prev => prev.map(t => t.id === item.id ? { ...t, completed: !t.completed } : t));
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1600, margin: '0 auto' }}>
      {/* Month Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #2196f3, #ff4081)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {format(currentMonth, 'MMMM yyyy')}
        </Typography>
        <Box>
          <Button onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>Prev</Button>
          <Button variant="contained" sx={{ mx: 1 }} onClick={() => setCurrentMonth(new Date())}>Today</Button>
          <Button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>Next</Button>
        </Box>
      </Box>

      {/* Weekday Headers */}
      <Grid container spacing={2}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => (
          <Grid item xs key={day} sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{day}</Typography>
          </Grid>
        ))}
      </Grid>

      {/* Days Grid */}
      <Grid container spacing={2}>
        {days.map((day, i) => {
          const dayTasks = tasks.filter(t => isSameDay(t.dueDate, day));
          const dayNotes = notes.filter(n => isSameDay(n.createdAt, day));
          return (
            <Grid item xs={12} sm={6} md={4} lg={12/7} key={i}>
              <CalendarDay
                istoday={isToday(day)} istomorrow={isTomorrow(day)}
                isweekend={isWeekend(day)} ispast={isPast(day) && !isToday(day)}
                hastasks={dayTasks.length + dayNotes.length > 0}
              >
                <Typography sx={{ fontWeight: 600, mb: .5 }}>
                  {isToday(day) ? 'Today' : format(day, 'MMM d')}
                </Typography>
                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                  {dayTasks.map(t => (
                    <TaskItem
                      key={t.id} completed={t.completed} variantColor={t.priority}
                      onClick={() => toggleComplete({ ...t, collection: 'tasks' })}
                    >
                      <Checkbox
                        checked={t.completed}
                        icon={<RadioButtonUnchecked fontSize="small" />}
                        checkedIcon={<DoneAll fontSize="small" />}
                        size="small"
                        onClick={e => e.stopPropagation()}
                      />
                      <Typography noWrap sx={{ ml: 1, textDecoration: t.completed ? 'line-through' : 'none' }}>
                        {t.title}
                      </Typography>
                      {t.priority === 'high' && <PriorityError fontSize="small" color="error" sx={{ ml: 'auto' }} />}
                    </TaskItem>
                  ))}
                  {dayNotes.map(n => (
                    <TaskItem
                      key={n.id} completed={false} variantColor="info"
                      onClick={() => toggleComplete({ ...n, collection: 'notes' })}
                    >
                      <Checkbox
                        checked={false}
                        icon={<StarBorderIcon fontSize="small" />}
                        checkedIcon={<StarIcon fontSize="small" />}
                        size="small"
                        onClick={e => e.stopPropagation()}
                      />
                      <EventIcon fontSize="small" color="info" sx={{ ml: 1 }} />
                      <Typography noWrap sx={{ ml: 1 }}>
                        {n.title}
                      </Typography>
                    </TaskItem>
                  ))}
                  {dayTasks.length + dayNotes.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic', textAlign: 'center' }}>No items</Typography>}
                </Box>
              </CalendarDay>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
