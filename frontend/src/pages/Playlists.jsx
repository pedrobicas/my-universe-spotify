import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { spotifyAPI } from '../services/api'
import { 
  Plus, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  Heart, 
  MoreHorizontal, 
  Music, 
  Users, 
  Clock,
  Shuffle,
  Repeat,
  Volume2,
  Edit3,
  Trash2,
  Share2,
  Download,
  Star,
  SkipBack,
  SkipForward,
  X
} from 'lucide-react'
import Card from '../components/Card'
import Loading from '../components/Loading'
import Button from '../components/Button'

const Playlists = () => {
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '', public: true })
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(50)

  useEffect(() => {
    loadPlaylists()
  }, [])

  const loadPlaylists = async () => {
    try {
      setLoading(true)
      const response = await spotifyAPI.getPlaylists(50)
      
      // Validar e filtrar playlists válidas
      const validPlaylists = response.data.items?.filter(playlist => 
        playlist && 
        playlist.id && 
        playlist.name && 
        typeof playlist === 'object'
      ) || []
      
      setPlaylists(validPlaylists)
    } catch (error) {
      console.error('Error loading playlists:', error)
      setPlaylists([])
    } finally {
      setLoading(false)
    }
  }

  const createPlaylist = async () => {
    try {
      const response = await spotifyAPI.createPlaylist({
        name: newPlaylist.name,
        description: newPlaylist.description,
        public: newPlaylist.public
      })
      
      // Reload playlists
      await loadPlaylists()
      setShowCreateModal(false)
      setNewPlaylist({ name: '', description: '', public: true })
    } catch (error) {
      console.error('Error creating playlist:', error)
    }
  }

  const filteredPlaylists = playlists.filter(playlist => {
    // Validar se a playlist é válida
    if (!playlist || !playlist.id || !playlist.name) return false
    
    const matchesSearch = playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (playlist.description && playlist.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (filterType === 'public') return playlist.public && matchesSearch
    if (filterType === 'private') return !playlist.public && matchesSearch
    return matchesSearch
  })

  const sortedPlaylists = [...filteredPlaylists].sort((a, b) => {
    // Validar se ambas as playlists são válidas
    if (!a || !b || !a.name || !b.name) return 0
    
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'tracks':
        return (b.tracks?.total || 0) - (a.tracks?.total || 0)
      case 'recent':
        return new Date(b.updated_at || 0) - new Date(a.updated_at || 0)
      default:
        return 0
    }
  })

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = ((ms % 60000) / 1000).toFixed(0)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const getTotalDuration = (tracks) => {
    const totalMs = tracks.reduce((acc, track) => acc + (track.track?.duration_ms || 0), 0)
    const hours = Math.floor(totalMs / 3600000)
    const minutes = Math.floor((totalMs % 3600000) / 60000)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
                Suas Playlists
              </h1>
              <p className="text-gray-300 text-lg mt-2">
                Gerencie e descubra suas coleções musicais
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
                             className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Playlist
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Busca */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar playlists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 backdrop-blur-sm"
            >
              <option value="all">Todas</option>
              <option value="public">Públicas</option>
              <option value="private">Privadas</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 backdrop-blur-sm"
            >
              <option value="name">Nome</option>
              <option value="tracks">Mais Tracks</option>
              <option value="recent">Mais Recentes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Playlists */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {sortedPlaylists.length === 0 ? (
          <Card className="bg-black/20 backdrop-blur-sm border border-white/10 text-center py-12">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhuma playlist encontrada</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm ? 'Tente ajustar sua busca' : 'Crie sua primeira playlist para começar'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Playlist
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedPlaylists.filter(playlist => playlist && playlist.id && playlist.name).map((playlist) => (
              <Card 
                key={playlist.id} 
                className="bg-black/20 backdrop-blur-sm border border-white/10 hover:border-green-500/50 transition-all duration-300 group cursor-pointer"
                onClick={() => setSelectedPlaylist(playlist)}
              >
                {/* Imagem da Playlist */}
                <div className="relative mb-4">
                  <img
                    src={playlist.images && playlist.images.length > 0 ? playlist.images[0].url : '/default-playlist.jpg'}
                    alt={playlist.name}
                    className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Overlay com controles */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <div className="flex space-x-3">
                      <button className="p-3 bg-green-600 hover:bg-green-700 rounded-full transition-colors">
                        <Play className="w-6 h-6 text-white" />
                      </button>
                      <button className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                        <Heart className="w-5 h-5 text-white" />
                      </button>
                      <button className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                        <MoreHorizontal className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Badge de tipo */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                    playlist.public 
                      ? 'bg-green-500/80 text-white' 
                      : 'bg-gray-500/80 text-white'
                  }`}>
                    {playlist.public ? 'Pública' : 'Privada'}
                  </div>
                </div>

                {/* Informações da Playlist */}
                <div className="space-y-3">
                                     <h3 className="font-semibold text-white text-lg truncate group-hover:text-green-400 transition-colors">
                    {playlist.name}
                  </h3>
                  
                  {playlist.description && (
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {playlist.description}
                    </p>
                  )}

                  {/* Estatísticas */}
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Music className="w-4 h-4" />
                      <span>{playlist.tracks?.total || 0} tracks</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{playlist.followers?.total || 0}</span>
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-white/10">
                    {playlist.owner?.images && playlist.owner.images.length > 0 && (
                      <img
                        src={playlist.owner.images[0].url}
                        alt={playlist.owner.display_name || 'Owner'}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="text-gray-400 text-sm">
                      {playlist.owner?.display_name || 'Unknown'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criação de Playlist */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full mx-4 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Nova Playlist</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Nome da Playlist
                </label>
                <input
                  type="text"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Digite o nome da playlist"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500"
                  placeholder="Descreva sua playlist"
                  rows="3"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="public"
                  checked={newPlaylist.public}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, public: e.target.checked })}
                  className="w-4 h-4 text-green-600 bg-black/20 border-white/10 rounded focus:ring-green-500"
                />
                <label htmlFor="public" className="text-gray-300 text-sm">
                  Playlist pública
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-8">
              <Button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600"
              >
                Cancelar
              </Button>
              <Button
                onClick={createPlaylist}
                disabled={!newPlaylist.name.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Criar Playlist
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Playlist */}
      {selectedPlaylist && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            {/* Header da Playlist */}
            <div className="relative p-8">
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
              
              <div className="flex flex-col md:flex-row gap-8">
                <img
                  src={selectedPlaylist.images && selectedPlaylist.images.length > 0 ? selectedPlaylist.images[0].url : '/default-playlist.jpg'}
                  alt={selectedPlaylist.name || 'Playlist'}
                  className="w-64 h-64 object-cover rounded-lg"
                />
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {selectedPlaylist.name}
                    </h2>
                    {selectedPlaylist.description && (
                      <p className="text-gray-300 text-lg">
                        {selectedPlaylist.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-gray-400">
                    <span>{selectedPlaylist.tracks?.total || 0} tracks</span>
                    <span>•</span>
                    <span>{selectedPlaylist.followers?.total || 0} seguidores</span>
                    <span>•</span>
                    <span>{selectedPlaylist.public ? 'Pública' : 'Privada'}</span>
                  </div>

                  <div className="flex space-x-3">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Play className="w-5 h-5 mr-2" />
                      Reproduzir
                    </Button>
                    <Button className="bg-white/10 hover:bg-white/20">
                      <Shuffle className="w-5 h-5 mr-2" />
                      Shuffle
                    </Button>
                    <Button className="bg-white/10 hover:bg-white/20">
                      <Heart className="w-5 h-5 mr-2" />
                      Salvar
                    </Button>
                  </div>

                  <div className="flex space-x-3">
                    <Button className="bg-white/10 hover:bg-white/20">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button className="bg-white/10 hover:bg-white/20">
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </Button>
                    <Button className="bg-white/10 hover:bg-white/20">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Tracks */}
            <div className="px-8 pb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Tracks</h3>
              <div className="space-y-2">
                {selectedPlaylist.tracks?.items && selectedPlaylist.tracks.items.length > 0 ? (
                  selectedPlaylist.tracks.items.map((item, index) => (
                    <div key={item.track?.id || index} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <div className="w-8 text-center text-gray-400 font-medium">
                        {index + 1}
                      </div>
                      
                      <img
                        src={item.track?.album?.images && item.track.album.images.length > 0 ? item.track.album.images[0].url : '/default-track.jpg'}
                        alt={item.track?.album?.name || 'Track'}
                        className="w-12 h-12 rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <p className="font-medium text-white">{item.track?.name || 'Unknown Track'}</p>
                        <p className="text-gray-400 text-sm">
                          {item.track?.artists && item.track.artists.length > 0 ? item.track.artists.map(a => a.name).join(', ') : 'Unknown Artist'}
                        </p>
                      </div>
                      
                      <div className="text-gray-400 text-sm">
                        {item.track?.duration_ms ? formatDuration(item.track.duration_ms) : 'N/A'}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                          <Play className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                          <Heart className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Esta playlist não possui tracks</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Player de música flutuante */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src={currentTrack.album?.images && currentTrack.album.images.length > 0 ? currentTrack.album.images[0].url : '/default-track.jpg'} 
                  alt={currentTrack.album?.name || 'Track'}
                  className="w-12 h-12 rounded-lg"
                />
                <div>
                  <p className="font-medium text-white">{currentTrack.name || 'Unknown Track'}</p>
                  <p className="text-gray-400 text-sm">
                    {currentTrack.artists && currentTrack.artists.length > 0 ? currentTrack.artists.map(a => a.name).join(', ') : 'Unknown Artist'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Shuffle className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <SkipBack className="w-5 h-5 text-white" />
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 bg-green-600 hover:bg-green-700 rounded-full transition-colors"
                >
                  {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <SkipForward className="w-5 h-5 text-white" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Repeat className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <Volume2 className="w-5 h-5 text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-20 accent-green-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Playlists
