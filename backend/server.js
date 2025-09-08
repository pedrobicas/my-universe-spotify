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

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:5173', 'http://127.0.0.1:5173'];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
}));

app.options('*', cors());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'} - User-Agent: ${req.headers['user-agent']?.substring(0, 50) || 'No user-agent'}`);
  next();
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cookieParser(process.env.COOKIE_SECRET || 'default-secret'));

app.use((req, res, next) => {
  res.setCookie = function(name, value, options = {}) {
    const cookieOptions = {
      ...options,
      path: '/',
      sameSite: 'lax',
      httpOnly: options.httpOnly !== false,
      secure: false,
      domain: undefined
    };
    
    return this.cookie(name, value, cookieOptions);
  };
  
  next();
});

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  const { code, state, error } = req.query;
  
  if (code) {
    console.log('Spotify callback received at root, redirecting to /auth/callback');
    res.redirect(`/auth/callback?code=${code}&state=${state || ''}`);
  } else if (error) {
    console.log('Spotify error received at root:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  } else {
    res.redirect(process.env.FRONTEND_URL);
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/test-cors', (req, res) => {
  res.status(200).json({ 
    message: 'CORS test successful', 
    origin: req.headers.origin,
    timestamp: new Date().toISOString() 
  });
});

app.use(errorMiddleware);

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`Spotify Redirect URI: ${process.env.REDIRECT_URI}`);
  console.log(`Server accessible at:`);
  console.log(`   - http://127.0.0.1:${PORT}`);
  console.log(`   - http://localhost:${PORT}`);
  console.log(`   - http://172.21.74.86:${PORT}`);
});

module.exports = app;
