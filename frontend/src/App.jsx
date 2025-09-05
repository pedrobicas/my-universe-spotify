import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { MusicProvider } from './contexts/MusicContext'
import { SettingsProvider } from './contexts/SettingsContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Playlists from './pages/Playlists'
import Discoveries from './pages/Discoveries'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Loading from './components/Loading'
import NowPlaying from './components/NowPlaying'
import { Suspense } from 'react'

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <MusicProvider>
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
                path="/discoveries" 
                element={
                  <PrivateRoute>
                    <Discoveries />
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
              <Route 
                path="/settings" 
                element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </main>
        
        {/* Player flutuante global */}
        <NowPlaying />
      </div>
      </MusicProvider>
      </SettingsProvider>
    </AuthProvider>
  )
}

export default App
