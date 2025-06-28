const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

admin.initializeApp();
const db = admin.firestore();

// Create Gmail transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL_USER,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    accessToken: process.env.GMAIL_ACCESS_TOKEN
  }
});

// Function to scan tasks and send notifications
exports.scanTasks = functions.pubsub
  .schedule('every 15 minutes')
  .onRun(async (context) => {
    try {
      // Get all active users
      const usersSnapshot = await db.collection('users').get();
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        
        // Get user's tasks
        const tasksSnapshot = await db.collection('tasks')
          .where('userId', '==', userId)
          .where('completed', '==', false)
          .get();

        // Check each task
        tasksSnapshot.forEach(async (taskDoc) => {
          const task = taskDoc.data();
          const dueDate = task.dueDate.toDate();
          const now = new Date();
          
          // Check for 30-minute due tasks
          if (dueDate - now <= 30 * 60 * 1000 && dueDate - now > 0) {
            await sendEmailNotification(userData.email, task, '30-minute reminder');
          }
          
          // Check for overdue tasks
          if (now - dueDate >= 60 * 60 * 1000) {
            await sendEmailNotification(userData.email, task, 'overdue notification');
          }
        });
      }
      
      // Send weekly summary if it's Monday
      if (new Date().getDay() === 1) {
        await sendWeeklySummary();
      }
      
      return null;
    } catch (error) {
      console.error('Error scanning tasks:', error);
      throw error;
    }
  });

// Function to send email notifications
async function sendEmailNotification(email, task, notificationType) {
  try {
    const mailOptions = {
      from: 'Caregiver Hub <notifications@caregiverhub.com>',
      to: email,
      subject: `Task ${notificationType}: ${task.title}`,
      text: `Your task "${task.title}" is ${notificationType}. Due date: ${task.dueDate.toDate().toLocaleString()}`,
      html: `
        <h2>Task ${notificationType}</h2>
        <p><strong>Title:</strong> ${task.title}</p>
        <p><strong>Due Date:</strong> ${task.dueDate.toDate().toLocaleString()}</p>
        <p><strong>Description:</strong> ${task.description || 'No description'}</p>
        <p><a href="https://your-app-url.com/tasks">View Task</a></p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Sent ${notificationType} to ${email} for task ${task.title}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Function to send weekly summary
async function sendWeeklySummary() {
  try {
    const usersSnapshot = await db.collection('users').get();
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      // Get all tasks for the week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const tasksSnapshot = await db.collection('tasks')
        .where('userId', '==', userId)
        .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(weekAgo))
        .get();

      if (tasksSnapshot.empty) continue;

      // Group tasks by status
      const tasksByStatus = {
        completed: [],
        inProgress: [],
        overdue: []
      };

      tasksSnapshot.forEach(taskDoc => {
        const task = taskDoc.data();
        const dueDate = task.dueDate.toDate();
        const now = new Date();
        
        if (task.completed) {
          tasksByStatus.completed.push(task);
        } else if (dueDate < now) {
          tasksByStatus.overdue.push(task);
        } else {
          tasksByStatus.inProgress.push(task);
        }
      });

      // Send summary email
      const mailOptions = {
        from: 'Caregiver Hub <notifications@caregiverhub.com>',
        to: userData.email,
        subject: 'Your Weekly Task Summary',
        html: generateWeeklySummaryHTML(tasksByStatus)
      };

      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.error('Error sending weekly summary:', error);
  }
}

// Helper function to generate weekly summary HTML
function generateWeeklySummaryHTML(tasks) {
  return `
    <h1>Your Weekly Task Summary</h1>
    
    <h2>Completed Tasks (${tasks.completed.length})</h2>
    <ul>
      ${tasks.completed.map(task => `<li>${task.title}</li>`).join('')}
    </ul>
    
    <h2>In Progress Tasks (${tasks.inProgress.length})</h2>
    <ul>
      ${tasks.inProgress.map(task => `<li>${task.title} - Due: ${task.dueDate.toDate().toLocaleString()}</li>`).join('')}
    </ul>
    
    <h2>Overdue Tasks (${tasks.overdue.length})</h2>
    <ul>
      ${tasks.overdue.map(task => `<li>${task.title} - Due: ${task.dueDate.toDate().toLocaleString()}</li>`).join('')}
    </ul>
    
    <p><a href="https://your-app-url.com/tasks">View All Tasks</a></p>
  `;
}
