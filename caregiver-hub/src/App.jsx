import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { initializeApp } from "firebase/app";
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Notes from './pages/Notes';
import Login from './pages/Login';
import Tasks from './pages/Tasks';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import SignOut from './pages/SignOut';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { messaging } from './firebase';
import { ThemeProvider } from './contexts/ThemeContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default function App() {
  useEffect(() => {
    // Initialize Firebase messaging
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })
      .then((registration) => {
        console.log("✅ Service worker registered");

        // Ask for notification permission
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            getToken(messaging, {
              vapidKey: import.meta.env.VITE_VAPID_KEY,
              serviceWorkerRegistration: registration,
            }).then((currentToken) => {
              if (currentToken) {
                console.log("✅ FCM Token:", currentToken);
              } else {
                console.warn("⚠️ No registration token available.");
              }
            }).catch((err) => {
              console.error("❌ An error occurred while retrieving token. ", err);
            });
          }
        });
      });
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="notes" element={<Notes />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="signout" element={<SignOut />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
