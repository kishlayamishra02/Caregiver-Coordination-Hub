import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';

import { initializeReminderService, startReminderListener } from './services/reminderService';
import { messaging } from './firebase';

// Layouts & Routes
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import TestReminder from './components/TestReminder';

// Pages
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Notes from './pages/Notes';
import Login from './pages/Login';
import Tasks from './pages/Tasks';
import Register from './pages/Register';
import SignOut from './pages/SignOut';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

function App() {
  useEffect(() => {
    const initReminders = async () => {
      try {
        await initializeReminderService();
        startReminderListener();
      } catch (error) {
        console.error('Failed to initialize reminder service:', error);
      }
    };
    initReminders();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <CssBaseline />
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />
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

              {/* Fallback Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
