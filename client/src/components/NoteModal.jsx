import { useState, useEffect } from 'react'

const COLORS = ['#6C63FF','#FF6584','#43E97B','#F7971E','#00C9FF','#FC5C7D','#6A82FB','#FC466B','#11998E','#38EF7D']

export default function NoteModal({ note, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isEdit = !!note

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setColor(note.color)
    } else {
      setTitle('')
      setContent('')
      setColor(COLORS[Math.floor(Math.random() * COLORS.length)])
    }
  }, [note])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    setLoading(true)
    setError('')
    try {
      await onSave({ id: note?.id, title: title.trim(), content, color })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await onDelete(note.id)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      {showDeleteConfirm ? (
        <div className="modal" style={{ maxWidth: 400, textAlign: 'center' }}>
          <h2>Delete Note?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>This action cannot be undone.</p>
          <div className="modal-actions" style={{ justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>Delete</button>
          </div>
        </div>
      ) : (
        <div className="modal">
          <h2>{isEdit ? 'Edit Note' : 'New Note'}</h2>
          {error && <div className="alert error show">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input type="text" className="form-input" placeholder="Give your note a title"
                value={title} onChange={e => setTitle(e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea className="form-input" rows="5" placeholder="Write something..."
                style={{ resize: 'vertical' }} value={content} onChange={e => setContent(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Color</label>
              <div className="color-picker">
                {COLORS.map(c => (
                  <div key={c} className={`color-swatch ${color === c ? 'active' : ''}`}
                    style={{ background: c }} onClick={() => setColor(c)} />
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              {isEdit && (
                <button type="button" className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>Delete</button>
              )}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" style={{ display: 'block' }}></span> : <span>Save Note</span>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
