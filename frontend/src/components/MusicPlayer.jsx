import React, { useState, useRef, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  VolumeX,
  Heart,
  Share2,
  List,
  Maximize2
} from 'lucide-react'

const MusicPlayer = ({ 
  track, 
  isPlaying, 
  onPlay, 
  onPause, 
  onNext, 
  onPrevious, 
  onShuffle, 
  onRepeat,
  onVolumeChange,
  onLike,
  isLiked = false,
  showQueue = false,
  onToggleQueue
}) => {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState('none') // none, one, all
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  
  const audioRef = useRef(null)
  const progressRef = useRef(null)
  const volumeTimeoutRef = useRef(null)

  useEffect(() => {
    if (track && audioRef.current) {
      audioRef.current.load()
      setCurrentTime(0)
      setDuration(0)
    }
  }, [track])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => onNext?.()

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [onNext])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause?.()
    } else {
      onPlay?.()
    }
  }

  const handleProgressClick = (e) => {
    const rect = progressRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    onVolumeChange?.(newVolume)
  }

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false)
      setVolume(70)
      onVolumeChange?.(70)
    } else {
      setIsMuted(true)
      onVolumeChange?.(0)
    }
  }

  const toggleShuffle = () => {
    const newShuffle = !shuffle
    setShuffle(newShuffle)
    onShuffle?.(newShuffle)
  }

  const toggleRepeat = () => {
    const modes = ['none', 'one', 'all']
    const currentIndex = modes.indexOf(repeat)
    const nextIndex = (currentIndex + 1) % modes.length
    const newRepeat = modes[nextIndex]
    setRepeat(newRepeat)
    onRepeat?.(newRepeat)
  }

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleVolumeSliderShow = () => {
    setShowVolumeSlider(true)
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current)
    }
  }

  const handleVolumeSliderHide = () => {
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeSlider(false)
    }, 2000)
  }

  if (!track) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 z-50">
      <audio ref={audioRef} preload="metadata" />
      
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <img 
              src={track.album?.images?.[0]?.url || '/default-track.jpg'} 
              alt={track.album?.name || 'Track'}
              className="w-14 h-14 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white truncate">
                {track.name || 'Unknown Track'}
              </p>
              <p className="text-gray-400 text-sm truncate">
                {track.artists?.map(a => a.name).join(', ') || 'Unknown Artist'}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <button 
                onClick={onLike}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isLiked 
                    ? 'text-red-500 hover:text-red-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title={isLiked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              
              <button 
                onClick={onToggleQueue}
                className={`p-2 text-gray-400 hover:text-white rounded-full transition-all duration-200 ${
                  showQueue ? 'bg-white/10' : ''
                }`}
                title="Mostrar fila"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Player Controls */}
          <div className="flex flex-col items-center space-y-2 flex-1">
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition-all duration-200 ${
                  shuffle ? 'text-green-500' : 'text-gray-400 hover:text-white'
                }`}
                title="Embaralhar"
              >
                <Shuffle className="w-5 h-5" />
              </button>
              
              <button 
                onClick={onPrevious}
                className="p-2 text-gray-400 hover:text-white rounded-full transition-all duration-200 hover:bg-white/10"
                title="Anterior"
              >
                <SkipBack className="w-6 h-6" />
              </button>
              
              <button 
                onClick={handlePlayPause}
                className="p-4 bg-green-600 hover:bg-green-700 rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg"
                title={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 text-white" />
                ) : (
                  <Play className="w-7 h-7 text-white ml-1" />
                )}
              </button>
              
              <button 
                onClick={onNext}
                className="p-2 text-gray-400 hover:text-white rounded-full transition-all duration-200 hover:bg-white/10"
                title="Próxima"
              >
                <SkipForward className="w-6 h-6" />
              </button>
              
              <button 
                onClick={toggleRepeat}
                className={`p-2 rounded-full transition-all duration-200 ${
                  repeat === 'none' ? 'text-gray-400 hover:text-white' :
                  repeat === 'one' ? 'text-green-500' : 'text-green-500'
                }`}
                title={
                  repeat === 'none' ? 'Sem repetição' :
                  repeat === 'one' ? 'Repetir uma' : 'Repetir todas'
                }
              >
                <Repeat className="w-5 h-5" />
                {repeat === 'one' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full text-xs"></span>
                )}
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="flex items-center space-x-3 w-full max-w-md">
              <span className="text-gray-400 text-xs w-12 text-right">
                {formatTime(currentTime)}
              </span>
              
              <div 
                ref={progressRef}
                className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer relative group"
                onClick={handleProgressClick}
              >
                <div className="h-full bg-green-500 rounded-full relative">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
                <div 
                  className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-100"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              
              <span className="text-gray-400 text-xs w-12">
                {formatTime(duration)}
              </span>
            </div>
          </div>
          
          {/* Volume Control */}
          <div className="flex items-center space-x-3 flex-1 justify-end">
            <button 
              onClick={toggleMute}
              className="p-2 text-gray-400 hover:text-white rounded-full transition-all duration-200"
              title={isMuted ? 'Ativar som' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <div 
              className="relative"
              onMouseEnter={handleVolumeSliderShow}
              onMouseLeave={handleVolumeSliderHide}
            >
              <div className={`absolute bottom-full right-0 mb-2 p-3 bg-gray-800 rounded-lg shadow-xl transition-all duration-200 ${
                showVolumeSlider ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                  className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-green-500"
                  style={{
                    background: `linear-gradient(to right, #22c55e 0%, #22c55e ${volume}%, rgba(255,255,255,0.2) ${volume}%)`
                  }}
                />
              </div>
            </div>
            
            <button 
              className="p-2 text-gray-400 hover:text-white rounded-full transition-all duration-200"
              title="Tela cheia"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MusicPlayer

