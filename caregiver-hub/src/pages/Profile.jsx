import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Avatar,
    Grid,
    TextField,
    Button,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function Profile() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        preferredLanguage: '',
        timezone: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setFormData({
                        name: userDoc.data().name || '',
                        email: user.email || '',
                        role: userDoc.data().role || 'Caregiver',
                        preferredLanguage: userDoc.data().preferredLanguage || 'English',
                        timezone: userDoc.data().timezone || 'Asia/Kolkata',
                    });
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchUserData();
        }
    }, [user]);

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
            setLoading(true);
            setError('');

            await updateDoc(doc(db, 'users', user.uid), {
                name: formData.name,
                role: formData.role,
                preferredLanguage: formData.preferredLanguage,
                timezone: formData.timezone,
                updatedAt: new Date(),
            });

            // Update Firebase Auth display name
            await updateProfile(user, {
                displayName: formData.name,
            });

            // Update user object in AuthContext
            user.updateProfile({
                displayName: formData.name,
            });

        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                Loading...
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Profile Settings
            </Typography>

            <Paper sx={{ p: 3, mt: 2 }}>
                <Grid container spacing={3}>
                    <Grid xs={12} md={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Avatar
                                sx={{
                                    width: 120,
                                    height: 120,
                                    bgcolor: 'primary.main',
                                    mb: 2,
                                }}
                            >
                                {user?.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    user?.displayName?.[0] || 'U'
                                )}
                            </Avatar>
                            <Typography variant="h6" gutterBottom>
                                {user?.displayName}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                {user?.email}
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid xs={12} md={8}>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                <Grid xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Full Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Grid>

                                <Grid xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                    />
                                </Grid>

                                <Grid xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Role</InputLabel>
                                        <Select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            label="Role"
                                        >
                                            <MenuItem value="Caregiver">Caregiver</MenuItem>
                                            <MenuItem value="Family Member">Family Member</MenuItem>
                                            <MenuItem value="Administrator">Administrator</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Preferred Language</InputLabel>
                                        <Select
                                            name="preferredLanguage"
                                            value={formData.preferredLanguage}
                                            onChange={handleInputChange}
                                            label="Preferred Language"
                                        >
                                            <MenuItem value="English">English</MenuItem>
                                            <MenuItem value="Hindi">Hindi</MenuItem>
                                            <MenuItem value="Spanish">Spanish</MenuItem>
                                            <MenuItem value="French">French</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Timezone</InputLabel>
                                        <Select
                                            name="timezone"
                                            value={formData.timezone}
                                            onChange={handleInputChange}
                                            label="Timezone"
                                        >
                                            <MenuItem value="Asia/Kolkata">Asia/Kolkata</MenuItem>
                                            <MenuItem value="America/New_York">America/New_York</MenuItem>
                                            <MenuItem value="Europe/London">Europe/London</MenuItem>
                                            <MenuItem value="Australia/Sydney">Australia/Sydney</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {error && (
                                    <Grid xs={12}>
                                        <Typography color="error" variant="body2">
                                            {error}
                                        </Typography>
                                    </Grid>
                                )}

                                <Grid xs={12}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={loading}
                                        fullWidth
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}
