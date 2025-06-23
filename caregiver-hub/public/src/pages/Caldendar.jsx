import CalendarView from '../components/CalendarView';

export default function Calendar() {
  const sampleTasks = [
    { title: 'Doctor Visit', date: '2025-06-23' },
    { title: 'Medicine Pickup', date: '2025-06-25' }
  ];

  return <CalendarView tasks={sampleTasks} />;
}