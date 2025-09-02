const spotifyService = require('../services/spotifyService');

class ApiController {
  // Get user profile
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

  // Get user's top tracks
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

  // Get user's top artists
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

  // Get user's playlists
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

  // Get playlist tracks
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

  // Create new playlist
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

  // Update playlist
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

  // Delete playlist
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

  // Add tracks to playlist
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

  // Remove tracks from playlist
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

  // Reorder playlist tracks
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

  // Get audio features for tracks
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
      
      // If it's a permissions error, return a more specific message
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

  // Get recently played tracks
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

  // Search tracks
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

  // Search playlists
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

  // Get track details
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

  // Get playlist analytics
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

  // Get currently playing track
  async getNowPlaying(req, res) {
    try {
      const nowPlaying = await spotifyService.getNowPlaying(req.accessToken);
      if (nowPlaying) {
        res.json(nowPlaying);
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
}

module.exports = new ApiController();
