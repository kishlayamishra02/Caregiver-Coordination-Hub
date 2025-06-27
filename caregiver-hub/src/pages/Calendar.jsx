import { useAuth } from '../contexts/AuthContext';
import CalendarView from '../components/CalendarView';

export default function Calendar() {
  const { user } = useAuth();

  return (
    <div>
      <CalendarView user={user} />
    </div>
  );
}
