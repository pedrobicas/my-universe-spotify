import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useDemo } from '../contexts/DemoContext'
import { spotifyAPI } from '../services/api'
import demoAPI from '../services/demoAPI'
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
import Loading from '../components/Loading'
import Button from '../components/Button'
import '../styles/playlists.css'

const Playlists = () => {
  const { user } = useAuth()
  const { isDemoMode } = useDemo()
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
  const [viewMode, setViewMode] = useState('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState(null)
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [showPlaylistDetail, setShowPlaylistDetail] = useState(false)
  
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [queue, setQueue] = useState([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [showQueue, setShowQueue] = useState(false)
  const [volume, setVolume] = useState(70)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState('none')

  // Função para obter a API correta baseada no modo
  const getAPI = () => {
    return isDemoMode ? demoAPI : spotifyAPI;
  };

  useEffect(() => {
    loadPlaylists()
  }, [isDemoMode])

  const loadPlaylists = async () => {
    try {
      setLoading(true)
      const api = getAPI();
      const response = await api.getPlaylists(50)
      
      const validPlaylists = response.data.items?.filter(playlist => 
        playlist && 
        playlist.id && 
        playlist.name && 
        typeof playlist === 'object'
      ) || []
      
      const playlistsWithTracks = await Promise.all(
        validPlaylists.map(async (playlist) => {
          try {
            const api = getAPI();
            const tracksResponse = await api.getPlaylistTracks(playlist.id)
            return {
              ...playlist,
              tracks: tracksResponse.data
            }
          } catch (error) {
            console.error(`Error loading tracks for playlist ${playlist.id}:`, error)
            return {
              ...playlist,
              tracks: { items: [], total: 0 }
            }
          }
        })
      )
      
      setPlaylists(playlistsWithTracks)
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
      if (playlistId) {
        await spotifyAPI.updatePlaylist(playlistId, {
          name: updates.name,
          description: updates.description,
          public: updates.public,
          collaborative: updates.collaborative
        })
      }
      
      await loadPlaylists()
      setEditingPlaylist(null)
    } catch (error) {
      console.error('Error updating playlist:', error)
      alert('Erro ao atualizar playlist: ' + error.message)
    }
  }

  const deletePlaylist = async (playlistId) => {
    try {
      if (!playlistId) {
        alert('ID da playlist não encontrado')
        return
      }
      
      console.log('=== INICIANDO EXCLUSÃO ===')
      console.log('ID da playlist:', playlistId)
      console.log('Tipo do ID:', typeof playlistId)
      console.log('API disponível:', !!spotifyAPI)
      console.log('Método deletePlaylist disponível:', !!spotifyAPI.deletePlaylist)
      
      const response = await spotifyAPI.deletePlaylist(playlistId)
      console.log('Resposta da exclusão:', response)
      
      alert('Playlist excluída com sucesso!')
      
      await loadPlaylists()
    } catch (error) {
      console.error('=== ERRO NA EXCLUSÃO ===')
      console.error('Error completo:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      
      let errorMessage = 'Erro ao excluir playlist'
      if (error.response?.data?.message) {
        errorMessage += ': ' + error.response.data.message
      } else if (error.message) {
        errorMessage += ': ' + error.message
      }
      
      alert(errorMessage)
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
      
      if (playlist.tracks?.items && playlist.tracks.items.length > 0) {
        const tracks = playlist.tracks.items.map(item => item.track).filter(Boolean)
        setQueue(tracks)
        setCurrentTrackIndex(startIndex)
        setCurrentTrack(tracks[startIndex])
        setIsPlaying(true)
      } else {
        try {
          const api = getAPI();
          const response = await api.getPlaylistTracks(playlist.id)
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

  const handleBackFromDetail = () => {
    setShowPlaylistDetail(false)
    setSelectedPlaylist(null)
  }

  const filteredPlaylists = playlists.filter(playlist => {
    if (!playlist || !playlist.id || !playlist.name) return false
    
    const matchesSearch = searchTerm === '' || 
      playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (playlist.description && playlist.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (!matchesSearch) return false
    
    if (filters.type === 'public' && !playlist.public) return false
    if (filters.type === 'private' && playlist.public) return false
    if (filters.type === 'collaborative' && !playlist.collaborative) return false
    
    if (filters.minTracks && playlist.tracks?.total < parseInt(filters.minTracks)) return false
    if (filters.maxTracks && playlist.tracks?.total > parseInt(filters.maxTracks)) return false
    
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
                Suas Playlists
              </h1>
              <p className="text-gray-300 text-base sm:text-lg mt-2 sm:mt-3">
                Gerencie e descubra suas coleções musicais
              </p>
            </div>
            
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 xs:gap-4">
              <Button
                onClick={loadPlaylists}
                className="group relative px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-800/50 hover:bg-slate-700/60 text-white border-2 border-slate-600/30 hover:border-slate-500/50 rounded-xl backdrop-blur-md transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-slate-500/20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-600/20 to-slate-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="font-medium text-sm sm:text-base">Atualizar</span>
                </div>
              </Button>
              
            <Button
              onClick={() => setShowCreateModal(true)}
              className="group relative px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white rounded-xl shadow-xl hover:shadow-2xl hover:shadow-green-500/40 transition-all duration-300 border-2 border-green-400/30 hover:border-green-300/50 overflow-hidden font-semibold"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center">
                <Plus className="w-4 sm:w-5 h-4 sm:h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-sm sm:text-base">Nova Playlist</span>
              </div>
            </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
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

          <div className="flex items-center bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-2 border-slate-600/30 rounded-2xl p-2 shadow-2xl shadow-slate-900/30">
            <button
              onClick={() => setViewMode('grid')}
              className={`group relative p-3 rounded-xl transition-all duration-300 ${
                viewMode === 'grid' 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-green-500/40' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Visualização em grade"
            >
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${viewMode === 'grid' ? 'opacity-30' : ''}`}></div>
              <Grid3X3 className="w-5 h-5 relative z-10" />
            </button>
            
            <button
              onClick={() => setViewMode('list')}
              className={`group relative p-3 rounded-xl transition-all duration-300 ${
                viewMode === 'list' 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-green-500/40' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Visualização em lista"
            >
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${viewMode === 'list' ? 'opacity-30' : ''}`}></div>
              <List className="w-5 h-5 relative z-10" />
            </button>
            
            <button
              onClick={() => setViewMode('compact')}
              className={`group relative p-3 rounded-xl transition-all duration-300 ${
                viewMode === 'compact' 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-green-500/40' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Visualização compacta"
            >
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${viewMode === 'compact' ? 'opacity-30' : ''}`}></div>
              <BarChart3 className="w-5 h-5 relative z-10" />
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
                className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:from-purple-700 hover:via-pink-700 hover:to-red-600 text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:shadow-pink-500/50 transition-all duration-500 border-2 border-pink-400/40 hover:border-pink-300/60 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-45 from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 animate-pulse"></div>
                <div className="relative flex items-center">
                  <Plus className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Criar Primeira Playlist</span>
                </div>
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
                  isLiked={false}
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


    </div>
  )
}

export default Playlists
