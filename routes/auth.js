const express = require('express');
const bcrypt = require('bcryptjs');
const { get, all, run } = require('../database/init');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const SALT_ROUNDS = 12;

const AVATAR_COLORS = [
  '#6C63FF', '#FF6584', '#43E97B', '#F7971E',
  '#00C9FF', '#FC5C7D', '#6A82FB', '#FC466B',
  '#3F2B96', '#A8C0FF', '#11998E', '#38EF7D'
];

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: 'Username must be 3-30 characters' });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUser) {
      return res.status(409).json({ error: 'Username or email already taken' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const result = run(
      'INSERT INTO users (username, email, password_hash, display_name, avatar_color) VALUES (?, ?, ?, ?, ?)',
      [username, email.toLowerCase(), passwordHash, displayName || username, avatarColor]
    );

    run('INSERT INTO sessions_log (user_id, action, ip_address) VALUES (?, ?, ?)',
      [result.lastInsertRowid, 'signup', req.ip]);

    req.session.userId = result.lastInsertRowid;
    req.session.username = username;

    // Welcome note
    run('INSERT INTO notes (user_id, title, content, color, pinned) VALUES (?, ?, ?, ?, ?)',
      [result.lastInsertRowid, '👋 Welcome to DEKNEK!',
       'This is your personal dashboard. Create, edit, and organize your notes here!', '#6C63FF', 1]);

    return res.status(201).json({
      message: 'Account created successfully',
      user: { id: result.lastInsertRowid, username, email: email.toLowerCase(),
        displayName: displayName || username, avatarColor }
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.status(400).json({ error: 'Username/email and password are required' });
    }

    const user = get('SELECT * FROM users WHERE username = ? OR email = ?', [login, login.toLowerCase()]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    run('INSERT INTO sessions_log (user_id, action, ip_address) VALUES (?, ?, ?)',
      [user.id, 'login', req.ip]);

    req.session.userId = user.id;
    req.session.username = user.username;

    return res.json({
      message: 'Login successful',
      user: { id: user.id, username: user.username, email: user.email,
        displayName: user.display_name, avatarColor: user.avatar_color }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  if (req.session.userId) {
    run('INSERT INTO sessions_log (user_id, action, ip_address) VALUES (?, ?, ?)',
      [req.session.userId, 'logout', req.ip]);
  }
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('deknek.sid');
    return res.json({ message: 'Logged out successfully' });
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = get('SELECT id, username, email, display_name, avatar_color, created_at FROM users WHERE id = ?',
    [req.session.userId]);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const noteCount = get('SELECT COUNT(*) as count FROM notes WHERE user_id = ?', [user.id]);
  const loginCount = get("SELECT COUNT(*) as count FROM sessions_log WHERE user_id = ? AND action = 'login'", [user.id]);

  return res.json({
    user: {
      id: user.id, username: user.username, email: user.email,
      displayName: user.display_name, avatarColor: user.avatar_color,
      createdAt: user.created_at,
      stats: { notes: noteCount.count, logins: loginCount.count }
    }
  });
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { displayName, email, currentPassword, newPassword } = req.body;
    const userId = req.session.userId;
    const user = get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (displayName) {
      run('UPDATE users SET display_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [displayName, userId]);
    }
    if (email && email !== user.email) {
      const emailExists = get('SELECT id FROM users WHERE email = ? AND id != ?', [email.toLowerCase(), userId]);
      if (emailExists) return res.status(409).json({ error: 'Email already in use' });
      run('UPDATE users SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [email.toLowerCase(), userId]);
    }
    if (currentPassword && newPassword) {
      const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!validPassword) return res.status(401).json({ error: 'Current password is incorrect' });
      if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
      const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newHash, userId]);
    }

    const updatedUser = get('SELECT id, username, email, display_name, avatar_color FROM users WHERE id = ?', [userId]);
    return res.json({ message: 'Profile updated', user: updatedUser });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
