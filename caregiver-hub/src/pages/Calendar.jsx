import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CalendarView from '../components/CalendarView';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

export default function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [searchParams] = useSearchParams();
  const db = getFirestore();

  useEffect(() => {
    const syncIfNeededAndFetchEvents = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const synced = searchParams.get("synced") === "true";

      // Use environment variable for production
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
      const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

      // Sync first if needed
      if (synced) {
        await fetch(`${backendUrl}/unity-link-26935/us-central1/syncCalendarToFirestore?userId=${user.uid}`);
      }

      // Then fetch events
      const eventsRef = collection(db, `users/${user.uid}/calendarEvents`);
      const snapshot = await getDocs(eventsRef);

      const events = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          title: data.summary || "No Title",
          date: data.start?.date || data.start?.dateTime?.split('T')[0] || "2025-01-01",
        };
      });

      setTasks(events);
      console.log("Fetched events from Firestore:", events);

    };

    syncIfNeededAndFetchEvents().catch(console.error);
  }, [searchParams]);

  const syncCalendar = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return;

    await fetch(`${backendUrl}/unity-link-26935/us-central1/syncCalendarToFirestore?userId=${user.uid}`);
    
    // Redirect with ?synced=true
    window.location.href = `${frontendUrl}/calendar?synced=true`;
  };

  return (
    <div>
      <button onClick={syncCalendar} style={{ marginBottom: '1rem' }}>
        Sync Calendar Now
      </button>
      <CalendarView tasks={tasks} />
    </div>
  );
}
