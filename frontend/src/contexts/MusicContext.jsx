import React, { createContext, useContext, useState, useCallback } from 'react';
import { spotifyAPI } from '../services/api';

const MusicContext = createContext();

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

export const MusicProvider = ({ children }) => {
  const [currentQueue, setCurrentQueue] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Get available devices
  const fetchDevices = useCallback(async () => {
    try {
      const response = await spotifyAPI.getDevices();
      setDevices(response.data?.devices || []);
      
      // Auto-select the active device if any
      const activeDevice = response.data?.devices?.find(device => device.is_active);
      if (activeDevice && !selectedDevice) {
        setSelectedDevice(activeDevice.id);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  }, [selectedDevice]);

  // Play a single track
  const playTrack = useCallback(async (track, queue = [track], startIndex = 0) => {
    try {
      const trackUris = queue.map(t => `spotify:track:${t.id}`);
      
      const options = {
        trackUris,
        offset: startIndex
      };
      
      if (selectedDevice) {
        options.deviceId = selectedDevice;
      }

      await spotifyAPI.startPlayback(options);
      
      setCurrentQueue(queue);
      setCurrentTrackIndex(startIndex);
      setIsPlaying(true);
      
      return true;
    } catch (error) {
      console.error('Error playing track:', error);
      throw error;
    }
  }, [selectedDevice]);

  // Play a playlist
  const playPlaylist = useCallback(async (playlist, startIndex = 0) => {
    try {
      let tracks = [];
      
      // Get tracks from playlist
      if (playlist.tracks?.items) {
        tracks = playlist.tracks.items.map(item => item.track).filter(Boolean);
      } else {
        // Fetch tracks if not available
        const response = await spotifyAPI.getPlaylistTracks(playlist.id);
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
  }, [playTrack]);

  // Play by context URI (playlist/album)
  const playContext = useCallback(async (contextUri, startIndex = 0) => {
    try {
      const options = {
        contextUri,
        offset: startIndex
      };
      
      if (selectedDevice) {
        options.deviceId = selectedDevice;
      }

      await spotifyAPI.startPlayback(options);
      setIsPlaying(true);
      
      return true;
    } catch (error) {
      console.error('Error playing context:', error);
      throw error;
    }
  }, [selectedDevice]);

  // Add track to queue
  const addToQueue = useCallback((track) => {
    setCurrentQueue(prev => [...prev, track]);
  }, []);

  // Remove track from queue
  const removeFromQueue = useCallback((index) => {
    setCurrentQueue(prev => {
      const newQueue = [...prev];
      newQueue.splice(index, 1);
      
      // Adjust current index if needed
      if (index <= currentTrackIndex && currentTrackIndex > 0) {
        setCurrentTrackIndex(prev => prev - 1);
      }
      
      return newQueue;
    });
  }, [currentTrackIndex]);

  // Clear queue
  const clearQueue = useCallback(() => {
    setCurrentQueue([]);
    setCurrentTrackIndex(0);
    setIsPlaying(false);
  }, []);

  const value = {
    // State
    currentQueue,
    currentTrackIndex,
    currentTrack: currentQueue[currentTrackIndex] || null,
    isPlaying,
    devices,
    selectedDevice,
    
    // Actions
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
