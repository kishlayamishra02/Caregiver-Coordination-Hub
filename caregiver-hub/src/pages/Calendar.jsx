import { useAuth } from '../contexts/AuthContext';
import CalendarView from '../components/CalendarView';

export default function Calendar() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading user...</div>;
  }

  return (
    <div>
      <CalendarView />
    </div>
  );
}
