import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import demoAPI from '../services/demoAPI'
import { spotifyAPI } from '../services/api'
import { useDemo } from './DemoContext'

const MusicContext = createContext(null)

export const useMusic = () => {
  const context = useContext(MusicContext)
  if (!context) throw new Error('useMusic must be used within a MusicProvider')
  return context
}

export const MusicProvider = ({ children }) => {
  const { isDemoMode } = useDemo()
  const currentAPI = isDemoMode ? demoAPI : spotifyAPI
  const [currentQueue, setCurrentQueue] = useState([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState(null)

  const fetchDevices = useCallback(async () => {
    try {
      const response = await currentAPI.getDevices()
      const nextDevices = response.data?.devices || []
      setDevices(nextDevices)
      setSelectedDevice((current) => current || nextDevices.find((device) => device.is_active)?.id || null)
    } catch (error) {
      console.warn('Devices unavailable:', error?.message)
    }
  }, [currentAPI])

  const playTrack = useCallback(async (track, queue = [track], startIndex = 0) => {
    if (!track?.id) return false
    const safeQueue = queue.filter((item) => item?.id)
    const index = Math.min(Math.max(startIndex, 0), Math.max(safeQueue.length - 1, 0))
    const options = {
      trackUris: safeQueue.map((item) => `spotify:track:${item.id}`),
      offset: index,
      ...(selectedDevice ? { deviceId: selectedDevice } : {}),
    }

    await currentAPI.startPlayback(options)
    setCurrentQueue(safeQueue)
    setCurrentTrackIndex(index)
    setIsPlaying(true)
    return true
  }, [currentAPI, selectedDevice])

  const playPlaylist = useCallback(async (playlist, startIndex = 0) => {
    let tracks = playlist.tracks?.items?.map((item) => item.track).filter(Boolean) || []
    if (!tracks.length) {
      const response = await currentAPI.getPlaylistTracks(playlist.id)
      tracks = response.data?.items?.map((item) => item.track).filter(Boolean) || []
    }
    if (!tracks.length) throw new Error('Playlist is empty')
    return playTrack(tracks[startIndex] || tracks[0], tracks, startIndex)
  }, [currentAPI, playTrack])

  const playContext = useCallback(async (contextUri, startIndex = 0) => {
    await currentAPI.startPlayback({
      contextUri,
      offset: startIndex,
      ...(selectedDevice ? { deviceId: selectedDevice } : {}),
    })
    setIsPlaying(true)
    return true
  }, [currentAPI, selectedDevice])

  const addToQueue = useCallback((track) => setCurrentQueue((queue) => [...queue, track]), [])

  const removeFromQueue = useCallback((index) => {
    setCurrentQueue((queue) => queue.filter((_, itemIndex) => itemIndex !== index))
    setCurrentTrackIndex((current) => index <= current && current > 0 ? current - 1 : current)
  }, [])

  const clearQueue = useCallback(() => {
    setCurrentQueue([])
    setCurrentTrackIndex(0)
    setIsPlaying(false)
  }, [])

  const value = useMemo(() => ({
    currentQueue,
    currentTrackIndex,
    currentTrack: currentQueue[currentTrackIndex] || null,
    isPlaying,
    devices,
    selectedDevice,
    playTrack,
    playPlaylist,
    playContext,
    addToQueue,
    removeFromQueue,
    clearQueue,
    fetchDevices,
    setSelectedDevice,
    setIsPlaying,
    setCurrentTrackIndex,
  }), [currentQueue, currentTrackIndex, isPlaying, devices, selectedDevice, playTrack, playPlaylist, playContext, addToQueue, removeFromQueue, clearQueue, fetchDevices])

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
}
