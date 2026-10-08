import {
  demoUser,
  demoTopTracks,
  demoTopArtists,
  demoPlaylists,
  demoPlaylistTracks,
  demoRecentTracks,
  demoAudioFeatures,
  demoStats,
  demoListeningHistory,
  simulateApiDelay,
} from '../data/demoData'

const STORAGE_KEY = 'my_universe_demo_state_v2'

const toTrackItems = (tracks) => tracks.map((track) => ({
  track,
  added_at: new Date().toISOString(),
  added_by: { id: demoUser.id },
}))

const idFromUri = (uri = '') => uri.split(':').pop()
const clone = (value) => JSON.parse(JSON.stringify(value))

class DemoSpotifyAPI {
  constructor() {
    this.isDemo = true
    this.resetState()
    this.restoreState()
  }

  resetState() {
    this.playlists = clone(demoPlaylists)
    this.playlistTracks = new Map(
      Object.entries(demoPlaylistTracks).map(([playlistId, tracks]) => [playlistId, [...tracks]])
    )
  }

  restoreState() {
    if (typeof window === 'undefined') return
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY)
      if (!saved) return
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed.playlists)) this.playlists = parsed.playlists
      if (parsed.playlistTracks && typeof parsed.playlistTracks === 'object') {
        this.playlistTracks = new Map(
          Object.entries(parsed.playlistTracks).map(([playlistId, trackIds]) => [
            playlistId,
            (trackIds || []).map((id) => demoTopTracks.find((track) => track.id === id)).filter(Boolean),
          ])
        )
      }
    } catch {
      this.resetState()
    }
  }

  persistState() {
    if (typeof window === 'undefined') return
    const playlistTracks = Object.fromEntries(
      [...this.playlistTracks.entries()].map(([playlistId, tracks]) => [playlistId, tracks.map((track) => track.id)])
    )
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ playlists: this.playlists, playlistTracks }))
  }

  async login() {
    await simulateApiDelay(180)
    return { authUrl: '/demo-login' }
  }

  async checkAuth() {
    await simulateApiDelay(120)
    return { data: { authenticated: true, user: demoUser } }
  }

  async getUserProfile() {
    await simulateApiDelay(120)
    return { data: demoUser }
  }

  async getUserStats() {
    await simulateApiDelay(160)
    return { data: demoStats }
  }

  async getTopTracks(timeRange = 'short_term', limit = 20) {
    await simulateApiDelay(160)
    const offsets = { short_term: 0, medium_term: 2, long_term: 4 }
    const offset = offsets[timeRange] ?? 0
    const rotated = [...demoTopTracks.slice(offset), ...demoTopTracks.slice(0, offset)]
    return { data: { items: rotated.slice(0, limit) } }
  }

  async getRecentlyPlayed(limit = 20) {
    await simulateApiDelay(140)
    return { data: { items: demoRecentTracks.slice(0, limit) } }
  }

  async getSavedTracks(limit = 20, offset = 0) {
    await simulateApiDelay(150)
    const tracks = demoTopTracks.map((track) => ({ track, added_at: new Date().toISOString() }))
    return { data: { items: tracks.slice(offset, offset + limit), total: demoStats.totalSavedTracks } }
  }

  async getTopArtists(timeRange = 'short_term', limit = 20) {
    await simulateApiDelay(160)
    const offsets = { short_term: 0, medium_term: 1, long_term: 2 }
    const offset = offsets[timeRange] ?? 0
    const rotated = [...demoTopArtists.slice(offset), ...demoTopArtists.slice(0, offset)]
    return { data: { items: rotated.slice(0, limit) } }
  }

  async getArtistTopTracks(artistId) {
    await simulateApiDelay(140)
    const tracks = demoTopTracks.filter((track) => track.artists?.some((artist) => artist.id === artistId))
    return { data: { tracks } }
  }

  async getFollowedArtists(limit = 20) {
    await simulateApiDelay(140)
    return { data: { artists: { items: demoTopArtists.slice(0, limit), total: demoStats.totalFollowedArtists } } }
  }

  async getPlaylists(limit = 50) {
    await simulateApiDelay(170)
    const items = this.playlists.slice(0, limit).map((playlist) => ({
      ...playlist,
      tracks: { ...(playlist.tracks || {}), total: this.playlistTracks.get(playlist.id)?.length || 0 },
    }))
    return { data: { items } }
  }

  async getPlaylistTracks(playlistId) {
    await simulateApiDelay(150)
    const tracks = this.playlistTracks.get(playlistId) || []
    return { data: { items: toTrackItems(tracks), total: tracks.length } }
  }

  async createPlaylist(data) {
    await simulateApiDelay(180)
    const id = `demo-playlist-${Date.now()}`
    const newPlaylist = {
      id,
      name: data.name,
      description: data.description || '',
      public: Boolean(data.public),
      collaborative: Boolean(data.collaborative),
      tracks: { total: 0 },
      images: [{ url: '/demo/playlists/custom.svg' }],
      owner: { id: demoUser.id, display_name: demoUser.display_name },
    }
    this.playlists.unshift(newPlaylist)
    this.playlistTracks.set(id, [])
    this.persistState()
    return { data: newPlaylist }
  }

  async updatePlaylist(playlistId, updates) {
    await simulateApiDelay(150)
    const playlistIndex = this.playlists.findIndex((playlist) => playlist.id === playlistId)
    if (playlistIndex !== -1) this.playlists[playlistIndex] = { ...this.playlists[playlistIndex], ...updates }
    this.persistState()
    return { data: { success: true } }
  }

  async deletePlaylist(playlistId) {
    await simulateApiDelay(140)
    this.playlists = this.playlists.filter((playlist) => playlist.id !== playlistId)
    this.playlistTracks.delete(playlistId)
    this.persistState()
    return { data: { success: true } }
  }

  async addTracksToPlaylist(playlistId, trackUris) {
    await simulateApiDelay(150)
    const current = this.playlistTracks.get(playlistId) || []
    const additions = trackUris
      .map(idFromUri)
      .map((id) => demoTopTracks.find((track) => track.id === id))
      .filter(Boolean)
      .filter((track) => !current.some((item) => item.id === track.id))
    this.playlistTracks.set(playlistId, [...current, ...additions])
    this.persistState()
    return { data: { snapshot_id: `demo-snapshot-${Date.now()}` } }
  }

  async removeTracksFromPlaylist(playlistId, trackUris) {
    await simulateApiDelay(140)
    const ids = new Set(trackUris.map(idFromUri))
    const current = this.playlistTracks.get(playlistId) || []
    this.playlistTracks.set(playlistId, current.filter((track) => !ids.has(track.id)))
    this.persistState()
    return { data: { snapshot_id: `demo-snapshot-${Date.now()}` } }
  }

  async reorderPlaylistTracks(playlistId, rangeStart, insertBefore, rangeLength = 1) {
    await simulateApiDelay(130)
    const current = [...(this.playlistTracks.get(playlistId) || [])]
    if (!current.length || rangeStart < 0 || rangeStart >= current.length) return { data: { snapshot_id: `demo-snapshot-${Date.now()}` } }
    const moved = current.splice(rangeStart, Math.max(1, rangeLength))
    let destination = Math.max(0, Math.min(insertBefore, current.length))
    if (insertBefore > rangeStart) destination = Math.max(0, destination - moved.length)
    current.splice(destination, 0, ...moved)
    this.playlistTracks.set(playlistId, current)
    this.persistState()
    return { data: { snapshot_id: `demo-snapshot-${Date.now()}` } }
  }

  async getAudioFeatures(trackIds) {
    await simulateApiDelay(120)
    return { data: { audio_features: demoAudioFeatures.filter((feature) => trackIds.includes(feature.id)) } }
  }

  async searchTracks(query, limit = 10) {
    await simulateApiDelay(130)
    const needle = query.toLowerCase().trim()
    const filteredTracks = demoTopTracks.filter((track) =>
      track.name.toLowerCase().includes(needle) || track.artists?.some((artist) => artist.name.toLowerCase().includes(needle)))
    return { data: { tracks: { items: filteredTracks.slice(0, Math.min(limit, 10)) } } }
  }

  async searchPlaylists(query, limit = 10) {
    await simulateApiDelay(130)
    const needle = query.toLowerCase().trim()
    const filteredPlaylists = this.playlists.filter((playlist) =>
      playlist.name.toLowerCase().includes(needle) || playlist.description?.toLowerCase().includes(needle))
    return { data: { playlists: { items: filteredPlaylists.slice(0, Math.min(limit, 10)) } } }
  }

  async getRecommendations(params = {}) {
    await simulateApiDelay(160)
    const seed = `${params.seed_genres || ''}${params.market || ''}${params.target_energy || ''}${params.target_valence || ''}`
    const offset = demoTopTracks.length
      ? [...seed].reduce((total, char) => total + char.charCodeAt(0), 0) % demoTopTracks.length
      : 0
    const ordered = [...demoTopTracks.slice(offset), ...demoTopTracks.slice(0, offset)]
    return { data: { tracks: ordered.slice(0, Math.min(params.limit || 20, demoTopTracks.length)), fallback: false } }
  }

  async getListeningHistory() {
    await simulateApiDelay(130)
    return { data: demoListeningHistory }
  }

  async getProfileInsights() {
    await simulateApiDelay(140)
    return { data: { ...demoStats } }
  }

  async getDevices() {
    await simulateApiDelay(90)
    return { data: { devices: [{ id: 'demo-browser', name: 'Este navegador', type: 'Computer', is_active: true, volume_percent: 68 }] } }
  }

  async startPlayback() { await simulateApiDelay(80); return { data: { success: true } } }
  async playTrack() { await simulateApiDelay(80); return { data: { success: true } } }
  async pausePlayback() { await simulateApiDelay(70); return { data: { success: true } } }
  async resumePlayback() { await simulateApiDelay(70); return { data: { success: true } } }
  async skipToNext() { await simulateApiDelay(70); return { data: { success: true } } }
  async skipToPrevious() { await simulateApiDelay(70); return { data: { success: true } } }

  async getCurrentPlayback() {
    await simulateApiDelay(90)
    return { data: { is_playing: false, item: null, progress_ms: 0, device: { name: 'Este navegador', type: 'Computer', volume_percent: 68 } } }
  }

  async get(endpoint) {
    switch (endpoint) {
      case '/api/now-playing': return this.getCurrentPlayback()
      case '/api/player/devices': return this.getDevices()
      case '/api/recently-played?limit=50': return this.getRecentlyPlayed(50)
      case '/api/me/saved-tracks?limit=50': return { data: { items: demoTopTracks.map((track) => ({ track })), total: demoStats.totalSavedTracks } }
      case '/api/me/followed-artists?limit=50': return { data: { artists: { items: demoTopArtists, total: demoStats.totalFollowedArtists } } }
      default: throw new Error(`Demo API endpoint not implemented: ${endpoint}`)
    }
  }

  async put(endpoint) {
    switch (endpoint) {
      case '/api/player/play': return this.resumePlayback()
      case '/api/player/pause': return this.pausePlayback()
      default: throw new Error(`Demo API PUT endpoint not implemented: ${endpoint}`)
    }
  }

  async post(endpoint) {
    switch (endpoint) {
      case '/api/player/next': return this.skipToNext()
      case '/api/player/previous': return this.skipToPrevious()
      default: throw new Error(`Demo API POST endpoint not implemented: ${endpoint}`)
    }
  }
}

export default new DemoSpotifyAPI()
