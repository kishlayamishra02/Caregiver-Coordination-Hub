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
  Avatar,
  Badge,
  useTheme,
  styled
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
  Bookmark,
  BookmarkBorder,
  NoteAdd,
  Folder,
  FilterList
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

// Styled components for enhanced UI
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)'
  }
}));

const NoteCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: '10px',
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  '&.pinned': {
    backgroundColor: theme.palette.primary.lighter,
    borderLeft: `4px solid ${theme.palette.secondary.main}`
  }
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  marginRight: theme.spacing(1),
  borderRadius: '6px',
  fontWeight: 500
}));

export default function Notes() {
  const theme = useTheme();
  const [notes, setNotes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newContent, setNewContent] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([
    'General', 'Medical', 'Medication',
    'Appointments', 'Personal', 'Work'
  ]);
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

  const handleSaveNote = async () => {
    if (!newNote.trim() || !newContent.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const payload = {
        title: newNote,
        content: newContent,
        category: selectedCategory || 'General',
        updatedAt: new Date(),
        userId: user?.uid,
      };

      if (editingNote) {
        await updateDoc(doc(db, 'notes', editingNote), payload);
      } else {
        await addDoc(collection(db, 'notes'), {
          ...payload,
          createdAt: new Date(),
          isPinned: false,
          tags: []
        });
      }

      setOpenDialog(false);
      setNewNote('');
      setNewContent('');
      setSelectedCategory('');
      setEditingNote(null);
      fetchNotes();
    } catch (error) {
      setError('Failed to save note. Please try again.');
      console.error('Error saving note:', error);
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
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4" sx={{
          fontWeight: 700,
          color: theme.palette.primary.dark,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <NoteAdd fontSize="large" /> My Notes
        </Typography>

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
          sx={{
            borderRadius: '8px',
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        >
          Create Note
        </Button>
      </Box>

      {/* Search and Filter Bar */}
      <StyledPaper sx={{ p: 2, mb: 3 }}>
        <Box sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <TextField
            placeholder="Search notes..."
            size="small"
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: '400px' }}
            InputProps={{
              startAdornment: (
                <Search sx={{
                  mr: 1,
                  color: theme.palette.action.active
                }} />
              ),
              sx: {
                borderRadius: '8px'
              }
            }}
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="filter-category-label">Filter by Category</InputLabel>
            <Select
              labelId="filter-category-label"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Filter by Category"
              sx={{ borderRadius: '8px', pl: 4 }} // extra padding left for the icon
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
      </StyledPaper>

      {/* Add Note Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: theme.palette.primary.main,
          color: 'white',
          fontWeight: 600
        }}>
          {editingNote ? 'Edit Note' : 'Create New Note'}
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
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
              sx={{
                borderRadius: '8px'
              }}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{
              borderRadius: '6px',
              px: 2,
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
              borderRadius: '6px',
              px: 3,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : editingNote ? (
              'Update Note'
            ) : (
              'Save Note'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notes List */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': {
              height: '4px',
              borderRadius: '2px'
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
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
          {error}
        </Alert>
      )}

      {filteredNotes.length === 0 ? (
        <StyledPaper sx={{
          p: 4,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <img
            src="/empty-notes.svg"
            alt="No notes"
            style={{ width: '200px', opacity: 0.7 }}
          />
          <Typography variant="h6" color="text.secondary">
            {selectedTab === 1 ?
              'No pinned notes yet' :
              'No notes found. Create your first note!'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            sx={{ mt: 2 }}
          >
            Create Note
          </Button>
        </StyledPaper>
      ) : (
        <List sx={{ display: 'grid', gap: 2 }}>
          {filteredNotes
            .filter(note => selectedTab === 1 ? note.isPinned : true)
            .map((note) => (
              <NoteCard
                key={note.id}
                className={note.isPinned ? 'pinned' : ''}
                elevation={2}
              >
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      {note.title}
                      {note.isPinned && (
                        <Star color="secondary" fontSize="small" />
                      )}
                    </Typography>

                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        whiteSpace: 'pre-line',
                        mb: 2
                      }}
                    >
                      {note.content}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <CategoryChip
                        label={note.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={
                          note.createdAt?.toDate().toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        }
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title={note.isPinned ? 'Unpin note' : 'Pin note'}>
                      <IconButton
                        onClick={() => togglePinNote(note.id, note.isPinned)}
                        disabled={loading}
                        size="small"
                        color={note.isPinned ? 'secondary' : 'default'}
                      >
                        {note.isPinned ? <Star /> : <StarBorder />}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit note">
                      <IconButton
                        onClick={() => {
                          setNewNote(note.title);
                          setNewContent(note.content);
                          setSelectedCategory(note.category);
                          setEditingNote(note.id);
                          setOpenDialog(true);
                        }}
                        disabled={loading}
                        size="small"
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete note">
                      <IconButton
                        onClick={() => handleDeleteNote(note.id)}
                        disabled={loading}
                        size="small"
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </NoteCard>
            ))}
        </List>
      )}
    </Box>
  );
}