import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { 
  Home, 
  BarChart3, 
  ListMusic, 
  Search, 
  Bell, 
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
import Button from './Button'

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Nova música adicionada à sua playlist', time: '2 min atrás', read: false },
    { id: 2, message: 'Seu artista favorito lançou um novo álbum', time: '1 hora atrás', read: false },
    { id: 3, message: 'Playlist "Workout Mix" foi atualizada', time: '3 horas atrás', read: true }
  ])
  const [showNotifications, setShowNotifications] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Playlists', href: '/playlists', icon: ListMusic },
    { name: 'Análises', href: '/analytics', icon: BarChart3 }
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

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Implementar busca
      console.log('Searching for:', searchQuery)
      setSearchQuery('')
      setIsSearchOpen(false)
    }
  }

  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    // Fechar menus quando mudar de rota
    setIsMobileMenuOpen(false)
    setIsUserMenuOpen(false)
    setIsSearchOpen(false)
  }, [location])

  return (
    <>
      {/* Navbar principal */}
      <nav className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo e navegação principal */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link to="/dashboard" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-all duration-200">
                  <Music className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
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
                        className={`group relative flex items-center space-x-3 px-4 py-2.5 rounded-md font-medium transition-all duration-300 ease-out overflow-hidden ${
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
                        <div className="flex items-center space-x-3">
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
            <div className="flex items-center space-x-3">
              {/* Busca */}
              <div className="relative">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
                
                {/* Dropdown de busca */}
                {isSearchOpen && (
                  <div className="absolute right-0 top-12 w-80 bg-gray-900/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl">
                    <form onSubmit={handleSearch} className="p-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Buscar músicas, artistas, playlists..."
                          className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          autoFocus
                        />
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Button
                          type="submit"
                          disabled={!searchQuery.trim()}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                          Buscar
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setIsSearchOpen(false)}
                          className="bg-gray-700 hover:bg-gray-600"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Notificações */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors relative"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown de notificações */}
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 bg-gray-900/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-white/10">
                      <h3 className="text-lg font-semibold text-white">Notificações</h3>
                    </div>
                    <div className="p-2">
                      {notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Nenhuma notificação</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => markNotificationAsRead(notification.id)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              notification.read ? 'bg-white/5' : 'bg-green-500/20'
                            } hover:bg-white/10`}
                          >
                            <p className="text-white text-sm">{notification.message}</p>
                            <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Menu do usuário */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  {user?.images?.[0]?.url ? (
                    <img
                      src={user.images[0].url}
                      alt={user.display_name}
                      className="w-7 h-7 rounded-full border border-green-400"
                    />
                  ) : (
                    <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium">{user?.display_name}</span>
                </button>

                {/* Dropdown do usuário */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-12 w-64 bg-gray-900/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl">
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center space-x-3">
                        {user?.images?.[0]?.url ? (
                          <img
                            src={user.images[0].url}
                            alt={user.display_name}
                            className="w-10 h-10 rounded-full border border-green-400"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-white">{user?.display_name}</p>
                          <p className="text-gray-400 text-sm">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Perfil</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Configurações</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Menu mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile - Estilo Dashboard */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-gray-900/95 backdrop-blur-xl border-t border-white/10">
            <div className="px-4 py-4">
              <div className="flex flex-wrap justify-center gap-1 p-1">
                {navigation.map((item, index) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group relative flex items-center space-x-3 px-4 py-2.5 rounded-md font-medium transition-all duration-300 ease-out overflow-hidden ${
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
                      <div className="flex items-center space-x-3">
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
        )}
      </nav>

      {/* Player mini flutuante */}
      {currentTrack && (
        <div className="fixed bottom-4 right-4 bg-black/90 backdrop-blur-sm border border-white/10 rounded-xl p-3 shadow-2xl z-40">
          <div className="flex items-center space-x-3">
            <img
              src={currentTrack.album?.images[0]?.url}
              alt={currentTrack.album?.name}
              className="w-12 h-12 rounded-lg"
            />
            <div className="min-w-0">
              <p className="text-white font-medium text-sm truncate">{currentTrack.name}</p>
              <p className="text-gray-400 text-xs truncate">
                {currentTrack.artists?.map(a => a.name).join(', ')}
              </p>
            </div>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Overlay para fechar menus */}
      {(isSearchOpen || showNotifications || isUserMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsSearchOpen(false)
            setShowNotifications(false)
            setIsUserMenuOpen(false)
          }}
        />
      )}
    </>
  )
}

export default Navbar
