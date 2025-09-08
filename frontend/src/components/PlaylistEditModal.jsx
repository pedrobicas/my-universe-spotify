import React, { useState, useEffect } from 'react'
import { 
  X, 
  Save, 
  Image as ImageIcon, 
  Users, 
  Lock, 
  Globe,
  Music,
  Plus,
  Trash2,
  Search,
  GripVertical
} from 'lucide-react'
import Button from './Button'
import { spotifyAPI } from '../services/api'

const PlaylistEditModal = ({ 
  playlist, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  onAddTracks,
  onRemoveTrack,
  onReorderTracks
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    public: true,
    collaborative: false
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedTracks, setSelectedTracks] = useState([])
  const [activeTab, setActiveTab] = useState('details') 

  useEffect(() => {
    if (playlist && isOpen) {
      setFormData({
        name: playlist.name || '',
        description: playlist.description || '',
        public: playlist.public !== false,
        collaborative: playlist.collaborative || false
      })
      
      if (playlist.id) {
        loadPlaylistTracks(playlist.id)
      }
    } else if (!playlist && isOpen) {
      setFormData({
        name: '',
        description: '',
        public: true,
        collaborative: false
      })
      setSelectedTracks([])
    }
    
    if (isOpen) {
      setSearchQuery('')
      setSearchResults([])
      setIsSearching(false)
    }
  }, [playlist, isOpen])

  const loadPlaylistTracks = async (playlistId) => {
    try {
      console.log('Carregando tracks para playlist:', playlistId)
      
      if (playlist.tracks?.items && playlist.tracks.items.length > 0) {
        console.log('Usando tracks existentes:', playlist.tracks.items.length)
        const tracks = playlist.tracks.items.map(item => item.track).filter(Boolean) || []
        setSelectedTracks(tracks)
        return
      }
      
      console.log('Buscando tracks via API...')
      try {
        const response = await spotifyAPI.getPlaylistTracks(playlistId)
        console.log('Resposta da API:', response)
        const tracks = response.data.items?.map(item => item.track).filter(Boolean) || []
        console.log('Tracks encontradas:', tracks.length)
        setSelectedTracks(tracks)
      } catch (error) {
        console.error('Erro ao buscar tracks via getPlaylistTracks:', error)
        
        console.log('Tentando fallback via getPlaylists...')
        try {
          const response = await spotifyAPI.getPlaylists(50)
          const userPlaylist = response.data.items.find(p => p.id === playlistId)
          if (userPlaylist?.tracks?.items) {
            const tracks = userPlaylist.tracks.items.map(item => item.track).filter(Boolean) || []
            console.log('Tracks via fallback:', tracks.length)
            setSelectedTracks(tracks)
          } else {
            console.log('Nenhuma track encontrada via fallback')
            setSelectedTracks([])
          }
        } catch (fallbackError) {
          console.error('Erro no fallback:', fallbackError)
          setSelectedTracks([])
        }
      }
    } catch (error) {
      console.error('Erro geral ao carregar tracks:', error)
      setSelectedTracks([])
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Nome da playlist é obrigatório')
      return
    }
    
    try {
      const playlistId = playlist?.id || null
      
      const dataToSave = {
        ...formData,
        tracks: selectedTracks
      }
      
      onSave?.(playlistId, dataToSave)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar playlist:', error)
      alert('Erro ao salvar playlist: ' + error.message)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    console.log('Buscando tracks para:', searchQuery)
    setIsSearching(true)
    try {
      const response = await spotifyAPI.searchTracks(searchQuery, 20)
      console.log('Resposta da busca:', response)
      const tracks = response.data.tracks?.items || []
      console.log('Tracks encontradas:', tracks.length)
      setSearchResults(tracks)
    } catch (error) {
      console.error('Erro na busca:', error)
      setSearchResults([])
      alert('Erro ao buscar tracks. Tente novamente.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddTrack = async (track) => {
    console.log('Tentando adicionar track:', track.name, 'ID:', track.id)
    
    if (!selectedTracks.find(t => t.id === track.id)) {
      console.log('Track não encontrada na playlist, adicionando...')
      
      setSelectedTracks(prev => [...prev, track])
      
      setSearchResults([])
      setSearchQuery('')
      
      if (playlist?.id) {
        try {
          console.log('Adicionando track via API para playlist:', playlist.id)
          await spotifyAPI.addTracksToPlaylist(playlist.id, [`spotify:track:${track.id}`])
          console.log('Track adicionada com sucesso via API')
          alert(`"${track.name}" adicionada à playlist com sucesso!`)
        } catch (error) {
          console.error('Erro ao adicionar track à playlist:', error)
          setSelectedTracks(prev => prev.filter(t => t.id !== track.id))
          alert(`Erro ao adicionar "${track.name}" à playlist: ${error.message}`)
        }
      } else {
        console.log('Nova playlist, track adicionada apenas ao estado local')
        alert(`"${track.name}" adicionada à nova playlist!`)
      }
    } else {
      console.log('Track já existe na playlist')
      alert('Esta track já está na playlist!')
    }
  }

  const handleRemoveTrack = async (trackId) => {
    try {
      if (playlist?.id) {
        await spotifyAPI.removeTracksFromPlaylist(playlist.id, [`spotify:track:${trackId}`])
      }
      
      setSelectedTracks(prev => prev.filter(t => t.id !== trackId))
    } catch (error) {
      console.error('Erro ao remover track da playlist:', error)
      alert('Erro ao remover track da playlist')
    }
  }

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault()
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
    
    if (dragIndex !== dropIndex) {
      try {
        const newTracks = [...selectedTracks]
        const [draggedTrack] = newTracks.splice(dragIndex, 1)
        newTracks.splice(dropIndex, 0, draggedTrack)
        if (playlist?.id) {
          await spotifyAPI.reorderPlaylistTracks(playlist.id, dragIndex, dropIndex)
        }
        
        setSelectedTracks(newTracks)
        onReorderTracks?.(newTracks)
      } catch (error) {
        console.error('Erro ao reordenar tracks:', error)
        alert('Erro ao reordenar tracks')
      }
    }
  }

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-2xl w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl h-full sm:h-auto sm:max-h-[95vh] md:max-h-[90vh] overflow-hidden border border-white/10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate mr-4">
            {playlist ? 'Editar Playlist' : 'Criar Nova Playlist'}
          </h2>
          <button
            onClick={onClose}
            className="group relative p-2 sm:p-3 text-gray-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/60 rounded-xl transition-all duration-300 border-2 border-slate-600/30 hover:border-slate-500/50 shadow-lg hover:shadow-xl hover:shadow-slate-500/30 flex-shrink-0"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <X className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 overflow-x-auto flex-shrink-0">
          {[
            { id: 'details', label: 'Detalhes', icon: ImageIcon, shortLabel: 'Info' },
            { id: 'tracks', label: 'Tracks', icon: Music, shortLabel: 'Tracks' },
            { id: 'settings', label: 'Configurações', icon: Users, shortLabel: 'Config' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-6 md:px-8 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-all duration-300 overflow-hidden whitespace-nowrap min-w-0 flex-1 sm:flex-none ${
                activeTab === tab.id
                  ? 'text-emerald-300 border-b-3 border-emerald-400 bg-gradient-to-r from-emerald-500/20 to-green-500/20 shadow-lg shadow-emerald-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-slate-700/30 hover:to-slate-600/30'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${activeTab === tab.id ? 'opacity-50' : ''}`}></div>
              <tab.icon className={`w-3 h-3 sm:w-4 sm:h-4 relative z-10 transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'} flex-shrink-0`} />
              <span className="relative z-10 hidden sm:inline">{tab.label}</span>
              <span className="relative z-10 sm:hidden truncate">{tab.shortLabel}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6 overflow-y-auto flex-1 min-h-0">
          {activeTab === 'details' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Imagem da Playlist */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative flex-shrink-0">
                  <img
                    src={playlist?.images?.[0]?.url || '/default-playlist.jpg'}
                    alt={playlist?.name || 'Nova Playlist'}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl"
                  />
                  <button className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </button>
                </div>
                
                <div className="flex-1 space-y-3 sm:space-y-4 w-full">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Nome da Playlist *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                      placeholder={playlist ? "Digite o nome da playlist" : "Nome da nova playlist"}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base resize-none"
                      placeholder={playlist ? "Descreva sua playlist" : "Descreva a nova playlist"}
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tracks' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Busca de Tracks */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">Adicionar Tracks</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    Busque por nome da música ou artista para adicionar à playlist
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type="text"
                      placeholder="Digite o nome da música ou artista..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-9 sm:pl-10 pr-10 py-2 sm:py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setSearchResults([])
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    )}
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim() || isSearching}
                    className="group relative px-4 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-cyan-500/40 disabled:shadow-none transition-all duration-300 border-2 border-cyan-400/40 hover:border-cyan-300/60 disabled:border-gray-500/30 overflow-hidden text-sm sm:text-base flex-shrink-0"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10">{isSearching ? 'Buscando...' : 'Buscar'}</span>
                  </Button>
                </div>

                {/* Resultados da Busca */}
                {isSearching && (
                  <div className="text-center py-6 sm:py-8 text-gray-400">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                    <p>Buscando tracks...</p>
                  </div>
                )}
                
                {!isSearching && searchResults.length > 0 && (
                  <div className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
                    <p className="text-xs sm:text-sm text-gray-400 mb-2">
                      {searchResults.length} resultado(s) encontrado(s)
                    </p>
                    {searchResults.map(track => (
                      <div key={track.id} className="flex items-center justify-between p-2 sm:p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors gap-2 sm:gap-3">
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <img
                            src={track.album?.images?.[0]?.url || '/default-track.jpg'}
                            alt={track.album?.name || 'Track'}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-white text-sm sm:text-base truncate">{track.name}</p>
                            <p className="text-gray-400 text-xs sm:text-sm truncate">
                              {track.artists?.map(a => a.name).join(', ')}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleAddTrack(track)}
                          className="group relative px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 border border-green-400/30 hover:border-green-300/50 overflow-hidden flex-shrink-0"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative flex items-center">
                            <Plus className="w-2 h-2 sm:w-3 sm:h-3 mr-1 group-hover:rotate-90 transition-transform duration-300" />
                            <span className="hidden sm:inline">Adicionar</span>
                            <span className="sm:hidden">+</span>
                          </div>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
                  <div className="text-center py-6 sm:py-8 text-gray-400">
                    <p className="text-sm sm:text-base">Nenhuma track encontrada para "{searchQuery}"</p>
                    <p className="text-xs sm:text-sm">Tente uma busca diferente</p>
                  </div>
                )}
              </div>

              {/* Tracks Selecionadas */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  Tracks da Playlist ({selectedTracks.length})
                </h3>
                
                {selectedTracks.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-400">
                    <Music className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-base sm:text-lg">Nenhuma música na playlist</p>
                    <p className="text-xs sm:text-sm">Use a busca acima para adicionar músicas</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 sm:max-h-80 overflow-y-auto">
                    {selectedTracks.map((track, index) => (
                      <div
                        key={track.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 cursor-move flex-shrink-0" />
                        
                        <div className="w-6 sm:w-8 text-center text-gray-400 font-medium text-xs sm:text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        
                        <img
                          src={track.album?.images?.[0]?.url || '/default-track.jpg'}
                          alt={track.album?.name || 'Track'}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-shrink-0"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm sm:text-base truncate">{track.name}</p>
                          <p className="text-gray-400 text-xs sm:text-sm truncate">
                            {track.artists?.map(a => a.name).join(', ')}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveTrack(track.id)}
                          className="p-1 sm:p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>


            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-white">Configurações da Playlist</h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    {formData.public ? (
                      <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0" />
                    ) : (
                      <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white text-sm sm:text-base">Visibilidade</p>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        {formData.public ? 'Pública - Qualquer pessoa pode ver' : 'Privada - Apenas você pode ver'}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={formData.public}
                      onChange={(e) => handleInputChange('public', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white text-sm sm:text-base">Colaborativa</p>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        {formData.collaborative ? 'Outros usuários podem editar' : 'Apenas você pode editar'}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={formData.collaborative}
                      onChange={(e) => handleInputChange('collaborative', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 sm:p-6 border-t border-white/10 bg-gray-800/50 gap-3 sm:gap-0 flex-shrink-0">
          <div className="flex justify-center sm:justify-start">
            {playlist && (
              <Button
                onClick={() => onDelete?.(playlist.id)}
                className="group relative px-4 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-red-600 via-red-500 to-pink-600 hover:from-red-700 hover:via-red-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-300 border-2 border-red-400/40 hover:border-red-300/60 overflow-hidden text-sm sm:text-base"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center">
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 group-hover:scale-110 transition-transform duration-300" />
                  <span className="hidden sm:inline">Excluir Playlist</span>
                  <span className="sm:hidden">Excluir</span>
                </div>
              </Button>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button
              onClick={onClose}
              className="group relative px-4 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-slate-500/30 transition-all duration-300 border-2 border-slate-400/30 hover:border-slate-300/50 overflow-hidden text-sm sm:text-base"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">Cancelar</span>
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name.trim()}
              className="group relative px-4 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-green-500/50 disabled:shadow-none transition-all duration-300 border-2 border-green-400/40 hover:border-green-300/60 disabled:border-gray-500/30 overflow-hidden disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center">
                <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{playlist ? 'Salvar Alterações' : 'Criar Playlist'}</span>
                <span className="sm:hidden">{playlist ? 'Salvar' : 'Criar'}</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaylistEditModal
