import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Loading from './Loading'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="route-loading"><Loading /></div>
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}

export default PrivateRoute
