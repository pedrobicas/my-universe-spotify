import { Download, ExternalLink, Heart, History, Music2, Share2, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Loading from '../components/Loading'
import { useAuth } from '../contexts/AuthContext'
import { useDemo } from '../contexts/DemoContext'
import demoAPI from '../services/demoAPI'
import api from '../services/api'

const Profile = () => {
  const { user } = useAuth()
  const { isDemoMode } = useDemo()
  const [loading, setLoading] = useState(true)
  const [recentTracks, setRecentTracks] = useState([])
  const [savedCount, setSavedCount] = useState(0)
  const [followedCount, setFollowedCount] = useState(0)
  const [range, setRange] = useState('all')

  const currentAPI = isDemoMode ? demoAPI : api

  useEffect(() => {
    if (!user) return
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const [recentResult, savedResult, followedResult] = await Promise.allSettled([
          currentAPI.get('/api/recently-played?limit=50'),
          currentAPI.get('/api/me/saved-tracks?limit=50'),
          currentAPI.get('/api/me/followed-artists?limit=50'),
        ])
        if (!active) return
        if (recentResult.status === 'fulfilled') setRecentTracks(recentResult.value?.data?.items || [])
        if (savedResult.status === 'fulfilled') setSavedCount(savedResult.value?.data?.total ?? savedResult.value?.data?.items?.length ?? 0)
        if (followedResult.status === 'fulfilled') setFollowedCount(followedResult.value?.data?.artists?.total ?? followedResult.value?.data?.artists?.items?.length ?? 0)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [user, isDemoMode])

  const groupedHistory = useMemo(() => {
    const cutoff = new Date()
    if (range === 'today') cutoff.setHours(0, 0, 0, 0)
    if (range === 'week') cutoff.setDate(cutoff.getDate() - 7)

    const filtered = recentTracks.filter((item) => {
      if (range === 'all') return true
      const date = new Date(item.played_at)
      return !Number.isNaN(date.getTime()) && date >= cutoff
    })

    const groups = new Map()
    filtered.forEach((item) => {
      const date = new Date(item.played_at)
      if (Number.isNaN(date.getTime())) return
      const key = date.toISOString().slice(0, 10)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(item)
    })
    return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [recentTracks, range])

  const uniqueTracks = new Set(recentTracks.map((item) => item.track?.id).filter(Boolean)).size
  const uniqueArtists = new Set(recentTracks.flatMap((item) => item.track?.artists?.map((artist) => artist.id || artist.name) || [])).size

  const exportProfile = () => {
    const data = {
      profile: {
        displayName: user?.display_name,
        spotifyUrl: user?.external_urls?.spotify,
      },
      summary: { savedTracks: savedCount, followedArtists: followedCount, recentUniqueTracks: uniqueTracks },
      recentTracks,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `my-universe-profile-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const shareProfile = async () => {
    const url = user?.external_urls?.spotify || window.location.href
    try {
      if (navigator.share) await navigator.share({ title: user?.display_name || 'Spotify', url })
      else {
        await navigator.clipboard.writeText(url)
        window.alert('Link copiado.')
      }
    } catch (error) {
      if (error?.name !== 'AbortError') console.warn('Share failed:', error)
    }
  }

  if (!user || loading) return <Loading />

  return (
    <div className="page profile-page">
      <section className="profile-hero">
        <img className="profile-avatar" src={user.images?.[0]?.url || '/default-user.svg'} alt="" onError={(e) => { e.currentTarget.src = '/default-user.svg' }} />
        <div className="profile-title">
          <span className="eyebrow">PERFIL</span>
          <h1>{user.display_name || 'Seu perfil'}</h1>
          <div className="profile-meta">
            <span><Music2 size={13} /> dados da sua conta conectada</span>
          </div>
        </div>
        <div className="profile-actions">
          {user.external_urls?.spotify && <a className="quiet-button" href={user.external_urls.spotify} target="_blank" rel="noreferrer">Spotify <ExternalLink size={15} /></a>}
          <button className="quiet-button" onClick={shareProfile}><Share2 size={15} /> Compartilhar</button>
          <button className="primary-round-button" onClick={exportProfile}><Download size={15} /> Exportar dados</button>
        </div>
      </section>

      <section className="metric-strip profile-metrics">
        <article><span className="metric-icon"><Heart size={17} /></span><div><small>Faixas salvas</small><strong>{savedCount}</strong></div></article>
        <article><span className="metric-icon"><Users size={17} /></span><div><small>Artistas seguidos</small><strong>{followedCount}</strong></div></article>
        <article><span className="metric-icon"><Music2 size={17} /></span><div><small>Faixas únicas recentes</small><strong>{uniqueTracks}</strong></div></article>
        <article><span className="metric-icon"><History size={17} /></span><div><small>Artistas recentes</small><strong>{uniqueArtists}</strong></div></article>
      </section>

      <section className="content-panel history-panel">
        <div className="section-heading profile-history-heading">
          <div><span className="eyebrow">HISTÓRICO</span><h2>Ouvidas recentemente</h2></div>
          <div className="segmented-control compact-segmented">
            {[['all', 'Tudo'], ['week', '7 dias'], ['today', 'Hoje']].map(([value, label]) => <button key={value} className={range === value ? 'is-active' : ''} onClick={() => setRange(value)}>{label}</button>)}
          </div>
        </div>

        <div className="history-days">
          {groupedHistory.length ? groupedHistory.map(([dateKey, items]) => (
            <div className="history-day" key={dateKey}>
              <div className="history-date">
                <strong>{new Date(`${dateKey}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</strong>
                <small>{items.length} reprodução{items.length !== 1 ? 'ões' : ''}</small>
              </div>
              <div className="history-tracks">
                {items.map((item, index) => (
                  <div key={`${item.track?.id}-${item.played_at}-${index}`} className="history-track">
                    <img src={item.track?.album?.images?.[0]?.url || '/default-track.svg'} alt="" />
                    <span><strong>{item.track?.name || 'Faixa indisponível'}</strong><small>{item.track?.artists?.map((artist) => artist.name).join(', ') || '—'}</small></span>
                    <time>{item.played_at ? new Date(item.played_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}</time>
                  </div>
                ))}
              </div>
            </div>
          )) : <div className="history-empty">Nenhuma reprodução encontrada neste período.</div>}
        </div>
      </section>
    </div>
  )
}

export default Profile
