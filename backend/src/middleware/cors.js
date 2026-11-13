const cors = require('cors');

/**
 * CORS Configuration for Hilal Takaful Backend
 * Controls authorized origins for API and CMS access
 */
const configureCors = () => {
  const envOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) 
    : [];

  const defaultOrigins = [
    'https://hilaltakaful.com.ng',
    'https://www.hilaltakaful.com.ng',
    'https://admin.hilaltakaful.com.ng',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ];

  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'apikey'],
    credentials: true,
    maxAge: 86400 // 24 hours
  });
};

module.exports = configureCors;

