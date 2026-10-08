import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { getSpotifyLoginUrl } from '../services/api'
import { demoUser } from '../data/demoData'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const checkAuth = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (localStorage.getItem('spotify_demo_mode') === 'true') {
        setUser(demoUser)
        localStorage.setItem('spotify_demo_user', JSON.stringify(demoUser))
        return true
      }

      const response = await api.get('/auth/check')
      const authenticated = Boolean(response.data?.authenticated && response.data?.user)
      setUser(authenticated ? response.data.user : null)
      return authenticated
    } catch (authError) {
      setUser(null)
      if (authError.response?.status === 403) {
        setError('Esta conta ainda não está autorizada no aplicativo do Spotify.')
      } else if (authError.response?.status !== 401) {
        setError('Não foi possível verificar sua sessão.')
      }
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (import.meta.env.VITE_DEMO_ONLY === 'true') {
        setError('O login com Spotify está desabilitado nesta versão. Use a demonstração.')
        return
      }

      localStorage.removeItem('spotify_demo_mode')
      localStorage.removeItem('spotify_demo_user')
      window.location.assign(getSpotifyLoginUrl())
    } catch (loginError) {
      console.error('Login failed:', loginError)
      setError('Não foi possível iniciar o login com Spotify.')
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      if (localStorage.getItem('spotify_demo_mode') !== 'true') {
        await api.post('/auth/logout')
      }
    } catch (logoutError) {
      console.warn('Logout request failed:', logoutError)
    } finally {
      ;['spotify_access_token', 'spotify_refresh_token', 'spotify_expires_at', 'spotify_demo_mode', 'spotify_demo_user']
        .forEach((key) => localStorage.removeItem(key))
      setUser(null)
      navigate('/login')
    }
  }, [navigate])

  const refreshToken = useCallback(async () => {
    try {
      await api.post('/auth/refresh_token')
      return checkAuth()
    } catch (refreshError) {
      console.warn('Token refresh failed:', refreshError)
      setUser(null)
      navigate('/login?error=session_expired')
      return false
    }
  }, [checkAuth, navigate])

  const value = useMemo(() => ({
    user,
    loading,
    error,
    login,
    logout,
    refreshToken,
    checkAuth,
    setUser,
  }), [user, loading, error, login, logout, refreshToken, checkAuth])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
