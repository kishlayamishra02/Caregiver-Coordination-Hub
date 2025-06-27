import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useContext } from "react";
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
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AppContent = () => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Only set up push notifications in production
    if (import.meta.env.NODE_ENV === 'production' && user) {
      try {
        navigator.serviceWorker
          .register('/firebase-messaging-sw.js')
          .then((registration) => {
            console.log("✅ Service worker registered");
            
            // Request notification permission
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                console.log('✅ Notification permission granted');
                
                // Get token
                getToken(messaging, {
                  vapidKey: import.meta.env.VITE_VAPID_KEY,
                  serviceWorkerRegistration: registration,
                }).then((currentToken) => {
                  if (currentToken) {
                    console.log('✅ Current token: ', currentToken);
                  } else {
                    console.log('❌ No registration token available');
                  }
                }).catch((err) => {
                  console.log('❌ Error getting token: ', err);
                });
              } else {
                console.log('❌ Notification permission denied');
              }
            });
          })
          .catch((err) => {
            console.log('❌ Service worker registration failed: ', err);
          });
      } catch (err) {
        console.log('❌ Error setting up messaging: ', err);
      }
    }
  }, [user]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
          <Route path="tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="signout" element={<ProtectedRoute><SignOut /></ProtectedRoute>} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
