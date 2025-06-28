import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext'; // 

import { initializeReminderService, startReminderListener } from './services/reminderService';

import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import TestReminder from './components/TestReminder';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Notes from './pages/Notes';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SignOut from './pages/SignOut';

function AppRoutes() {
  const { user } = useAuth();

  // Initialize reminder system
  useEffect(() => {
    const initReminders = async () => {
      try {
        await initializeReminderService();
        if (user) {
          startReminderListener();
        }
      } catch (error) {
        console.error('Failed to initialize reminder service:', error);
      }
    };

    initReminders();
  }, [user]);

  return (
    <Router>
      <Routes>
        {/* */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* */}
        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/signout" element={<SignOut />} />
            <Route path="/test-reminder" element={<TestReminder />} />
          </Route>
        </Route>

        {/* */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <CssBaseline />
          <AppRoutes />
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
