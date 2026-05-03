const express = require('express');
const Note = require('../models/Note');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// GET /api/notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ user_id: req.session.userId }).sort({ updated_at: -1 });
    return res.json({ notes });
  } catch (err) {
    console.error('Fetch notes error:', err);
    return res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// POST /api/notes
router.post('/', async (req, res) => {
  try {
    const { title, content, color } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const newNote = await Note.create({
      user_id: req.session.userId,
      title,
      content: content || '',
      color: color || '#6C63FF'
    });

    return res.status(201).json({ message: 'Note created', note: newNote });
  } catch (err) {
    console.error('Create note error:', err);
    return res.status(500).json({ error: 'Failed to create note' });
  }
});

// PUT /api/notes/:id
router.put('/:id', async (req, res) => {
  try {
    const { title, content, color } = req.body;
    const noteId = req.params.id;

    const note = await Note.findOne({ _id: noteId, user_id: req.session.userId });
    if (!note) return res.status(404).json({ error: 'Note not found' });

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (color !== undefined) note.color = color;
    
    await note.save();

    return res.json({ message: 'Note updated', note });
  } catch (err) {
    console.error('Update note error:', err);
    return res.status(500).json({ error: 'Failed to update note' });
  }
});

// PUT /api/notes/:id/pin
router.put('/:id/pin', async (req, res) => {
  try {
    const noteId = req.params.id;
    const note = await Note.findOne({ _id: noteId, user_id: req.session.userId });
    
    if (!note) return res.status(404).json({ error: 'Note not found' });

    note.pinned = !note.pinned;
    await note.save();

    return res.json({ message: note.pinned ? 'Note pinned' : 'Note unpinned', note });
  } catch (err) {
    console.error('Toggle pin error:', err);
    return res.status(500).json({ error: 'Failed to toggle pin' });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const result = await Note.deleteOne({ _id: noteId, user_id: req.session.userId });
    
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Note not found' });

    return res.json({ message: 'Note deleted' });
  } catch (err) {
    console.error('Delete note error:', err);
    return res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
