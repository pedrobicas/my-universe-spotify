import { Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { DemoProvider } from './contexts/DemoContext'
import { MusicProvider } from './contexts/MusicContext'
import { SettingsProvider } from './contexts/SettingsContext'
import AuthSuccess from './pages/AuthSuccess'
import Dashboard from './pages/Dashboard'
import DemoLogin from './pages/DemoLogin'
import Discoveries from './pages/Discoveries'
import Login from './pages/Login'
import Playlists from './pages/Playlists'
import Privacy from './pages/Privacy'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Terms from './pages/Terms'
import DemoBanner from './components/DemoBanner'
import Loading from './components/Loading'
import Navbar from './components/Navbar'
import NowPlaying from './components/NowPlaying'
import PrivateRoute from './components/PrivateRoute'

const publicRoutes = ['/login', '/demo-login', '/auth/success', '/privacy', '/terms']

function AppFrame() {
  const location = useLocation()
  const isPublic = publicRoutes.includes(location.pathname)

  return (
    <div className={isPublic ? 'app app--public' : 'app app--private'}>
      {!isPublic && <Navbar />}
      {!isPublic && <DemoBanner />}

      <main className={isPublic ? 'public-shell' : 'app-main'}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/demo-login" element={<DemoLogin />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/playlists" element={<PrivateRoute><Playlists /></PrivateRoute>} />
            <Route path="/discoveries" element={<PrivateRoute><Discoveries /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </main>

      {!isPublic && <NowPlaying />}
    </div>
  )
}

function App() {
  return (
    <DemoProvider>
      <AuthProvider>
        <SettingsProvider>
          <MusicProvider>
            <AppFrame />
          </MusicProvider>
        </SettingsProvider>
      </AuthProvider>
    </DemoProvider>
  )
}

export default App
