import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMusic } from '../contexts/MusicContext';
import { useSettings } from '../contexts/SettingsContext';
import api from '../services/api';
import { Music, Pause, Play, SkipBack, SkipForward, Volume2, X, Maximize2, Minimize2, Smartphone, Monitor, Speaker } from 'lucide-react';

const NowPlaying = () => {
  const [track, setTrack] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const { user } = useAuth();
  const { devices, selectedDevice, setSelectedDevice, fetchDevices } = useMusic();
  const { settings } = useSettings();

  const fetchNowPlaying = async () => {
    try {
      const { data } = await api.get('/api/now-playing');
      if (data && data.item) {
        setTrack(data);
        const progressMs = data.progress_ms;
        const durationMs = data.item.duration_ms;
        setProgress((progressMs / durationMs) * 100);
      } else {
        setTrack(null);
      }
    } catch (error) {
      if (error.response && error.response.status !== 204) {
        console.error("Error fetching now playing track:", error);
      }
      setTrack(null);
    }
  };

  const handlePlayPause = async () => {
    if (!track) return;
    
    setIsLoading(true);
    try {
      if (track.is_playing) {
        await api.put('/api/player/pause');
      } else {
        await api.put('/api/player/play');
      }
      setTimeout(fetchNowPlaying, 500);
    } catch (error) {
      console.error('Error controlling playback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    setIsLoading(true);
    try {
      await api.post('/api/player/next');
      setTimeout(fetchNowPlaying, 500);
    } catch (error) {
      console.error('Error skipping to next:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = async () => {
    setIsLoading(true);
    try {
      await api.post('/api/player/previous');
      setTimeout(fetchNowPlaying, 500);
    } catch (error) {
      console.error('Error skipping to previous:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNowPlaying();
      fetchDevices();
      const interval = setInterval(fetchNowPlaying, 3000);
      return () => clearInterval(interval);
    }
  }, [user, fetchDevices]);

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'computer':
        return <Monitor size={16} />;
      case 'smartphone':
        return <Smartphone size={16} />;
      case 'speaker':
        return <Speaker size={16} />;
      default:
        return <Music size={16} />;
    }
  };

  const handleDeviceSelect = (deviceId) => {
    setSelectedDevice(deviceId);
    setShowDevices(false);
  };

  if (!track) {
    return (
      <>
        {isVisible && (
          <div className="fixed bottom-6 right-6 w-80 bg-gradient-to-br from-gray-800 via-gray-900 to-black border border-gray-600 rounded-2xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-700/20 to-transparent border-b border-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-xs text-gray-400 font-semibold">NADA TOCANDO</span>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Music size={32} className="text-gray-500" />
              </div>
              <h3 className="text-white font-semibold mb-2">Nada tocando no momento</h3>
              <p className="text-gray-400 text-sm mb-4">
                Abra o Spotify e comece a tocar uma música para ver ela aqui!
              </p>
              <button
                onClick={fetchNowPlaying}
                className="px-4 py-2 bg-spotify-green hover:bg-green-500 text-black rounded-lg font-semibold transition-all hover:scale-105"
              >
                Verificar novamente
              </button>
            </div>
          </div>
        )}

        {/* Botão para mostrar quando oculto */}
        {!isVisible && (
          <button
            onClick={() => setIsVisible(true)}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full shadow-2xl transition-all hover:scale-110 z-50 flex items-center justify-center"
          >
            <Music size={20} className="sm:w-6 sm:h-6" />
          </button>
        )}
      </>
    );
  }

  const { item, is_playing } = track;

  return (
    <>
      {/* Player flutuante expandido */}
      {!isMinimized && isVisible && (
        <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 w-72 sm:w-80 bg-gradient-to-br from-spotify-dark via-gray-900 to-black border border-spotify-green/30 rounded-2xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden max-w-[calc(100vw-1.5rem)] sm:max-w-none">{/* Header do player */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-spotify-green/20 to-transparent border-b border-white/10">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-spotify-green rounded-full animate-pulse"></div>
              <span className="text-xs text-spotify-green font-semibold">TOCANDO AGORA</span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all"
              >
                <Minimize2 size={14} />
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="p-3 sm:p-4">
            {/* Capa e info da música */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <img 
                  src={item.album.images[0]?.url} 
                  alt={item.name} 
                  className="w-16 h-16 rounded-lg shadow-lg"
                />
                <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
                {is_playing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-spotify-green rounded-full flex items-center justify-center animate-pulse">
                      <Play size={12} className="text-black ml-0.5" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm truncate">{item.name}</h3>
                <p className="text-spotify-light text-xs truncate">
                  {item.artists.map(artist => artist.name).join(', ')}
                </p>
                <p className="text-gray-500 text-xs truncate mt-1">{item.album.name}</p>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>{formatTime(track.progress_ms)}</span>
                <span>{formatTime(item.duration_ms)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div 
                  className="bg-spotify-green h-1 rounded-full transition-all duration-1000" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Controles */}
            <div className="flex items-center justify-between">
              <button 
                onClick={handlePrevious}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all disabled:opacity-50"
              >
                <SkipBack size={16} />
              </button>
              
              <button 
                onClick={handlePlayPause}
                disabled={isLoading}
                className="p-3 bg-spotify-green hover:bg-green-500 text-black rounded-full transition-all hover:scale-105 shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : is_playing ? (
                  <Pause size={18} />
                ) : (
                  <Play size={18} />
                )}
              </button>
              
              <button 
                onClick={handleNext}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all disabled:opacity-50"
              >
                <SkipForward size={16} />
              </button>

              
              <div className="flex items-center space-x-2">
                <Volume2 size={14} className="text-gray-400" />
                <div className="w-16 bg-gray-700 rounded-full h-1">
                  <div className="bg-white w-3/4 h-1 rounded-full"></div>
                </div>
              </div>

              {/* Device selector */}
              <div className="relative">
                <button
                  onClick={() => setShowDevices(!showDevices)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                  title="Escolher dispositivo"
                >
                  {getDeviceIcon(devices.find(d => d.id === selectedDevice)?.type)}
                </button>

                {showDevices && (
                  <div className="absolute bottom-12 right-0 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 min-w-48">
                    <div className="p-3 border-b border-gray-600">
                      <h4 className="text-sm font-semibold text-white">Escolher dispositivo</h4>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {devices.length === 0 ? (
                        <div className="p-3 text-sm text-gray-400 text-center">
                          Nenhum dispositivo encontrado
                        </div>
                      ) : (
                        devices.map((device) => (
                          <button
                            key={device.id}
                            onClick={() => handleDeviceSelect(device.id)}
                            className={`w-full p-3 text-left hover:bg-gray-700 transition-colors ${
                              device.id === selectedDevice ? 'bg-green-600/20 text-green-400' : 'text-white'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {getDeviceIcon(device.type)}
                              <div>
                                <div className="font-medium">{device.name}</div>
                                <div className="text-xs text-gray-400 capitalize">
                                  {device.type} {device.is_active && '• Ativo'}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Visualizador de áudio */}
          <div className={`h-1 transition-all duration-1000 ${
            is_playing 
              ? 'bg-gradient-to-r from-spotify-green via-blue-500 to-purple-500 opacity-60' 
              : 'bg-gray-600 opacity-30'
          }`}></div>
        </div>
      )}

      {/* Player minimizado */}
      {isMinimized && isVisible && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-spotify-dark to-gray-900 border border-spotify-green/30 rounded-full shadow-2xl backdrop-blur-xl z-50 overflow-hidden max-w-[calc(100vw-2rem)] sm:max-w-none">
          <div className="flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3">
            <div className="relative flex-shrink-0">
              <img 
                src={item.album.images[0]?.url} 
                alt={item.name} 
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full shadow-lg"
              />
              {is_playing && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-spotify-green rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-black rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 max-w-32 sm:max-w-48">
              <p className="text-white font-semibold text-sm truncate">{item.name}</p>
              <p className="text-gray-400 text-xs truncate">
                {item.artists.map(artist => artist.name).join(', ')}
              </p>
            </div>
            
            <button
              onClick={handlePlayPause}
              disabled={isLoading}
              className="p-1.5 sm:p-2 bg-spotify-green hover:bg-green-500 text-black rounded-full transition-all hover:scale-105 disabled:opacity-50 flex-shrink-0"
            >
              {isLoading ? (
                <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : is_playing ? (
                <Pause size={11} className="sm:w-3 sm:h-3" />
              ) : (
                <Play size={11} className="sm:w-3 sm:h-3" />
              )}
            </button>
            
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all flex-shrink-0"
            >
              <Maximize2 size={13} className="sm:w-4 sm:h-4" />
            </button>
            
            <button
              onClick={() => setIsVisible(false)}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all flex-shrink-0"
            >
              <X size={13} className="sm:w-4 sm:h-4" />
            </button>
          </div>
          
          {/* Barra de progresso minimalista */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-700">
            <div 
              className="bg-spotify-green h-0.5 transition-all duration-1000" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Botão para mostrar player quando oculto */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-spotify-green hover:bg-green-500 text-black rounded-full shadow-2xl transition-all hover:scale-110 z-50 flex items-center justify-center"
        >
          <Music size={20} className="sm:w-6 sm:h-6" />
        </button>
      )}
    </>
  );
};

export default NowPlaying;
