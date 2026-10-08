import {
  demoUser,
  demoTopTracks,
  demoTopArtists,
  demoPlaylists,
  demoRecentTracks,
  demoAudioFeatures,
  demoStats,
  demoListeningHistory,
  simulateApiDelay,
} from '../data/demoData'

const toTrackItems = (tracks) => tracks.map((track) => ({
  track,
  added_at: new Date().toISOString(),
  added_by: { id: demoUser.id },
}))

const idFromUri = (uri = '') => uri.split(':').pop()

class DemoSpotifyAPI {
  constructor() {
    this.isDemo = true
    this.playlistTracks = new Map()
    demoPlaylists.forEach((playlist, index) => {
      const count = Math.min(playlist.tracks?.total || 8, demoTopTracks.length)
      const offset = demoTopTracks.length ? index % demoTopTracks.length : 0
      const tracks = [...demoTopTracks.slice(offset), ...demoTopTracks.slice(0, offset)].slice(0, count)
      this.playlistTracks.set(playlist.id, tracks)
    })
  }

  async login() {
    await simulateApiDelay(250)
    return { authUrl: '/demo-login' }
  }

  async checkAuth() {
    await simulateApiDelay(180)
    return { data: { authenticated: true, user: demoUser } }
  }

  async getUserProfile() {
    await simulateApiDelay(180)
    return { data: demoUser }
  }

  async getUserStats() {
    await simulateApiDelay(260)
    return { data: demoStats }
  }

  async getTopTracks(timeRange = 'short_term', limit = 20) {
    await simulateApiDelay(220)
    const offsets = { short_term: 0, medium_term: 2, long_term: 4 }
    const offset = offsets[timeRange] ?? 0
    const rotated = [...demoTopTracks.slice(offset), ...demoTopTracks.slice(0, offset)]
    return { data: { items: rotated.slice(0, limit) } }
  }

  async getRecentlyPlayed(limit = 20) {
    await simulateApiDelay(200)
    return { data: { items: demoRecentTracks.slice(0, limit) } }
  }

  async getSavedTracks(limit = 20, offset = 0) {
    await simulateApiDelay(220)
    const tracks = demoTopTracks.map((track) => ({ track, added_at: new Date().toISOString() }))
    return { data: { items: tracks.slice(offset, offset + limit), total: demoStats.totalSavedTracks } }
  }

  async getTopArtists(timeRange = 'short_term', limit = 20) {
    await simulateApiDelay(220)
    const offsets = { short_term: 0, medium_term: 1, long_term: 2 }
    const offset = offsets[timeRange] ?? 0
    const rotated = [...demoTopArtists.slice(offset), ...demoTopArtists.slice(0, offset)]
    return { data: { items: rotated.slice(0, limit) } }
  }

  async getFollowedArtists(limit = 20) {
    await simulateApiDelay(200)
    return { data: { artists: { items: demoTopArtists.slice(0, limit), total: demoStats.totalFollowedArtists } } }
  }

  async getPlaylists(limit = 50) {
    await simulateApiDelay(240)
    const items = demoPlaylists.slice(0, limit).map((playlist) => ({
      ...playlist,
      tracks: { ...(playlist.tracks || {}), total: this.playlistTracks.get(playlist.id)?.length || 0 },
    }))
    return { data: { items } }
  }

  async getPlaylistTracks(playlistId) {
    await simulateApiDelay(220)
    const tracks = this.playlistTracks.get(playlistId) || []
    return { data: { items: toTrackItems(tracks), total: tracks.length } }
  }

  async createPlaylist(data) {
    await simulateApiDelay(260)
    const id = `playlist-${Date.now()}`
    const newPlaylist = {
      id,
      name: data.name,
      description: data.description || '',
      public: Boolean(data.public),
      collaborative: Boolean(data.collaborative),
      tracks: { total: 0 },
      images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' }],
      owner: { id: demoUser.id, display_name: demoUser.display_name },
      external_urls: { spotify: `https://open.spotify.com/playlist/${id}` },
    }

    demoPlaylists.push(newPlaylist)
    this.playlistTracks.set(id, [])
    return { data: newPlaylist }
  }

  async updatePlaylist(playlistId, updates) {
    await simulateApiDelay(220)
    const playlistIndex = demoPlaylists.findIndex((playlist) => playlist.id === playlistId)
    if (playlistIndex !== -1) demoPlaylists[playlistIndex] = { ...demoPlaylists[playlistIndex], ...updates }
    return { data: { success: true } }
  }

  async deletePlaylist(playlistId) {
    await simulateApiDelay(200)
    const playlistIndex = demoPlaylists.findIndex((playlist) => playlist.id === playlistId)
    if (playlistIndex !== -1) demoPlaylists.splice(playlistIndex, 1)
    this.playlistTracks.delete(playlistId)
    return { data: { success: true } }
  }

  async addTracksToPlaylist(playlistId, trackUris) {
    await simulateApiDelay(220)
    const current = this.playlistTracks.get(playlistId) || []
    const additions = trackUris
      .map(idFromUri)
      .map((id) => demoTopTracks.find((track) => track.id === id))
      .filter(Boolean)
      .filter((track) => !current.some((item) => item.id === track.id))
    this.playlistTracks.set(playlistId, [...current, ...additions])
    return { data: { snapshot_id: `snapshot-${Date.now()}` } }
  }

  async removeTracksFromPlaylist(playlistId, trackUris) {
    await simulateApiDelay(200)
    const ids = new Set(trackUris.map(idFromUri))
    const current = this.playlistTracks.get(playlistId) || []
    this.playlistTracks.set(playlistId, current.filter((track) => !ids.has(track.id)))
    return { data: { snapshot_id: `snapshot-${Date.now()}` } }
  }

  async reorderPlaylistTracks(playlistId, rangeStart, insertBefore, rangeLength = 1) {
    await simulateApiDelay(180)
    const current = [...(this.playlistTracks.get(playlistId) || [])]
    if (!current.length || rangeStart < 0 || rangeStart >= current.length) return { data: { snapshot_id: `snapshot-${Date.now()}` } }
    const moved = current.splice(rangeStart, Math.max(1, rangeLength))
    let destination = Math.max(0, Math.min(insertBefore, current.length))
    if (insertBefore > rangeStart) destination = Math.max(0, destination - moved.length)
    current.splice(destination, 0, ...moved)
    this.playlistTracks.set(playlistId, current)
    return { data: { snapshot_id: `snapshot-${Date.now()}` } }
  }

  async getAudioFeatures(trackIds) {
    await simulateApiDelay(180)
    return { data: { audio_features: demoAudioFeatures.filter((feature) => trackIds.includes(feature.id)) } }
  }

  async searchTracks(query, limit = 10) {
    await simulateApiDelay(180)
    const needle = query.toLowerCase()
    const filteredTracks = demoTopTracks.filter((track) =>
      track.name.toLowerCase().includes(needle) || track.artists?.some((artist) => artist.name.toLowerCase().includes(needle)))
    return { data: { tracks: { items: filteredTracks.slice(0, Math.min(limit, 10)) } } }
  }

  async searchPlaylists(query, limit = 10) {
    await simulateApiDelay(180)
    const needle = query.toLowerCase()
    const filteredPlaylists = demoPlaylists.filter((playlist) => playlist.name.toLowerCase().includes(needle))
    return { data: { playlists: { items: filteredPlaylists.slice(0, Math.min(limit, 10)) } } }
  }

  async getRecommendations(params = {}) {
    await simulateApiDelay(240)
    const seed = `${params.seed_genres || ''}${params.market || ''}`
    const offset = demoTopTracks.length
      ? [...seed].reduce((total, char) => total + char.charCodeAt(0), 0) % demoTopTracks.length
      : 0
    const ordered = [...demoTopTracks.slice(offset), ...demoTopTracks.slice(0, offset)]
    return { data: { tracks: ordered.slice(0, params.limit || 20), fallback: false } }
  }

  async getListeningHistory() {
    await simulateApiDelay(200)
    return { data: demoListeningHistory }
  }

  async getProfileInsights() {
    await simulateApiDelay(220)
    return {
      data: {
        listeningTime: demoStats.listeningTime,
        topGenres: demoStats.topGenres,
        totalSavedTracks: demoStats.totalSavedTracks,
        totalFollowedArtists: demoStats.totalFollowedArtists,
        averageTracksPerDay: demoStats.averageTracksPerDay,
      },
    }
  }

  async getDevices() {
    await simulateApiDelay(120)
    return { data: { devices: [{ id: 'demo-desktop', name: 'Este navegador', type: 'Computer', is_active: true, volume_percent: 72 }] } }
  }

  async startPlayback() {
    await simulateApiDelay(120)
    return { data: { success: true } }
  }

  async playTrack() {
    await simulateApiDelay(120)
    return { data: { success: true } }
  }

  async pausePlayback() {
    await simulateApiDelay(100)
    return { data: { success: true } }
  }

  async resumePlayback() {
    await simulateApiDelay(100)
    return { data: { success: true } }
  }

  async skipToNext() {
    await simulateApiDelay(100)
    return { data: { success: true } }
  }

  async skipToPrevious() {
    await simulateApiDelay(100)
    return { data: { success: true } }
  }

  async getCurrentPlayback() {
    await simulateApiDelay(120)
    return {
      data: {
        is_playing: true,
        item: demoTopTracks[0],
        progress_ms: 95000,
        device: { name: 'Este navegador', type: 'Computer' },
      },
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
        return { data: { items: demoTopTracks.map((track) => ({ track })), total: demoStats.totalSavedTracks } }
      case '/api/me/followed-artists?limit=50':
        return { data: { artists: { items: demoTopArtists.slice(0, 15), total: demoStats.totalFollowedArtists } } }
      default:
        throw new Error(`Demo API endpoint not implemented: ${endpoint}`)
    }
  }

  async put(endpoint) {
    switch (endpoint) {
      case '/api/player/play':
        return this.resumePlayback()
      case '/api/player/pause':
        return this.pausePlayback()
      default:
        throw new Error(`Demo API PUT endpoint not implemented: ${endpoint}`)
    }
  }

  async post(endpoint) {
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
