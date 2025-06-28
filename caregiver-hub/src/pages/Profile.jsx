import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Grid,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Divider,
  Card,
  CardContent,
  CardHeader,
  useTheme,
  styled,
  alpha,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Work as RoleIcon,
  Language as LanguageIcon,
  Schedule as TimezoneIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  CameraAlt as CameraIcon,
  Check as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';

const ProfileContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1200,
  margin: '0 auto',
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.default,
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: theme.shadows[4],
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(8px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[6],
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 150,
  height: 150,
  fontSize: 60,
  marginBottom: theme.spacing(2),
  border: `4px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    borderColor: theme.palette.primary.main,
    boxShadow: theme.shadows[4],
  },
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: 12,
  marginBottom: theme.spacing(3),
  background: alpha(
    theme.palette.mode === 'dark' 
      ? theme.palette.background.paper 
      : theme.palette.background.default,
    0.9
  ),
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  '& .MuiAlert-icon': {
    color: theme.palette.mode === 'dark' 
      ? theme.palette.primary.light 
      : theme.palette.primary.dark,
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  color: theme.palette.text.primary,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    background: alpha(theme.palette.background.default, 0.7),
    '& fieldset': {
      borderColor: alpha(theme.palette.divider, 0.3),
    },
    '&:hover fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.5),
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: 12,
  background: alpha(theme.palette.background.default, 0.7),
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: alpha(theme.palette.divider, 0.3),
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: alpha(theme.palette.primary.main, 0.5),
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

export default function Profile() {
  const { user } = useAuth();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: 'Testuser',
    email: 'test123@gmail.com',
    role: 'Administrator',
    preferredLanguage: 'English',
    timezone: 'Asia/Kolkata',
    photoURL: ''
  });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUpdating(true);
      
      // First try Firebase Storage upload
      let photoURL;
      try {
        // Get Firebase Storage instance
        const storage = getStorage();
        const storageRef = ref(storage, `profilePhotos/${user.uid}`);
        
        // Upload the file
        await uploadBytes(storageRef, file);
        
        // Get the download URL
        photoURL = await getDownloadURL(storageRef);
      } catch (storageError) {
        console.error('Firebase Storage upload failed:', storageError);
        // If storage upload fails, try a local URL.createObjectURL as fallback
        photoURL = URL.createObjectURL(file);
        console.log('Using local URL as fallback:', photoURL);
      }

      // Update Firebase Auth user's photo URL
      await updateProfile(user, { photoURL });
      
      // Update Firestore with the new photo URL
      await updateDoc(doc(db, 'users', user.uid), { 
        photoURL,
        updatedAt: new Date()
      });
      
      // Update local state
      setFormData(prev => ({ ...prev, photoURL }));
      
      setSuccess('Profile photo updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Photo update error:', error);
      setError('Failed to update photo: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setError('');
      setSuccess('');

      // Update logic would go here
      console.log('Updating profile:', formData);
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ProfileContainer>
      <Typography variant="h4" component="h1" gutterBottom sx={{
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`
          : `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textFillColor: 'transparent',
      }}>
        Personal Information
      </Typography>

      {error && (
        <StyledAlert severity="error" onClose={() => setError('')}>
          {error}
        </StyledAlert>
      )}

      {success && (
        <StyledAlert severity="success" onClose={() => setSuccess('')}>
          {success}
        </StyledAlert>
      )}

      <ProfileCard>
        <CardContent>
          <Grid container spacing={4}>
            {/* Left Side - Avatar and Basic Info */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleAvatarChange}
                />
                <label htmlFor="avatar-upload">
                  <ProfileAvatar
                    src={user?.photoURL || formData.photoURL}
                    sx={{ cursor: 'pointer' }}
                  >
                    {formData.name[0]}
                  </ProfileAvatar>
                </label>
                <Button
                  variant="outlined"
                  component="label"
                  htmlFor="avatar-upload"
                  startIcon={<CameraIcon />}
                  sx={{ 
                    mb: 3,
                    borderRadius: '12px',
                    px: 3,
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    color: theme.palette.text.primary,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    }
                  }}
                  disabled={updating}
                >
                  {updating ? 'Uploading...' : 'Change Photo'}
                </Button>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  {formData.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {formData.role}
                </Typography>
              </Box>
            </Grid>

            {/* Right Side - Form Fields */}
            <Grid item xs={12} md={8}>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <SectionTitle variant="subtitle1">
                      <PersonIcon fontSize="small" /> Full Name
                    </SectionTitle>
                    <StyledTextField
                      fullWidth
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <SectionTitle variant="subtitle1">
                      <EmailIcon fontSize="small" /> Email
                    </SectionTitle>
                    <StyledTextField
                      fullWidth
                      name="email"
                      value={formData.email}
                      disabled
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <SectionTitle variant="subtitle1">
                      <RoleIcon fontSize="small" /> Role
                    </SectionTitle>
                    <FormControl fullWidth>
                      <StyledSelect
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        variant="outlined"
                      >
                        <MenuItem value="Administrator">Administrator</MenuItem>
                        <MenuItem value="Caregiver">Caregiver</MenuItem>
                        <MenuItem value="Family Member">Family Member</MenuItem>
                      </StyledSelect>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <SectionTitle variant="subtitle1">
                      <LanguageIcon fontSize="small" /> Preferred Language
                    </SectionTitle>
                    <FormControl fullWidth>
                      <StyledSelect
                        name="preferredLanguage"
                        value={formData.preferredLanguage}
                        onChange={handleInputChange}
                        variant="outlined"
                      >
                        <MenuItem value="English">English</MenuItem>
                        <MenuItem value="Hindi">Hindi</MenuItem>
                        <MenuItem value="Spanish">Spanish</MenuItem>
                        <MenuItem value="French">French</MenuItem>
                      </StyledSelect>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <SectionTitle variant="subtitle1">
                      <TimezoneIcon fontSize="small" /> Timezone
                    </SectionTitle>
                    <FormControl fullWidth>
                      <StyledSelect
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleInputChange}
                        variant="outlined"
                      >
                        <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
                        <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                        <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                        <MenuItem value="Australia/Sydney">Australia/Sydney (AEST)</MenuItem>
                      </StyledSelect>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ 
                      my: 3,
                      borderColor: alpha(theme.palette.divider, 0.2),
                    }} />
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={updating}
                      startIcon={updating ? <CircularProgress size={20} /> : <SaveIcon />}
                      sx={{ 
                        px: 4,
                        py: 1.5,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        '&:hover': {
                          boxShadow: theme.shadows[4],
                          background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                        },
                        '&.Mui-disabled': {
                          background: alpha(theme.palette.action.disabled, 0.2),
                          color: alpha(theme.palette.text.disabled, 0.8),
                        }
                      }}
                    >
                      {updating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </ProfileCard>
    </ProfileContainer>
  );
}