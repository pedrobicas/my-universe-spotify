import { Edit3, Globe2, Lock, MoreHorizontal, Play, Share2, Trash2, Users } from 'lucide-react'
import { useState } from 'react'

const formatDuration = (items = []) => {
  const total = items.reduce((sum, item) => sum + (item?.track?.duration_ms || item?.duration_ms || 0), 0)
  const minutes = Math.round(total / 60000)
  if (!minutes) return null
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}min`
  return `${minutes} min`
}

const PlaylistCard = ({ playlist, onPlay, onEdit, onDelete, onShare, onSelect, viewMode = 'grid' }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const duration = formatDuration(playlist.tracks?.items || [])

  const prevent = (handler) => (event) => {
    event.stopPropagation()
    handler?.()
  }

  const handleDelete = prevent(() => {
    setMenuOpen(false)
    if (window.confirm(`Remover “${playlist.name}” da sua biblioteca?`)) onDelete?.(playlist.id)
  })

  return (
    <article className={`playlist-tile playlist-tile--${viewMode}`} onClick={() => onSelect?.(playlist)}>
      <div className="playlist-cover-wrap">
        <img
          className="playlist-cover"
          src={playlist.images?.[0]?.url || '/default-playlist.jpg'}
          alt=""
          onError={(e) => { e.currentTarget.src = '/default-playlist.jpg' }}
        />
        <button className="playlist-play" onClick={prevent(() => onPlay?.(playlist))} aria-label={`Reproduzir ${playlist.name}`}>
          <Play size={20} fill="currentColor" />
        </button>
      </div>

      <div className="playlist-copy">
        <div className="playlist-title-row">
          <h3>{playlist.name}</h3>
          <div className="playlist-menu-wrap">
            <button className="playlist-menu-trigger" onClick={prevent(() => setMenuOpen((value) => !value))} aria-label="Mais opções"><MoreHorizontal size={18} /></button>
            {menuOpen && (
              <div className="playlist-menu">
                <button onClick={prevent(() => { setMenuOpen(false); onEdit?.(playlist) })}><Edit3 size={15} /> Editar</button>
                <button onClick={prevent(() => { setMenuOpen(false); onShare?.(playlist) })}><Share2 size={15} /> Compartilhar</button>
                <button className="danger" onClick={handleDelete}><Trash2 size={15} /> Remover</button>
              </div>
            )}
          </div>
        </div>

        <p>{playlist.description || 'Sem descrição.'}</p>

        <div className="playlist-meta">
          <span>{playlist.public ? <Globe2 size={13} /> : <Lock size={13} />}{playlist.public ? 'Pública' : 'Privada'}</span>
          {playlist.collaborative && <span><Users size={13} />Colaborativa</span>}
          <span>{playlist.tracks?.total ?? playlist.tracks?.items?.length ?? 0} faixas</span>
          {duration && <span>{duration}</span>}
        </div>
      </div>
    </article>
  )
}

export default PlaylistCard
