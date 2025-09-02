import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, MapPin, User, Music, Calendar } from 'lucide-react';
import api from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [recentTracks, setRecentTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentTracks();
    }
  }, [user]);

  const fetchRecentTracks = async () => {
    try {
      const response = await api.get('/api/recently-played?limit=10');
      setRecentTracks(response.data.items || []);
    } catch (error) {
      console.error('Error fetching recent tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Carregando perfil...</div>;
  }

  return (
    <div className="container mx-auto p-8 text-white">
      <div className="flex flex-col items-center md:flex-row md:items-start mb-12">
        <img 
          src={user.images?.[0]?.url || '/default-track.jpg'} 
          alt={user.display_name}
          className="w-48 h-48 rounded-full object-cover border-4 border-spotify-green shadow-lg"
        />
        <div className="mt-6 md:mt-0 md:ml-8 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-bold">{user.display_name}</h1>
          <p className="text-spotify-light mt-2 text-lg">Assinante {user.product}</p>
          
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-center md:justify-start">
              <Mail className="w-5 h-5 mr-3 text-spotify-green" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start">
              <MapPin className="w-5 h-5 mr-3 text-spotify-green" />
              <span>{user.country}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start">
              <User className="w-5 h-5 mr-3 text-spotify-green" />
              <span>{user.followers.total} seguidores</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Músicas Mais Ouvidas Recentemente */}
      <div className="bg-spotify-bg rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Music className="w-6 h-6 mr-3 text-spotify-green" />
          Músicas Mais Ouvidas Recentemente
        </h2>
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-spotify-light">Carregando músicas...</p>
          </div>
        ) : recentTracks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentTracks.map((item, index) => (
              <div key={index} className="bg-spotify-dark p-4 rounded-lg hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-4">
                  <img 
                    src={item.track.album.images[0]?.url || '/default-track.jpg'} 
                    alt={item.track.name}
                    className="w-16 h-16 rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{item.track.name}</h3>
                    <p className="text-spotify-light text-xs truncate">
                      {item.track.artists.map(artist => artist.name).join(', ')}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-spotify-light">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{new Date(item.played_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-spotify-light">Nenhuma música encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
