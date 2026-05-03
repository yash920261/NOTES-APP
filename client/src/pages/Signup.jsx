import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const [form, setForm] = useState({ displayName: '', username: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signup(form.username.trim(), form.email.trim(), form.password, form.displayName.trim())
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="subtitle">Start organizing your ideas in seconds</p>

        {error && <div className="alert error show">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input type="text" id="displayName" className="form-input" placeholder="John Doe"
              value={form.displayName} onChange={update('displayName')} autoFocus />
          </div>
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input type="text" id="username" className="form-input" placeholder="johndoe"
              value={form.username} onChange={update('username')} required minLength="3" maxLength="30"
              pattern="[a-zA-Z0-9_]+" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input type="email" id="email" className="form-input" placeholder="you@example.com"
              value={form.email} onChange={update('email')} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <div className="password-wrapper">
              <input type={showPass ? 'text' : 'password'} id="password" className="form-input"
                placeholder="Min 6 characters" value={form.password} onChange={update('password')}
                required minLength="6" />
              <button type="button" className="password-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? <span className="spinner" style={{ display: 'block' }}></span> : 'Create account'}
          </button>
        </form>

        <div className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  )
}
