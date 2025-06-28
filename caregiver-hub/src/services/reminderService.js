import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import {
  doc,
  getDoc,
  query,
  where,
  collection,
  onSnapshot,
  getDocs
} from 'firebase/firestore';

const scheduledReminders = new Map(); // Use Map to track timeouts

// 🔔 Show browser or fallback notification
const showNotification = (title, body, type) => {
  try {
    if (!Notification) {
      console.error('Notification API not supported');
      throw new Error('Notification API not supported in this browser');
    }

    if (Notification.permission === 'denied') {
      console.error('Notifications are blocked');
      throw new Error('Notifications are blocked. Please allow notifications in your browser settings.');
    }

    if (Notification.permission === 'granted') {
      console.log('🔔 Showing browser notification:', title);
      new Notification(title, {
        body,
        icon: '/logo192.png',
        tag: type,
        requireInteraction: true,
        data: { type }
      });
    } else {
      console.warn('[Reminder] Browser notifications not allowed, falling back to snackbar');
      window.dispatchEvent(new CustomEvent('fallback-snackbar', {
        detail: {
          message: `${title} - ${body}`,
          severity: 'info'
        }
      }));
    }
  } catch (error) {
    console.error('⚠️ Error showing notification:', error);
    window.dispatchEvent(new CustomEvent('fallback-snackbar', {
      detail: {
        message: `Notification failed: ${error.message}`,
        severity: 'error'
      }
    }));
  }
};

// Test reminder for debugging
export const testReminder = () => {
  console.log('🧪 Testing reminder system...');
  
  // Test notification permission
  console.log('Permission:', Notification.permission);
  
  // Test browser notification
  showNotification(
    'Test Reminder',
    'This is a test reminder at ' + new Date().toLocaleString(),
    'test'
  );
  
  // Test fallback snackbar
  window.dispatchEvent(new CustomEvent("fallback-snackbar", {
    detail: {
      message: "🔔 This is a test reminder fallback",
      severity: "info"
    }
  }));
};

// ⏰ Schedule reminders at 5 min, 1 min, due-now
export const scheduleReminder = (item, dueDate, type) => {
  const id = `${type}-${item.id}`;
  if (scheduledReminders.has(id)) {
    console.log('⏱️ Reminder already scheduled:', id);
    return;
  }

  console.log('📅 Scheduling reminder for:', item.title, '| Due:', dueDate.toLocaleString());
  const now = Date.now();

  const timeouts = [
    { label: '5-min', offset: 5 * 60 * 1000 },
    { label: '1-min', offset: 1 * 60 * 1000 },
    { label: 'due-now', offset: 0 }
  ];

  const timeoutIds = [];

  timeouts.forEach(({ label, offset }) => {
    const triggerTime = dueDate.getTime() - offset;
    const timeToTrigger = triggerTime - now;

    if (timeToTrigger > 0) {
      console.log(`⏰ Will trigger '${label}' in ${Math.round(timeToTrigger / 1000)}s`);

      const timeoutId = setTimeout(() => {
        console.log(`⏰ Timeout triggered for '${label}' - ${item.title}`);
        console.log(`🔔 Triggering '${label}' for: ${item.title}`);
        showNotification(
          `${type === 'task' ? 'Task' : 'Note'} Reminder: ${item.title}`,
          `This ${type} is due ${label.replace('-', ' ')} at ${dueDate.toLocaleString()}`,
          label
        );
      }, timeToTrigger);

      timeoutIds.push(timeoutId);
    } else if (label === 'due-now' && timeToTrigger > -60 * 1000) {
      // Allow 'due-now' to fire if it's less than 1 minute old
      console.log(`⏰ (Late) Scheduling 'due-now' for: ${item.title} (delayed by 1s)`);
      
      const timeoutId = setTimeout(() => {
        console.log(`⏰ (Late) Triggering 'due-now' for: ${item.title}`);
        showNotification(
          `${type === 'task' ? 'Task' : 'Note'} Reminder: ${item.title}`,
          `This ${type} is due NOW at ${dueDate.toLocaleString()}`,
          'due-now'
        );
      }, 1000); // Small delay to prevent blocking

      timeoutIds.push(timeoutId);
    } else {
      console.log(`❌ Skipping '${label}' for: ${item.title} (already passed)`);
    }
  });

  scheduledReminders.set(id, { timeoutIds });
};

// 🧹 Clear all scheduled timeouts
const cleanupReminders = () => {
  console.log('🧹 Cleaning up all reminders...');
  scheduledReminders.forEach(({ timeoutIds }) => {
    timeoutIds.forEach(clearTimeout);
  });
  scheduledReminders.clear();
  console.log('🧹 All reminders cleaned up');
};

// 🧼 Helper to clear a specific reminder
const cleanupOne = (id) => {
  if (scheduledReminders.has(id)) {
    const { timeoutIds } = scheduledReminders.get(id);
    timeoutIds.forEach(clearTimeout);
    scheduledReminders.delete(id);
    console.log('🧹 Cleared reminder:', id);
  }
};

// 🔁 Check and schedule missed/overdue items
const checkAndTriggerOverdueReminders = async () => {
  const auth = getAuth();
  if (!auth.currentUser) return;

  const userId = auth.currentUser.uid;
  console.log('🔍 Checking overdue reminders for user:', userId);

  try {
    const tasksSnapshot = await getDocs(
      query(collection(db, 'tasks'),
        where('userId', '==', userId),
        where('completed', '==', false))
    );

    const notesSnapshot = await getDocs(
      query(collection(db, 'notes'),
        where('userId', '==', userId),
        where('reminderDate', '!=', null),
        where('completed', '==', false))
    );

    // Tasks
    tasksSnapshot.forEach(doc => {
      const task = { id: doc.id, ...doc.data() };
      const dueDate = task.dueDate?.toDate();
      if (dueDate && !task.completed) {
        scheduleReminder(task, dueDate, 'task');
      }
    });

    // Notes
    notesSnapshot.forEach(doc => {
      const note = { id: doc.id, ...doc.data() };
      const reminderDate = note.reminderDate?.toDate();
      if (reminderDate && !note.completed) {
        scheduleReminder(note, reminderDate, 'note');
      }
    });

  } catch (error) {
    console.error('⚠️ Error checking overdue reminders:', error);
  }
};

// 🤖 Initialize reminder service
export const initializeReminderService = async () => {
  try {
    console.log('🤖 Initializing reminder service...');
    
    // Request notification permission first
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      throw new Error('Notification permission not granted');
    }

    // Start real-time listener
    await startReminderListener();
    
    // Check for overdue reminders
    await checkAndTriggerOverdueReminders();
    
    console.log('✅ Reminder service initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize reminder service:', error);
    throw error;
  }
};

// 📡 Real-time Firestore listeners
export const startReminderListener = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  const userId = user.uid;
  console.log('📡 Starting live reminder listeners for:', userId);

  const tasksQuery = query(
    collection(db, 'tasks'),
    where('userId', '==', userId),
    where('completed', '==', false)
  );

  const notesQuery = query(
    collection(db, 'notes'),
    where('userId', '==', userId),
    where('reminderDate', '!=', null),
    where('completed', '==', false)
  );

  onSnapshot(tasksQuery, snapshot => {
    snapshot.docChanges().forEach(change => {
      const task = { id: change.doc.id, ...change.doc.data() };
      const dueDate = task.dueDate?.toDate();

      if (change.type === 'removed') {
        const id = `task-${task.id}`;
        cleanupOne(id);
      } else if (dueDate && !task.completed) {
        scheduleReminder(task, dueDate, 'task');
      }
    });
  });

  onSnapshot(notesQuery, snapshot => {
    snapshot.docChanges().forEach(change => {
      const note = { id: change.doc.id, ...change.doc.data() };
      const reminderDate = note.reminderDate?.toDate();

      if (change.type === 'removed') {
        const id = `note-${note.id}`;
        cleanupOne(id);
      } else if (reminderDate && !note.completed) {
        scheduleReminder(note, reminderDate, 'note');
      }
    });
  });

  // Optional: clear reminders when closing tab
  window.addEventListener('beforeunload', cleanupReminders);
};

// 🔄 Recheck reminders on tab regain focus
window.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    console.log('🔁 Tab became visible – checking reminders');
    checkAndTriggerOverdueReminders();
  }
});

window.addEventListener('focus', () => {
  console.log('🔁 Tab focused – checking reminders');
  checkAndTriggerOverdueReminders();
});
