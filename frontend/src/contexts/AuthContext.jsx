import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

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
      
      const response = await api.get('/auth/check')
      
      if (response.data.authenticated) {
        setUser(response.data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      if (error.response?.status !== 401) {
        setError('Authentication check failed')
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
      await api.post('/auth/logout')
      setUser(null)
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
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
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
