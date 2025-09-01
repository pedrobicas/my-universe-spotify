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
  const [activeTab, setActiveTab] = useState('details') // details, tracks, settings

  useEffect(() => {
    if (playlist && isOpen) {
      setFormData({
        name: playlist.name || '',
        description: playlist.description || '',
        public: playlist.public !== false,
        collaborative: playlist.collaborative || false
      })
      
      // Carregar tracks da playlist se existir
      if (playlist.id) {
        loadPlaylistTracks(playlist.id)
      }
    } else if (!playlist && isOpen) {
      // Resetar dados para nova playlist
      setFormData({
        name: '',
        description: '',
        public: true,
        collaborative: false
      })
      setSelectedTracks([])
    }
    
    // Limpar estados de busca quando abrir/fechar modal
    if (isOpen) {
      setSearchQuery('')
      setSearchResults([])
      setIsSearching(false)
    }
  }, [playlist, isOpen])

  const loadPlaylistTracks = async (playlistId) => {
    try {
      console.log('Carregando tracks para playlist:', playlistId)
      
      // Primeiro tentar usar os dados da playlist que já temos
      if (playlist.tracks?.items && playlist.tracks.items.length > 0) {
        console.log('Usando tracks existentes:', playlist.tracks.items.length)
        const tracks = playlist.tracks.items.map(item => item.track).filter(Boolean) || []
        setSelectedTracks(tracks)
        return
      }
      
      // Se não temos tracks na playlist, buscar via API
      console.log('Buscando tracks via API...')
      try {
        const response = await spotifyAPI.getPlaylistTracks(playlistId)
        console.log('Resposta da API:', response)
        const tracks = response.data.items?.map(item => item.track).filter(Boolean) || []
        console.log('Tracks encontradas:', tracks.length)
        setSelectedTracks(tracks)
      } catch (error) {
        console.error('Erro ao buscar tracks via getPlaylistTracks:', error)
        
        // Fallback: tentar buscar via getPlaylists
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
      // Se playlist é null, estamos criando uma nova
      // Se playlist existe, estamos editando
      const playlistId = playlist?.id || null
      
      // Incluir tracks no dados a serem salvos
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
      
      // Adicionar ao estado local primeiro
      setSelectedTracks(prev => [...prev, track])
      
      // Limpar resultados da busca após adicionar
      setSearchResults([])
      setSearchQuery('')
      
      // Se estamos editando uma playlist existente, adicionar a track via API
      if (playlist?.id) {
        try {
          console.log('Adicionando track via API para playlist:', playlist.id)
          await spotifyAPI.addTracksToPlaylist(playlist.id, [`spotify:track:${track.id}`])
          console.log('Track adicionada com sucesso via API')
          alert(`"${track.name}" adicionada à playlist com sucesso!`)
        } catch (error) {
          console.error('Erro ao adicionar track à playlist:', error)
          // Remover a track do estado local se falhar na API
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
      // Se estamos editando uma playlist existente, remover a track via API
      if (playlist?.id) {
        await spotifyAPI.removeTracksFromPlaylist(playlist.id, [`spotify:track:${trackId}`])
      }
      
      // Remover do estado local
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
        
        // Se estamos editando uma playlist existente, reordenar via API
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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">
            {playlist ? 'Editar Playlist' : 'Criar Nova Playlist'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {[
            { id: 'details', label: 'Detalhes', icon: ImageIcon },
            { id: 'tracks', label: 'Tracks', icon: Music },
            { id: 'settings', label: 'Configurações', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-green-400 border-b-2 border-green-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Imagem da Playlist */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={playlist?.images?.[0]?.url || '/default-playlist.jpg'}
                    alt={playlist?.name || 'Nova Playlist'}
                    className="w-32 h-32 object-cover rounded-xl"
                  />
                  <button className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-white" />
                  </button>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Nome da Playlist *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={playlist ? "Descreva sua playlist" : "Descreva a nova playlist"}
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tracks' && (
            <div className="space-y-6">
              {/* Busca de Tracks */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Adicionar Tracks</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Busque por nome da música ou artista para adicionar à playlist
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Digite o nome da música ou artista..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setSearchResults([])
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim() || isSearching}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {isSearching ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>

                {/* Resultados da Busca */}
                {isSearching && (
                  <div className="text-center py-8 text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                    <p>Buscando tracks...</p>
                  </div>
                )}
                
                {!isSearching && searchResults.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <p className="text-sm text-gray-400 mb-2">
                      {searchResults.length} resultado(s) encontrado(s)
                    </p>
                    {searchResults.map(track => (
                      <div key={track.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
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
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-sm transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>Nenhuma track encontrada para "{searchQuery}"</p>
                    <p className="text-sm">Tente uma busca diferente</p>
                  </div>
                )}
              </div>

              {/* Tracks Selecionadas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Tracks da Playlist ({selectedTracks.length})
                </h3>
                
                {selectedTracks.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Nenhuma música na playlist</p>
                    <p className="text-sm">Use a busca acima para adicionar músicas</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {selectedTracks.map((track, index) => (
                      <div
                        key={track.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                        
                        <div className="w-8 text-center text-gray-400 font-medium">
                          {index + 1}
                        </div>
                        
                        <img
                          src={track.album?.images?.[0]?.url || '/default-track.jpg'}
                          alt={track.album?.name || 'Track'}
                          className="w-10 h-10 rounded-lg"
                        />
                        
                        <div className="flex-1">
                          <p className="font-medium text-white">{track.name}</p>
                          <p className="text-gray-400 text-sm">
                            {track.artists?.map(a => a.name).join(', ')}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveTrack(track.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>


            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Configurações da Playlist</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {formData.public ? (
                      <Globe className="w-6 h-6 text-green-400" />
                    ) : (
                      <Lock className="w-6 h-6 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium text-white">Visibilidade</p>
                      <p className="text-gray-400 text-sm">
                        {formData.public ? 'Pública - Qualquer pessoa pode ver' : 'Privada - Apenas você pode ver'}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.public}
                      onChange={(e) => handleInputChange('public', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6 text-blue-400" />
                    <div>
                      <p className="font-medium text-white">Colaborativa</p>
                      <p className="text-gray-400 text-sm">
                        {formData.collaborative ? 'Outros usuários podem editar' : 'Apenas você pode editar'}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.collaborative}
                      onChange={(e) => handleInputChange('collaborative', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10 bg-gray-800/50">
          <div className="flex space-x-3">
            {playlist && (
              <Button
                onClick={onDelete}
                className="px-6 py-3 bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Playlist
              </Button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name.trim()}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {playlist ? 'Salvar Alterações' : 'Criar Playlist'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaylistEditModal
