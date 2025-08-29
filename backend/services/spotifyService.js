const axios = require('axios');

class SpotifyService {
  constructor() {
    this.baseURL = 'https://api.spotify.com/v1';
  }

  // Get user profile
  async getUserProfile(accessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  // Get user's top tracks
  async getTopTracks(accessToken, timeRange = 'short_term', limit = 20) {
    try {
      const response = await axios.get(`${this.baseURL}/me/top/tracks`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          time_range: timeRange,
          limit: limit
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  // Get user's top artists
  async getTopArtists(accessToken, timeRange = 'short_term', limit = 20) {
    try {
      const response = await axios.get(`${this.baseURL}/me/top/artists`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          time_range: timeRange,
          limit: limit
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  // Get user's playlists
  async getUserPlaylists(accessToken, limit = 50) {
    try {
      const response = await axios.get(`${this.baseURL}/me/playlists`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          limit: limit
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  // Create new playlist
  async createPlaylist(accessToken, userId, name, description = '', isPublic = false) {
    try {
      const response = await axios.post(`${this.baseURL}/users/${userId}/playlists`, {
        name,
        description,
        public: isPublic
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  // Add tracks to playlist
  async addTracksToPlaylist(accessToken, playlistId, trackUris) {
    try {
      const response = await axios.post(`${this.baseURL}/playlists/${playlistId}/tracks`, {
        uris: trackUris
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  // Get audio features for tracks
  async getAudioFeatures(accessToken, trackIds) {
    try {
      // Limit track IDs to avoid URL length issues
      const limitedTrackIds = trackIds.slice(0, 50);
      
      const response = await axios.get(`${this.baseURL}/audio-features`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          ids: limitedTrackIds.join(',')
        }
      });
      return response.data;
    } catch (error) {
      // Log the specific error for debugging
      console.error('Audio features error:', error.response?.data || error.message);
      
      // If it's a permissions error, return empty features instead of throwing
      if (error.response?.status === 403) {
        console.warn('Insufficient permissions for audio features, returning empty data');
        return { audio_features: [] };
      }
      
      throw this.handleSpotifyError(error);
    }
  }

  // Get recently played tracks
  async getRecentlyPlayed(accessToken, limit = 20) {
    try {
      const response = await axios.get(`${this.baseURL}/me/player/recently-played`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          limit: limit
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  // Search for tracks
  async searchTracks(accessToken, query, limit = 20) {
    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          q: query,
          type: 'track',
          limit: limit
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  // Get track details
  async getTrack(accessToken, trackId) {
    try {
      const response = await axios.get(`${this.baseURL}/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  // Handle Spotify API errors
  handleSpotifyError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return new Error(`Bad Request: ${data.error?.message || 'Invalid request'}`);
        case 401:
          return new Error('Unauthorized: Invalid or expired token');
        case 403:
          return new Error('Forbidden: Insufficient permissions');
        case 404:
          return new Error('Not Found: Resource not found');
        case 429:
          return new Error('Rate Limited: Too many requests');
        case 500:
          return new Error('Spotify Server Error');
        default:
          return new Error(`Spotify API Error: ${data.error?.message || 'Unknown error'}`);
      }
    }
    
    if (error.request) {
      return new Error('Network Error: Unable to reach Spotify API');
    }
    
    return error;
  }
}

module.exports = new SpotifyService();
