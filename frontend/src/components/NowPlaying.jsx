import { useCallback, useEffect, useMemo, useState } from 'react'
import { Monitor, Music2, Pause, Play, SkipBack, SkipForward, Smartphone, Speaker, Volume2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useDemo } from '../contexts/DemoContext'
import { useMusic } from '../contexts/MusicContext'
import { useSettings } from '../contexts/SettingsContext'
import api from '../services/api'
import demoAPI from '../services/demoAPI'

const formatTime = (ms = 0) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const DeviceIcon = ({ type }) => {
  const normalized = type?.toLowerCase()
  if (normalized === 'smartphone') return <Smartphone size={16} />
  if (normalized === 'speaker') return <Speaker size={16} />
  return <Monitor size={16} />
}

const NowPlaying = () => {
  const { user } = useAuth()
  const { isDemoMode } = useDemo()
  const { settings } = useSettings()
  const {
    currentTrack: contextTrack,
    currentQueue,
    currentTrackIndex,
    setCurrentTrackIndex,
    isPlaying: contextPlaying,
    setIsPlaying: setContextPlaying,
    devices,
    selectedDevice,
    setSelectedDevice,
    fetchDevices,
  } = useMusic()

  const [remotePlayback, setRemotePlayback] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDevices, setShowDevices] = useState(false)

  const currentAPI = isDemoMode ? demoAPI : api

  const fetchNowPlaying = useCallback(async () => {
    if (!user) return
    try {
      const response = await currentAPI.get('/api/now-playing')
      setRemotePlayback(response?.data?.item ? response.data : null)
    } catch (error) {
      if (error?.response?.status !== 204) console.warn('Now playing unavailable:', error?.message)
      setRemotePlayback(null)
    }
  }, [user, currentAPI])

  useEffect(() => {
    if (!user) return undefined
    fetchNowPlaying()
    fetchDevices()
    const timer = window.setInterval(fetchNowPlaying, 5000)
    return () => window.clearInterval(timer)
  }, [user, fetchNowPlaying, fetchDevices])

  const playback = useMemo(() => {
    if (isDemoMode && contextTrack) {
      return {
        item: contextTrack,
        is_playing: contextPlaying,
        progress_ms: 0,
      }
    }
    return remotePlayback
  }, [isDemoMode, contextTrack, contextPlaying, remotePlayback])

  if (!user || !settings.showMiniPlayer) return null

  const item = playback?.item
  const playing = playback?.is_playing ?? false
  const progressMs = playback?.progress_ms || 0
  const durationMs = item?.duration_ms || 0
  const progress = durationMs ? Math.min(100, (progressMs / durationMs) * 100) : 0
  const selectedDeviceData = devices.find((device) => device.id === selectedDevice)
  const volumePercent = playback?.device?.volume_percent ?? selectedDeviceData?.volume_percent

  const runControl = async (endpoint, method = 'post') => {
    if (!item) return
    setIsLoading(true)
    try {
      await currentAPI[method](endpoint)
      if (endpoint.includes('pause')) setContextPlaying(false)
      if (endpoint.includes('play')) setContextPlaying(true)
      if (isDemoMode && endpoint.endsWith('/next') && currentQueue.length) {
        setCurrentTrackIndex((currentTrackIndex + 1) % currentQueue.length)
        setContextPlaying(true)
      }
      if (isDemoMode && endpoint.endsWith('/previous') && currentQueue.length) {
        setCurrentTrackIndex((currentTrackIndex - 1 + currentQueue.length) % currentQueue.length)
        setContextPlaying(true)
      }
      if (!isDemoMode) window.setTimeout(fetchNowPlaying, 350)
    } catch (error) {
      console.error('Playback control failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <footer className="player-bar" aria-label="Player">
      <div className="player-track">
        {item ? (
          <>
            <img
              src={item.album?.images?.[0]?.url || '/default-track.svg'}
              alt=""
              onError={(e) => { e.currentTarget.src = '/default-track.svg' }}
            />
            <div className="player-track-copy">
              <strong title={item.name}>{item.name}</strong>
              <span title={item.artists?.map((artist) => artist.name).join(', ')}>
                {item.artists?.map((artist) => artist.name).join(', ') || 'Artista desconhecido'}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="player-placeholder"><Music2 size={20} /></div>
            <div className="player-track-copy"><strong>Nada tocando</strong><span>Escolha uma música para começar</span></div>
          </>
        )}
      </div>

      <div className="player-center">
        <div className="player-controls">
          <button disabled={!item || isLoading} onClick={() => runControl('/api/player/previous')} aria-label="Anterior"><SkipBack size={18} fill="currentColor" /></button>
          <button
            className="player-play"
            disabled={!item || isLoading}
            onClick={() => runControl(playing ? '/api/player/pause' : '/api/player/play', 'put')}
            aria-label={playing ? 'Pausar' : 'Reproduzir'}
          >
            {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>
          <button disabled={!item || isLoading} onClick={() => runControl('/api/player/next')} aria-label="Próxima"><SkipForward size={18} fill="currentColor" /></button>
        </div>
        <div className="player-progress-row">
          <span>{formatTime(progressMs)}</span>
          <div className="player-progress"><i style={{ width: `${progress}%` }} /></div>
          <span>{formatTime(durationMs)}</span>
        </div>
      </div>

      <div className="player-actions">
        <div className="device-picker">
          <button className="player-action" onClick={() => setShowDevices((value) => !value)} aria-label="Selecionar dispositivo">
            <DeviceIcon type={selectedDeviceData?.type || playback?.device?.type} />
          </button>
          {showDevices && (
            <div className="device-menu">
              <p>Ouvir em</p>
              {devices.length ? devices.map((device) => (
                <button key={device.id} onClick={() => { setSelectedDevice(device.id); setShowDevices(false) }} className={selectedDevice === device.id ? 'is-active' : ''}>
                  <DeviceIcon type={device.type} />
                  <span><strong>{device.name}</strong><small>{device.type || 'Dispositivo'}</small></span>
                </button>
              )) : <span className="device-empty">Nenhum dispositivo encontrado</span>}
            </div>
          )}
        </div>
        {Number.isFinite(volumePercent) && <>
          <Volume2 size={17} className="player-volume-icon" />
          <div className="player-volume" aria-label={`Volume ${volumePercent}%`}><i style={{ width: `${volumePercent}%` }} /></div>
        </>}
      </div>
    </footer>
  )
}

export default NowPlaying
