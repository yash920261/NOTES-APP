import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="logo">NOTES APP</Link>
      <div className="nav-links">
        {user ? (
          <>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Hey, {user.displayName || user.username}
            </span>
            <Link to="/dashboard" className="btn btn-secondary btn-sm">Dashboard</Link>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  )
}
