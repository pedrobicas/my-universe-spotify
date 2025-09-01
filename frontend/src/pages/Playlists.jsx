import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { spotifyAPI } from '../services/api'
import { 
  Plus, 
  Music, 
  Grid3X3,
  List,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import PlaylistCard from '../components/PlaylistCard'
import PlaylistEditModal from '../components/PlaylistEditModal'
import PlaylistFilters from '../components/PlaylistFilters'
import PlaylistDetail from '../components/PlaylistDetail'
import MusicPlayer from '../components/MusicPlayer'
import Loading from '../components/Loading'
import Button from '../components/Button'
import '../styles/playlists.css'

const Playlists = () => {
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    type: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
    minTracks: '',
    maxTracks: '',
    dateRange: 'all',
    collaborative: 'all',
    liked: 'all',
    duration: 'all',
    popularity: 'all'
  })
  const [viewMode, setViewMode] = useState('grid') // grid, list, compact
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState(null)
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [showPlaylistDetail, setShowPlaylistDetail] = useState(false)
  
  // Player state
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [queue, setQueue] = useState([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [showQueue, setShowQueue] = useState(false)
  const [volume, setVolume] = useState(70)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState('none')

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

  const createPlaylist = async (playlistData) => {
    try {
      const response = await spotifyAPI.createPlaylist({
        name: playlistData.name,
        description: playlistData.description,
        public: playlistData.public
      })
      
      // Se a playlist foi criada e tem tracks, adicionar as tracks
      if (response.data.id && playlistData.tracks && playlistData.tracks.length > 0) {
        const trackUris = playlistData.tracks.map(track => `spotify:track:${track.id}`)
        await spotifyAPI.addTracksToPlaylist(response.data.id, trackUris)
      }
      
      await loadPlaylists()
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating playlist:', error)
      alert('Erro ao criar playlist: ' + error.message)
    }
  }

  const updatePlaylist = async (playlistId, updates) => {
    try {
      // Atualizar informações básicas da playlist
      if (playlistId) {
        await spotifyAPI.updatePlaylist(playlistId, {
          name: updates.name,
          description: updates.description,
          public: updates.public,
          collaborative: updates.collaborative
        })
      }
      
      // Recarregar playlists para mostrar as mudanças
      await loadPlaylists()
      setEditingPlaylist(null)
    } catch (error) {
      console.error('Error updating playlist:', error)
      alert('Erro ao atualizar playlist: ' + error.message)
    }
  }

  const deletePlaylist = async (playlistId) => {
    try {
      if (playlistId) {
        await spotifyAPI.deletePlaylist(playlistId)
      }
      await loadPlaylists()
    } catch (error) {
      console.error('Error deleting playlist:', error)
      alert('Erro ao excluir playlist: ' + error.message)
    }
  }

  const sharePlaylist = async (playlist) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: playlist.name,
          text: `Confira minha playlist: ${playlist.name}`,
          url: playlist.external_urls?.spotify || window.location.href
        })
      } else {
        // Fallback para copiar link
        const url = playlist.external_urls?.spotify || window.location.href
        await navigator.clipboard.writeText(url)
        alert('Link copiado para a área de transferência!')
      }
    } catch (error) {
      console.error('Error sharing playlist:', error)
    }
  }

  const playPlaylist = async (playlist, startIndex = 0) => {
    try {
      console.log('Playing playlist:', playlist.name, 'starting at index:', startIndex)
      
      // Se temos tracks na playlist, usar elas
      if (playlist.tracks?.items && playlist.tracks.items.length > 0) {
        const tracks = playlist.tracks.items.map(item => item.track).filter(Boolean)
        setQueue(tracks)
        setCurrentTrackIndex(startIndex)
        setCurrentTrack(tracks[startIndex])
        setIsPlaying(true)
      } else {
        // Se não temos tracks, buscar via API
        try {
          const response = await spotifyAPI.getPlaylistTracks(playlist.id)
          const tracks = response.data.items?.map(item => item.track).filter(Boolean) || []
          if (tracks.length > 0) {
            setQueue(tracks)
            setCurrentTrackIndex(startIndex)
            setCurrentTrack(tracks[startIndex])
            setIsPlaying(true)
          }
        } catch (error) {
          console.error('Error loading playlist tracks:', error)
          alert('Erro ao carregar músicas da playlist')
        }
      }
    } catch (error) {
      console.error('Error playing playlist:', error)
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleNext = () => {
    if (queue.length > 0) {
      const nextIndex = (currentTrackIndex + 1) % queue.length
      setCurrentTrackIndex(nextIndex)
      setCurrentTrack(queue[nextIndex])
    }
  }

  const handlePrevious = () => {
    if (queue.length > 0) {
      const prevIndex = currentTrackIndex === 0 ? queue.length - 1 : currentTrackIndex - 1
      setCurrentTrackIndex(prevIndex)
      setCurrentTrack(queue[prevIndex])
    }
  }

  const handleShuffle = (newShuffle) => {
    setShuffle(newShuffle)
    if (newShuffle && queue.length > 0) {
      const shuffledQueue = [...queue].sort(() => Math.random() - 0.5)
      setQueue(shuffledQueue)
      setCurrentTrackIndex(0)
      setCurrentTrack(shuffledQueue[0])
    }
  }

  const handleRepeat = (newRepeat) => {
    setRepeat(newRepeat)
  }

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume)
  }

  const handleLike = () => {
    // Implementar like/unlike
    console.log('Toggling like for track:', currentTrack?.name)
  }

  const toggleQueue = () => {
    setShowQueue(!showQueue)
  }

  const handleBackFromDetail = () => {
    setShowPlaylistDetail(false)
    setSelectedPlaylist(null)
  }

  // Filtros e ordenação
  const filteredPlaylists = playlists.filter(playlist => {
    if (!playlist || !playlist.id || !playlist.name) return false
    
    // Busca por texto
    const matchesSearch = searchTerm === '' || 
      playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (playlist.description && playlist.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (!matchesSearch) return false
    
    // Filtro por tipo
    if (filters.type === 'public' && !playlist.public) return false
    if (filters.type === 'private' && playlist.public) return false
    if (filters.type === 'collaborative' && !playlist.collaborative) return false
    
    // Filtro por número de tracks
    if (filters.minTracks && playlist.tracks?.total < parseInt(filters.minTracks)) return false
    if (filters.maxTracks && playlist.tracks?.total > parseInt(filters.maxTracks)) return false
    
    // Filtro por colaboração
    if (filters.collaborative === 'true' && !playlist.collaborative) return false
    if (filters.collaborative === 'false' && playlist.collaborative) return false
    
    return true
  })

  const sortedPlaylists = [...filteredPlaylists].sort((a, b) => {
    let aValue, bValue
    
    switch (filters.sortBy) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'tracks':
        aValue = a.tracks?.total || 0
        bValue = b.tracks?.total || 0
        break
      case 'recent':
        aValue = new Date(a.created_at || 0)
        bValue = new Date(b.created_at || 0)
        break
      case 'updated':
        aValue = new Date(a.updated_at || 0)
        bValue = new Date(b.updated_at || 0)
        break
      case 'followers':
        aValue = a.followers?.total || 0
        bValue = b.followers?.total || 0
        break
      case 'duration':
        aValue = a.tracks?.items?.reduce((acc, item) => acc + (item.track?.duration_ms || 0), 0) || 0
        bValue = b.tracks?.items?.reduce((acc, item) => acc + (item.track?.duration_ms || 0), 0) || 0
        break
      default:
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
    }
    
    if (typeof aValue === 'string') {
      return filters.sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    } else {
      return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    }
  })

  if (loading) return <Loading />

  // Se estamos mostrando os detalhes de uma playlist
  if (showPlaylistDetail && selectedPlaylist) {
    return (
      <PlaylistDetail
        playlist={selectedPlaylist}
        onBack={handleBackFromDetail}
        onEdit={(playlist) => {
          setEditingPlaylist(playlist)
          setShowPlaylistDetail(false)
        }}
        onDelete={async (playlistId) => {
          await deletePlaylist(playlistId)
          setShowPlaylistDetail(false)
          setSelectedPlaylist(null)
        }}
        onPlay={playPlaylist}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
                Suas Playlists
              </h1>
              <p className="text-gray-300 text-lg mt-3">
                Gerencie e descubra suas coleções musicais
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={loadPlaylists}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Atualizar
              </Button>
              
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
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <PlaylistFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Controles de Visualização */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">
              {sortedPlaylists.length} playlist{sortedPlaylists.length !== 1 ? 's' : ''} encontrada{sortedPlaylists.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="Visualização em grade"
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="Visualização em lista"
            >
              <List className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setViewMode('compact')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'compact' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="Visualização compacta"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Playlists */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {sortedPlaylists.length === 0 ? (
          <div className="text-center py-16">
            <Music className="w-24 h-24 text-gray-400 mx-auto mb-6 opacity-50" />
            <h3 className="text-2xl font-semibold text-white mb-4">Nenhuma playlist encontrada</h3>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              {searchTerm || Object.values(filters).some(f => f !== 'all' && f !== '') 
                ? 'Tente ajustar seus filtros de busca' 
                : 'Crie sua primeira playlist para começar sua jornada musical'
              }
            </p>
            {!searchTerm && Object.values(filters).every(f => f === 'all' || f === '') && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4"
              >
                <Plus className="w-6 h-6 mr-3" />
                Criar Primeira Playlist
              </Button>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 playlist-grid ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : viewMode === 'list'
              ? 'grid-cols-1'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {sortedPlaylists.map((playlist) => (
              <div key={playlist.id} className="playlist-card">
                <PlaylistCard
                  playlist={playlist}
                  onPlay={playPlaylist}
                  onEdit={setEditingPlaylist}
                  onDelete={deletePlaylist}
                  onShare={sharePlaylist}
                  onSelect={(playlist) => {
                    setSelectedPlaylist(playlist)
                    setShowPlaylistDetail(true)
                  }}
                  isPlaying={currentTrack && queue.length > 0 && currentTrackIndex < queue.length && queue[currentTrackIndex]?.id === playlist.id}
                  isLiked={false} // Implementar verificação de like
                />
                </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criação de Playlist */}
      {showCreateModal && (
        <PlaylistEditModal
          playlist={null}
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={(id, data) => createPlaylist(data)}
        />
      )}

      {/* Modal de Edição de Playlist */}
      {editingPlaylist && (
        <PlaylistEditModal
          playlist={editingPlaylist}
          isOpen={!!editingPlaylist}
          onClose={() => setEditingPlaylist(null)}
          onSave={updatePlaylist}
          onDelete={deletePlaylist}
        />
      )}

      {/* Player de Música */}
      {currentTrack && (
        <MusicPlayer
          track={currentTrack}
          isPlaying={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onShuffle={handleShuffle}
          onRepeat={handleRepeat}
          onVolumeChange={handleVolumeChange}
          onLike={handleLike}
          isLiked={false}
          showQueue={showQueue}
          onToggleQueue={toggleQueue}
        />
      )}
    </div>
  )
}

export default Playlists
