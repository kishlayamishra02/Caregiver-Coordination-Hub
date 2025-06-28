import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { doc, getDoc, query, where, collection, onSnapshot } from 'firebase/firestore';

const scheduledReminders = new Set();

// Helper function to show notifications
const showNotification = (title, body, type) => {
  try {
    if (Notification.permission === 'granted') {
      console.log('Showing notification:', title, body);
      new Notification(title, {
        body,
        icon: '/logo192.png'
      });
    } else {
      console.log('Notification permission not granted');
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

// Function to schedule reminders with timeouts
const scheduleReminder = (item, dueDate, type) => {
  const id = `${type}-${item.id}`;
  if (scheduledReminders.has(id)) {
    console.log('Reminder already scheduled:', id);
    return;
  }

  console.log('Scheduling reminder for:', item.title, 'due at:', dueDate);

  const now = new Date();
  const timeUntilDue = dueDate - now;

  if (timeUntilDue > 0) {
    // Schedule 5 min, 1 min, and at due
    const timeouts = [
      { label: '5-min', offset: 5 * 60 * 1000 },
      { label: '1-min', offset: 1 * 60 * 1000 },
      { label: 'due-now', offset: 0 }
    ];

    timeouts.forEach(({ label, offset }) => {
      const timeToTrigger = dueDate - offset - now;

      if (timeToTrigger > 0) {
        console.log('Scheduling', label, 'notification in', timeToTrigger/1000, 'seconds');
        setTimeout(() => {
          console.log('Triggering', label, 'notification for:', item.title);
          showNotification(
            `${type === 'task' ? 'Task' : 'Note'} Reminder: ${item.title}`,
            `This ${type} is due ${label.replace('-', ' ')}: ${dueDate.toLocaleString()}`,
            label
          );
        }, timeToTrigger);
      }
    });

    scheduledReminders.add(id);
  }
};

export const initializeReminderService = async () => {
  const auth = getAuth();
  
  try {
    // Request permission for notifications
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted');
    } else {
      console.log('Notification permission denied');
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
};

export const startReminderListener = () => {
  const auth = getAuth();
  
  if (auth.currentUser) {
    const userId = auth.currentUser.uid;
    console.log('Starting reminder listener for user:', userId);

    // Listen for tasks
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', userId), // Changed from assignedTo to userId
      where('completed', '==', false)
    );

    // Listen for notes
    const notesQuery = query(
      collection(db, 'notes'),
      where('userId', '==', userId),
      where('reminderDate', '!=', null),
      where('completed', '==', false)
    );

    // Handle tasks
    onSnapshot(tasksQuery, async (snapshot) => {
      console.log('Task snapshot received:', snapshot.docChanges().length, 'changes');
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const task = change.doc.data();
          console.log('Processing task:', task.title, 'due at:', task.dueDate?.toDate());
          const dueDate = task.dueDate?.toDate();
          
          if (dueDate && !task.completed) {
            scheduleReminder(task, dueDate, 'task');
          }
        }
      });
    });

    // Handle notes
    onSnapshot(notesQuery, async (snapshot) => {
      console.log('Note snapshot received:', snapshot.docChanges().length, 'changes');
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const note = change.doc.data();
          console.log('Processing note:', note.title, 'reminder at:', note.reminderDate?.toDate());
          const reminderDate = note.reminderDate?.toDate();
          
          if (reminderDate && !note.completed) {
            scheduleReminder(note, reminderDate, 'note');
          }
        }
      });
    });
  }
};

export const sendWeeklySummary = async () => {
  const auth = getAuth();
  
  if (auth.currentUser) {
    const userId = auth.currentUser.uid;
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userEmail = userDoc.data().email;
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const tasksSnapshot = await getDocs(
      query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('createdAt', '>=', weekAgo)
      )
    );
    
    const tasks = tasksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate?.toDate()
    }));
    
    // Group tasks by status
    const completedTasks = tasks.filter(t => t.completed);
    const overdueTasks = tasks.filter(t => !t.completed && new Date() > t.dueDate);
    const upcomingTasks = tasks.filter(t => !t.completed && new Date() < t.dueDate);
    
    // Send summary email
    await sendEmailNotification(userEmail, {
      title: 'Weekly Summary',
      description: 'Your weekly task summary',
      completedTasks,
      overdueTasks,
      upcomingTasks
    }, 'summary');
  }
};

const sendEmailNotification = async (email, data, type) => {
  // Implement email sending logic here
};

const sendReminderNotification = async (task, type) => {
  // This function is no longer used, but kept for reference
  const messaging = getMessaging();
  const auth = getAuth();
  
  if (auth.currentUser) {
    try {
      const message = {
        notification: {
          title: `Task Reminder: ${task.title}`,
          body: `This task is due soon: ${task.dueDate.toDate().toLocaleString()}`,
          icon: '/logo192.png'
        },
        data: {
          type: 'task_reminder',
          taskId: task.id,
          userId: auth.currentUser.uid
        }
      };

      // Send message to all devices
      const messagingDevices = await getMessagingDevices(auth.currentUser.uid);
      for (const device of messagingDevices) {
        await messaging.sendToDevice(device.token, message);
      }
    } catch (error) {
      console.error('Error sending reminder notification:', error);
    }
  }
};

const getMessagingDevices = async (userId) => {
  // This function is no longer used, but kept for reference
  const devicesRef = collection(db, 'users', userId, 'devices');
  const snapshot = await getDocs(devicesRef);
  return snapshot.docs.map(doc => ({
    token: doc.data().token,
    platform: doc.data().platform
  }));
};
