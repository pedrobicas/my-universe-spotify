import { Compass, Flame, Globe2, Heart, Moon, Mountain, Pause, Play, Radio, Shuffle, Sparkles, Waves, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import Loading from '../components/Loading'
import { useDemo } from '../contexts/DemoContext'
import { useMusic } from '../contexts/MusicContext'
import { useAuth } from '../hooks/useAuth'
import demoAPI from '../services/demoAPI'
import { spotifyAPI } from '../services/api'

const moods = [
  { id: 'energetic', name: 'Energia', icon: Zap, genre: 'dance', seeds: { target_energy: .82, target_valence: .68, target_danceability: .72 } },
  { id: 'chill', name: 'Desacelerar', icon: Waves, genre: 'chill', seeds: { target_energy: .28, target_valence: .5, target_acousticness: .7 } },
  { id: 'focus', name: 'Foco', icon: Mountain, genre: 'ambient', seeds: { target_energy: .38, target_instrumentalness: .7, max_speechiness: .12 } },
  { id: 'party', name: 'Festa', icon: Flame, genre: 'dance', seeds: { target_energy: .9, target_valence: .82, target_danceability: .9 } },
  { id: 'romantic', name: 'Romântico', icon: Heart, genre: 'bossanova', seeds: { target_valence: .6, target_acousticness: .58, target_energy: .4 } },
  { id: 'sleep', name: 'Madrugada', icon: Moon, genre: 'ambient', seeds: { target_energy: .15, target_valence: .32, target_acousticness: .86 } },
]

const genreMixes = [
  { id: 'jazz-electronic', name: 'Jazz / eletrônico', genres: ['jazz', 'electronic'] },
  { id: 'classical-ambient', name: 'Clássico / ambient', genres: ['classical', 'ambient'] },
  { id: 'rock-folk', name: 'Rock / folk', genres: ['rock', 'folk'] },
  { id: 'hiphop-jazz', name: 'Hip-hop / jazz', genres: ['hip-hop', 'jazz'] },
  { id: 'indie-pop', name: 'Indie / pop', genres: ['indie', 'pop'] },
  { id: 'pop-world', name: 'Pop / world', genres: ['pop', 'world-music'] },
]

const regions = [
  { id: 'BR', name: 'Brasil', flag: '🇧🇷', genre: 'brazil' },
  { id: 'JP', name: 'Japão', flag: '🇯🇵', genre: 'j-pop' },
  { id: 'KR', name: 'Coreia do Sul', flag: '🇰🇷', genre: 'k-pop' },
  { id: 'NG', name: 'Nigéria', flag: '🇳🇬', genre: 'afrobeat' },
  { id: 'ES', name: 'Espanha', flag: '🇪🇸', genre: 'latin' },
  { id: 'FR', name: 'França', flag: '🇫🇷', genre: 'pop' },
]

const getTimeProfile = () => {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) return { label: 'Para começar o dia', seeds: { target_valence: .7, target_energy: .62, target_danceability: .6 } }
  if (hour >= 12 && hour < 18) return { label: 'Para a sua tarde', seeds: { target_valence: .6, target_energy: .52, target_acousticness: .4 } }
  if (hour >= 18 && hour < 22) return { label: 'Para o fim do dia', seeds: { target_valence: .48, target_energy: .4, target_acousticness: .58 } }
  return { label: 'Para agora', seeds: { target_valence: .32, target_energy: .22, target_acousticness: .82 } }
}

const TrackGrid = ({ tracks, onPlay, currentTrack, isPlaying }) => (
  <div className="discovery-track-grid">
    {tracks.map((track, index) => {
      const active = currentTrack?.id === track.id
      return (
        <button key={`${track.id}-${index}`} className={`discovery-track${active ? ' is-active' : ''}`} onClick={() => onPlay(track, tracks, index)}>
          <div className="discovery-track-art">
            <img src={track.album?.images?.[0]?.url || '/default-track.svg'} alt="" onError={(e) => { e.currentTarget.src = '/default-track.svg' }} />
            <i>{active && isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</i>
          </div>
          <strong>{track.name}</strong>
          <small>{track.artists?.map((artist) => artist.name).join(', ')}</small>
        </button>
      )
    })}
  </div>
)

const Discoveries = () => {
  const { user } = useAuth()
  const { isDemoMode } = useDemo()
  const { playTrack, currentTrack, isPlaying } = useMusic()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('for-you')
  const [timeBased, setTimeBased] = useState([])
  const [emerging, setEmerging] = useState([])
  const [generated, setGenerated] = useState(null)
  const [mixTracks, setMixTracks] = useState([])
  const [worldTracks, setWorldTracks] = useState([])
  const [selectedMix, setSelectedMix] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [notice, setNotice] = useState('')

  const api = isDemoMode ? demoAPI : spotifyAPI
  const timeProfile = getTimeProfile()

  const requestRecommendations = async (params) => {
    const response = await api.getRecommendations(params)
    if (response?.data?.fallback) setNotice('O Spotify limitou esta recomendação; exibimos a melhor alternativa disponível.')
    return Array.isArray(response?.data?.tracks) ? response.data.tracks : []
  }

  useEffect(() => {
    if (!user) return
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const [timeTracks, emergingTracks] = await Promise.all([
          requestRecommendations({ seed_genres: 'pop', limit: 16, ...timeProfile.seeds }),
          requestRecommendations({ seed_genres: 'indie', limit: 12, max_popularity: 40, target_energy: .45 }),
        ])
        if (active) {
          setTimeBased(timeTracks)
          setEmerging(emergingTracks)
        }
      } catch (error) {
        console.error('Discovery load failed:', error)
        if (active) setNotice('Não foi possível carregar algumas recomendações agora.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [user, isDemoMode])

  const play = async (track, tracks, index) => {
    try {
      await playTrack(track, tracks, index)
    } catch (error) {
      console.error('Playback failed:', error)
      setNotice('Abra o Spotify em um dispositivo ativo para iniciar a reprodução.')
    }
  }

  const generateMood = async (mood) => {
    setLoading(true)
    setNotice('')
    try {
      const tracks = await requestRecommendations({ seed_genres: mood.genre, market: user?.country || 'BR', limit: 24, ...mood.seeds })
      setGenerated({ mood, tracks })
    } catch (error) {
      console.error('Mood generation failed:', error)
      setNotice('Não foi possível gerar essa seleção agora.')
    } finally {
      setLoading(false)
    }
  }

  const exploreMix = async (mix) => {
    setLoading(true)
    setNotice('')
    setSelectedMix(mix)
    try {
      const tracks = await requestRecommendations({ seed_genres: mix.genres.join(','), limit: 20, target_energy: .58, target_valence: .52 })
      setMixTracks(tracks)
    } catch (error) {
      console.error('Genre mix failed:', error)
      setNotice('Esse mix não retornou resultados agora.')
    } finally {
      setLoading(false)
    }
  }

  const exploreRegion = async (region) => {
    setLoading(true)
    setNotice('')
    setSelectedRegion(region)
    try {
      const tracks = await requestRecommendations({ seed_genres: region.genre, market: region.id, limit: 20, target_valence: .58 })
      setWorldTracks(tracks)
    } catch (error) {
      console.error('World discovery failed:', error)
      setNotice('Não foi possível explorar essa região agora.')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'for-you', label: 'Para você', icon: Sparkles },
    { id: 'mood', label: 'Mood', icon: Waves },
    { id: 'mix', label: 'Misturar', icon: Shuffle },
    { id: 'world', label: 'Mundo', icon: Globe2 },
  ]

  if (loading && !timeBased.length && !generated && !mixTracks.length && !worldTracks.length) return <Loading />

  return (
    <div className="page discoveries-page">
      <header className="page-heading discoveries-heading">
        <div>
          <span className="eyebrow">DESCOBRIR</span>
          <h1>Saia do automático.</h1>
          <p>Novas faixas a partir do seu contexto, não de uma sequência infinita de cards.</p>
        </div>
      </header>

      <nav className="discovery-tabs" aria-label="Tipos de descoberta">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} className={activeTab === id ? 'is-active' : ''} onClick={() => setActiveTab(id)}><Icon size={16} /> {label}</button>
        ))}
      </nav>

      {notice && <div className="discovery-notice">{notice}</div>}

      {activeTab === 'for-you' && (
        <div className="discovery-section-stack">
          <section className="discovery-feature">
            <div className="discovery-feature-copy">
              <span className="eyebrow">AGORA</span>
              <h2>{timeProfile.label}</h2>
              <p>Uma sequência ajustada ao momento do dia usando energia, valência e acústica como sinal — sem inventar um “mood” para você.</p>
              {timeBased[0] && <button className="primary-round-button" onClick={() => play(timeBased[0], timeBased, 0)}><Play size={17} fill="currentColor" /> Reproduzir seleção</button>}
            </div>
            <div className="discovery-feature-covers" aria-hidden="true">
              {timeBased.slice(0, 4).map((track, index) => <img key={`${track.id}-${index}`} src={track.album?.images?.[0]?.url || '/default-track.svg'} alt="" style={{ '--cover-index': index }} />)}
            </div>
          </section>

          <section className="content-panel discovery-content-panel">
            <div className="section-heading"><div><span className="eyebrow">SELEÇÃO DO MOMENTO</span><h2>Talvez você goste</h2></div><span className="section-note">{timeBased.length} faixas</span></div>
            <TrackGrid tracks={timeBased.slice(0, 12)} onPlay={play} currentTrack={currentTrack} isPlaying={isPlaying} />
          </section>

          <section className="content-panel discovery-content-panel">
            <div className="section-heading"><div><span className="eyebrow">FORA DO RADAR</span><h2>Um pouco menos óbvio</h2></div><Radio size={18} /></div>
            <TrackGrid tracks={emerging.slice(0, 8)} onPlay={play} currentTrack={currentTrack} isPlaying={isPlaying} />
          </section>
        </div>
      )}

      {activeTab === 'mood' && (
        <div className="discovery-section-stack">
          <section className="content-panel mood-panel">
            <div className="section-heading"><div><span className="eyebrow">ESCOLHA UM PONTO DE PARTIDA</span><h2>O que combina com agora?</h2></div></div>
            <div className="mood-grid">
              {moods.map((mood) => {
                const Icon = mood.icon
                return <button key={mood.id} className={generated?.mood?.id === mood.id ? 'is-active' : ''} onClick={() => generateMood(mood)}><Icon size={20} /><span>{mood.name}</span></button>
              })}
            </div>
          </section>
          {generated && (
            <section className="content-panel discovery-content-panel">
              <div className="section-heading"><div><span className="eyebrow">{generated.mood.name.toUpperCase()}</span><h2>Feita para este momento</h2></div>{generated.tracks[0] && <button className="quiet-button" onClick={() => play(generated.tracks[0], generated.tracks, 0)}><Play size={15} /> Tocar tudo</button>}</div>
              <TrackGrid tracks={generated.tracks} onPlay={play} currentTrack={currentTrack} isPlaying={isPlaying} />
            </section>
          )}
        </div>
      )}

      {activeTab === 'mix' && (
        <div className="discovery-section-stack">
          <section className="content-panel mood-panel">
            <div className="section-heading"><div><span className="eyebrow">CRUZAR GÊNEROS</span><h2>Duas referências, outra rota.</h2></div></div>
            <div className="mix-grid">
              {genreMixes.map((mix, index) => <button key={mix.id} className={selectedMix?.id === mix.id ? 'is-active' : ''} onClick={() => exploreMix(mix)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{mix.name}</strong><Shuffle size={15} /></button>)}
            </div>
          </section>
          {!!mixTracks.length && <section className="content-panel discovery-content-panel"><div className="section-heading"><div><span className="eyebrow">MIX</span><h2>{selectedMix?.name}</h2></div></div><TrackGrid tracks={mixTracks} onPlay={play} currentTrack={currentTrack} isPlaying={isPlaying} /></section>}
        </div>
      )}

      {activeTab === 'world' && (
        <div className="discovery-section-stack">
          <section className="content-panel mood-panel">
            <div className="section-heading"><div><span className="eyebrow">POR REGIÃO</span><h2>Troque o seu ponto de referência.</h2></div></div>
            <div className="region-grid">
              {regions.map((region) => <button key={region.id} className={selectedRegion?.id === region.id ? 'is-active' : ''} onClick={() => exploreRegion(region)}><span>{region.flag}</span><strong>{region.name}</strong><small>{region.genre}</small></button>)}
            </div>
          </section>
          {!!worldTracks.length && <section className="content-panel discovery-content-panel"><div className="section-heading"><div><span className="eyebrow">{selectedRegion?.id}</span><h2>De {selectedRegion?.name} para sua fila</h2></div><Compass size={18} /></div><TrackGrid tracks={worldTracks} onPlay={play} currentTrack={currentTrack} isPlaying={isPlaying} /></section>}
        </div>
      )}
    </div>
  )
}

export default Discoveries
