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
router.get('/playlists/:playlistId/tracks', apiController.getPlaylistTracks);
router.post('/playlists', apiController.createPlaylist);
router.put('/playlists/:playlistId', apiController.updatePlaylist);
router.delete('/playlists/:playlistId', apiController.deletePlaylist);
router.post('/playlists/:playlistId/tracks', apiController.addTracksToPlaylist);
router.delete('/playlists/:playlistId/tracks', apiController.removeTracksFromPlaylist);
router.put('/playlists/:playlistId/tracks/reorder', apiController.reorderPlaylistTracks);

// Audio features
router.get('/audio-features', apiController.getAudioFeatures);

// Recently played
router.get('/recently-played', apiController.getRecentlyPlayed);

// Currently playing
router.get('/now-playing', apiController.getNowPlaying);

// Search
router.get('/search/tracks', apiController.searchTracks);
router.get('/search/playlists', apiController.searchPlaylists);

// Track details
router.get('/tracks/:trackId', apiController.getTrack);

// Playlist analytics
router.get('/playlists/:playlistId/analytics', apiController.getPlaylistAnalytics);

module.exports = router;
