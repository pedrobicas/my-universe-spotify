const axios = require('axios');

class SpotifyService {
  constructor() {
    this.baseURL = 'https://api.spotify.com/v1';
  }

  
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

  
  async getArtistTopTracks(accessToken, artistId, market = 'BR') {
    try {
      // Spotify removed /artists/{id}/top-tracks in February 2026.
      // Preserve the app feature by resolving the artist name and searching its catalog.
      const artistResponse = await axios.get(`${this.baseURL}/artists/${artistId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const artistName = artistResponse.data?.name;
      if (!artistName) return { tracks: [] };

      const response = await axios.get(`${this.baseURL}/search`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: {
          q: `artist:"${artistName}"`,
          type: 'track',
          market,
          limit: 10
        }
      });
      return { tracks: response.data?.tracks?.items || [] };
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  
  async getUserPlaylists(accessToken, limit = 50) {
    try {
      const response = await axios.get(`${this.baseURL}/me/playlists`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: { limit: Math.min(Math.max(Number(limit) || 20, 1), 50) }
      });

      // Spotify renamed playlist.tracks -> playlist.items in 2026. Keep a normalized
      // `tracks` alias internally so the UI stays compatible with demo data too.
      const data = response.data || {};
      return {
        ...data,
        items: (data.items || []).map((playlist) => ({
          ...playlist,
          tracks: playlist.tracks || playlist.items || { total: 0 }
        }))
      };
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  
  async getPlaylistTracks(accessToken, playlistId) {
    try {
      const response = await axios.get(`${this.baseURL}/playlists/${playlistId}/items`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: { limit: 50 }
      });
      const data = response.data || {};
      return {
        ...data,
        items: (data.items || []).map((entry) => ({
          ...entry,
          track: entry.track || entry.item || null
        }))
      };
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  
  async createPlaylist(accessToken, name, description = '', isPublic = false, collaborative = false) {
    try {
      const response = await axios.post(`${this.baseURL}/me/playlists`, {
        name,
        description,
        public: isPublic,
        collaborative: isPublic ? false : Boolean(collaborative)
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

  
  async deletePlaylist(accessToken, playlistId) {
    try {
      // Spotify has no destructive "delete playlist" endpoint. Removing the playlist
      // from the current user's library is the safe equivalent and preserves its items.
      await axios.delete(`${this.baseURL}/me/library`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: { uris: `spotify:playlist:${playlistId}` }
      });
      return { removed: true };
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  async addTracksToPlaylist(accessToken, playlistId, trackUris) {
    try {
      const response = await axios.post(`${this.baseURL}/playlists/${playlistId}/items`, {
        uris: trackUris.slice(0, 100)
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

  async removeTracksFromPlaylist(accessToken, playlistId, trackUris) {
    try {
      const response = await axios.delete(`${this.baseURL}/playlists/${playlistId}/items`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          items: trackUris.slice(0, 100).map(uri => ({ uri }))
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  async reorderPlaylistTracks(accessToken, playlistId, rangeStart, insertBefore, rangeLength = 1) {
    try {
      const response = await axios.put(`${this.baseURL}/playlists/${playlistId}/items`, {
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

  async getAudioFeatures(accessToken, trackIds) {
    try {
      
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
      
      console.error('Audio features error:', error.response?.data || error.message);
      
      
      if ([403, 404].includes(error.response?.status)) {
        console.warn('Insufficient permissions for audio features, returning empty data');
        return { audio_features: [] };
      }
      
      throw this.handleSpotifyError(error);
    }
  }

  
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

  
  async getSavedTracks(accessToken, limit = 20, offset = 0) {
    try {
      const response = await axios.get(`${this.baseURL}/me/tracks`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          limit: limit,
          offset: offset
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  
  async getFollowedArtists(accessToken, limit = 20) {
    try {
      const response = await axios.get(`${this.baseURL}/me/following`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          type: 'artist',
          limit: limit
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  
  async getUserStats(accessToken) {
    try {
      
      const [topTracksShort, topArtistsShort, recentTracks, savedTracks, followedArtists] = await Promise.all([
        this.getTopTracks(accessToken, 'short_term', 50),
        this.getTopArtists(accessToken, 'short_term', 50),
        this.getRecentlyPlayed(accessToken, 50),
        this.getSavedTracks(accessToken, 50, 0),
        this.getFollowedArtists(accessToken, 50)
      ]);

      
      const totalSavedTracks = savedTracks.total || 0;
      const totalFollowedArtists = followedArtists.artists?.total || 0;
      
      
      const genres = {};
      topArtistsShort.items?.forEach(artist => {
        artist.genres?.forEach(genre => {
          genres[genre] = (genres[genre] || 0) + 1;
        });
      });

      const topGenres = Object.entries(genres)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([genre, count]) => ({ genre, count }));

      
      const listeningPatterns = this.calculateListeningPatterns(recentTracks.items || []);
      
      
      const audioFeaturesStats = await this.calculateAudioFeaturesStats(accessToken, topTracksShort.items || []);

      return {
        overview: {
          totalSavedTracks,
          totalFollowedArtists,
          topTracksCount: topTracksShort.items?.length || 0,
          topArtistsCount: topArtistsShort.items?.length || 0
        },
        topGenres,
        listeningPatterns,
        audioFeatures: audioFeaturesStats,
        recentActivity: {
          tracksPlayedLastMonth: recentTracks.items?.length || 0,
          uniqueArtistsLastMonth: new Set(
            recentTracks.items?.map(item => item.track.artists?.[0]?.id) || []
          ).size
        }
      };
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  
  calculateListeningPatterns(recentTracks) {
    if (!recentTracks.length) return { hourDistribution: [], dayDistribution: [] };

    const hourCounts = new Array(24).fill(0);
    const dayCounts = new Array(7).fill(0);
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    recentTracks.forEach(item => {
      const date = new Date(item.played_at);
      const hour = date.getHours();
      const day = date.getDay();
      
      hourCounts[hour]++;
      dayCounts[day]++;
    });

    return {
      hourDistribution: hourCounts.map((count, hour) => ({
        hour: `${hour}:00`,
        count
      })),
      dayDistribution: dayCounts.map((count, day) => ({
        day: dayNames[day],
        count
      }))
    };
  }

  
  async calculateAudioFeaturesStats(accessToken, topTracks) {
    try {
      if (!topTracks.length) return null;

      const trackIds = topTracks.slice(0, 20).map(track => track.id);
      const audioFeatures = await this.getAudioFeatures(accessToken, trackIds);
      
      if (!audioFeatures.audio_features?.length) return null;

      const features = audioFeatures.audio_features.filter(f => f !== null);
      if (!features.length) return null;

      const averages = {
        danceability: 0,
        energy: 0,
        valence: 0,
        acousticness: 0,
        instrumentalness: 0,
        speechiness: 0
      };

      features.forEach(feature => {
        Object.keys(averages).forEach(key => {
          averages[key] += feature[key] || 0;
        });
      });

      Object.keys(averages).forEach(key => {
        averages[key] = (averages[key] / features.length) * 100;
      });

      return averages;
    } catch (error) {
      console.warn('Failed to calculate audio features stats:', error.message);
      return null;
    }
  }

  
  async searchTracks(accessToken, query, limit = 20) {
    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          q: query,
          type: 'track',
          limit: Math.min(Math.max(Number(limit) || 5, 1), 10)
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  
  async searchPlaylists(accessToken, query, limit = 20) {
    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          q: query,
          type: 'playlist',
          limit: Math.min(Math.max(Number(limit) || 5, 1), 10)
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  
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

  
  async getPlaylistAnalytics(accessToken, playlistId) {
    try {
      
      const playlistResponse = await axios.get(`${this.baseURL}/playlists/${playlistId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const playlist = playlistResponse.data;
      
      
      const tracksResponse = await axios.get(`${this.baseURL}/playlists/${playlistId}/items`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          limit: 50
        }
      });

      const tracks = (tracksResponse.data.items || []).map(entry => ({ ...entry, track: entry.track || entry.item || null }));
      
      
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
        genres: {}
      };

      
      analytics.formattedDuration = this.formatDuration(analytics.totalDuration);
      analytics.formattedAverageDuration = this.formatDuration(analytics.averageTrackLength);

      return analytics;
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  
  async getNowPlaying(accessToken, refreshToken) {
    try {
      const result = await this.makeAuthenticatedRequest(
        'GET',
        `${this.baseURL}/me/player/currently-playing`,
        null,
        accessToken,
        refreshToken
      );
      
      
      if (result.newTokens) {
        return { 
          data: result.response.data,
          newTokens: result.newTokens 
        };
      }
      
      return { data: result.data };
    } catch (error) {
      
      if (error.response && error.response.status === 204) {
  return { data: null };
      }
      throw this.handleSpotifyError(error);
    }
  }

  
  async pausePlayback(accessToken, refreshToken) {
    try {
      const result = await this.makeAuthenticatedRequest(
        'PUT',
        `${this.baseURL}/me/player/pause`,
        {},
        accessToken,
        refreshToken
      );
      
      
      if (result.newTokens) {
        return { success: true, newTokens: result.newTokens };
      }
      
      return { success: true };
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  async resumePlayback(accessToken, refreshToken) {
    try {
      const result = await this.makeAuthenticatedRequest(
        'PUT',
        `${this.baseURL}/me/player/play`,
        {},
        accessToken,
        refreshToken
      );
      
      if (result.newTokens) {
        return { success: true, newTokens: result.newTokens };
      }
      
      return { success: true };
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  async skipToNext(accessToken, refreshToken) {
    try {
      const result = await this.makeAuthenticatedRequest(
        'POST',
        `${this.baseURL}/me/player/next`,
        {},
        accessToken,
        refreshToken
      );
      
      if (result.newTokens) {
        return { success: true, newTokens: result.newTokens };
      }
      
      return { success: true };
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  async skipToPrevious(accessToken, refreshToken) {
    try {
      const result = await this.makeAuthenticatedRequest(
        'POST',
        `${this.baseURL}/me/player/previous`,
        {},
        accessToken,
        refreshToken
      );
      
      if (result.newTokens) {
        return { success: true, newTokens: result.newTokens };
      }
      
      return { success: true };
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  async startPlayback(accessToken, refreshToken, options = {}) {
    try {
      const body = {};
      
      if (options.trackUris && options.trackUris.length > 0) {
        body.uris = options.trackUris;
        if (options.offset !== undefined) {
          body.offset = { position: options.offset };
        }
      }
      
      if (options.contextUri) {
        body.context_uri = options.contextUri;
        if (options.offset !== undefined) {
          body.offset = { position: options.offset };
        }
      }
      
      let url = `${this.baseURL}/me/player/play`;
      if (options.deviceId) {
        url += `?device_id=${options.deviceId}`;
      }

      const result = await this.makeAuthenticatedRequest(
        'PUT',
        url,
        body,
        accessToken,
        refreshToken
      );
      
      if (result.newTokens) {
        return { success: true, newTokens: result.newTokens };
      }
      
      return { success: true };
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  async getDevices(accessToken, refreshToken) {
    try {
      const result = await this.makeAuthenticatedRequest(
        'GET',
        `${this.baseURL}/me/player/devices`,
        {},
        accessToken,
        refreshToken
      );
      
      if (result.newTokens) {
        return { devices: result.response?.data?.devices || [], newTokens: result.newTokens };
      }
      
      return result.data;
    } catch (error) {
      throw this.handleSpotifyError(error);
    }
  }

  formatDuration(ms) {
    if (!ms) return '0m';
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
  }

  async refreshTokenIfNeeded(refreshToken) {
    const axios = require('axios');
    
    try {
      const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', 
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: process.env.SPOTIFY_CLIENT_ID,
          client_secret: process.env.SPOTIFY_CLIENT_SECRET
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return {
        access_token: tokenResponse.data.access_token,
        refresh_token: tokenResponse.data.refresh_token || refreshToken,
        expires_in: tokenResponse.data.expires_in
      };
    } catch (error) {
      console.error('Token refresh error in service:', error);
      throw new Error('Token refresh failed');
    }
  }

  async makeAuthenticatedRequest(method, url, data, accessToken, refreshToken) {
    const axios = require('axios');
    
    const makeRequest = async (token) => {
      const config = {
        method,
        url,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      if (data && (method === 'POST' || method === 'PUT')) {
        config.data = data;
      }
      
      return await axios(config);
    };

    try {
      return await makeRequest(accessToken);
    } catch (error) {
      if (error.response?.status === 401 && refreshToken) {
        console.log('Token expired, attempting refresh...');
        
        try {
          const newTokens = await this.refreshTokenIfNeeded(refreshToken);
          console.log('Token refreshed successfully, retrying request...');
          
          const response = await makeRequest(newTokens.access_token);
          
          return {
            response,
            newTokens
          };
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw this.handleSpotifyError(error);
        }
      }
      
      throw this.handleSpotifyError(error);
    }
  }

  async getRecommendations(accessToken, params = {}) {
    const limit = Math.min(Math.max(Number(params.limit) || 10, 1), 20);
    const market = typeof params.market === 'string' && params.market.length === 2
      ? params.market.toUpperCase()
      : 'BR';

    try {
      const spotifyParams = { ...params, limit, market };
      const response = await axios.get(`${this.baseURL}/recommendations`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: spotifyParams
      });
      return response.data;
    } catch (error) {
      // Recommendations and audio-analysis endpoints are unavailable to many
      // Development Mode apps. Fall back to real user/catalog data rather than
      // fabricating recommendations in the interface.
      const status = error.response?.status;
      if (![403, 404].includes(status)) throw this.handleSpotifyError(error);

      try {
        const top = await this.getTopTracks(accessToken, 'medium_term', Math.max(limit, 10));
        const tracks = (top.items || []).slice(0, limit);
        if (tracks.length) return { tracks, fallback: 'top-tracks' };
      } catch (topError) {
        console.warn('Top-tracks recommendation fallback unavailable:', topError.message);
      }

      const genre = String(params.seed_genres || '').split(',')[0].trim();
      if (genre) {
        try {
          const search = await this.searchTracks(accessToken, `genre:${genre}`, Math.min(limit, 10));
          return { tracks: search.tracks?.items || [], fallback: 'search' };
        } catch (searchError) {
          console.warn('Search recommendation fallback unavailable:', searchError.message);
        }
      }

      return { tracks: [], fallback: 'unavailable' };
    }
  }

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
          return new Error(data?.reason === 'QUOTA_EXCEEDED' ? 'Spotify quota exceeded' : 'Spotify rate limit exceeded');
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
