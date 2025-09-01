import React, { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Shuffle, 
  Heart, 
  Share2, 
  Edit3, 
  Trash2, 
  Plus,
  Clock,
  Users,
  Globe,
  Lock,
  Music,
  Search,
  X
} from 'lucide-react'
import { spotifyAPI } from '../services/api'
import Button from './Button'
import Loading from './Loading'

const PlaylistDetail = ({ playlist, onBack, onEdit, onDelete }) => {
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddTracks, setShowAddTracks] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [addTrackQuery, setAddTrackQuery] = useState('')

  useEffect(() => {
    if (playlist) {
      loadPlaylistTracks()
    }
  }, [playlist])

  const loadPlaylistTracks = async () => {
    try {
      setLoading(true)
      // Buscar tracks da playlist
      const response = await spotifyAPI.getPlaylistTracks(playlist.id)
      setTracks(response.data.items || [])
    } catch (error) {
      console.error('Erro ao carregar tracks:', error)
      setTracks([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!addTrackQuery.trim()) return
    
    setIsSearching(true)
    try {
      const response = await spotifyAPI.searchTracks(addTrackQuery, 20)
      const tracks = response.data.tracks?.items || []
      setSearchResults(tracks)
    } catch (error) {
      console.error('Erro na busca:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddTrack = async (track) => {
    try {
      await spotifyAPI.addTracksToPlaylist(playlist.id, [`spotify:track:${track.id}`])
      // Recarregar tracks da playlist
      await loadPlaylistTracks()
      // Limpar busca
      setSearchResults([])
      setAddTrackQuery('')
      setShowAddTracks(false)
    } catch (error) {
      console.error('Erro ao adicionar track:', error)
      alert('Erro ao adicionar track à playlist')
    }
  }

  const handleRemoveTrack = async (trackId) => {
    try {
      await spotifyAPI.removeTracksFromPlaylist(playlist.id, [`spotify:track:${trackId}`])
      // Recarregar tracks da playlist
      await loadPlaylistTracks()
    } catch (error) {
      console.error('Erro ao remover track:', error)
      alert('Erro ao remover track da playlist')
    }
  }

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = ((ms % 60000) / 1000).toFixed(0)
    return `${minutes}:${seconds.padStart(2, '0')}`
  }

  const filteredTracks = tracks.filter(track => {
    if (!track.track) return false
    const trackName = track.track.name.toLowerCase()
    const artistName = track.track.artists?.map(a => a.name).join(' ').toLowerCase() || ''
    const searchLower = searchTerm.toLowerCase()
    return trackName.includes(searchLower) || artistName.includes(searchLower)
  })

  if (!playlist) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              onClick={onBack}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
          </div>
          
          <div className="flex items-start space-x-8">
            {/* Imagem da Playlist */}
            <div className="relative">
              <img
                src={playlist.images?.[0]?.url || '/default-playlist.jpg'}
                alt={playlist.name}
                className="w-48 h-48 object-cover rounded-2xl shadow-2xl"
              />
            </div>
            
            {/* Informações da Playlist */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                {playlist.public ? (
                  <Globe className="w-5 h-5 text-green-400" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm text-gray-400 uppercase tracking-wider">
                  {playlist.public ? 'Pública' : 'Privada'}
                </span>
              </div>
              
              <h1 className="text-5xl font-bold text-white mb-4">{playlist.name}</h1>
              
              {playlist.description && (
                <p className="text-gray-300 text-lg mb-6 max-w-2xl">
                  {playlist.description}
                </p>
              )}
              
              <div className="flex items-center space-x-6 text-gray-400 mb-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>{playlist.owner?.display_name || 'Usuário'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Music className="w-5 h-5" />
                  <span>{playlist.tracks?.total || tracks.length} músicas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>
                    {tracks.reduce((total, item) => total + (item.track?.duration_ms || 0), 0) > 0 
                      ? formatDuration(tracks.reduce((total, item) => total + (item.track?.duration_ms || 0), 0))
                      : '--:--'
                    }
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setShowAddTracks(true)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-4"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Músicas
                </Button>
                
                <Button
                  onClick={() => onEdit(playlist)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-4"
                >
                  <Edit3 className="w-5 h-5 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Busca nas Tracks */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar nas músicas da playlist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Lista de Tracks */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {loading ? (
          <Loading />
        ) : filteredTracks.length === 0 ? (
          <div className="text-center py-16">
            <Music className="w-24 h-24 text-gray-400 mx-auto mb-6 opacity-50" />
            <h3 className="text-2xl font-semibold text-white mb-4">
              {searchTerm ? 'Nenhuma música encontrada' : 'Nenhuma música na playlist'}
            </h3>
            <p className="text-gray-400 text-lg mb-8">
              {searchTerm 
                ? 'Tente uma busca diferente' 
                : 'Adicione músicas para começar a ouvir'
              }
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setShowAddTracks(true)}
                className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4"
              >
                <Plus className="w-6 h-6 mr-3" />
                Adicionar Primeira Música
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-black/20 rounded-2xl border border-white/10 overflow-hidden">
            {/* Header da Lista */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-white/5 border-b border-white/10 text-gray-400 text-sm font-medium">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-6">Título</div>
              <div className="col-span-3">Artista</div>
              <div className="col-span-1">Duração</div>
              <div className="col-span-1">Ações</div>
            </div>
            
            {/* Tracks */}
            <div className="divide-y divide-white/10">
              {filteredTracks.map((item, index) => {
                const track = item.track
                if (!track) return null
                
                return (
                  <div
                    key={track.id}
                    className="grid grid-cols-12 gap-4 p-4 hover:bg-white/5 transition-colors group"
                  >
                    <div className="col-span-1 text-center text-gray-400">
                      {index + 1}
                    </div>
                    
                    <div className="col-span-6 flex items-center space-x-4">
                      <img
                        src={track.album?.images?.[0]?.url || '/default-track.jpg'}
                        alt={track.album?.name || 'Album'}
                        className="w-12 h-12 rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-white">{track.name}</p>
                        <p className="text-gray-400 text-sm">{track.album?.name}</p>
                      </div>
                    </div>
                    
                    <div className="col-span-3 text-gray-300">
                      {track.artists?.map(a => a.name).join(', ')}
                    </div>
                    
                    <div className="col-span-1 text-gray-400">
                      {formatDuration(track.duration_ms)}
                    </div>
                    
                    <div className="col-span-1 flex items-center justify-center">
                      <button
                        onClick={() => handleRemoveTrack(track.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Remover música da playlist"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal para Adicionar Tracks */}
      {showAddTracks && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">Adicionar Músicas</h2>
              <button
                onClick={() => setShowAddTracks(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Busca */}
            <div className="p-6 border-b border-white/10">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar músicas..."
                    value={addTrackQuery}
                    onChange={(e) => setAddTrackQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={!addTrackQuery.trim() || isSearching}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
            </div>
            
            {/* Resultados */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map(track => (
                    <div key={track.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img
                          src={track.album?.images?.[0]?.url || '/default-track.jpg'}
                          alt={track.album?.name || 'Track'}
                          className="w-10 h-10 rounded-lg"
                        />
                        <div>
                          <p className="font-medium text-white">{track.name}</p>
                          <p className="text-gray-400 text-sm">
                            {track.artists?.map(a => a.name).join(', ')}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAddTrack(track)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  ))}
                </div>
              ) : addTrackQuery && !isSearching ? (
                <div className="text-center py-8 text-gray-400">
                  <p>Nenhuma música encontrada para "{addTrackQuery}"</p>
                  <p className="text-sm">Tente uma busca diferente</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Digite algo para buscar músicas</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlaylistDetail
