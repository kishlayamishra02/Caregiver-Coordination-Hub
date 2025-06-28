import { initializeReminderService, startReminderListener } from './reminderService';

export const testReminder = async (taskData) => {
  try {
    // Initialize the reminder service
    await initializeReminderService();
    
    // Test notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Create a test task with a specific due date
    const testTask = {
      title: taskData.title || 'Test Task',
      description: taskData.description || 'This is a test task',
      dueDate: new Date(taskData.dueDate || Date.now() + 3600000), // Default to 1 hour from now
      userId: 'test-user-id'
    };

    // Simulate task creation
    console.log('Testing reminder with task:', testTask);
    
    // Show immediate notification
    showNotification(
      `Test Reminder: ${testTask.title}`,
      `This is a test notification. The task is due at ${testTask.dueDate.toLocaleString()}`,
      'test'
    );

    // Schedule a notification for 5 seconds from now
    setTimeout(() => {
      showNotification(
        `Test Reminder: ${testTask.title}`,
        `Reminder scheduled notification. The task is due at ${testTask.dueDate.toLocaleString()}`,
        'test-scheduled'
      );
    }, 5000);

    return testTask;
  } catch (error) {
    console.error('Test reminder error:', error);
    throw error;
  }
};

// Helper function to show notifications
const showNotification = (title, body, type) => {
  try {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/logo192.png',
        tag: type
      });
    }
  } catch (error) {
    console.error('Error showing test notification:', error);
  }
};

// Test weekly summary
export const testWeeklySummary = async () => {
  try {
    // Create some test tasks
    const testTasks = [
      {
        title: 'Test Task 1',
        description: 'Completed task',
        completed: true,
        dueDate: new Date(Date.now() - 86400000) // Yesterday
      },
      {
        title: 'Test Task 2',
        description: 'Upcoming task',
        completed: false,
        dueDate: new Date(Date.now() + 86400000) // Tomorrow
      },
      {
        title: 'Test Task 3',
        description: 'Overdue task',
        completed: false,
        dueDate: new Date(Date.now() - 86400000) // Yesterday
      }
    ];

    // Show summary notification
    showNotification(
      'Test Weekly Summary',
      `Tasks this week:\n\n` +
      `Completed: ${testTasks.filter(t => t.completed).length}\n` +
      `Upcoming: ${testTasks.filter(t => !t.completed && t.dueDate > Date.now()).length}\n` +
      `Overdue: ${testTasks.filter(t => !t.completed && t.dueDate < Date.now()).length}`,
      'test-summary'
    );

    return testTasks;
  } catch (error) {
    console.error('Test weekly summary error:', error);
    throw error;
  }
};
