import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
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
  Grid,
  Tabs,
  Tab,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField as MuiTextField,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Category,
  Search,
  Label,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { db } from '../firebase';
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
import { useAuth } from '../contexts/AuthContext';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newContent, setNewContent] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(['General', 'Medical', 'Medication', 'Appointments']);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const { user } = useAuth();

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  useEffect(() => {
    fetchNotes();
  }, [user, selectedCategory, searchTerm]);

  const fetchNotes = async () => {
    try {
      const q = query(
        collection(db, 'notes'),
        where('userId', '==', user?.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedNotes = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError('Failed to fetch notes. Please try again.');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !newContent.trim()) return;

    try {
      setLoading(true);
      setError(null);

      await addDoc(collection(db, 'notes'), {
        title: newNote,
        content: newContent,
        category: selectedCategory || 'General',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: user?.uid,
        isPinned: false,
        tags: []
      });

      setOpenDialog(false);
      setNewNote('');
      setNewContent('');
      setSelectedCategory('');
      fetchNotes();
    } catch (error) {
      setError('Failed to add note. Please try again.');
      console.error('Error adding note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = async (noteId, newTitle, newContent) => {
    try {
      setLoading(true);
      setError(null);

      await updateDoc(doc(db, 'notes', noteId), {
        title: newTitle,
        content: newContent,
        updatedAt: new Date(),
      });

      setEditingNote(null);
      fetchNotes();
    } catch (error) {
      setError('Failed to update note. Please try again.');
      console.error('Error updating note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      setLoading(true);
      setError(null);

      await deleteDoc(doc(db, 'notes', noteId));
      fetchNotes();
    } catch (error) {
      setError('Failed to delete note. Please try again.');
      console.error('Error deleting note:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePinNote = async (noteId, isPinned) => {
    try {
      setLoading(true);
      setError(null);

      await updateDoc(doc(db, 'notes', noteId), {
        isPinned: !isPinned,
        updatedAt: new Date(),
      });

      fetchNotes();
    } catch (error) {
      setError('Failed to update note. Please try again.');
      console.error('Error updating note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredNotes = notes.filter(note => {
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Notes
      </Typography>

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search notes..."
            size="small"
            onChange={handleSearch}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1 }} />,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="">All</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Add Note Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note Title"
            fullWidth
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            error={!!error}
            helperText={error}
          />
          <TextField
            margin="dense"
            label="Note Content"
            fullWidth
            multiline
            rows={4}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddNote} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save Note'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notes List */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setOpenDialog(true);
              setNewNote('');
              setNewContent('');
              setSelectedCategory('');
              setEditingNote(null);
            }}
          >
            Add Note
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          sx={{ mb: 2 }}
        >
          <Tab label="All Notes" />
          <Tab label="Pinned" />
        </Tabs>

        <List>
          {filteredNotes
            .filter(note => selectedTab === 1 ? note.isPinned : true)
            .map((note) => (
              <React.Fragment key={note.id}>
                <ListItem
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Pin/Unpin Note">
                        <IconButton
                          onClick={() => togglePinNote(note.id, note.isPinned)}
                          disabled={loading}
                        >
                          {note.isPinned ? <Star /> : <StarBorder />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Note">
                        <IconButton
                          onClick={() => {
                            setNewNote(note.title);
                            setNewContent(note.content);
                            setSelectedCategory(note.category);
                            setEditingNote(note.id);
                            setOpenDialog(true);
                          }}
                          disabled={loading}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Note">
                        <IconButton
                          onClick={() => handleDeleteNote(note.id)}
                          disabled={loading}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={note.title}
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {note.content}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                          <Chip
                            label={note.category}
                            size="small"
                            icon={<Category />}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </React.Fragment>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
        </List>

        {filteredNotes.length === 0 && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No notes found. Create your first note using the button above.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}