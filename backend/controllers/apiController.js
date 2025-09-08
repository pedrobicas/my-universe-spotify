const spotifyService = require('../services/spotifyService');

class ApiController {
  async getMe(req, res) {
    try {
      const userProfile = await spotifyService.getUserProfile(req.accessToken);
      res.json(userProfile);
    } catch (error) {
      console.error('Get user profile error:', error);
      res.status(500).json({ 
        error: 'Failed to get user profile',
        message: error.message 
      });
    }
  }

  async getSavedTracks(req, res) {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const savedTracks = await spotifyService.getSavedTracks(req.accessToken, parseInt(limit), parseInt(offset));
      res.json(savedTracks);
    } catch (error) {
      console.error('Get saved tracks error:', error);
      res.status(500).json({ 
        error: 'Failed to get saved tracks',
        message: error.message 
      });
    }
  }

  async getFollowedArtists(req, res) {
    try {
      const { limit = 20 } = req.query;
      const followedArtists = await spotifyService.getFollowedArtists(req.accessToken, parseInt(limit));
      res.json(followedArtists);
    } catch (error) {
      console.error('Get followed artists error:', error);
      res.status(500).json({ 
        error: 'Failed to get followed artists',
        message: error.message 
      });
    }
  }

  async getUserStats(req, res) {
    try {
      const stats = await spotifyService.getUserStats(req.accessToken);
      res.json(stats);
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({ 
        error: 'Failed to get user statistics',
        message: error.message 
      });
    }
  }

  async getTopTracks(req, res) {
    try {
      const { time_range = 'short_term', limit = 20 } = req.query;
      const topTracks = await spotifyService.getTopTracks(req.accessToken, time_range, parseInt(limit));
      res.json(topTracks);
    } catch (error) {
      console.error('Get top tracks error:', error);
      res.status(500).json({ 
        error: 'Failed to get top tracks',
        message: error.message 
      });
    }
  }

  async getTopArtists(req, res) {
    try {
      const { time_range = 'short_term', limit = 20 } = req.query;
      const topArtists = await spotifyService.getTopArtists(req.accessToken, time_range, parseInt(limit));
      res.json(topArtists);
    } catch (error) {
      console.error('Get top artists error:', error);
      res.status(500).json({ 
        error: 'Failed to get top artists',
        message: error.message 
      });
    }
  }

  async getArtistTopTracks(req, res) {
    try {
      const { artistId } = req.params;
      const { market = 'US' } = req.query;
      const topTracks = await spotifyService.getArtistTopTracks(req.accessToken, artistId, market);
      res.json(topTracks);
    } catch (error) {
      console.error('Get artist top tracks error:', error);
      res.status(500).json({ 
        error: 'Failed to get artist top tracks',
        message: error.message 
      });
    }
  }

  async getPlaylists(req, res) {
    try {
      const { limit = 50 } = req.query;
      const playlists = await spotifyService.getUserPlaylists(req.accessToken, parseInt(limit));
      res.json(playlists);
    } catch (error) {
      console.error('Get playlists error:', error);
      res.status(500).json({ 
        error: 'Failed to get playlists',
        message: error.message 
      });
    }
  }

  async getPlaylistTracks(req, res) {
    try {
      const { playlistId } = req.params;
      const tracks = await spotifyService.getPlaylistTracks(req.accessToken, playlistId);
      res.json(tracks);
    } catch (error) {
      console.error('Get playlist tracks error:', error);
      res.status(500).json({ 
        error: 'Failed to get playlist tracks',
        message: error.message 
      });
    }
  }

  async createPlaylist(req, res) {
    try {
      const { name, description = '', isPublic = false } = req.body;
      
      if (!name) {
        return res.status(400).json({ 
          error: 'Playlist name is required',
          message: 'Please provide a name for the playlist' 
        });
      }

      const playlist = await spotifyService.createPlaylist(
        req.accessToken, 
        req.user.id, 
        name, 
        description, 
        isPublic
      );
      
      res.status(201).json(playlist);
    } catch (error) {
      console.error('Create playlist error:', error);
      res.status(500).json({ 
        error: 'Failed to create playlist',
        message: error.message 
      });
    }
  }

  async updatePlaylist(req, res) {
    try {
      const { playlistId } = req.params;
      const { name, description, public: isPublic, collaborative } = req.body;
      
      if (!name) {
        return res.status(400).json({ 
          error: 'Playlist name is required',
          message: 'Please provide a name for the playlist' 
        });
      }

      const updatedPlaylist = await spotifyService.updatePlaylist(
        req.accessToken, 
        playlistId, 
        { name, description, public: isPublic, collaborative }
      );
      
      res.json(updatedPlaylist);
    } catch (error) {
      console.error('Update playlist error:', error);
      res.status(500).json({ 
        error: 'Failed to update playlist',
        message: error.message 
      });
    }
  }

  async deletePlaylist(req, res) {
    try {
      const { playlistId } = req.params;
      
      await spotifyService.deletePlaylist(req.accessToken, playlistId);
      
      res.json({ message: 'Playlist deleted successfully' });
    } catch (error) {
      console.error('Delete playlist error:', error);
      res.status(500).json({ 
        error: 'Failed to delete playlist',
        message: error.message 
      });
    }
  }

  async addTracksToPlaylist(req, res) {
    try {
      const { playlistId } = req.params;
      const { trackUris } = req.body;
      
      if (!trackUris || !Array.isArray(trackUris) || trackUris.length === 0) {
        return res.status(400).json({ 
          error: 'Track URIs are required',
          message: 'Please provide an array of track URIs' 
        });
      }

      const result = await spotifyService.addTracksToPlaylist(
        req.accessToken, 
        playlistId, 
        trackUris
      );
      
      res.json(result);
    } catch (error) {
      console.error('Add tracks to playlist error:', error);
      res.status(500).json({ 
        error: 'Failed to add tracks to playlist',
        message: error.message 
      });
    }
  }

  async removeTracksFromPlaylist(req, res) {
    try {
      const { playlistId } = req.params;
      const { trackUris } = req.body;
      
      if (!trackUris || !Array.isArray(trackUris) || trackUris.length === 0) {
        return res.status(400).json({ 
          error: 'Track URIs are required',
          message: 'Please provide an array of track URIs to remove' 
        });
      }

      const result = await spotifyService.removeTracksFromPlaylist(
        req.accessToken, 
        playlistId, 
        trackUris
      );
      
      res.json(result);
    } catch (error) {
      console.error('Remove tracks from playlist error:', error);
      res.status(500).json({ 
        error: 'Failed to remove tracks from playlist',
        message: error.message 
      });
    }
  }

  async reorderPlaylistTracks(req, res) {
    try {
      const { playlistId } = req.params;
      const { rangeStart, insertBefore, rangeLength = 1 } = req.body;
      
      if (rangeStart === undefined || insertBefore === undefined) {
        return res.status(400).json({ 
          error: 'Range start and insert before are required',
          message: 'Please provide rangeStart and insertBefore parameters' 
        });
      }

      const result = await spotifyService.reorderPlaylistTracks(
        req.accessToken, 
        playlistId, 
        rangeStart, 
        insertBefore, 
        rangeLength
      );
      
      res.json(result);
    } catch (error) {
      console.error('Reorder playlist tracks error:', error);
      res.status(500).json({ 
        error: 'Failed to reorder playlist tracks',
        message: error.message 
      });
    }
  }

  async getAudioFeatures(req, res) {
    try {
      const { trackIds } = req.query;
      
      if (!trackIds) {
        return res.status(400).json({ 
          error: 'Track IDs are required',
          message: 'Please provide track IDs as comma-separated values' 
        });
      }

  const trackIdsArray = trackIds.split(',').map(id => id.trim());
  console.log('Track IDs recebidos para audio features:', trackIdsArray);
      
      if (trackIdsArray.length === 0) {
        return res.status(400).json({ 
          error: 'Invalid track IDs',
          message: 'Please provide valid track IDs' 
        });
      }

      const audioFeatures = await spotifyService.getAudioFeatures(
        req.accessToken, 
        trackIdsArray
      );
      
      res.json(audioFeatures);
    } catch (error) {
      console.error('Get audio features error:', error);
      
      if (error.message.includes('Insufficient permissions') || error.message.includes('Forbidden')) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          message: 'Your Spotify account does not have permission to access audio features. This feature may require a premium account or additional permissions.',
          details: 'Audio features are only available for certain account types and may require specific scopes in your Spotify app configuration.'
        });
      }
      
      res.status(500).json({ 
        error: 'Failed to get audio features',
        message: error.message 
      });
    }
  }

  async getRecentlyPlayed(req, res) {
    try {
      const { limit = 20 } = req.query;
      const recentlyPlayed = await spotifyService.getRecentlyPlayed(req.accessToken, parseInt(limit));
      res.json(recentlyPlayed);
    } catch (error) {
      console.error('Get recently played error:', error);
      res.status(500).json({ 
        error: 'Failed to get recently played tracks',
        message: error.message 
      });
    }
  }

  async searchTracks(req, res) {
    try {
      const { q, limit = 20 } = req.query;
      
      if (!q) {
        return res.status(400).json({ 
          error: 'Search query is required',
          message: 'Please provide a search query' 
        });
      }

      const searchResults = await spotifyService.searchTracks(
        req.accessToken, 
        q, 
        parseInt(limit)
      );
      
      res.json(searchResults);
    } catch (error) {
      console.error('Search tracks error:', error);
      res.status(500).json({ 
        error: 'Failed to search tracks',
        message: error.message 
      });
    }
  }

  async searchPlaylists(req, res) {
    try {
      const { q, limit = 20 } = req.query;
      
      if (!q) {
        return res.status(400).json({ 
          error: 'Search query is required',
          message: 'Please provide a search query' 
        });
      }

      const searchResults = await spotifyService.searchPlaylists(
        req.accessToken, 
        q, 
        parseInt(limit)
      );
      
      res.json(searchResults);
    } catch (error) {
      console.error('Search playlists error:', error);
      res.status(500).json({ 
        error: 'Failed to search playlists',
        message: error.message 
      });
    }
  }

  async getTrack(req, res) {
    try {
      const { trackId } = req.params;
      
      if (!trackId) {
        return res.status(400).json({ 
          error: 'Track ID is required',
          message: 'Please provide a track ID' 
        });
      }

      const track = await spotifyService.getTrack(req.accessToken, trackId);
      res.json(track);
    } catch (error) {
      console.error('Get track error:', error);
      res.status(500).json({ 
        error: 'Failed to get track details',
        message: error.message 
      });
    }
  }

  async getPlaylistAnalytics(req, res) {
    try {
      const { playlistId } = req.params;
      
      if (!playlistId) {
        return res.status(400).json({ 
          error: 'Playlist ID is required',
          message: 'Please provide a playlist ID' 
        });
      }

      const analytics = await spotifyService.getPlaylistAnalytics(
        req.accessToken, 
        playlistId
      );
      
      res.json(analytics);
    } catch (error) {
      console.error('Get playlist analytics error:', error);
      res.status(500).json({ 
        error: 'Failed to get playlist analytics',
        message: error.message 
      });
    }
  }

  async getNowPlaying(req, res) {
    try {
      const refreshToken = req.cookies.spotify_refresh_token;
      const result = await spotifyService.getNowPlaying(req.accessToken, refreshToken);
      
      if (result.newTokens) {
        this.updateTokenCookies(res, result.newTokens);
      }
      
      if (result.data) {
        res.json(result.data);
      } else {
        res.status(204).send();
      }
    } catch (error) {
      console.error('Get now playing error:', error);
      res.status(500).json({ 
        error: 'Failed to get currently playing track',
        message: error.message 
      });
    }
  }

  updateTokenCookies(res, newTokens) {
    if (newTokens) {
      res.setCookie('spotify_access_token', newTokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: newTokens.expires_in * 1000
      });

      if (newTokens.refresh_token) {
        res.setCookie('spotify_refresh_token', newTokens.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 30 * 24 * 60 * 60 * 1000 
        });
      }
    }
  }

  async pausePlayback(req, res) {
    try {
      const refreshToken = req.cookies.spotify_refresh_token;
      const result = await spotifyService.pausePlayback(req.accessToken, refreshToken);
      
      if (result.newTokens) {
        this.updateTokenCookies(res, result.newTokens);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Pause playback error:', error);
      res.status(500).json({ 
        error: 'Failed to pause playback',
        message: error.message 
      });
    }
  }

  async resumePlayback(req, res) {
    try {
      const refreshToken = req.cookies.spotify_refresh_token;
      const result = await spotifyService.resumePlayback(req.accessToken, refreshToken);
      
      if (result.newTokens) {
        this.updateTokenCookies(res, result.newTokens);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Resume playback error:', error);
      res.status(500).json({ 
        error: 'Failed to resume playback',
        message: error.message 
      });
    }
  }

  async skipToNext(req, res) {
    try {
      const refreshToken = req.cookies.spotify_refresh_token;
      const result = await spotifyService.skipToNext(req.accessToken, refreshToken);
      
      if (result.newTokens) {
        this.updateTokenCookies(res, result.newTokens);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Skip to next error:', error);
      res.status(500).json({ 
        error: 'Failed to skip to next track',
        message: error.message 
      });
    }
  }

  async skipToPrevious(req, res) {
    try {
      const refreshToken = req.cookies.spotify_refresh_token;
      const result = await spotifyService.skipToPrevious(req.accessToken, refreshToken);
      
      if (result.newTokens) {
        this.updateTokenCookies(res, result.newTokens);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Skip to previous error:', error);
      res.status(500).json({ 
        error: 'Failed to skip to previous track',
        message: error.message 
      });
    }
  }

  async startPlayback(req, res) {
    try {
      const refreshToken = req.refreshToken;
      const result = await spotifyService.startPlayback(req.accessToken, refreshToken, req.body);
      
      if (result.newTokens) {
        res.cookie('accessToken', result.newTokens.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: result.newTokens.expires_in * 1000
        });
        
        if (result.newTokens.refresh_token) {
          res.cookie('refreshToken', result.newTokens.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000
          });
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Start playback error:', error);
      res.status(500).json({ 
        error: 'Failed to start playback',
        message: error.message 
      });
    }
  }

  async getDevices(req, res) {
    try {
      const refreshToken = req.refreshToken;
      const result = await spotifyService.getDevices(req.accessToken, refreshToken);
      
      if (result.newTokens) {
        res.cookie('accessToken', result.newTokens.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: result.newTokens.expires_in * 1000
        });
        
        if (result.newTokens.refresh_token) {
          res.cookie('refreshToken', result.newTokens.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000 
          });
        }
      }
      
      res.json(result.devices || result);
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to get devices',
        message: error.message 
      });
    }
  }
  async getRecommendations(req, res) {
    try {
  const recommendations = await spotifyService.getRecommendations(req.accessToken, req.query);
  if (!Array.isArray(recommendations.tracks) || recommendations.tracks.length === 0) {
    return res.json({ ...recommendations, fallback: true });
  }
  res.json(recommendations);
    } catch (error) {
      console.error('Get recommendations error:', error);
      res.status(500).json({ 
        error: 'Failed to get recommendations',
        message: error.message 
      });
    }
  }
}

module.exports = new ApiController();
