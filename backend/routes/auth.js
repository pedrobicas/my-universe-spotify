const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/login', authController.login);

router.get('/callback', authController.callback);

router.post('/refresh_token', authController.refreshToken);

router.post('/logout', authController.logout);

router.get('/check', authController.checkAuth);

module.exports = router;
