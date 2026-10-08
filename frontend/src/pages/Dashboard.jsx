import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Clock3, Disc3, History, Music2, Pause, Play, Sparkles, Users } from 'lucide-react'
import { useDemo } from '../contexts/DemoContext'
import { useMusic } from '../contexts/MusicContext'
import { useAuth } from '../hooks/useAuth'
import demoAPI from '../services/demoAPI'
import { spotifyAPI } from '../services/api'
import Loading from '../components/Loading'

const timeRanges = [
  { value: 'short_term', label: '4 semanas' },
  { value: 'medium_term', label: '6 meses' },
  { value: 'long_term', label: '1 ano' },
]

const formatDuration = (ms = 0) => {
  const minutes = Math.round(ms / 60000)
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}min`
  return `${minutes} min`
}

const Dashboard = () => {
  const { user } = useAuth()
  const { isDemoMode } = useDemo()
  const { playTrack, currentTrack, isPlaying } = useMusic()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('medium_term')
  const [topTracks, setTopTracks] = useState([])
  const [topArtists, setTopArtists] = useState([])
  const [recentTracks, setRecentTracks] = useState([])
  const [audioFeatures, setAudioFeatures] = useState([])

  const api = isDemoMode ? demoAPI : spotifyAPI

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      try {
        const [tracksResponse, artistsResponse, recentResponse] = await Promise.all([
          api.getTopTracks(timeRange, 50),
          api.getTopArtists(timeRange, 50),
          api.getRecentlyPlayed(50),
        ])

        if (!active) return
        const tracks = tracksResponse?.data?.items || []
        const artists = artistsResponse?.data?.items || []
        const recent = recentResponse?.data?.items || []
        setTopTracks(tracks)
        setTopArtists(artists)
        setRecentTracks(recent)

        try {
          const ids = tracks.map((track) => track.id).filter(Boolean).slice(0, 100)
          const featuresResponse = ids.length ? await api.getAudioFeatures(ids) : null
          if (active) setAudioFeatures((featuresResponse?.data?.audio_features || []).filter(Boolean))
        } catch (featureError) {
          console.warn('Audio features unavailable:', featureError?.message)
          if (active) setAudioFeatures([])
        }
      } catch (error) {
        console.error('Dashboard data failed:', error)
        if (active) {
          setTopTracks([])
          setTopArtists([])
          setRecentTracks([])
          setAudioFeatures([])
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [timeRange, isDemoMode])

  const genreRanking = useMemo(() => {
    const counts = new Map()
    topArtists.forEach((artist) => {
      artist.genres?.forEach((genre) => counts.set(genre, (counts.get(genre) || 0) + 1))
    })
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }))
  }, [topArtists])

  const taste = useMemo(() => {
    if (!audioFeatures.length) return null
    const average = (key) => audioFeatures.reduce((sum, feature) => sum + (feature?.[key] || 0), 0) / audioFeatures.length
    return {
      energy: average('energy'),
      danceability: average('danceability'),
      valence: average('valence'),
      acousticness: average('acousticness'),
    }
  }, [audioFeatures])

  const listeningHours = useMemo(() => {
    const hours = Array(24).fill(0)
    recentTracks.forEach((entry) => {
      if (!entry?.played_at) return
      const date = new Date(entry.played_at)
      if (!Number.isNaN(date.getTime())) hours[date.getHours()] += 1
    })
    return hours
  }, [recentTracks])

  const maxHourValue = Math.max(...listeningHours, 1)
  const totalDuration = topTracks.reduce((sum, track) => sum + (track.duration_ms || 0), 0)
  const heroTrack = topTracks[0]
  const heroArtist = topArtists[0]
  const displayName = user?.display_name?.split(' ')?.[0] || 'você'

  const play = async (track, queue = topTracks, index = 0) => {
    if (!track) return
    try {
      await playTrack(track, queue, index)
    } catch (error) {
      console.error('Playback failed:', error)
    }
  }

  const playArtist = async (artist) => {
    try {
      const response = await api.getArtistTopTracks(artist.id, user?.country || 'BR')
      const tracks = response?.data?.tracks || []
      if (tracks.length) await play(tracks[0], tracks, 0)
    } catch (error) {
      console.error('Artist playback failed:', error)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="page dashboard-page">
      <header className="page-heading dashboard-heading">
        <div>
          <span className="eyebrow">MY UNIVERSE / VISÃO GERAL</span>
          <h1>O que ficou em repeat, {displayName}.</h1>
          <p>Seu histórico transformado em uma leitura simples do que você realmente ouviu.</p>
        </div>
        <div className="segmented-control" aria-label="Período analisado">
          {timeRanges.map((range) => (
            <button key={range.value} onClick={() => setTimeRange(range.value)} className={timeRange === range.value ? 'is-active' : ''}>
              {range.label}
            </button>
          ))}
        </div>
      </header>

      {heroTrack ? (
        <section className="listen-hero">
          <div className="listen-hero-art" aria-hidden="true">
            <img src={heroTrack.album?.images?.[0]?.url || '/default-track.svg'} alt="" />
          </div>
          <div className="listen-hero-shade" />
          <div className="listen-hero-content">
            <span className="hero-kicker">#1 DO PERÍODO</span>
            <h2>{heroTrack.name}</h2>
            <p>{heroTrack.artists?.map((artist) => artist.name).join(', ')} · {heroTrack.album?.name}</p>
            <div className="hero-actions">
              <button className="primary-round-button" onClick={() => play(heroTrack, topTracks, 0)}>
                {currentTrack?.id === heroTrack.id && isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                <span>{currentTrack?.id === heroTrack.id && isPlaying ? 'Tocando' : 'Reproduzir'}</span>
              </button>
              {heroTrack.external_urls?.spotify && (
                <a className="ghost-button" href={heroTrack.external_urls.spotify} target="_blank" rel="noreferrer">
                  Abrir no Spotify <ArrowUpRight size={16} />
                </a>
              )}
            </div>
          </div>
          <div className="hero-rank-card">
            <span>Seu artista nº 1</span>
            <strong>{heroArtist?.name || '—'}</strong>
            <small>{heroArtist?.genres?.[0] || 'gênero não informado'}</small>
          </div>
        </section>
      ) : (
        <section className="empty-panel"><Music2 size={28} /><h2>Ainda não há dados suficientes.</h2><p>Quando o Spotify retornar seu histórico, ele aparece aqui.</p></section>
      )}

      <section className="metric-strip" aria-label="Resumo do período">
        <article><span className="metric-icon"><Disc3 size={18} /></span><div><small>Faixas analisadas</small><strong>{topTracks.length}</strong></div></article>
        <article><span className="metric-icon"><Users size={18} /></span><div><small>Artistas no ranking</small><strong>{topArtists.length}</strong></div></article>
        <article><span className="metric-icon"><Clock3 size={18} /></span><div><small>Duração do top</small><strong>{formatDuration(totalDuration)}</strong></div></article>
        <article><span className="metric-icon"><History size={18} /></span><div><small>Reproduções recentes</small><strong>{recentTracks.length}</strong></div></article>
      </section>

      <div className="dashboard-grid dashboard-grid--main">
        <section className="content-panel top-tracks-panel">
          <div className="section-heading">
            <div><span className="eyebrow">TOP TRACKS</span><h2>Mais ouvidas</h2></div>
            <span className="section-note">{timeRanges.find((range) => range.value === timeRange)?.label}</span>
          </div>

          <div className="track-table">
            <div className="track-table-head"><span>#</span><span>Título</span><span className="desktop-only">Álbum</span><span className="track-duration-head"><Clock3 size={15} /></span></div>
            {topTracks.slice(0, 10).map((track, index) => {
              const active = currentTrack?.id === track.id
              return (
                <button key={track.id || index} className={`track-row${active ? ' is-playing' : ''}`} onClick={() => play(track, topTracks, index)}>
                  <span className="track-rank"><i>{index + 1}</i>{active && isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}</span>
                  <span className="track-title-cell">
                    <img src={track.album?.images?.[0]?.url || '/default-track.svg'} alt="" onError={(e) => { e.currentTarget.src = '/default-track.svg' }} />
                    <span><strong>{track.name}</strong><small>{track.artists?.map((artist) => artist.name).join(', ')}</small></span>
                  </span>
                  <span className="track-album desktop-only">{track.album?.name || '—'}</span>
                  <span className="track-duration">{formatDuration(track.duration_ms).replace(' min', ':00')}</span>
                </button>
              )
            })}
          </div>
        </section>

        <aside className="dashboard-side-stack">
          <section className="content-panel taste-panel">
            <div className="section-heading compact"><div><span className="eyebrow">ÁUDIO</span><h2>Perfil do seu som</h2></div><Sparkles size={18} /></div>
            {taste ? (
              <div className="taste-bars">
                {[
                  ['Energia', taste.energy],
                  ['Dançabilidade', taste.danceability],
                  ['Positividade', taste.valence],
                  ['Acústico', taste.acousticness],
                ].map(([label, value]) => (
                  <div className="taste-row" key={label}>
                    <div><span>{label}</span><strong>{Math.round(value * 100)}</strong></div>
                    <div className="taste-track"><i style={{ width: `${Math.round(value * 100)}%` }} /></div>
                  </div>
                ))}
              </div>
            ) : <p className="muted-copy">O Spotify não retornou os atributos de áudio para este período.</p>}
          </section>

          <section className="content-panel genre-panel">
            <div className="section-heading compact"><div><span className="eyebrow">GÊNEROS</span><h2>Sua órbita</h2></div></div>
            <div className="genre-list">
              {genreRanking.length ? genreRanking.map((item, index) => (
                <div key={item.genre} className="genre-item"><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.genre}</strong><small>{item.count} artista{item.count !== 1 ? 's' : ''}</small></div>
              )) : <p className="muted-copy">Sem gêneros suficientes para montar o ranking.</p>}
            </div>
          </section>
        </aside>
      </div>

      <section className="content-panel artists-panel">
        <div className="section-heading"><div><span className="eyebrow">ARTISTAS</span><h2>Quem dominou seu período</h2></div><span className="section-note">Top {Math.min(6, topArtists.length)}</span></div>
        <div className="artist-shelf">
          {topArtists.slice(0, 6).map((artist, index) => (
            <button className="artist-card" key={artist.id || index} onClick={() => playArtist(artist)}>
              <div className="artist-image-wrap"><img src={artist.images?.[0]?.url || '/default-user.svg'} alt="" /><span>{index + 1}</span><i className="artist-play"><Play size={18} fill="currentColor" /></i></div>
              <strong>{artist.name}</strong>
              <small>{artist.genres?.slice(0, 2).join(' · ') || 'Artista'}</small>
            </button>
          ))}
        </div>
      </section>

      <div className="dashboard-grid dashboard-grid--secondary">
        <section className="content-panel listening-clock-panel">
          <div className="section-heading"><div><span className="eyebrow">ÚLTIMAS REPRODUÇÕES</span><h2>Quando você mais ouviu</h2></div><span className="section-note">amostra recente</span></div>
          <div className="hour-chart" aria-label="Reproduções por hora do dia">
            {listeningHours.map((value, hour) => (
              <div className="hour-column" key={hour} title={`${hour}:00 — ${value} reproduções`}>
                <div className="hour-bar"><i style={{ height: `${Math.max(value ? 10 : 2, (value / maxHourValue) * 100)}%` }} /></div>
                {hour % 4 === 0 && <span>{String(hour).padStart(2, '0')}h</span>}
              </div>
            ))}
          </div>
        </section>

        <section className="content-panel recent-panel">
          <div className="section-heading"><div><span className="eyebrow">AGORA HÁ POUCO</span><h2>Histórico recente</h2></div></div>
          <div className="recent-list">
            {recentTracks.slice(0, 5).map((entry, index) => {
              const track = entry.track
              if (!track) return null
              return (
                <button key={`${track.id}-${index}`} onClick={() => play(track, recentTracks.map((item) => item.track).filter(Boolean), index)}>
                  <img src={track.album?.images?.[0]?.url || '/default-track.svg'} alt="" />
                  <span><strong>{track.name}</strong><small>{track.artists?.map((artist) => artist.name).join(', ')}</small></span>
                  <time>{entry.played_at ? new Date(entry.played_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}</time>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
