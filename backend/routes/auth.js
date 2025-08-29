const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// GET /auth/login - Get Spotify OAuth URL
router.get('/login', authController.login);

// GET /auth/callback - Handle OAuth callback from Spotify
router.get('/callback', authController.callback);

// POST /auth/refresh_token - Refresh access token
router.post('/refresh_token', authController.refreshToken);

// POST /auth/logout - Logout user
router.post('/logout', authController.logout);

// GET /auth/check - Check authentication status
router.get('/check', authController.checkAuth);

module.exports = router;
