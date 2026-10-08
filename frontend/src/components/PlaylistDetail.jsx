import { ArrowLeft, Clock3, ExternalLink, Lock, Pencil, Pause, Play, Plus, Search, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useDemo } from '../contexts/DemoContext'
import { useMusic } from '../contexts/MusicContext'
import demoAPI from '../services/demoAPI'
import { spotifyAPI } from '../services/api'
import Loading from './Loading'

const formatTrackDuration = (ms = 0) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

const formatCollectionDuration = (ms = 0) => {
  const minutes = Math.round(ms / 60000)
  return minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`
}

const PlaylistDetail = ({ playlist, onBack, onEdit, onDelete }) => {
  const { isDemoMode } = useDemo()
  const { playTrack, playPlaylist, currentTrack, isPlaying } = useMusic()
  const api = isDemoMode ? demoAPI : spotifyAPI
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  const loadTracks = async () => {
    setLoading(true)
    try {
      const response = await api.getPlaylistTracks(playlist.id)
      setTracks(response?.data?.items || [])
    } catch (error) {
      console.error('Playlist tracks failed:', error)
      setTracks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (playlist?.id) loadTracks()
  }, [playlist?.id, isDemoMode])

  const visibleTracks = useMemo(() => {
    const term = filter.trim().toLowerCase()
    if (!term) return tracks
    return tracks.filter(({ track }) => {
      const haystack = `${track?.name || ''} ${track?.album?.name || ''} ${track?.artists?.map((artist) => artist.name).join(' ') || ''}`.toLowerCase()
      return haystack.includes(term)
    })
  }, [tracks, filter])

  const totalDuration = tracks.reduce((total, item) => total + (item.track?.duration_ms || 0), 0)
  const playableTracks = tracks.map((item) => item.track).filter(Boolean)

  const handlePlayAll = async () => {
    if (!playableTracks.length) return
    await playPlaylist({ ...playlist, tracks: { items: tracks } }, 0)
  }

  const handlePlay = async (track) => {
    const index = playableTracks.findIndex((item) => item.id === track.id)
    await playTrack(track, playableTracks, Math.max(index, 0))
  }

  const handleSearch = async (event) => {
    event?.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    try {
      const response = await api.searchTracks(query.trim(), 10)
      setResults(response?.data?.tracks?.items || [])
    } catch (error) {
      console.error('Track search failed:', error)
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  const addTrack = async (track) => {
    try {
      await api.addTracksToPlaylist(playlist.id, [`spotify:track:${track.id}`])
      setQuery('')
      setResults([])
      await loadTracks()
    } catch (error) {
      console.error('Add track failed:', error)
      window.alert('Não foi possível adicionar esta faixa.')
    }
  }

  const removeTrack = async (track) => {
    try {
      await api.removeTracksFromPlaylist(playlist.id, [`spotify:track:${track.id}`])
      setTracks((current) => current.filter((item) => item.track?.id !== track.id))
    } catch (error) {
      console.error('Remove track failed:', error)
      window.alert('Não foi possível remover esta faixa.')
    }
  }

  const removePlaylist = async () => {
    if (!window.confirm(`Remover “${playlist.name}” da sua biblioteca?`)) return
    await onDelete(playlist.id)
  }

  return (
    <div className="page playlist-detail-page">
      <button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Sua biblioteca</button>

      <section className="playlist-detail-hero">
        <img src={playlist.images?.[0]?.url || '/default-playlist.svg'} alt="" className="playlist-detail-cover" />
        <div className="playlist-detail-copy">
          <span className="eyebrow">{playlist.public === false ? 'PLAYLIST PRIVADA' : 'PLAYLIST'}</span>
          <h1>{playlist.name}</h1>
          {playlist.description && <p>{playlist.description}</p>}
          <div className="playlist-detail-meta">
            <strong>{playlist.owner?.display_name || 'Sua biblioteca'}</strong>
            <span>{tracks.length} faixa{tracks.length !== 1 ? 's' : ''}</span>
            <span>{formatCollectionDuration(totalDuration)}</span>
            {playlist.public === false && <span><Lock size={12} /> privada</span>}
          </div>
        </div>
      </section>

      <section className="playlist-detail-actions">
        <button className="playlist-play-button" onClick={handlePlayAll} disabled={!tracks.length} aria-label="Reproduzir playlist"><Play size={22} fill="currentColor" /></button>
        <button className="quiet-button" onClick={() => setShowAdd(true)}><Plus size={16} /> Adicionar</button>
        <button className="quiet-button" onClick={() => onEdit(playlist)}><Pencil size={15} /> Editar</button>
        {playlist.external_urls?.spotify && <a className="quiet-button" href={playlist.external_urls.spotify} target="_blank" rel="noreferrer">Spotify <ExternalLink size={14} /></a>}
        <button className="icon-danger-button" onClick={removePlaylist} aria-label="Remover playlist"><Trash2 size={16} /></button>
      </section>

      <section className="content-panel playlist-track-panel">
        <div className="playlist-track-toolbar">
          <div><span className="eyebrow">FAIXAS</span><h2>{tracks.length ? 'Conteúdo da playlist' : 'Playlist vazia'}</h2></div>
          <label className="library-search compact-search"><Search size={16} /><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filtrar faixas" /></label>
        </div>

        {loading ? <Loading /> : visibleTracks.length ? (
          <div className="playlist-track-list">
            <div className="playlist-track-head"><span>#</span><span>Título</span><span className="desktop-only">Álbum</span><span><Clock3 size={14} /></span><span /></div>
            {visibleTracks.map(({ track }, index) => {
              if (!track) return null
              const active = currentTrack?.id === track.id
              return (
                <div className={`playlist-track-item${active ? ' is-active' : ''}`} key={`${track.id}-${index}`}>
                  <button className="track-index-button" onClick={() => handlePlay(track)} aria-label={`Reproduzir ${track.name}`}>
                    <span>{index + 1}</span>
                    {active && isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                  </button>
                  <button className="playlist-track-title" onClick={() => handlePlay(track)}>
                    <img src={track.album?.images?.[0]?.url || '/default-track.svg'} alt="" />
                    <span><strong>{track.name}</strong><small>{track.artists?.map((artist) => artist.name).join(', ') || '—'}</small></span>
                  </button>
                  <span className="playlist-track-album desktop-only">{track.album?.name || '—'}</span>
                  <span className="playlist-track-duration">{formatTrackDuration(track.duration_ms)}</span>
                  <button className="track-remove-button" onClick={() => removeTrack(track)} aria-label={`Remover ${track.name}`}><X size={15} /></button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="playlist-empty-state"><p>{filter ? 'Nenhuma faixa corresponde ao filtro.' : 'Adicione a primeira faixa e esta playlist ganha vida.'}</p>{!filter && <button className="quiet-button" onClick={() => setShowAdd(true)}><Plus size={15} /> Adicionar faixa</button>}</div>
        )}
      </section>

      {showAdd && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowAdd(false)}>
          <section className="compact-modal" role="dialog" aria-modal="true" aria-label="Adicionar faixas">
            <div className="modal-heading"><div><span className="eyebrow">BUSCAR NO SPOTIFY</span><h2>Adicionar faixas</h2></div><button className="modal-close" onClick={() => setShowAdd(false)}><X size={18} /></button></div>
            <form className="modal-search" onSubmit={handleSearch}><Search size={17} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Música ou artista" /><button type="submit" disabled={searching}>{searching ? 'Buscando…' : 'Buscar'}</button></form>
            <div className="modal-search-results">
              {results.map((track) => <button key={track.id} onClick={() => addTrack(track)}><img src={track.album?.images?.[0]?.url || '/default-track.svg'} alt="" /><span><strong>{track.name}</strong><small>{track.artists?.map((artist) => artist.name).join(', ')}</small></span><Plus size={16} /></button>)}
              {!searching && query && !results.length && <p>Nenhum resultado para esta busca.</p>}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default PlaylistDetail
