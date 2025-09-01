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

  // Get playlist tracks
  async getPlaylistTracks(accessToken, playlistId) {
    try {
      const response = await axios.get(`${this.baseURL}/playlists/${playlistId}/tracks`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
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

  // Update playlist
  async updatePlaylist(accessToken, playlistId, updates) {
    try {
      const response = await axios.put(`${this.baseURL}/playlists/${playlistId}`, updates, {
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

  // Delete playlist (Note: Spotify API doesn't support deleting playlists directly)
  // This would need to be implemented differently, perhaps by clearing all tracks
  async deletePlaylist(accessToken, playlistId) {
    try {
      // Get current tracks to remove them all
      const playlist = await axios.get(`${this.baseURL}/playlists/${playlistId}/tracks`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (playlist.data.items && playlist.data.items.length > 0) {
        const trackUris = playlist.data.items.map(item => ({
          uri: item.track.uri
        }));

        // Remove all tracks
        await axios.delete(`${this.baseURL}/playlists/${playlistId}/tracks`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          data: {
            tracks: trackUris
          }
        });
      }

      // Note: We can't actually delete the playlist via API, but we can clear it
      return { message: 'Playlist cleared successfully' };
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

  // Remove tracks from playlist
  async removeTracksFromPlaylist(accessToken, playlistId, trackUris) {
    try {
      const response = await axios.delete(`${this.baseURL}/playlists/${playlistId}/tracks`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          tracks: trackUris.map(uri => ({ uri }))
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  // Reorder playlist tracks
  async reorderPlaylistTracks(accessToken, playlistId, rangeStart, insertBefore, rangeLength = 1) {
    try {
      const response = await axios.put(`${this.baseURL}/playlists/${playlistId}/tracks`, {
        range_start: rangeStart,
        insert_before: insertBefore,
        range_length: rangeLength
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

  // Search for playlists
  async searchPlaylists(accessToken, query, limit = 20) {
    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          q: query,
          type: 'playlist',
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

  // Get playlist analytics (custom implementation)
  async getPlaylistAnalytics(accessToken, playlistId) {
    try {
      // Get playlist details
      const playlistResponse = await axios.get(`${this.baseURL}/playlists/${playlistId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const playlist = playlistResponse.data;
      
      // Get tracks for analysis
      const tracksResponse = await axios.get(`${this.baseURL}/playlists/${playlistId}/tracks`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          limit: 100 // Get up to 100 tracks for analysis
        }
      });

      const tracks = tracksResponse.data.items;
      
      // Calculate analytics
      const analytics = {
        totalTracks: tracks.length,
        totalDuration: tracks.reduce((acc, item) => acc + (item.track?.duration_ms || 0), 0),
        averageTrackLength: tracks.length > 0 ? 
          tracks.reduce((acc, item) => acc + (item.track?.duration_ms || 0), 0) / tracks.length : 0,
        uniqueArtists: new Set(tracks.flatMap(item => 
          item.track?.artists?.map(artist => artist.id) || []
        )).size,
        uniqueAlbums: new Set(tracks.map(item => 
          item.track?.album?.id
        ).filter(Boolean)).size,
        genres: {},
        popularity: {
          average: tracks.length > 0 ? 
            tracks.reduce((acc, item) => acc + (item.track?.popularity || 0), 0) / tracks.length : 0,
          distribution: {
            high: tracks.filter(item => (item.track?.popularity || 0) >= 80).length,
            medium: tracks.filter(item => (item.track?.popularity || 0) >= 50 && (item.track?.popularity || 0) < 80).length,
            low: tracks.filter(item => (item.track?.popularity || 0) < 50).length
          }
        }
      };

      // Format duration
      analytics.formattedDuration = this.formatDuration(analytics.totalDuration);
      analytics.formattedAverageDuration = this.formatDuration(analytics.averageTrackLength);

      return analytics;
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  // Helper method to format duration
  formatDuration(ms) {
    if (!ms) return '0m';
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
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
