import { Grid3X3, List, Plus, RefreshCw, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Loading from '../components/Loading'
import PlaylistCard from '../components/PlaylistCard'
import PlaylistDetail from '../components/PlaylistDetail'
import PlaylistEditModal from '../components/PlaylistEditModal'
import { useDemo } from '../contexts/DemoContext'
import { useMusic } from '../contexts/MusicContext'
import demoAPI from '../services/demoAPI'
import { spotifyAPI } from '../services/api'

const Playlists = () => {
  const { isDemoMode } = useDemo()
  const { playPlaylist } = useMusic()
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState(null)
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)

  const api = isDemoMode ? demoAPI : spotifyAPI

  const loadPlaylists = async () => {
    setLoading(true)
    try {
      const response = await api.getPlaylists(50)
      const valid = (response?.data?.items || []).filter((playlist) => playlist?.id && playlist?.name)
      const enriched = await Promise.all(valid.map(async (playlist) => {
        try {
          const tracksResponse = await api.getPlaylistTracks(playlist.id)
          const items = tracksResponse?.data?.items || []
          return { ...playlist, tracks: { ...(playlist.tracks || {}), ...(tracksResponse?.data || {}), items, total: playlist.tracks?.total ?? tracksResponse?.data?.total ?? items.length } }
        } catch (error) {
          console.warn(`Tracks unavailable for ${playlist.name}:`, error?.message)
          return playlist
        }
      }))
      setPlaylists(enriched)
    } catch (error) {
      console.error('Playlists failed:', error)
      setPlaylists([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPlaylists() }, [isDemoMode])

  const visiblePlaylists = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const filtered = playlists.filter((playlist) => !term || playlist.name.toLowerCase().includes(term) || playlist.description?.toLowerCase().includes(term))
    return [...filtered].sort((a, b) => {
      if (sortBy === 'tracks') return (b.tracks?.total || 0) - (a.tracks?.total || 0)
      if (sortBy === 'owner') return (a.owner?.display_name || '').localeCompare(b.owner?.display_name || '', 'pt-BR')
      return a.name.localeCompare(b.name, 'pt-BR')
    })
  }, [playlists, searchTerm, sortBy])

  const createPlaylist = async (data) => {
    try {
      const response = await api.createPlaylist({ name: data.name, description: data.description, public: data.public, collaborative: data.collaborative })
      if (response?.data?.id && data.tracks?.length) {
        await api.addTracksToPlaylist(response.data.id, data.tracks.map((track) => `spotify:track:${track.id}`))
      }
      setShowCreateModal(false)
      await loadPlaylists()
    } catch (error) {
      console.error('Create playlist failed:', error)
      window.alert('Não foi possível criar a playlist.')
    }
  }

  const updatePlaylist = async (playlistId, updates) => {
    try {
      await api.updatePlaylist(playlistId, {
        name: updates.name,
        description: updates.description,
        public: updates.public,
        collaborative: updates.collaborative,
      })
      setEditingPlaylist(null)
      await loadPlaylists()
    } catch (error) {
      console.error('Update playlist failed:', error)
      window.alert('Não foi possível atualizar a playlist.')
    }
  }

  const deletePlaylist = async (playlistId) => {
    try {
      await api.deletePlaylist(playlistId)
      if (selectedPlaylist?.id === playlistId) setSelectedPlaylist(null)
      await loadPlaylists()
    } catch (error) {
      console.error('Delete playlist failed:', error)
      window.alert('Não foi possível remover a playlist da sua biblioteca.')
    }
  }

  const sharePlaylist = async (playlist) => {
    const url = playlist.external_urls?.spotify || window.location.href
    try {
      if (navigator.share) await navigator.share({ title: playlist.name, url })
      else {
        await navigator.clipboard.writeText(url)
        window.alert('Link copiado.')
      }
    } catch (error) {
      if (error?.name !== 'AbortError') console.warn('Share failed:', error)
    }
  }

  const handlePlay = async (playlist) => {
    try {
      await playPlaylist(playlist)
    } catch (error) {
      console.error('Playlist playback failed:', error)
      window.alert('Não foi possível iniciar esta playlist no dispositivo selecionado.')
    }
  }

  if (loading) return <Loading />

  if (selectedPlaylist) {
    return (
      <PlaylistDetail
        playlist={selectedPlaylist}
        onBack={() => setSelectedPlaylist(null)}
        onEdit={(playlist) => { setEditingPlaylist(playlist); setSelectedPlaylist(null) }}
        onDelete={deletePlaylist}
      />
    )
  }

  return (
    <div className="page playlists-page">
      <header className="page-heading playlist-page-heading">
        <div>
          <span className="eyebrow">SUA BIBLIOTECA</span>
          <h1>Playlists.</h1>
          <p>{playlists.length} coleções conectadas à sua conta.</p>
        </div>
        <div className="playlist-heading-actions">
          <button className="quiet-button" onClick={loadPlaylists}><RefreshCw size={16} /> Atualizar</button>
          <button className="primary-round-button" onClick={() => setShowCreateModal(true)}><Plus size={18} /> Nova playlist</button>
        </div>
      </header>

      <section className="library-toolbar">
        <label className="library-search"><Search size={17} /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar na sua biblioteca" /></label>
        <div className="library-toolbar-right">
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Ordenar playlists">
            <option value="name">Nome</option>
            <option value="tracks">Mais faixas</option>
            <option value="owner">Criador</option>
          </select>
          <div className="view-toggle" aria-label="Visualização">
            <button className={viewMode === 'grid' ? 'is-active' : ''} onClick={() => setViewMode('grid')} aria-label="Grade"><Grid3X3 size={17} /></button>
            <button className={viewMode === 'list' ? 'is-active' : ''} onClick={() => setViewMode('list')} aria-label="Lista"><List size={17} /></button>
          </div>
        </div>
      </section>

      {visiblePlaylists.length ? (
        <section className={`playlist-library playlist-library--${viewMode}`}>
          {visiblePlaylists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              viewMode={viewMode}
              onPlay={handlePlay}
              onEdit={setEditingPlaylist}
              onDelete={deletePlaylist}
              onShare={sharePlaylist}
              onSelect={setSelectedPlaylist}
            />
          ))}
        </section>
      ) : (
        <section className="empty-library"><span>0</span><h2>Nada por aqui.</h2><p>{searchTerm ? 'Nenhuma playlist corresponde à busca.' : 'Crie uma playlist para começar sua biblioteca.'}</p></section>
      )}

      {showCreateModal && <PlaylistEditModal playlist={null} isOpen onClose={() => setShowCreateModal(false)} onSave={createPlaylist} />}
      {editingPlaylist && <PlaylistEditModal playlist={editingPlaylist} isOpen onClose={() => setEditingPlaylist(null)} onSave={updatePlaylist} />}
    </div>
  )
}

export default Playlists
