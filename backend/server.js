const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const errorMiddleware = require('./middlewares/error');

const app = express();
const PORT = process.env.PORT || 8080;

// CORS configuration - MUST BE FIRST, before any other middleware
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
}));

// Pre-flight requests
app.options('*', cors());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'} - User-Agent: ${req.headers['user-agent']?.substring(0, 50) || 'No user-agent'}`);
  next();
});

// Security middleware - AFTER CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable CSP for development
}));

// Rate limiting - Disabled for development
// const limiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute
//   max: 10000, // limit each IP to 10000 requests per minute (very high for dev)
//   message: 'Too many requests from this IP, please try again later.',
//   standardHeaders: true,
//   legacyHeaders: false,
//   skipSuccessfulRequests: true, // Don't count successful requests
//   skipFailedRequests: false     // Count failed requests
// });
// app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET || 'default-secret'));

// Cookie configuration for cross-origin - simplified
app.use((req, res, next) => {
  // Add a helper method for setting cookies with proper options
  res.setCookie = function(name, value, options = {}) {
    const cookieOptions = {
      ...options,
      path: '/',
      sameSite: 'lax',
      httpOnly: options.httpOnly !== false,
      secure: false, // Force false for development
      domain: undefined // Allow cross-origin
    };
    
    return this.cookie(name, value, cookieOptions);
  };
  
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Fallback callback route for Spotify (in case it redirects to root)
app.get('/', (req, res) => {
  const { code, state, error } = req.query;
  
  if (code) {
    // Spotify callback received at root, redirect to proper callback route
    console.log('Spotify callback received at root, redirecting to /auth/callback');
    res.redirect(`/auth/callback?code=${code}&state=${state || ''}`);
  } else if (error) {
    // Spotify error received at root, redirect to frontend with error
    console.log('Spotify error received at root:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  } else {
    // Just root access, redirect to frontend
    res.redirect(process.env.FRONTEND_URL);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test CORS endpoint
app.get('/test-cors', (req, res) => {
  res.status(200).json({ 
    message: 'CORS test successful', 
    origin: req.headers.origin,
    timestamp: new Date().toISOString() 
  });
});

// Global error handling middleware
app.use(errorMiddleware);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔗 Spotify Redirect URI: ${process.env.REDIRECT_URI}`);
  console.log(`🌍 Server accessible at:`);
  console.log(`   - http://127.0.0.1:${PORT}`);
  console.log(`   - http://localhost:${PORT}`);
  console.log(`   - http://172.21.74.86:${PORT}`);
});

module.exports = app;
