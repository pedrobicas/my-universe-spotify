import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { MusicProvider } from './contexts/MusicContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { DemoProvider } from './contexts/DemoContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import DemoBanner from './components/DemoBanner'
import Login from './pages/Login'
import DemoLogin from './pages/DemoLogin'
import Dashboard from './pages/Dashboard'
import Playlists from './pages/Playlists'
import Discoveries from './pages/Discoveries'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import AuthSuccess from './pages/AuthSuccess'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Loading from './components/Loading'
import NowPlaying from './components/NowPlaying'
import { Suspense } from 'react'

function App() {
  return (
    <DemoProvider>
      <AuthProvider>
        <SettingsProvider>
          <MusicProvider>
          <div className="min-h-screen">
            <DemoBanner />
            <Navbar />
            <main>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/demo-login" element={<DemoLogin />} />
                  <Route path="/auth/success" element={<AuthSuccess />} />
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
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
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
    </DemoProvider>
  )
}

export default App
