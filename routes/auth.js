const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Note = require('../models/Note');
const SessionLog = require('../models/SessionLog');
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

    const emailLower = email.toLowerCase();
    const existingUser = await User.findOne({ $or: [{ username }, { email: emailLower }] });
    if (existingUser) {
      return res.status(409).json({ error: 'Username or email already taken' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const newUser = await User.create({
      username,
      email: emailLower,
      password_hash: passwordHash,
      display_name: displayName || username,
      avatar_color: avatarColor
    });

    await SessionLog.create({ user_id: newUser._id, action: 'signup', ip_address: req.ip });

    req.session.userId = newUser._id;
    req.session.username = newUser.username;

    // Welcome note
    await Note.create({
      user_id: newUser._id,
      title: '👋 Welcome to DEKNEK!',
      content: 'This is your personal dashboard. Create, edit, and organize your notes here!',
      color: '#6C63FF',
      pinned: true
    });

    return res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        displayName: newUser.display_name,
        avatarColor: newUser.avatar_color
      }
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

    const loginLower = login.toLowerCase();
    const user = await User.findOne({ $or: [{ username: login }, { email: loginLower }] });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    await SessionLog.create({ user_id: user._id, action: 'login', ip_address: req.ip });

    req.session.userId = user._id;
    req.session.username = user.username;

    return res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        avatarColor: user.avatar_color
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  if (req.session.userId) {
    await SessionLog.create({ user_id: req.session.userId, action: 'logout', ip_address: req.ip });
  }
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('deknek.sid');
    return res.json({ message: 'Logged out successfully' });
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const noteCount = await Note.countDocuments({ user_id: user._id });
    const loginCount = await SessionLog.countDocuments({ user_id: user._id, action: 'login' });

    return res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        avatarColor: user.avatar_color,
        createdAt: user.created_at,
        stats: { notes: noteCount, logins: loginCount }
      }
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { displayName, email, currentPassword, newPassword } = req.body;
    const userId = req.session.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (displayName) user.display_name = displayName;

    if (email && email.toLowerCase() !== user.email) {
      const emailLower = email.toLowerCase();
      const emailExists = await User.findOne({ email: emailLower, _id: { $ne: userId } });
      if (emailExists) return res.status(409).json({ error: 'Email already in use' });
      user.email = emailLower;
    }

    if (currentPassword && newPassword) {
      const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!validPassword) return res.status(401).json({ error: 'Current password is incorrect' });
      if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
      user.password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    }

    await user.save();

    return res.json({
      message: 'Profile updated',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        avatarColor: user.avatar_color
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
