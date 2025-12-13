// API Configuration
// Update this URL to point to your backend server
// For local development: 'http://localhost:3000/api'
// For production: 'https://hnp.onrender.com/api'

// Auto-detect environment - uses localhost for local development, production URL otherwise
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://hnp.onrender.com/api';

