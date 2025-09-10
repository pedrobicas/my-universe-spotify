import { 
  demoUser, 
  demoTopTracks, 
  demoTopArtists, 
  demoPlaylists, 
  demoRecentTracks, 
  demoAudioFeatures, 
  demoStats,
  demoListeningHistory,
  simulateApiDelay 
} from '../data/demoData'

class DemoSpotifyAPI {
  constructor() {
    this.isDemo = true
  }

  async login() {
    await simulateApiDelay(500)
    return { authUrl: '/demo-login' }
  }

  async checkAuth() {
    await simulateApiDelay(300)
    return {
      data: {
        authenticated: true,
        user: demoUser
      }
    }
  }

  async getUserProfile() {
    await simulateApiDelay(500)
    return { data: demoUser }
  }

  async getUserStats() {
    await simulateApiDelay(800)
    return { data: demoStats }
  }

  async getTopTracks(timeRange = 'short_term', limit = 20) {
    await simulateApiDelay(600)
    return { 
      data: { 
        items: demoTopTracks.slice(0, limit) 
      } 
    }
  }

  async getRecentlyPlayed(limit = 20) {
    await simulateApiDelay(500)
    return { 
      data: { 
        items: demoRecentTracks.slice(0, limit) 
      } 
    }
  }

  async getSavedTracks(limit = 20, offset = 0) {
    await simulateApiDelay(700)
    const tracks = demoTopTracks.map(track => ({ track, added_at: new Date().toISOString() }))
    return { 
      data: { 
        items: tracks.slice(offset, offset + limit),
        total: demoStats.totalSavedTracks
      } 
    }
  }

  async getTopArtists(timeRange = 'short_term', limit = 20) {
    await simulateApiDelay(600)
    return { 
      data: { 
        items: demoTopArtists.slice(0, limit) 
      } 
    }
  }

  async getFollowedArtists(limit = 20) {
    await simulateApiDelay(500)
    return { 
      data: { 
        artists: {
          items: demoTopArtists.slice(0, limit),
          total: demoStats.totalFollowedArtists
        }
      } 
    }
  }

  async getPlaylists(limit = 50) {
    await simulateApiDelay(800)
    return { 
      data: { 
        items: demoPlaylists.slice(0, limit) 
      } 
    }
  }

  async getPlaylistTracks(playlistId) {
    await simulateApiDelay(600)
    const tracks = demoTopTracks.slice(0, 10).map(track => ({
      track,
      added_at: new Date().toISOString(),
      added_by: { id: 'demo-user-123' }
    }))
    return { 
      data: { 
        items: tracks 
      } 
    }
  }

  async createPlaylist(data) {
    await simulateApiDelay(1000)
    const newPlaylist = {
      id: `playlist-${Date.now()}`,
      name: data.name,
      description: data.description || '',
      public: data.public || false,
      collaborative: data.collaborative || false,
      tracks: { total: 0 },
      images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' }],
      owner: { display_name: demoUser.display_name },
      external_urls: { spotify: `https://open.spotify.com/playlist/playlist-${Date.now()}` }
    }
    
    demoPlaylists.push(newPlaylist)
    
    return { data: newPlaylist }
  }

  async updatePlaylist(playlistId, updates) {
    await simulateApiDelay(800)
    const playlistIndex = demoPlaylists.findIndex(p => p.id === playlistId)
    if (playlistIndex !== -1) {
      demoPlaylists[playlistIndex] = { ...demoPlaylists[playlistIndex], ...updates }
    }
    return { data: { success: true } }
  }

  async deletePlaylist(playlistId) {
    await simulateApiDelay(600)
    const playlistIndex = demoPlaylists.findIndex(p => p.id === playlistId)
    if (playlistIndex !== -1) {
      demoPlaylists.splice(playlistIndex, 1)
    }
    return { data: { success: true } }
  }

  async addTracksToPlaylist(playlistId, trackUris) {
    await simulateApiDelay(800)
    console.log(`Demo: Adding ${trackUris.length} tracks to playlist ${playlistId}`)
    return { data: { snapshot_id: `snapshot-${Date.now()}` } }
  }

  async removeTracksFromPlaylist(playlistId, trackUris) {
    await simulateApiDelay(700)
    console.log(`Demo: Removing ${trackUris.length} tracks from playlist ${playlistId}`)
    return { data: { snapshot_id: `snapshot-${Date.now()}` } }
  }

  async getAudioFeatures(trackIds) {
    await simulateApiDelay(500)
    return { 
      data: { 
        audio_features: demoAudioFeatures.filter(af => trackIds.includes(af.id)) 
      } 
    }
  }

  async searchTracks(query, limit = 20) {
    await simulateApiDelay(400)
    const filteredTracks = demoTopTracks.filter(track => 
      track.name.toLowerCase().includes(query.toLowerCase()) ||
      track.artists[0].name.toLowerCase().includes(query.toLowerCase())
    )
    return { 
      data: { 
        tracks: { 
          items: filteredTracks.slice(0, limit) 
        } 
      } 
    }
  }

  async searchPlaylists(query, limit = 20) {
    await simulateApiDelay(400)
    const filteredPlaylists = demoPlaylists.filter(playlist => 
      playlist.name.toLowerCase().includes(query.toLowerCase())
    )
    return { 
      data: { 
        playlists: { 
          items: filteredPlaylists.slice(0, limit) 
        } 
      } 
    }
  }

  async getRecommendations(params) {
    await simulateApiDelay(1200)
    const shuffledTracks = [...demoTopTracks].sort(() => Math.random() - 0.5)
    return { 
      data: { 
        tracks: shuffledTracks.slice(0, params.limit || 20),
        fallback: false
      } 
    }
  }

  async getListeningHistory() {
    await simulateApiDelay(600)
    return { data: demoListeningHistory }
  }

  async getProfileInsights() {
    await simulateApiDelay(900)
    return { 
      data: {
        listeningTime: demoStats.listeningTime,
        topGenres: demoStats.topGenres,
        totalSavedTracks: demoStats.totalSavedTracks,
        totalFollowedArtists: demoStats.totalFollowedArtists,
        averageTracksPerDay: demoStats.averageTracksPerDay
      }
    }
  }

  async playTrack(trackUri, contextUri = null) {
    await simulateApiDelay(300)
    console.log(`Demo: Playing track ${trackUri} in context ${contextUri}`)
    return { data: { success: true } }
  }

  async pausePlayback() {
    await simulateApiDelay(200)
    console.log('Demo: Pausing playback')
    return { data: { success: true } }
  }

  async resumePlayback() {
    await simulateApiDelay(200)
    console.log('Demo: Resuming playback')
    return { data: { success: true } }
  }

  async skipToNext() {
    await simulateApiDelay(300)
    console.log('Demo: Skipping to next track')
    return { data: { success: true } }
  }

  async skipToPrevious() {
    await simulateApiDelay(300)
    console.log('Demo: Skipping to previous track')
    return { data: { success: true } }
  }

  async getCurrentPlayback() {
    await simulateApiDelay(200)
    return { 
      data: {
        is_playing: true,
        item: demoTopTracks[0],
        progress_ms: 95000,
        device: {
          name: 'Demo Device',
          type: 'Computer'
        }
      }
    }
  }

  async get(endpoint) {
    switch (endpoint) {
      case '/api/now-playing':
        return this.getCurrentPlayback()
      case '/api/player/devices':
        return this.getDevices()
      case '/api/recently-played?limit=50':
        return this.getRecentlyPlayed(50)
      case '/api/me/saved-tracks?limit=50':
        return { data: { items: demoTopTracks.slice(0, 20), total: 127 } }
      case '/api/me/followed-artists?limit=50':
        return { data: { artists: { items: demoTopArtists.slice(0, 15), total: 42 } } }
      default:
        throw new Error(`Demo API endpoint not implemented: ${endpoint}`)
    }
  }

  async put(endpoint, data) {
    switch (endpoint) {
      case '/api/player/play':
        return this.resumePlayback()
      case '/api/player/pause':
        return this.pausePlayback()
      default:
        throw new Error(`Demo API PUT endpoint not implemented: ${endpoint}`)
    }
  }

  async post(endpoint, data) {
    switch (endpoint) {
      case '/api/player/next':
        return this.skipToNext()
      case '/api/player/previous':
        return this.skipToPrevious()
      default:
        throw new Error(`Demo API POST endpoint not implemented: ${endpoint}`)
    }
  }
}

export default new DemoSpotifyAPI()
