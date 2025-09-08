const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const apiController = require('../controllers/apiController');

const router = express.Router();

router.use(authenticateToken);

router.get('/me', apiController.getMe);
router.get('/me/saved-tracks', apiController.getSavedTracks);
router.get('/me/followed-artists', apiController.getFollowedArtists);
router.get('/me/stats', apiController.getUserStats);

router.get('/top/tracks', apiController.getTopTracks);
router.get('/top/artists', apiController.getTopArtists);

router.get('/artists/:artistId/top-tracks', apiController.getArtistTopTracks);

router.get('/playlists', apiController.getPlaylists);
router.get('/playlists/:playlistId/tracks', apiController.getPlaylistTracks);
router.post('/playlists', apiController.createPlaylist);
router.put('/playlists/:playlistId', apiController.updatePlaylist);
router.delete('/playlists/:playlistId', apiController.deletePlaylist);
router.post('/playlists/:playlistId/tracks', apiController.addTracksToPlaylist);
router.delete('/playlists/:playlistId/tracks', apiController.removeTracksFromPlaylist);
router.put('/playlists/:playlistId/tracks/reorder', apiController.reorderPlaylistTracks);

router.get('/audio-features', apiController.getAudioFeatures);
router.get('/recently-played', apiController.getRecentlyPlayed);
router.get('/now-playing', apiController.getNowPlaying);

router.put('/player/pause', apiController.pausePlayback);
router.put('/player/play', apiController.resumePlayback);
router.put('/player/start', apiController.startPlayback);
router.post('/player/next', apiController.skipToNext);
router.post('/player/previous', apiController.skipToPrevious);
router.get('/player/devices', apiController.getDevices);

router.get('/search/tracks', apiController.searchTracks);
router.get('/search/playlists', apiController.searchPlaylists);
router.get('/tracks/:trackId', apiController.getTrack);
router.get('/playlists/:playlistId/analytics', apiController.getPlaylistAnalytics);
router.get('/recommendations', apiController.getRecommendations);

module.exports = router;
