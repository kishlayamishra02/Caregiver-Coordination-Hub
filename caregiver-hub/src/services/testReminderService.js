import { initializeReminderService, startReminderListener } from './reminderService';

// Show a browser notification (instant)
const showNotification = (title, body, type = 'info') => {
  try {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/logo192.png',
        tag: type,
      });
    } else {
      console.warn('🔕 Notification permission not granted, falling back');
      window.dispatchEvent(new CustomEvent("fallback-snackbar", {
        detail: {
          message: `${title} - ${body}`,
          severity: 'info'
        }
      }));
    }
  } catch (error) {
    console.error('🚨 Error showing notification:', error);
  }
};

// 🔧 Utility: Manually create a task-like object and schedule
export const testReminder = async () => {
  try {
    await initializeReminderService();

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('❌ Notifications not allowed by browser');
    }

    const dueDate = new Date(Date.now() + 10000); // 10 seconds from now
    const testTask = {
      id: 'test-task-' + Date.now(),
      title: '🧪 Test Reminder',
      description: 'This is a test task reminder',
      dueDate,
      completed: false,
      userId: 'test-user-id'
    };

    console.log(`⏳ Scheduling test reminder: '${testTask.title}'`);
    console.log('🔔 Will trigger in ~10 seconds:', dueDate.toLocaleTimeString());

    // Simulate manual notification now
    showNotification('🔔 Immediate Test', 'This is an instant test notification', 'test-now');

    // Start real-time listener in case it's not active
    startReminderListener();

    // Schedule the reminder manually (like a real task)
    const scheduleReminder = (await import('./reminderService')).scheduleReminder;
    scheduleReminder(testTask, dueDate, 'task');

    return testTask;

  } catch (error) {
    console.error('🚫 testReminder failed:', error.message);
    throw error;
  }
};

// 🔁 Simulate a summary notification
export const testWeeklySummary = async () => {
  try {
    const now = Date.now();

    const testTasks = [
      { title: '✅ Done Task', completed: true, dueDate: new Date(now - 2 * 86400000) },
      { title: '🕒 Upcoming Task', completed: false, dueDate: new Date(now + 2 * 86400000) },
      { title: '⚠️ Overdue Task', completed: false, dueDate: new Date(now - 86400000) },
    ];

    showNotification(
      '📊 Test Weekly Summary',
      `Completed: ${testTasks.filter(t => t.completed).length} | ` +
      `Upcoming: ${testTasks.filter(t => !t.completed && t.dueDate > now).length} | ` +
      `Overdue: ${testTasks.filter(t => !t.completed && t.dueDate < now).length}`,
      'summary'
    );

    return testTasks;

  } catch (error) {
    console.error('🚫 testWeeklySummary failed:', error);
    throw error;
  }
};
