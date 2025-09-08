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
  X,
  Play,
  Pause
} from 'lucide-react'
import { spotifyAPI } from '../services/api'
import { useMusic } from '../contexts/MusicContext'
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
  const { playTrack, playPlaylist, currentTrack, isPlaying } = useMusic()

  useEffect(() => {
    if (playlist) {
      loadPlaylistTracks()
    }
  }, [playlist])

  const loadPlaylistTracks = async () => {
    try {
      setLoading(true)
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
      await loadPlaylistTracks()
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
      await loadPlaylistTracks()
    } catch (error) {
      console.error('Erro ao remover track:', error)
      alert('Erro ao remover track da playlist')
    }
  }

  const handlePlayTrack = async (track, index) => {
    try {
      const playlistTracks = tracks.map(item => item.track).filter(Boolean)
      await playTrack(track, playlistTracks, index)
    } catch (error) {
      console.error('Erro ao reproduzir música:', error)
      alert('Erro ao reproduzir música. Verifique se você tem o Spotify aberto e um dispositivo ativo.')
    }
  }

  const handlePlayPlaylist = async () => {
    try {
      const playlistWithTracks = { ...playlist, tracks: { items: tracks } }
      await playPlaylist(playlistWithTracks, 0)
    } catch (error) {
      console.error('Erro ao reproduzir playlist:', error)
      alert('Erro ao reproduzir playlist. Verifique se você tem o Spotify aberto e um dispositivo ativo.')
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <Button
              onClick={onBack}
              className="group relative px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-800/60 hover:bg-slate-700/70 text-white border-2 border-slate-600/40 hover:border-slate-500/60 rounded-xl backdrop-blur-md transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-slate-500/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-600/30 to-slate-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-medium text-sm sm:text-base">Voltar</span>
              </div>
            </Button>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Imagem da Playlist */}
            <div className="relative flex-shrink-0 mx-auto lg:mx-0">
              <img
                src={playlist.images?.[0]?.url || '/default-playlist.jpg'}
                alt={playlist.name}
                className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 object-cover rounded-2xl shadow-2xl"
              />
            </div>
            
            {/* Informações da Playlist */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-3 sm:mb-4">
                {playlist.public ? (
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                ) : (
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                )}
                <span className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">
                  {playlist.public ? 'Pública' : 'Privada'}
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 break-words">{playlist.name}</h1>
              
              {playlist.description && (
                <p className="text-gray-300 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 max-w-full lg:max-w-2xl">
                  {playlist.description}
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{playlist.owner?.display_name || 'Usuário'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Music className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{playlist.tracks?.total || tracks.length} músicas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>
                    {tracks.reduce((total, item) => total + (item.track?.duration_ms || 0), 0) > 0 
                      ? formatDuration(tracks.reduce((total, item) => total + (item.track?.duration_ms || 0), 0))
                      : '--:--'
                    }
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <Button
                  onClick={handlePlayPlaylist}
                  disabled={tracks.length === 0}
                  className="w-full sm:w-auto group relative px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 disabled:from-gray-600 disabled:to-gray-700 text-white text-sm sm:text-base lg:text-lg font-bold rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-3xl hover:shadow-green-500/60 disabled:shadow-none transition-all duration-500 border-2 border-green-400/50 hover:border-green-300/70 disabled:border-gray-500/30 overflow-hidden disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center justify-center">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
                    <span>Reproduzir</span>
                  </div>
                </Button>
                
                <Button
                  onClick={() => setShowAddTracks(true)}
                  className="w-full sm:w-auto group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 border-2 border-blue-400/40 hover:border-blue-300/60 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="text-sm sm:text-base">Adicionar</span>
                  </div>
                </Button>
                
                <Button
                  onClick={() => onEdit(playlist)}
                  className="w-full sm:w-auto group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-amber-500/40 transition-all duration-300 border-2 border-amber-400/40 hover:border-amber-300/60 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center">
                    <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="text-sm sm:text-base">Editar</span>
                  </div>
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
                className="group relative px-10 py-5 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:shadow-purple-500/60 transition-all duration-500 border-2 border-purple-400/50 hover:border-purple-300/70 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center">
                  <Plus className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Adicionar Primeira Música</span>
                </div>
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-black/20 rounded-2xl border border-white/10 overflow-hidden">
            {/* Header da Lista - Desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-white/5 border-b border-white/10 text-gray-400 text-sm font-medium">
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
                    className="p-3 sm:p-4 hover:bg-white/5 transition-colors group"
                  >
                    {/* Layout Mobile */}
                    <div className="md:hidden">
                      <div className="flex items-center space-x-3">
                        {/* Número/Play Button */}
                        <div className="relative flex-shrink-0 w-10 h-10 flex items-center justify-center">
                          <button
                            onClick={() => handlePlayTrack(track, index)}
                            className="w-full h-full flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-black opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-500/50 border-2 border-green-400/30 hover:border-green-300/50"
                            title="Reproduzir música"
                          >
                            {currentTrack?.id === track.id && isPlaying ? (
                              <Pause size={14} className="animate-pulse" />
                            ) : (
                              <Play size={14} />
                            )}
                          </button>
                          <span className="absolute inset-0 flex items-center justify-center text-gray-400 group-hover:opacity-0 transition-opacity font-medium text-sm">
                            {index + 1}
                          </span>
                        </div>

                        {/* Informações da Música */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-white font-medium truncate text-sm sm:text-base">
                                {track.name}
                              </h4>
                              <p className="text-gray-400 text-xs sm:text-sm truncate">
                                {track.artists?.map(artist => artist.name).join(', ')}
                              </p>
                            </div>
                            
                            {/* Ações Mobile */}
                            <div className="flex items-center space-x-2 ml-2">
                              <span className="text-gray-400 text-xs">
                                {formatDuration(track.duration_ms)}
                              </span>
                              <button
                                onClick={() => handleRemoveTrack(track.id)}
                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-all"
                                title="Remover da playlist"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Layout Desktop */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-1 text-center text-gray-400 flex items-center justify-center">
                        <button
                          onClick={() => handlePlayTrack(track, index)}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-black opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-500/50 border-2 border-green-400/30 hover:border-green-300/50"
                          title="Reproduzir música"
                        >
                          {currentTrack?.id === track.id && isPlaying ? (
                            <Pause size={16} className="animate-pulse" />
                          ) : (
                            <Play size={16} />
                          )}
                        </button>
                        <span className="group-hover:opacity-0 transition-opacity font-medium">
                          {index + 1}
                        </span>
                      </div>
                      
                      <div className="col-span-6">
                        <div className="flex items-center space-x-3">
                          <img
                            src={track.album?.images?.[0]?.url || '/default-track.jpg'}
                            alt={track.album?.name || 'Album'}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-white font-medium truncate hover:text-green-400 transition-colors cursor-pointer">
                              {track.name}
                            </h4>
                            <p className="text-gray-400 text-sm truncate">
                              {track.album?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-span-3">
                        <p className="text-gray-400 truncate text-sm">
                          {track.artists?.map(artist => artist.name).join(', ')}
                        </p>
                      </div>
                      
                      <div className="col-span-1 text-center">
                        <span className="text-gray-400 text-sm">
                          {formatDuration(track.duration_ms)}
                        </span>
                      </div>
                      
                      <div className="col-span-1 text-center">
                        <button
                          onClick={() => handleRemoveTrack(track.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-all opacity-0 group-hover:opacity-100"
                          title="Remover da playlist"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
                className="group relative p-3 text-gray-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/60 rounded-xl transition-all duration-300 border-2 border-slate-600/30 hover:border-slate-500/50 shadow-lg hover:shadow-xl hover:shadow-slate-500/30"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <X className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
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
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 shadow-lg hover:shadow-xl hover:shadow-green-500/25 transition-all duration-200 border border-green-500/20"
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
