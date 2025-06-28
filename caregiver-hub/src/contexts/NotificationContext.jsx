import React, { createContext, useContext, useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Handle fallback notifications from reminder service
  useEffect(() => {
    const handleFallback = (e) => {
      console.log('Handling fallback notification:', e.detail);
      showNotification(e.detail.message, e.detail.severity || 'info');
    };

    window.addEventListener('fallback-snackbar', handleFallback);
    return () => window.removeEventListener('fallback-snackbar', handleFallback);
  }, []);

  const showNotification = (message, severity = 'info') => {
    setNotification({
      message,
      severity: severity.toLowerCase() // Ensure consistent casing
    });
    setSnackbarOpen(true);
  };

  const closeNotification = () => {
    setSnackbarOpen(false);
  };

  // Request notification permission on mount
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        setPermissionGranted(permission === 'granted');
        return permission;
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        setPermissionGranted(false);
        return 'denied';
      }
    };

    requestPermission();
  }, []);

  const value = {
    notification,
    snackbarOpen,
    permissionGranted,
    showNotification,
    closeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={closeNotification}
          severity={notification?.severity || 'info'}
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
