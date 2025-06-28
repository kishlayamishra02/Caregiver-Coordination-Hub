import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  useTheme,
  styled,
  Grid,
  alpha,
  Badge
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Label,
  Star,
  StarBorder,
  Bookmark,
  BookmarkBorder,
  NoteAdd,
  Folder,
  FilterList,
  Image,
  Description,
  MoreVert,
  CheckCircle
} from '@mui/icons-material';
import { db, storage } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';

// Styled components
const NotesContainer = styled(Box)(({ theme }) => ({
  maxWidth: '1400px',
  margin: '0 auto',
  padding: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const NoteCard = styled(Card)(({ theme, pinned }) => ({
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  borderLeft: `4px solid ${pinned ? theme.palette.secondary.main : theme.palette.primary.main}`,
  boxShadow: theme.shadows[2],
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: pinned 
    ? alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08)
    : theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
}));

const NoteHeader = styled(CardHeader)(({ theme }) => ({
  paddingBottom: 0,
  '& .MuiCardHeader-title': {
    fontWeight: 600,
    fontSize: '1.1rem',
  },
}));

const NoteContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  paddingTop: 0,
  '& .note-description': {
    whiteSpace: 'pre-line',
    color: theme.palette.text.secondary,
    lineHeight: 1.6,
  },
}));

const NoteImage = styled('img')(({ theme }) => ({
  width: '100%',
  borderRadius: '8px',
  marginTop: theme.spacing(2),
  maxHeight: '200px',
  objectFit: 'cover',
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: theme.spacing(6),
  borderRadius: '16px',
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
}));

export default function Notes() {
  const theme = useTheme();
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newContent, setNewContent] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories] = useState([
    'General', 'Medical', 'Medication',
    'Appointments', 'Personal', 'Work'
  ]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [user, selectedCategory, searchTerm]);

  const fetchNotes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const q = query(
        collection(db, 'notes'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedNotes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError('Failed to fetch notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    
    try {
      const storageRef = ref(storage, `note-images/${user.uid}/${Date.now()}`);
      await uploadBytes(storageRef, imageFile);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) {
      setError('Note title is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const payload = {
        title: newNote,
        content: newContent,
        category: selectedCategory || 'General',
        updatedAt: new Date(),
        userId: user.uid,
        imageUrl: imageUrl || null,
      };

      if (editingNote) {
        await updateDoc(doc(db, 'notes', editingNote), payload);
        setSuccess('Note updated successfully!');
      } else {
        await addDoc(collection(db, 'notes'), {
          ...payload,
          createdAt: new Date(),
          isPinned: false,
        });
        setSuccess('Note created successfully!');
      }

      resetForm();
      fetchNotes();
    } catch (error) {
      setError('Failed to save note. Please try again.');
      console.error('Error saving note:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOpenDialog(false);
    setNewNote('');
    setNewContent('');
    setSelectedCategory('');
    setEditingNote(null);
    setImageFile(null);
    setImagePreview('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'notes', noteId));
      setSuccess('Note deleted successfully!');
      fetchNotes();
    } catch (error) {
      setError('Failed to delete note. Please try again.');
      console.error('Error deleting note:', error);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const togglePinNote = async (noteId, isPinned) => {
    try {
      await updateDoc(doc(db, 'notes', noteId), {
        isPinned: !isPinned,
        updatedAt: new Date(),
      });
      fetchNotes();
    } catch (error) {
      setError('Failed to update note. Please try again.');
      console.error('Error updating note:', error);
    }
  };

  const filteredNotes = notes.filter(note => {
    if (selectedTab === 1 && !note.isPinned) return false;
    if (selectedCategory && note.category !== selectedCategory) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        note.category.toLowerCase().includes(searchLower);
    }
    return true;
  });

  return (
    <NotesContainer>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h4" sx={{
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`
            : `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          <NoteAdd fontSize="large" /> My Notes
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setOpenDialog(true);
            setEditingNote(null);
          }}
          sx={{
            borderRadius: '12px',
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: theme.shadows[2],
            '&:hover': {
              boxShadow: theme.shadows[4],
            }
          }}
        >
          Create Note
        </Button>
      </Box>

      {/* Search and Filter */}
      <Card sx={{ mb: 3, borderRadius: '12px' }}>
        <CardContent>
          <Box sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <TextField
              placeholder="Search notes..."
              size="small"
              fullWidth
              sx={{ maxWidth: 400 }}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Search sx={{
                    mr: 1,
                    color: theme.palette.action.active
                  }} />
                ),
                sx: {
                  borderRadius: '12px',
                  background: alpha(theme.palette.primary.main, 0.05)
                }
              }}
            />

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Filter by Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Filter by Category"
                sx={{ borderRadius: '12px' }}
                startAdornment={
                  <FilterList
                    fontSize="small"
                    sx={{
                      position: 'absolute',
                      left: 12,
                      color: theme.palette.action.active
                    }}
                  />
                }
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Folder fontSize="small" /> {category}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        value={selectedTab}
        onChange={(e, newValue) => setSelectedTab(newValue)}
        sx={{
          mb: 3,
          '& .MuiTabs-indicator': {
            height: 4,
            borderRadius: '2px 2px 0 0'
          }
        }}
      >
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BookmarkBorder /> All Notes
            </Box>
          }
          sx={{ textTransform: 'none', fontWeight: 500 }}
        />
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Bookmark /> Pinned
            </Box>
          }
          sx={{ textTransform: 'none', fontWeight: 500 }}
        />
      </Tabs>

      {/* Status Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3, borderRadius: '12px' }}>
          {success}
        </Alert>
      )}

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <EmptyState>
          <img
            src="/empty-notes.svg"
            alt="No notes"
            style={{ width: '200px', opacity: 0.7, marginBottom: theme.spacing(2) }}
          />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            {selectedTab === 1 ? 'No pinned notes yet' : 'No notes found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedTab === 1 
              ? 'Pin important notes to find them easily' 
              : 'Create your first note to get started'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            sx={{ mt: 1 }}
          >
            Create Note
          </Button>
        </EmptyState>
      ) : (
        <Grid container spacing={3}>
          {filteredNotes.map((note) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={note.id}>
              <NoteCard pinned={note.isPinned}>
                <NoteHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {note.title}
                      {note.isPinned && (
                        <Star color="secondary" fontSize="small" />
                      )}
                    </Box>
                  }
                  action={
                    <IconButton
                      onClick={() => togglePinNote(note.id, note.isPinned)}
                      size="small"
                      color={note.isPinned ? 'secondary' : 'default'}
                    >
                      {note.isPinned ? <Star /> : <StarBorder />}
                    </IconButton>
                  }
                />

                <NoteContent>
                  <Typography variant="body2" className="note-description">
                    {note.content}
                  </Typography>

                  {note.imageUrl && (
                    <NoteImage 
                      src={note.imageUrl} 
                      alt="Note attachment" 
                    />
                  )}

                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      label={note.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                      icon={<Folder fontSize="small" />}
                    />
                    <Chip
                      label={note.createdAt?.toLocaleDateString()}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </NoteContent>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  p: 2,
                  gap: 1,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                }}>
                  <Tooltip title="Edit note">
                    <IconButton
                      onClick={() => {
                        setNewNote(note.title);
                        setNewContent(note.content);
                        setSelectedCategory(note.category);
                        setEditingNote(note.id);
                        setImagePreview(note.imageUrl || '');
                        setOpenDialog(true);
                      }}
                      size="small"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete note">
                    <IconButton
                      onClick={() => handleDeleteNote(note.id)}
                      size="small"
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </NoteCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Note Dialog */}
      <Dialog
        open={openDialog}
        onClose={resetForm}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: theme.palette.primary.main,
          color: 'white',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <NoteAdd /> {editingNote ? 'Edit Note' : 'Create New Note'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Note Title"
            fullWidth
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            error={!!error}
            helperText={error}
            sx={{ mb: 2 }}
            InputProps={{
              sx: {
                borderRadius: '8px'
              }
            }}
          />

          <TextField
            margin="dense"
            label="Note Content"
            fullWidth
            multiline
            rows={6}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              sx: {
                borderRadius: '8px'
              }
            }}
          />

          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="note-image-upload"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="note-image-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<Image />}
              sx={{ mb: 2 }}
            >
              Add Image
            </Button>
          </label>

          {imagePreview && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                Image Preview:
              </Typography>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  borderRadius: '8px'
                }}
              />
            </Box>
          )}

          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
              sx={{ borderRadius: '8px' }}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button
            onClick={resetForm}
            sx={{
              borderRadius: '8px',
              px: 3,
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveNote}
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: '8px',
              px: 3,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : editingNote ? (
              'Update Note'
            ) : (
              'Create Note'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </NotesContainer>
  );
}