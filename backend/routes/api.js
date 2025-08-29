const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const apiController = require('../controllers/apiController');

const router = express.Router();

// Apply authentication middleware to all API routes
router.use(authenticateToken);

// User profile
router.get('/me', apiController.getMe);

// Top content
router.get('/top/tracks', apiController.getTopTracks);
router.get('/top/artists', apiController.getTopArtists);

// Playlists
router.get('/playlists', apiController.getPlaylists);
router.post('/playlists', apiController.createPlaylist);
router.post('/playlists/:playlistId/tracks', apiController.addTracksToPlaylist);

// Audio features
router.get('/audio-features', apiController.getAudioFeatures);

// Recently played
router.get('/recently-played', apiController.getRecentlyPlayed);

// Search
router.get('/search/tracks', apiController.searchTracks);

// Track details
router.get('/tracks/:trackId', apiController.getTrack);

module.exports = router;
