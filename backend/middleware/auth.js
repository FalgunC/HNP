// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return next();
  }
  
  // If it's an API request, return JSON
  if (req.path.startsWith('/api')) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }
  
  // Otherwise redirect to login page
  res.redirect('/admin/login');
};

// Middleware to check if user is not authenticated (for login/register pages)
const isNotAuthenticated = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return res.redirect('/admin/dashboard');
  }
  next();
};

module.exports = {
  isAuthenticated,
  isNotAuthenticated
};

