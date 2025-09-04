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

  // Get user's saved tracks
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

  // Get user's followed artists
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

  // Get comprehensive user statistics
  async getUserStats(accessToken) {
    try {
      // Fetch multiple data sources in parallel
      const [topTracksShort, topArtistsShort, recentTracks, savedTracks, followedArtists] = await Promise.all([
        this.getTopTracks(accessToken, 'short_term', 50),
        this.getTopArtists(accessToken, 'short_term', 50),
        this.getRecentlyPlayed(accessToken, 50),
        this.getSavedTracks(accessToken, 50, 0),
        this.getFollowedArtists(accessToken, 50)
      ]);

      // Calculate statistics
      const totalSavedTracks = savedTracks.total || 0;
      const totalFollowedArtists = followedArtists.artists?.total || 0;
      
      // Calculate genre distribution from top artists
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

      // Calculate listening patterns
      const listeningPatterns = this.calculateListeningPatterns(recentTracks.items || []);
      
      // Calculate audio features averages from top tracks
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

  // Helper method to calculate listening patterns
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

  // Helper method to calculate audio features statistics
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

  // Get currently playing track with auto-refresh
  async getNowPlaying(accessToken, refreshToken) {
    try {
      const result = await this.makeAuthenticatedRequest(
        'GET',
        `${this.baseURL}/me/player/currently-playing`,
        null,
        accessToken,
        refreshToken
      );
      
      // If we got new tokens, return them with the data
      if (result.newTokens) {
        return { 
          data: result.response.data,
          newTokens: result.newTokens 
        };
      }
      
      return { data: result.data };
    } catch (error) {
      // If nothing is playing, Spotify returns 204 No Content, which axios might treat as an error.
      if (error.response && error.response.status === 204) {
        return { data: null }; // Return null if nothing is playing
      }
      throw this.handleSpotifyError(error);
    }
  }

  // Play/pause controls with auto-refresh
  async pausePlayback(accessToken, refreshToken) {
    try {
      const result = await this.makeAuthenticatedRequest(
        'PUT',
        `${this.baseURL}/me/player/pause`,
        {},
        accessToken,
        refreshToken
      );
      
      // If we got new tokens, return them with the result
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
      
      // If we got new tokens, return them with the result
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
      
      // If we got new tokens, return them with the result
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
      
      // If we got new tokens, return them with the result
      if (result.newTokens) {
        return { success: true, newTokens: result.newTokens };
      }
      
      return { success: true };
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

  // Helper method to refresh token automatically
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

  // Enhanced method to make authenticated requests with auto-refresh
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
      // Try with current token first
      return await makeRequest(accessToken);
    } catch (error) {
      // If unauthorized and we have a refresh token, try to refresh
      if (error.response?.status === 401 && refreshToken) {
        console.log('Token expired, attempting refresh...');
        
        try {
          const newTokens = await this.refreshTokenIfNeeded(refreshToken);
          console.log('Token refreshed successfully, retrying request...');
          
          // Retry the request with new token
          const response = await makeRequest(newTokens.access_token);
          
          // Return both the response and new tokens for the controller to update cookies
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

  // Get recommendations
  async getRecommendations(accessToken, params) {
    try {
      // List of valid Spotify genres
      const validGenres = [
        'acoustic', 'afrobeat', 'alt-rock', 'alternative', 'ambient', 'blues', 'bossanova', 
        'brazil', 'breakbeat', 'british', 'chill', 'classical', 'club', 'country', 'dance', 
        'dancehall', 'deep-house', 'disco', 'drum-and-bass', 'dub', 'dubstep', 'electronic', 
        'folk', 'funk', 'garage', 'gospel', 'groove', 'grunge', 'hip-hop', 'house', 'indie', 
        'indie-pop', 'jazz', 'j-dance', 'j-idol', 'j-pop', 'j-rock', 'k-pop', 'latin', 
        'pop', 'r-n-b', 'reggae', 'rock', 'soul', 'world-music'
      ];

      // Default market (helps some accounts avoid odd 404s on recs)
      const defaultMarket = (typeof params.market === 'string' && params.market.length === 2)
        ? params.market.toUpperCase()
        : 'BR';

      // Ensure we have at least one seed parameter (required by Spotify API)
      const spotifyParams = {
        limit: Math.min(parseInt(params.limit) || 20, 100), // Max 100 tracks
        market: defaultMarket
      };
      
      // Count total seeds to ensure we don't exceed 5
      let seedCount = 0;
      const seeds = [];
      
      // Add seed parameters with validation and fallbacks
      if (params.seed_tracks) {
        const trackSeeds = params.seed_tracks.split(',').slice(0, 2); // Max 2 tracks
        if (trackSeeds.length > 0) {
          spotifyParams.seed_tracks = trackSeeds.join(',');
          seedCount += trackSeeds.length;
          seeds.push(`tracks: ${trackSeeds.length}`);
        }
      }
      
      if (params.seed_artists && seedCount < 5) {
        const artistSeeds = params.seed_artists.split(',').slice(0, Math.min(2, 5 - seedCount)); // Max 2 artists or remaining slots
        if (artistSeeds.length > 0) {
          spotifyParams.seed_artists = artistSeeds.join(',');
          seedCount += artistSeeds.length;
          seeds.push(`artists: ${artistSeeds.length}`);
        }
      }
      
      if (params.seed_genres && seedCount < 5) {
        // Validate and filter genres
        const requestedGenres = params.seed_genres.split(',');
        const validRequestedGenres = requestedGenres.filter(genre => 
          validGenres.includes(genre.trim().toLowerCase())
        );
        
        if (validRequestedGenres.length > 0) {
          const genreSeeds = validRequestedGenres.slice(0, Math.min(1, 5 - seedCount));
          spotifyParams.seed_genres = genreSeeds.join(',');
          seedCount += genreSeeds.length;
          seeds.push(`genres: ${genreSeeds.length}`);
        }
      }
      
  // If no valid seeds provided, use safe default genres
      if (seedCount === 0) {
        spotifyParams.seed_genres = 'pop';
        seedCount = 1;
        seeds.push('genres: 1 (default)');
      }
      
      // Add audio feature parameters with validation
      const audioFeatures = [
        // Only allow min/max/target_* params supported by Spotify
        'min_acousticness', 'max_acousticness', 'target_acousticness',
        'min_danceability', 'max_danceability', 'target_danceability',
        'min_energy', 'max_energy', 'target_energy',
        'min_instrumentalness', 'max_instrumentalness', 'target_instrumentalness',
        'min_liveness', 'max_liveness', 'target_liveness',
        'min_loudness', 'max_loudness', 'target_loudness',
        'min_speechiness', 'max_speechiness', 'target_speechiness',
        'min_valence', 'max_valence', 'target_valence',
        'min_tempo', 'max_tempo', 'target_tempo',
        'min_popularity', 'max_popularity', 'target_popularity'
      ];
      
      audioFeatures.forEach(feature => {
        if (params[feature] !== undefined && params[feature] !== null && params[feature] !== '') {
          const value = parseFloat(params[feature]);
          if (!isNaN(value)) {
            // Validate ranges for audio features (0-1 for most, different for tempo and loudness)
            if (feature.includes('tempo')) {
              spotifyParams[feature] = Math.max(0, Math.min(value, 250)); // Tempo range
            } else if (feature.includes('loudness')) {
              spotifyParams[feature] = Math.max(-60, Math.min(value, 0)); // Loudness range
            } else if (!feature.includes('popularity')) {
              spotifyParams[feature] = Math.max(0, Math.min(value, 1)); // 0-1 range
            } else {
              spotifyParams[feature] = Math.max(0, Math.min(value, 100)); // Popularity range
            }
          }
        }
      });

  console.log(`Spotify recommendations - Total seeds: ${seedCount} (${seeds.join(', ')})`);
  console.log('Final params:', spotifyParams);

      // Try with current params first
      try {
        const response = await axios.get(`${this.baseURL}/recommendations`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
          params: spotifyParams
        });
  return response.data;
      } catch (firstError) {
        const status = firstError?.response?.status;
        console.warn('Recommendations call failed:', status, firstError?.message);

        // If it's a 404, skip genre-fallback and go straight to search-based fallback
        if (status === 404) {
          // Secondary fallback: build a candidate pool via Search and filter by audio features/popularity
          try {
            // 1) Resolve seed names for better queries
            const seedArtistIds = (spotifyParams.seed_artists || params.seed_artists || '').split(',').filter(Boolean);
            const seedTrackIds = (spotifyParams.seed_tracks || params.seed_tracks || '').split(',').filter(Boolean);

            const nameRequests = [];
            seedArtistIds.forEach(id => nameRequests.push(
              axios.get(`${this.baseURL}/artists/${id}`, { headers: { 'Authorization': `Bearer ${accessToken}` } }).catch(() => null)
            ));
            seedTrackIds.forEach(id => nameRequests.push(
              axios.get(`${this.baseURL}/tracks/${id}`, { headers: { 'Authorization': `Bearer ${accessToken}` } }).catch(() => null)
            ));
            const nameResponses = await Promise.all(nameRequests);
            const seedArtistNames = nameResponses
              .map(r => r?.data?.name)
              .filter(Boolean)
              .slice(0, 2);
            const seedTrackNames = nameResponses
              .map(r => r?.data?.name || r?.data?.title)
              .filter(Boolean)
              .slice(0, 2);

            // 2) Build up to 3 search queries to gather a decent pool
            const genre = (spotifyParams.seed_genres || 'pop').split(',')[0];
            const queries = [];
            if (seedArtistNames.length) queries.push(`${genre} ${seedArtistNames.join(' ')}`);
            if (seedTrackNames.length) queries.push(`${genre} ${seedTrackNames.join(' ')}`);
            queries.push(`${genre}`);

            // 3) Execute searches and gather unique track IDs
            const poolLimit = Math.max(spotifyParams.limit, 20);
            const perQuery = Math.min(50, poolLimit);
            const searchReqs = queries.slice(0, 3).map(q => 
              axios.get(`${this.baseURL}/search`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
                params: { q: q.slice(0, 250), type: 'track', limit: perQuery, market: defaultMarket }
              }).catch(() => null)
            );
            const results = await Promise.all(searchReqs);
            const items = results
              .flatMap(r => r?.data?.tracks?.items || [])
              .filter(Boolean);
            const uniqueMap = new Map();
            items.forEach(t => { if (t && t.id) uniqueMap.set(t.id, t); });
            let candidates = Array.from(uniqueMap.values());

            // 4) Filter by popularity first if requested
            const minPop = typeof params.min_popularity !== 'undefined' ? parseFloat(params.min_popularity) : undefined;
            const maxPop = typeof params.max_popularity !== 'undefined' ? parseFloat(params.max_popularity) : undefined;
            if (!isNaN(minPop)) candidates = candidates.filter(t => (t.popularity ?? 0) >= minPop);
            if (!isNaN(maxPop)) candidates = candidates.filter(t => (t.popularity ?? 0) <= maxPop);

            // 5) Get audio features for candidates (batch up to 100)
            const candidateIds = candidates.slice(0, 100).map(t => t.id);
            const featuresRes = await this.getAudioFeatures(accessToken, candidateIds);
            const featById = new Map();
            (featuresRes.audio_features || []).forEach(f => { if (f && f.id) featById.set(f.id, f); });

            // 6) Filter candidates by target/min/max constraints with tolerance
            const tolerance = 0.15;
            const passes = (f) => {
              if (!f) return false;
              const checks = [];
              // target_* closeness
              Object.keys(params).forEach(k => {
                if (k.startsWith('target_')) {
                  const key = k.replace('target_', '');
                  const v = parseFloat(params[k]);
                  if (!isNaN(v) && typeof f[key] === 'number') {
                    checks.push(Math.abs(f[key] - v) <= (key === 'tempo' ? 20 : key === 'loudness' ? 6 : tolerance));
                  }
                }
              });
              // min_*/max_* constraints
              Object.keys(params).forEach(k => {
                if (k.startsWith('min_') || k.startsWith('max_')) {
                  const key = k.replace(/^min_|^max_/, '');
                  const v = parseFloat(params[k]);
                  if (!isNaN(v) && typeof f[key] === 'number') {
                    if (k.startsWith('min_')) checks.push(f[key] >= v);
                    if (k.startsWith('max_')) checks.push(f[key] <= v);
                  }
                }
              });
              return checks.every(Boolean);
            };

            let filtered = candidates.filter(t => passes(featById.get(t.id)));
            if (filtered.length < spotifyParams.limit) {
              filtered = candidates;
            }

            const targetKeys = Object.keys(params).filter(k => k.startsWith('target_'));
            if (targetKeys.length) {
              filtered.sort((a, b) => {
                const fa = featById.get(a.id), fb = featById.get(b.id);
                const score = (f) => targetKeys.reduce((acc, k) => {
                  const key = k.replace('target_', '');
                  const v = parseFloat(params[k]);
                  if (f && typeof f[key] === 'number' && !isNaN(v)) {
                    const diff = Math.abs(f[key] - v);
                    const norm = key === 'tempo' ? diff / 250 : key === 'loudness' ? diff / 60 : diff;
                    return acc + norm;
                  }
                  return acc + 1;
                }, 0);
                return score(fa) - score(fb);
              });
            }

            return { tracks: filtered.slice(0, spotifyParams.limit), fallback: 'search+features' };
          } catch (searchErr) {
            console.error('Search fallback failed:', searchErr?.response?.status, searchErr?.message);
            return { tracks: [], fallback: 'empty' };
          }
        }

        // Build a safe genre for fallback
        const safeGenre = 'pop';

        // Primary fallback: try recommendations with a single validated genre and validated audio features
  // Minimal fallback: only genre + limit + market
  const fallbackParams = { seed_genres: safeGenre, limit: spotifyParams.limit, market: defaultMarket };

        console.log('Attempting recommendations fallback with safe genre:', fallbackParams);

        try {
          const fallbackResponse = await axios.get(`${this.baseURL}/recommendations`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            params: fallbackParams
          });
          return { ...fallbackResponse.data, fallback: 'genre' };
        } catch (fallbackError) {
          console.warn('Recommendations fallback failed:', fallbackError?.response?.status, fallbackError?.message);

          // Secondary fallback: build a candidate pool via Search and filter by audio features/popularity
          try {
            // 1) Resolve seed names for better queries
            const seedArtistIds = (spotifyParams.seed_artists || params.seed_artists || '').split(',').filter(Boolean);
            const seedTrackIds = (spotifyParams.seed_tracks || params.seed_tracks || '').split(',').filter(Boolean);

            const nameRequests = [];
            seedArtistIds.forEach(id => nameRequests.push(
              axios.get(`${this.baseURL}/artists/${id}`, { headers: { 'Authorization': `Bearer ${accessToken}` } }).catch(() => null)
            ));
            seedTrackIds.forEach(id => nameRequests.push(
              axios.get(`${this.baseURL}/tracks/${id}`, { headers: { 'Authorization': `Bearer ${accessToken}` } }).catch(() => null)
            ));
            const nameResponses = await Promise.all(nameRequests);
            const seedArtistNames = nameResponses
              .map(r => r?.data?.name)
              .filter(Boolean)
              .slice(0, 2);
            const seedTrackNames = nameResponses
              .map(r => r?.data?.name || r?.data?.title)
              .filter(Boolean)
              .slice(0, 2);

            // 2) Build up to 3 search queries to gather a decent pool
            const genre = (spotifyParams.seed_genres || 'pop').split(',')[0];
            const queries = [];
            if (seedArtistNames.length) queries.push(`${genre} ${seedArtistNames.join(' ')}`);
            if (seedTrackNames.length) queries.push(`${genre} ${seedTrackNames.join(' ')}`);
            queries.push(`${genre}`);

            // 3) Execute searches and gather unique track IDs
            const poolLimit = Math.max(spotifyParams.limit, 20);
            const perQuery = Math.min(50, poolLimit);
            const searchReqs = queries.slice(0, 3).map(q => 
              axios.get(`${this.baseURL}/search`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
                params: { q: q.slice(0, 250), type: 'track', limit: perQuery, market: defaultMarket }
              }).catch(() => null)
            );
            const results = await Promise.all(searchReqs);
            const items = results
              .flatMap(r => r?.data?.tracks?.items || [])
              .filter(Boolean);
            const uniqueMap = new Map();
            items.forEach(t => { if (t && t.id) uniqueMap.set(t.id, t); });
            let candidates = Array.from(uniqueMap.values());

            // 4) Filter by popularity first if requested
            const minPop = typeof params.min_popularity !== 'undefined' ? parseFloat(params.min_popularity) : undefined;
            const maxPop = typeof params.max_popularity !== 'undefined' ? parseFloat(params.max_popularity) : undefined;
            if (!isNaN(minPop)) candidates = candidates.filter(t => (t.popularity ?? 0) >= minPop);
            if (!isNaN(maxPop)) candidates = candidates.filter(t => (t.popularity ?? 0) <= maxPop);

            // 5) Get audio features for candidates (batch up to 100)
            const candidateIds = candidates.slice(0, 100).map(t => t.id);
            const featuresRes = await this.getAudioFeatures(accessToken, candidateIds);
            const featById = new Map();
            (featuresRes.audio_features || []).forEach(f => { if (f && f.id) featById.set(f.id, f); });

            // 6) Filter candidates by target/min/max constraints with tolerance
            const tolerance = 0.15;
            const passes = (f) => {
              if (!f) return false;
              const checks = [];
              // target_* closeness
              Object.keys(params).forEach(k => {
                if (k.startsWith('target_')) {
                  const key = k.replace('target_', '');
                  const v = parseFloat(params[k]);
                  if (!isNaN(v) && typeof f[key] === 'number') {
                    checks.push(Math.abs(f[key] - v) <= (key === 'tempo' ? 20 : key === 'loudness' ? 6 : tolerance));
                  }
                }
              });
              // min_*/max_* constraints
              Object.keys(params).forEach(k => {
                if (k.startsWith('min_') || k.startsWith('max_')) {
                  const key = k.replace(/^min_|^max_/, '');
                  const v = parseFloat(params[k]);
                  if (!isNaN(v) && typeof f[key] === 'number') {
                    if (k.startsWith('min_')) checks.push(f[key] >= v);
                    if (k.startsWith('max_')) checks.push(f[key] <= v);
                  }
                }
              });
              return checks.every(Boolean);
            };

            let filtered = candidates.filter(t => passes(featById.get(t.id)));
            // If too few, relax tolerance by not enforcing target_* strictness
            if (filtered.length < spotifyParams.limit) {
              filtered = candidates;
            }

            // 7) Rank by closeness to targets if provided
            const targetKeys = Object.keys(params).filter(k => k.startsWith('target_'));
            if (targetKeys.length) {
              filtered.sort((a, b) => {
                const fa = featById.get(a.id), fb = featById.get(b.id);
                const score = (f) => targetKeys.reduce((acc, k) => {
                  const key = k.replace('target_', '');
                  const v = parseFloat(params[k]);
                  if (f && typeof f[key] === 'number' && !isNaN(v)) {
                    const diff = Math.abs(f[key] - v);
                    const norm = key === 'tempo' ? diff / 250 : key === 'loudness' ? diff / 60 : diff;
                    return acc + norm;
                  }
                  return acc + 1;
                }, 0);
                return score(fa) - score(fb);
              });
            }

            return { tracks: filtered.slice(0, spotifyParams.limit), fallback: 'search+features' };
          } catch (searchErr) {
            console.error('Search fallback failed:', searchErr?.response?.status, searchErr?.message);
            // Final fallback: return empty list rather than throwing 404 to frontend
            return { tracks: [], fallback: 'empty' };
          }
        }
      }
      
    } catch (error) {
      console.error('Spotify recommendations error:', error.response?.data || error.message);
      if (error.response?.status === 404) {
        console.error('404 Error - possibly invalid genre or track/artist IDs');
      }
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
