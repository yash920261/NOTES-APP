import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [loginVal, setLoginVal] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(loginVal.trim(), password)
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
        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to your workspace</p>

        {error && <div className="alert error show">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login">Username or Email</label>
            <input type="text" id="login" className="form-input" placeholder="you@example.com"
              value={loginVal} onChange={e => setLoginVal(e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input type={showPass ? 'text' : 'password'} id="password" className="form-input"
                placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                required minLength="6" />
              <button type="button" className="password-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? <span className="spinner" style={{ display: 'block' }}></span> : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer">Don't have an account? <Link to="/signup">Create one</Link></div>
      </div>
    </div>
  )
}
