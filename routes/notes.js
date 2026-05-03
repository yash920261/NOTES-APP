const express = require('express');
const { get, all, run } = require('../database/init');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/notes
router.get('/', (req, res) => {
  const notes = all('SELECT * FROM notes WHERE user_id = ? ORDER BY pinned DESC, updated_at DESC',
    [req.session.userId]);
  return res.json({ notes });
});

// POST /api/notes
router.post('/', (req, res) => {
  const { title, content, color } = req.body;
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const result = run('INSERT INTO notes (user_id, title, content, color) VALUES (?, ?, ?, ?)',
    [req.session.userId, title.trim(), content || '', color || '#6C63FF']);
  const note = get('SELECT * FROM notes WHERE id = ?', [result.lastInsertRowid]);
  return res.status(201).json({ note });
});

// PUT /api/notes/:id
router.put('/:id', (req, res) => {
  const { title, content, color, pinned } = req.body;
  const noteId = req.params.id;
  const note = get('SELECT * FROM notes WHERE id = ? AND user_id = ?', [noteId, req.session.userId]);
  if (!note) return res.status(404).json({ error: 'Note not found' });

  run('UPDATE notes SET title = ?, content = ?, color = ?, pinned = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [title !== undefined ? title : note.title,
     content !== undefined ? content : note.content,
     color !== undefined ? color : note.color,
     pinned !== undefined ? (pinned ? 1 : 0) : note.pinned,
     noteId]);

  const updated = get('SELECT * FROM notes WHERE id = ?', [noteId]);
  return res.json({ note: updated });
});

// DELETE /api/notes/:id
router.delete('/:id', (req, res) => {
  const noteId = req.params.id;
  const note = get('SELECT * FROM notes WHERE id = ? AND user_id = ?', [noteId, req.session.userId]);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  run('DELETE FROM notes WHERE id = ?', [noteId]);
  return res.json({ message: 'Note deleted' });
});

// PUT /api/notes/:id/pin
router.put('/:id/pin', (req, res) => {
  const noteId = req.params.id;
  const note = get('SELECT * FROM notes WHERE id = ? AND user_id = ?', [noteId, req.session.userId]);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  run('UPDATE notes SET pinned = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [note.pinned ? 0 : 1, noteId]);
  const updated = get('SELECT * FROM notes WHERE id = ?', [noteId]);
  return res.json({ note: updated });
});

module.exports = router;
