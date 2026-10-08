import { GripVertical, Lock, Music2, Plus, Search, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDemo } from '../contexts/DemoContext'
import demoAPI from '../services/demoAPI'
import { spotifyAPI } from '../services/api'

const PlaylistEditModal = ({ playlist, isOpen, onClose, onSave }) => {
  const { isDemoMode } = useDemo()
  const api = isDemoMode ? demoAPI : spotifyAPI
  const [form, setForm] = useState({ name: '', description: '', public: true, collaborative: false })
  const [tracks, setTracks] = useState([])
  const [tab, setTab] = useState('details')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setForm({
      name: playlist?.name || '',
      description: playlist?.description || '',
      public: playlist?.public !== false,
      collaborative: Boolean(playlist?.collaborative),
    })
    setTracks((playlist?.tracks?.items || []).map((item) => item.track).filter(Boolean))
    setTab('details')
    setQuery('')
    setResults([])

    if (playlist?.id && !playlist?.tracks?.items?.length) {
      api.getPlaylistTracks(playlist.id)
        .then((response) => setTracks((response?.data?.items || []).map((item) => item.track).filter(Boolean)))
        .catch(() => setTracks([]))
    }
  }, [isOpen, playlist?.id, isDemoMode])

  if (!isOpen) return null

  const save = async () => {
    if (!form.name.trim()) return window.alert('Dê um nome para a playlist.')
    setSaving(true)
    try {
      await onSave?.(playlist?.id || null, { ...form, name: form.name.trim(), description: form.description.trim(), tracks })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const search = async (event) => {
    event.preventDefault()
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
    if (tracks.some((item) => item.id === track.id)) return
    setTracks((current) => [...current, track])
    if (playlist?.id) {
      try {
        await api.addTracksToPlaylist(playlist.id, [`spotify:track:${track.id}`])
      } catch (error) {
        setTracks((current) => current.filter((item) => item.id !== track.id))
        return window.alert('Não foi possível adicionar esta faixa.')
      }
    }
    setQuery('')
    setResults([])
  }

  const removeTrack = async (track) => {
    const previous = tracks
    setTracks((current) => current.filter((item) => item.id !== track.id))
    if (playlist?.id) {
      try {
        await api.removeTracksFromPlaylist(playlist.id, [`spotify:track:${track.id}`])
      } catch (error) {
        setTracks(previous)
        window.alert('Não foi possível remover esta faixa.')
      }
    }
  }

  const reorder = async (from, to) => {
    if (from === to || from < 0 || to < 0) return
    const next = [...tracks]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setTracks(next)
    if (playlist?.id) {
      try { await api.reorderPlaylistTracks(playlist.id, from, to) }
      catch (error) { setTracks(tracks) }
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="playlist-editor-modal" role="dialog" aria-modal="true" aria-label={playlist ? 'Editar playlist' : 'Nova playlist'}>
        <header className="modal-heading editor-heading">
          <div><span className="eyebrow">{playlist ? 'EDITAR PLAYLIST' : 'NOVA PLAYLIST'}</span><h2>{playlist ? playlist.name : 'Criar playlist'}</h2></div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </header>

        <nav className="editor-tabs">
          <button className={tab === 'details' ? 'is-active' : ''} onClick={() => setTab('details')}>Detalhes</button>
          <button className={tab === 'tracks' ? 'is-active' : ''} onClick={() => setTab('tracks')}>Faixas <span>{tracks.length}</span></button>
        </nav>

        <div className="editor-content">
          {tab === 'details' ? (
            <div className="editor-details-grid">
              <img src={playlist?.images?.[0]?.url || '/default-playlist.svg'} alt="" className="editor-cover" />
              <div className="editor-form">
                <label>Nome<input value={form.name} maxLength={100} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nome da playlist" /></label>
                <label>Descrição<textarea value={form.description} maxLength={300} rows={4} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Uma descrição curta, se quiser" /></label>
                <label className="editor-switch-row"><span><strong>Playlist pública</strong><small>{form.public ? 'Aparece no seu perfil do Spotify.' : 'Visível apenas para você e colaboradores.'}</small></span><input type="checkbox" checked={form.public} onChange={(event) => setForm((current) => ({ ...current, public: event.target.checked, collaborative: event.target.checked ? false : current.collaborative }))} /></label>
                <label className="editor-switch-row"><span><strong>Colaborativa</strong><small>Permite que outras pessoas adicionem faixas.</small></span><input type="checkbox" checked={form.collaborative} disabled={form.public} onChange={(event) => setForm((current) => ({ ...current, collaborative: event.target.checked }))} /></label>
                {form.public === false && <div className="editor-note"><Lock size={14} /> Esta playlist ficará privada.</div>}
              </div>
            </div>
          ) : (
            <div className="editor-tracks-panel">
              <form className="modal-search" onSubmit={search}><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar música ou artista" /><button type="submit" disabled={searching}>{searching ? 'Buscando…' : 'Buscar'}</button></form>
              {results.length > 0 && <div className="editor-search-results">{results.map((track) => <button key={track.id} onClick={() => addTrack(track)} type="button"><img src={track.album?.images?.[0]?.url || '/default-track.svg'} alt="" /><span><strong>{track.name}</strong><small>{track.artists?.map((artist) => artist.name).join(', ')}</small></span><Plus size={15} /></button>)}</div>}
              <div className="editor-track-list">
                {tracks.length ? tracks.map((track, index) => (
                  <div className="editor-track-row" key={track.id} draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', String(index))} onDragOver={(event) => event.preventDefault()} onDrop={(event) => reorder(Number(event.dataTransfer.getData('text/plain')), index)}>
                    <GripVertical size={15} /><span className="editor-track-index">{index + 1}</span><img src={track.album?.images?.[0]?.url || '/default-track.svg'} alt="" /><span className="editor-track-copy"><strong>{track.name}</strong><small>{track.artists?.map((artist) => artist.name).join(', ')}</small></span><button onClick={() => removeTrack(track)} type="button"><Trash2 size={15} /></button>
                  </div>
                )) : <div className="editor-empty"><Music2 size={24} /><p>Sem faixas ainda. Busque acima para montar a playlist.</p></div>}
              </div>
            </div>
          )}
        </div>

        <footer className="editor-footer"><button className="quiet-button" onClick={onClose}>Cancelar</button><button className="primary-round-button" onClick={save} disabled={saving}>{saving ? 'Salvando…' : playlist ? 'Salvar alterações' : 'Criar playlist'}</button></footer>
      </section>
    </div>
  )
}

export default PlaylistEditModal
