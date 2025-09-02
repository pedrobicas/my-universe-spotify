import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Music, Pause, Play } from 'lucide-react';

const NowPlaying = () => {
  const [track, setTrack] = useState(null);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

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

  useEffect(() => {
    if (user) {
      fetchNowPlaying();
      const interval = setInterval(fetchNowPlaying, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  if (!track) {
    return (
      <div className="bg-spotify-dark p-4 rounded-lg shadow-lg text-center">
        <p className="text-spotify-light">Nenhuma música tocando no momento.</p>
      </div>
    );
  }

  const { item, is_playing } = track;

  return (
    <div className="bg-spotify-bg p-4 rounded-lg shadow-lg flex items-center space-x-4">
      <img src={item.album.images[0].url} alt={item.name} className="w-24 h-24 rounded-md" />
      <div className="flex-1">
        <p className="font-bold text-lg">{item.name}</p>
        <p className="text-spotify-light">{item.artists.map(artist => artist.name).join(', ')}</p>
        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
          <div className="bg-spotify-green h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      <div className="text-spotify-green">
        {is_playing ? <Pause size={28} /> : <Play size={28} />}
      </div>
    </div>
  );
};

export default NowPlaying;
