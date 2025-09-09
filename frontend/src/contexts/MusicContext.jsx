import React, { createContext, useContext, useState, useCallback } from 'react';
import { spotifyAPI } from '../services/api';
import { useDemo } from './DemoContext';
import demoAPI from '../services/demoAPI';

const MusicContext = createContext();

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

export const MusicProvider = ({ children }) => {
  const { isDemoMode } = useDemo();
  const [currentQueue, setCurrentQueue] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Função para obter a API correta baseada no modo
  const getAPI = () => {
    return isDemoMode ? demoAPI : spotifyAPI;
  };

  const fetchDevices = useCallback(async () => {
    try {
      const api = getAPI();
      const response = await api.getDevices();
      setDevices(response.data?.devices || []);
      
      const activeDevice = response.data?.devices?.find(device => device.is_active);
      if (activeDevice && !selectedDevice) {
        setSelectedDevice(activeDevice.id);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  }, [selectedDevice, isDemoMode]);

  const playTrack = useCallback(async (track, queue = [track], startIndex = 0) => {
    try {
      const api = getAPI();
      const trackUris = queue.map(t => `spotify:track:${t.id}`);
      
      const options = {
        trackUris,
        offset: startIndex
      };
      
      if (selectedDevice) {
        options.deviceId = selectedDevice;
      }

      await api.startPlayback(options);
      
      setCurrentQueue(queue);
      setCurrentTrackIndex(startIndex);
      setIsPlaying(true);
      
      return true;
    } catch (error) {
      console.error('Error playing track:', error);
      throw error;
    }
  }, [selectedDevice, isDemoMode]);

  const playPlaylist = useCallback(async (playlist, startIndex = 0) => {
    try {
      const api = getAPI();
      let tracks = [];
      
      if (playlist.tracks?.items) {
        tracks = playlist.tracks.items.map(item => item.track).filter(Boolean);
      } else {
        const response = await api.getPlaylistTracks(playlist.id);
        tracks = response.data.items?.map(item => item.track).filter(Boolean) || [];
      }

      if (tracks.length === 0) {
        throw new Error('Playlist is empty');
      }

      return await playTrack(tracks[startIndex], tracks, startIndex);
    } catch (error) {
      console.error('Error playing playlist:', error);
      throw error;
    }
  }, [playTrack, isDemoMode]);

  const playContext = useCallback(async (contextUri, startIndex = 0) => {
    try {
      const api = getAPI();
      const options = {
        contextUri,
        offset: startIndex
      };
      
      if (selectedDevice) {
        options.deviceId = selectedDevice;
      }

      await api.startPlayback(options);
      setIsPlaying(true);
      
      return true;
    } catch (error) {
      console.error('Error playing context:', error);
      throw error;
    }
  }, [selectedDevice, isDemoMode]);

  const addToQueue = useCallback((track) => {
    setCurrentQueue(prev => [...prev, track]);
  }, []);

  const removeFromQueue = useCallback((index) => {
    setCurrentQueue(prev => {
      const newQueue = [...prev];
      newQueue.splice(index, 1);
      if (index <= currentTrackIndex && currentTrackIndex > 0) {
        setCurrentTrackIndex(prev => prev - 1);
      }
      
      return newQueue;
    });
  }, [currentTrackIndex]);

  const clearQueue = useCallback(() => {
    setCurrentQueue([]);
    setCurrentTrackIndex(0);
    setIsPlaying(false);
  }, []);

  const value = {
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
    setCurrentTrackIndex
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
};
