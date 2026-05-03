import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <>
      <section className="hero">
        <div className="hero-badge"><span className="dot"></span> Now with real-time sync</div>
        <h1>Your ideas,<br /><span className="gradient">beautifully organized</span></h1>
        <p>A secure, blazing-fast workspace to capture your thoughts, organize your projects, and stay on top of everything that matters.</p>
        <div className="hero-actions">
          <Link to="/signup" className="btn btn-primary">Start for free →</Link>
          <Link to="/login" className="btn btn-secondary">I have an account</Link>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="icon" style={{ background: 'rgba(108,99,255,0.15)' }}>🔒</div>
          <h3>Secure Authentication</h3>
          <p>Industry-standard bcrypt hashing, session management, and rate limiting keep your account safe.</p>
        </div>
        <div className="feature-card">
          <div className="icon" style={{ background: 'rgba(255,101,132,0.15)' }}>⚡</div>
          <h3>Lightning Fast</h3>
          <p>Built on Node.js with SQLite — instant reads, zero-config database, and sub-millisecond queries.</p>
        </div>
        <div className="feature-card">
          <div className="icon" style={{ background: 'rgba(67,233,123,0.15)' }}>📝</div>
          <h3>Smart Notes</h3>
          <p>Create, color-code, pin, and organize your notes with a beautiful, intuitive interface.</p>
        </div>
      </section>
    </>
  )
}
