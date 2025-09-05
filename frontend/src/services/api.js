import axios from 'axios'

// Global state to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

const api = axios.create({
  baseURL: 'http://127.0.0.1:8080', // Use 127.0.0.1 for Spotify compatibility
  withCredentials: true,
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add loading state if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors (unauthorized) - but only for non-auth endpoints
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url?.includes('/auth/') &&
        !originalRequest.url?.includes('/refresh_token')) {
      
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => {
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Try to refresh token
        await api.post('/auth/refresh_token')
        
        processQueue(null, true)
        isRefreshing = false
        
        // Retry original request
        return api(originalRequest)
      } catch (refreshError) {
        // If refresh fails, redirect to login
        console.log('Token refresh failed, redirecting to login')
        processQueue(refreshError, null)
        isRefreshing = false
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// API methods
export const spotifyAPI = {
  // User profile
  getMe: () => api.get('/api/me'),
  
  // Top content
  getTopTracks: (timeRange = 'short_term', limit = 20) => 
    api.get(`/api/top/tracks?time_range=${timeRange}&limit=${limit}`),
  
  getTopArtists: (timeRange = 'short_term', limit = 20) => 
    api.get(`/api/top/artists?time_range=${timeRange}&limit=${limit}`),
  
  // Playlists
  getPlaylists: (limit = 50) => 
    api.get(`/api/playlists?limit=${limit}`),
  
  getPlaylistTracks: (playlistId) => 
    api.get(`/api/playlists/${playlistId}/tracks`),
  
  createPlaylist: (data) => 
    api.post('/api/playlists', data),
  
  updatePlaylist: (playlistId, data) => 
    api.put(`/api/playlists/${playlistId}`, data),
  
  deletePlaylist: (playlistId) => 
    api.delete(`/api/playlists/${playlistId}`),
  
  addTracksToPlaylist: (playlistId, trackUris) => 
    api.post(`/api/playlists/${playlistId}/tracks`, { trackUris }),
  
  removeTracksFromPlaylist: (playlistId, trackUris) => 
    api.delete(`/api/playlists/${playlistId}/tracks`, { data: { trackUris } }),
  
  reorderPlaylistTracks: (playlistId, rangeStart, insertBefore, rangeLength = 1) => 
    api.put(`/api/playlists/${playlistId}/tracks/reorder`, { 
      rangeStart, 
      insertBefore, 
      rangeLength 
    }),
  
  getPlaylistAnalytics: (playlistId) => 
    api.get(`/api/playlists/${playlistId}/analytics`),
  
  // Audio features
  getAudioFeatures: (trackIds) => 
    api.get(`/api/audio-features?trackIds=${trackIds.join(',')}`),
  
  // Recently played
  getRecentlyPlayed: (limit = 20) => 
    api.get(`/api/recently-played?limit=${limit}`),
  
  // Search
  searchTracks: (query, limit = 20) => 
    api.get(`/api/search/tracks?q=${encodeURIComponent(query)}&limit=${limit}`),
  
  searchPlaylists: (query, limit = 20) => 
    api.get(`/api/search/playlists?q=${encodeURIComponent(query)}&limit=${limit}`),
  
  // Track details
  getTrack: (trackId) => 
    api.get(`/api/tracks/${trackId}`),
  
  // Recommendations
  getRecommendations: (params) => 
    api.get('/api/recommendations', { params }),
  
  // Followed artists
  getFollowedArtists: (limit = 50) => 
    api.get(`/api/me/following/artists?limit=${limit}`),

  // Playback controls
  startPlayback: (options) => 
    api.put('/api/player/start', options),
  
  getDevices: () => 
    api.get('/api/player/devices'),
}

export default api
