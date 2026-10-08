import axios from 'axios'

let isRefreshing = false
let failedQueue = []

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080'
export const getSpotifyLoginUrl = () => `${API_BASE_URL}/auth/login?redirect=1`

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 12000,
})

const flushQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve())
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isAuthRequest = originalRequest?.url?.startsWith('/auth/')

    if (error.response?.status !== 401 || originalRequest?._retry || isAuthRequest) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
        .then(() => api(originalRequest))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      await api.post('/auth/refresh_token')
      flushQueue(null)
      return api(originalRequest)
    } catch (refreshError) {
      flushQueue(refreshError)
      localStorage.removeItem('spotify_demo_mode')
      localStorage.removeItem('spotify_demo_user')
      if (window.location.pathname !== '/login') window.location.assign('/login?error=session_expired')
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export const spotifyAPI = {
  getMe: () => api.get('/api/me'),
  getTopTracks: (timeRange = 'short_term', limit = 20) => api.get(`/api/top/tracks?time_range=${timeRange}&limit=${limit}`),
  getTopArtists: (timeRange = 'short_term', limit = 20) => api.get(`/api/top/artists?time_range=${timeRange}&limit=${limit}`),
  getPlaylists: (limit = 50) => api.get(`/api/playlists?limit=${limit}`),
  getPlaylistTracks: (playlistId) => api.get(`/api/playlists/${playlistId}/tracks`),
  createPlaylist: (data) => api.post('/api/playlists', data),
  updatePlaylist: (playlistId, data) => api.put(`/api/playlists/${playlistId}`, data),
  deletePlaylist: (playlistId) => api.delete(`/api/playlists/${playlistId}`),
  addTracksToPlaylist: (playlistId, trackUris) => api.post(`/api/playlists/${playlistId}/tracks`, { trackUris }),
  removeTracksFromPlaylist: (playlistId, trackUris) => api.delete(`/api/playlists/${playlistId}/tracks`, { data: { trackUris } }),
  reorderPlaylistTracks: (playlistId, rangeStart, insertBefore, rangeLength = 1) => api.put(`/api/playlists/${playlistId}/tracks/reorder`, { rangeStart, insertBefore, rangeLength }),
  getPlaylistAnalytics: (playlistId) => api.get(`/api/playlists/${playlistId}/analytics`),
  getAudioFeatures: (trackIds) => api.get(`/api/audio-features?trackIds=${trackIds.join(',')}`),
  getRecentlyPlayed: (limit = 20) => api.get(`/api/recently-played?limit=${limit}`),
  searchTracks: (query, limit = 10) => api.get(`/api/search/tracks?q=${encodeURIComponent(query)}&limit=${Math.min(limit, 10)}`),
  searchPlaylists: (query, limit = 10) => api.get(`/api/search/playlists?q=${encodeURIComponent(query)}&limit=${Math.min(limit, 10)}`),
  getTrack: (trackId) => api.get(`/api/tracks/${trackId}`),
  getRecommendations: (params) => api.get('/api/recommendations', { params }),
  getFollowedArtists: (limit = 50) => api.get(`/api/me/followed-artists?limit=${limit}`),
  getArtistTopTracks: (artistId, market = 'BR') => api.get(`/api/artists/${artistId}/top-tracks?market=${market}`),
  startPlayback: (options) => api.put('/api/player/start', options),
  getDevices: () => api.get('/api/player/devices'),
}

export default api
