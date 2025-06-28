import React from 'react';
import { testReminder, testWeeklySummary } from '../services/testReminderService';

const TestReminder = () => {
  const handleTestReminder = async () => {
    try {
      const task = await testReminder({
        title: 'Test Task',
        description: 'This is a test task',
        dueDate: Date.now() + 3600000 // 1 hour from now
      });
      console.log('Test task created:', task);
    } catch (error) {
      console.error('Test reminder failed:', error);
      alert('Test reminder failed. Check console for details.');
    }
  };

  const handleTestWeeklySummary = async () => {
    try {
      const tasks = await testWeeklySummary();
      console.log('Test weekly summary created:', tasks);
    } catch (error) {
      console.error('Test weekly summary failed:', error);
      alert('Test weekly summary failed. Check console for details.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Reminder System Test</h2>
      <button 
        onClick={handleTestReminder}
        style={{
          padding: '10px 20px',
          margin: '10px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Task Reminder
      </button>
      
      <button 
        onClick={handleTestWeeklySummary}
        style={{
          padding: '10px 20px',
          margin: '10px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Weekly Summary
      </button>

      <p style={{ marginTop: '20px' }}>
        1. Click "Test Task Reminder" to create a test task that will trigger notifications:
        <ul>
          <li>Immediate notification</li>
          <li>Scheduled notification (5 seconds later)</li>
        </ul>
      </p>
      
      <p>
        2. Click "Test Weekly Summary" to test the weekly summary notification with sample tasks
      </p>
      
      <p>
        Note: You may need to grant notification permissions when prompted by your browser
      </p>
    </div>
  );
};

export default TestReminder;
