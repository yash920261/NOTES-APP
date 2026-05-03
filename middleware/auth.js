// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
}

// Middleware to redirect logged-in users away from auth pages
function redirectIfAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard.html');
  }
  return next();
}

module.exports = { requireAuth, redirectIfAuth };
