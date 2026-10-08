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

const allowedOrigins = [...new Set([
  ...(process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(','),
  process.env.FRONTEND_URL
].map((origin) => origin?.trim()).filter(Boolean))];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(process.env.COOKIE_SECRET ? cookieParser(process.env.COOKIE_SECRET) : cookieParser());

app.use((req, res, next) => {
  res.setCookie = function setCookie(name, value, options = {}) {
    return this.cookie(name, value, {
      path: '/',
      ...options,
      httpOnly: options.httpOnly !== false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: undefined
    });
  };
  next();
});

// Cookies are intentionally cross-site in production when frontend/backend live on
// different hosts. Reject state-changing browser requests from unknown origins.
app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  return next();
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 180,
  standardHeaders: 'draft-7',
  legacyHeaders: false
});

app.use('/auth', authLimiter, authRoutes);
app.use('/api', apiLimiter, apiRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
});

app.use(errorMiddleware);
app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }));

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`My Universe API listening on port ${PORT}`);
  });
}

module.exports = app;
