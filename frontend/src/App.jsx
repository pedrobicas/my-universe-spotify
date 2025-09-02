import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Playlists from './pages/Playlists'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'
import Loading from './components/Loading'
import { Suspense } from 'react'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Navbar />
        <main>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/playlists" 
                element={
                  <PrivateRoute>
                    <Playlists />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <PrivateRoute>
                    <Analytics />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </AuthProvider>
  )
}

export default App
