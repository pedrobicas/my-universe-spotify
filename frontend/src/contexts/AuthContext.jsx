import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { demoUser } from '../data/demoData'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuth()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true)
      setError(null)
      
     const isDemoMode = localStorage.getItem('spotify_demo_mode') === 'true'
      if (isDemoMode) {
        setUser(demoUser)
        localStorage.setItem('spotify_demo_user', JSON.stringify(demoUser))
        return
      }
      
      const response = await api.get('/auth/check')
      
      if (response.data.authenticated) {
        setUser(response.data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      
      if (error.response?.status === 403) {
        setError('Usuário não autorizado para esta aplicação')
        navigate('/login?error=user_not_authorized')
      } else if (error.response?.status !== 401) {
        setError('Falha na verificação de autenticação')
      }
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const demoOnly = import.meta.env.VITE_DEMO_ONLY === 'true'
      if (demoOnly) {
        setError('Login com Spotify está desabilitado. Use o modo demonstração.')
        setLoading(false)
        return
      }
      
      const accessToken = localStorage.getItem('spotify_access_token');
      const expiresAt = localStorage.getItem('spotify_expires_at');
      
      if (accessToken && expiresAt && Date.now() < parseInt(expiresAt)) {
        await checkAuth();
        return;
      }
      
      const response = await api.get('/auth/login')
      window.location.href = response.data.authUrl
    } catch (error) {
      console.error('Login failed:', error)
      setError('Failed to initiate login')
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      const isDemoMode = localStorage.getItem('spotify_demo_mode') === 'true'
      if (!isDemoMode) {
        await api.post('/auth/logout')
      }
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      localStorage.removeItem('spotify_expires_at');
      localStorage.removeItem('spotify_demo_mode');
      localStorage.removeItem('spotify_demo_user');
      
      setUser(null)
      navigate('/login')
    }
  }

  const refreshToken = async () => {
    try {
      await api.post('/auth/refresh_token')
      await checkAuth()
    } catch (error) {
      console.error('Token refresh failed:', error)
      setUser(null)
      navigate('/login')
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshToken,
    checkAuth,
    setUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
