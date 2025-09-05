import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { 
  Home, 
  BarChart3, 
  ListMusic, 
  Settings, 
  LogOut, 
  User, 
  Menu, 
  X,
  Music,
  Heart,
  Clock,
  TrendingUp,
  Play,
  Pause
} from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Playlists', href: '/playlists', icon: ListMusic },
    { name: 'Descobertas', href: '/discoveries', icon: TrendingUp }
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  useEffect(() => {
    // Fechar menus quando mudar de rota
    setIsMobileMenuOpen(false)
    setIsUserMenuOpen(false)
  }, [location])

  return (
    <>
      {/* Navbar principal */}
      <nav className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo e navegação principal */}
            <div className="flex items-center space-x-4 sm:space-x-8">
              {/* Logo */}
              <Link to="/dashboard" className="flex items-center space-x-2 group">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-all duration-200">
                  <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent hidden xs:block">
                  My Universe
                </span>
              </Link>

              {/* Navegação desktop - Estilo Dashboard */}
              <div className="hidden lg:flex">
                <div className="flex gap-1 p-1">
                  {navigation.map((item, index) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group relative flex items-center space-x-3 px-3 xl:px-4 py-2.5 rounded-md font-medium transition-all duration-300 ease-out overflow-hidden ${
                          active ? 'active' : ''
                        } ${
                          active
                            ? 'text-green-400'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                        }`}
                        style={{
                          animationDelay: `${index * 100}ms`
                        }}
                      >
                        {/* Linha de progresso para item ativo */}
                        {active && (
                          <div className="absolute bottom-0 left-0 h-0.5 bg-green-400 rounded-full animate-progress w-full"></div>
                        )}
                        
                        {/* Conteúdo do item */}
                        <div className="flex items-center space-x-2 xl:space-x-3">
                          <div className={`icon-container p-1.5 rounded-md transition-all duration-300 ${
                            active 
                              ? 'bg-green-400/20 text-green-400' 
                              : 'bg-gray-600/30 text-gray-500 group-hover:bg-gray-500/30 group-hover:text-gray-300'
                          }`}>
                            <Icon className={`w-4 h-4 transition-all duration-300 ${
                              active ? 'text-green-400' : 'text-gray-500 group-hover:text-gray-300'
                            }`} />
                          </div>
                          <span className={`text-sm font-medium transition-all duration-300 ${
                            active ? 'text-green-400' : 'text-gray-500 group-hover:text-gray-300'
                          }`}>
                            {item.name}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Ações do usuário */}
            <div className="flex items-center space-x-2 sm:space-x-3">{/* Menu mobile toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Menu do usuário */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 sm:p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  {user?.images?.[0]?.url ? (
                    <img
                      src={user.images[0].url}
                      alt={user.display_name}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-green-400"
                    />
                  ) : (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-green-600 rounded-full flex items-center justify-center">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium truncate max-w-24 xl:max-w-none">{user?.display_name}</span>
                </button>

                {/* Dropdown do usuário */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-12 w-56 sm:w-64 bg-gray-900/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl z-50">
                    <div className="p-3 sm:p-4 border-b border-white/10">
                      <div className="flex items-center space-x-3">
                        {user?.images?.[0]?.url ? (
                          <img
                            src={user.images[0].url}
                            alt={user.display_name}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-green-400"
                          />
                        ) : (
                          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white text-sm sm:text-base truncate">{user?.display_name}</p>
                          <p className="text-gray-400 text-xs sm:text-sm truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">Perfil</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">Configurações</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Sair</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Menu mobile responsivo */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-gray-900/95 backdrop-blur-xl border-t border-white/10">
            <div className="px-3 py-4 space-y-2">
              {navigation.map((item, index) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                      active
                        ? 'bg-green-600/20 text-green-400 border border-green-400/30'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className={`p-2 rounded-md transition-all duration-300 ${
                      active 
                        ? 'bg-green-400/20 text-green-400' 
                        : 'bg-gray-600/30 text-gray-400 group-hover:bg-gray-500/30 group-hover:text-gray-300'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-base font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Player mini flutuante responsivo */}
      {currentTrack && (
        <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 bg-black/90 backdrop-blur-sm border border-white/10 rounded-xl p-2.5 sm:p-3 shadow-2xl z-40 max-w-xs sm:max-w-sm">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img
              src={currentTrack.album?.images[0]?.url}
              alt={currentTrack.album?.name}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-white font-medium text-xs sm:text-sm truncate">{currentTrack.name}</p>
              <p className="text-gray-400 text-xs truncate">
                {currentTrack.artists?.map(a => a.name).join(', ')}
              </p>
            </div>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 sm:p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors flex-shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              ) : (
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Overlay para fechar menus */}
      {(isUserMenuOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsUserMenuOpen(false)
            setIsMobileMenuOpen(false)
          }}
        />
      )}
    </>
  )
}

export default Navbar
