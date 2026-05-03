import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import NoteModal from '../components/NoteModal'

function timeAgo(dateStr) {
  const s = Math.floor((Date.now() - new Date(dateStr + 'Z').getTime()) / 1000)
  if (s < 60) return 'Just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function Dashboard() {
  const { user, updateProfile, addToast, logout } = useAuth()
  const [notes, setNotes] = useState([])
  const [section, setSection] = useState('notes')
  const [modalNote, setModalNote] = useState(undefined) // undefined = closed, null = new, object = edit
  const [profileForm, setProfileForm] = useState({ displayName: '', email: '', currentPassword: '', newPassword: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')

  const loadNotes = useCallback(async () => {
    try {
      const res = await fetch('/api/notes')
      const data = await res.json()
      setNotes(data.notes || [])
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { loadNotes() }, [loadNotes])

  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        displayName: user.displayName || '',
        email: user.email || '',
      }))
    }
  }, [user])

  const handleSaveNote = async ({ id, title, content, color }) => {
    const res = await fetch(id ? `/api/notes/${id}` : '/api/notes', {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, color }),
    })
    if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
    addToast(id ? 'Note updated' : 'Note created')
    await loadNotes()
  }

  const handleDeleteNote = async (id) => {
    const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
    addToast('Note deleted')
    await loadNotes()
  }

  const handleTogglePin = async (e, id) => {
    e.stopPropagation()
    await fetch(`/api/notes/${id}/pin`, { method: 'PUT' })
    addToast('Pin toggled')
    await loadNotes()
  }

  const handleDeleteClick = (e, id) => {
    e.stopPropagation()
    // Quick-delete from card button
    if (confirm('Delete this note?')) {
      handleDeleteNote(id)
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError('')
    try {
      await updateProfile(profileForm)
      setProfileForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }))
    } catch (err) {
      setProfileError(err.message)
    } finally {
      setProfileLoading(false)
    }
  }

  const initial = (user?.displayName || user?.username || '?')[0].toUpperCase()
  const pinnedCount = notes.filter(n => n.pinned).length

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="user-info">
          <div className="avatar" style={{ background: user?.avatarColor }}>{initial}</div>
          <div className="user-details">
            <h3>{user?.displayName || user?.username}</h3>
            <p>@{user?.username}</p>
          </div>
        </div>

        <button className={`nav-item ${section === 'notes' ? 'active' : ''}`}
          onClick={() => setSection('notes')}>📝 My Notes</button>
        <button className={`nav-item ${section === 'profile' ? 'active' : ''}`}
          onClick={() => setSection('profile')}>👤 Profile</button>
        <div className="nav-spacer"></div>
        <button className="nav-item" style={{ color: 'var(--error)' }} onClick={logout}>🚪 Log out</button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* ===== NOTES SECTION ===== */}
        {section === 'notes' && (
          <section>
            <div className="page-header">
              <div>
                <h2>My Notes</h2>
                <p>{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
              </div>
              <button className="btn btn-primary" onClick={() => setModalNote(null)}>+ New Note</button>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-label">TOTAL NOTES</div>
                <div className="stat-value">{notes.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📌</div>
                <div className="stat-label">PINNED</div>
                <div className="stat-value">{pinnedCount}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔐</div>
                <div className="stat-label">LOGINS</div>
                <div className="stat-value">{user?.stats?.logins || 0}</div>
              </div>
            </div>

            {notes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No notes yet</h3>
                <p>Create your first note to get started!</p>
              </div>
            ) : (
              <div className="notes-grid">
                {notes.map(n => (
                  <div key={n.id} className="note-card" onClick={() => setModalNote(n)}>
                    <div className="note-color-bar" style={{ background: n.color }}></div>
                    {n.pinned ? <span className="pin-badge">📌</span> : null}
                    <h3>{n.title}</h3>
                    <p>{n.content}</p>
                    <div className="note-meta">
                      <span>{timeAgo(n.updated_at)}</span>
                      <div className="note-actions">
                        <button className="btn-icon" style={{ width: 30, height: 30 }}
                          onClick={(e) => handleTogglePin(e, n.id)} title={n.pinned ? 'Unpin' : 'Pin'}>📌</button>
                        <button className="btn-icon" style={{ width: 30, height: 30 }}
                          onClick={(e) => handleDeleteClick(e, n.id)} title="Delete">🗑</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ===== PROFILE SECTION ===== */}
        {section === 'profile' && (
          <section>
            <div className="page-header"><div><h2>Profile</h2><p>Manage your account settings</p></div></div>
            <div className="profile-section">
              <div className="profile-header">
                <div className="big-avatar" style={{ background: user?.avatarColor }}>{initial}</div>
                <div className="profile-info">
                  <h2>{user?.displayName || user?.username}</h2>
                  <p>Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="profile-form">
                <h3>Edit Profile</h3>
                {profileError && <div className="alert error show">{profileError}</div>}
                <form onSubmit={handleProfileSubmit}>
                  <div className="form-group">
                    <label>Display Name</label>
                    <input type="text" className="form-input" value={profileForm.displayName}
                      onChange={e => setProfileForm(p => ({ ...p, displayName: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" className="form-input" value={profileForm.email}
                      onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Current Password (for password change)</label>
                    <input type="password" className="form-input" placeholder="Leave blank to keep current"
                      value={profileForm.currentPassword}
                      onChange={e => setProfileForm(p => ({ ...p, currentPassword: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input type="password" className="form-input" placeholder="Min 6 characters"
                      value={profileForm.newPassword}
                      onChange={e => setProfileForm(p => ({ ...p, newPassword: e.target.value }))} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                    {profileLoading ? <span className="spinner" style={{ display: 'block' }}></span> : 'Save Changes'}
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Note Modal */}
      {modalNote !== undefined && (
        <NoteModal note={modalNote} onClose={() => setModalNote(undefined)}
          onSave={handleSaveNote} onDelete={handleDeleteNote} />
      )}
    </div>
  )
}
