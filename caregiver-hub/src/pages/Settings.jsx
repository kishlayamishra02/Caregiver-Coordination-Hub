import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  MenuItem,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Notifications,
  Email,
  CalendarToday,
  Brightness4,
  Brightness7,
  Info,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useThemeContext } from '../contexts/ThemeContext';

export default function Settings() {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useThemeContext();
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    language: 'en',
    timezone: 'Asia/Kolkata',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setSettings(prev => ({
            ...prev,
            ...userDoc.data().settings,
          }));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Failed to load settings');
      }
    };

    if (user) {
      fetchSettings();
    }
  }, [user]);

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // First check if user document exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      // If user document doesn't exist, create it with default settings
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          settings: settings,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        // If user document exists, update it
        await updateDoc(userDocRef, {
          settings: settings,
          updatedAt: new Date(),
        });
      }

      setSuccess('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError('');

      // Delete user from Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        isActive: false,
        deletedAt: new Date(),
      });

      // Delete user from Firebase Auth
      await user.delete();

      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, mt: 2 }}>
        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications}
                  onChange={() => handleToggle('notifications')}
                  color="primary"
                />
              }
              label="App Notifications"
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                  color="primary"
                />
              }
              label="Email Notifications"
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Appearance
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={toggleTheme}
                  color="primary"
                  sx={{
                    '& .MuiSwitch-switchBase': {
                      '&.Mui-checked': {
                        color: '#1976d2',
                      },
                    },
                  }}
                />
              }
              label="Dark Mode"
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid xs={12}>
            <Typography variant="h6" gutterBottom>
              Language & Region
            </Typography>
            <Grid container spacing={3}>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Language"
                  name="language"
                  value={settings.language}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="hi">Hindi</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                </TextField>
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Timezone"
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="Asia/Kolkata">Asia/Kolkata</MenuItem>
                  <MenuItem value="America/New_York">America/New_York</MenuItem>
                  <MenuItem value="Europe/London">Europe/London</MenuItem>
                  <MenuItem value="Australia/Sydney">Australia/Sydney</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Grid>

          <Grid xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
              fullWidth
              sx={{ mb: 2 }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Grid>

          <Grid xs={12}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Info />}
              onClick={() => setDeleteDialogOpen(true)}
              fullWidth
              sx={{ mb: 2 }}
            >
              Delete Account
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action is irreversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
