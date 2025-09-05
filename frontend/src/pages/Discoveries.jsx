import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMusic } from '../contexts/MusicContext';
import { spotifyAPI } from '../services/api';
import { 
  Compass, MapPin, Sun, Moon, CloudRain, Zap, 
  Coffee, Dumbbell, Car, Home, Heart, TrendingUp,
  Globe, Music, Shuffle, Play, Plus, Star,
  Clock, Headphones, Radio, Disc3, Volume2,
  Search, Filter, Download, Share, Sparkles,
  Mountain, Waves, Wind, Flame, Snowflake, Pause
} from 'lucide-react';
import Card from '../components/Card';
import Loading from '../components/Loading';

const Discoveries = () => {
  const { user } = useAuth();
  const { playTrack, currentTrack, isPlaying } = useMusic();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mood-generator');
  const [recommendations, setRecommendations] = useState([]);
  const [similarTracks, setSimilarTracks] = useState([]);
  const [emergingArtists, setEmergingArtists] = useState([]);
  const [timeBasedRecs, setTimeBasedRecs] = useState([]);
  const [generatedPlaylist, setGeneratedPlaylist] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedGenreMix, setSelectedGenreMix] = useState([]);
  const [worldMusic, setWorldMusic] = useState([]);
  const [fallbackMessage, setFallbackMessage] = useState('');

  // Mapear cada mood para um gênero seguro e coerente
  const moodGenreMap = {
    energetic: 'dance',
    chill: 'chill',
    focus: 'ambient',
    party: 'dance',
    romantic: 'bossanova',
    melancholic: 'acoustic',
    workout: 'electronic',
    sleep: 'ambient',
  };

  // Moods/Climas disponíveis
  const moods = [
    { id: 'energetic', name: 'Energético', icon: Zap, color: 'from-yellow-400 to-orange-500', seeds: { target_energy: 0.8, target_valence: 0.7, target_danceability: 0.7 } },
    { id: 'chill', name: 'Relaxante', icon: Waves, color: 'from-blue-400 to-cyan-500', seeds: { target_energy: 0.3, target_valence: 0.5, target_acousticness: 0.7 } },
    { id: 'focus', name: 'Foco', icon: Mountain, color: 'from-purple-400 to-indigo-500', seeds: { target_energy: 0.4, target_instrumentalness: 0.7, max_speechiness: 0.1 } },
    { id: 'party', name: 'Festa', icon: Flame, color: 'from-pink-400 to-red-500', seeds: { target_energy: 0.9, target_valence: 0.8, target_danceability: 0.9 } },
    { id: 'romantic', name: 'Romântico', icon: Heart, color: 'from-rose-400 to-pink-500', seeds: { target_valence: 0.6, target_acousticness: 0.6, target_energy: 0.4 } },
    { id: 'melancholic', name: 'Melancólico', icon: CloudRain, color: 'from-gray-400 to-slate-500', seeds: { target_valence: 0.2, target_energy: 0.3, target_acousticness: 0.8 } },
    { id: 'workout', name: 'Treino', icon: Dumbbell, color: 'from-green-400 to-emerald-500', seeds: { target_energy: 0.9, target_tempo: 120, target_danceability: 0.8 } },
    { id: 'sleep', name: 'Dormir', icon: Moon, color: 'from-indigo-400 to-purple-600', seeds: { target_energy: 0.1, target_valence: 0.3, target_acousticness: 0.9 } }
  ];

  // Atividades
  const activities = [
    { id: 'commute', name: 'Viagem/Trânsito', icon: Car, duration: 30 },
    { id: 'work', name: 'Trabalho', icon: Coffee, duration: 120 },
    { id: 'study', name: 'Estudos', icon: Mountain, duration: 90 },
    { id: 'cooking', name: 'Cozinhar', icon: Home, duration: 45 },
    { id: 'workout', name: 'Exercícios', icon: Dumbbell, duration: 60 },
    { id: 'relaxing', name: 'Relaxar', icon: Waves, duration: 60 }
  ];

  // Países e regiões para música mundial
  const regions = [
    { id: 'BR', name: 'Brasil', flag: '🇧🇷', genres: ['latin', 'brazil'] },
    { id: 'JP', name: 'Japão', flag: '🇯🇵', genres: ['j-pop', 'j-rock'] },
    { id: 'KR', name: 'Coreia do Sul', flag: '🇰🇷', genres: ['k-pop'] },
    { id: 'IN', name: 'Índia', flag: '🇮🇳', genres: ['world-music'] },
    { id: 'FR', name: 'França', flag: '��', genres: ['pop'] },
    { id: 'ES', name: 'Espanha', flag: '🇪🇸', genres: ['latin'] },
    { id: 'AR', name: 'Argentina', flag: '🇦🇷', genres: ['latin'] },
    { id: 'NG', name: 'Nigéria', flag: '🇳🇬', genres: ['afrobeat'] }
  ];

  // Combinações de gêneros interessantes
  const genreMixes = [
    { id: 'jazz-electronic', name: 'Jazz + Eletrônico', genres: ['jazz', 'electronic'], icon: Disc3 },
    { id: 'classical-ambient', name: 'Clássico + Ambiente', genres: ['classical', 'ambient'], icon: Wind },
    { id: 'rock-folk', name: 'Rock + Folk', genres: ['rock', 'folk'], icon: Mountain },
    { id: 'hip-hop-jazz', name: 'Hip-Hop + Jazz', genres: ['hip-hop', 'jazz'], icon: Radio },
    { id: 'pop-world', name: 'Pop + Mundial', genres: ['pop', 'world-music'], icon: Globe },
    { id: 'indie-pop', name: 'Indie + Pop', genres: ['indie', 'pop'], icon: Sparkles }
  ];

  useEffect(() => {
    if (user) {
      loadDiscoveryData();
    }
  }, [user]);

  const loadDiscoveryData = async () => {
    setLoading(true);
    try {
      // Carregar dados básicos para recomendações
      const [topTracks, topArtists] = await Promise.all([
        spotifyAPI.getTopTracks('medium_term', 20),
        spotifyAPI.getTopArtists('medium_term', 10)
      ]);

      // Buscar recomendações baseadas no horário atual
      await generateTimeBasedRecommendations();
      
      // Buscar artistas emergentes (baixa popularidade mas com características interessantes)
      await findEmergingArtists();

    } catch (error) {
      console.error('Error loading discovery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePlaylistByMood = async (mood, activity = null) => {
    try {
      setLoading(true);
      setFallbackMessage('');
      setSelectedMood(mood);
      setSelectedActivity(activity);

      // Para o Gerador por Clima, vamos usar APENAS o gênero e características do mood
      // Não incluir seeds do usuário para ter resultados mais puros e variados
      const chosenGenre = moodGenreMap[mood.id] || 'pop';
      const limit = Math.min(100, Math.max(10, activity ? Math.ceil(activity.duration / 3) : 30));
      const params = {
        limit,
        market: 'BR',
        seed_genres: chosenGenre, // Gênero coerente com o mood
        ...mood.seeds, // Características de audio (target_energy, target_valence, etc.)
      };

  const response = await spotifyAPI.getRecommendations(params);
      if (response?.data?.fallback) {
        setFallbackMessage('As recomendações foram geradas em modo fallback — resultados limitados.');
      }
      
      const playlist = {
        name: `${mood.name}${activity ? ` para ${activity.name}` : ''} • ${new Date().toLocaleDateString()}`,
        description: `Playlist gerada automaticamente para o mood ${mood.name}${activity ? ` durante ${activity.name}` : ''}`,
  tracks: Array.isArray(response.data?.tracks) ? response.data.tracks : [],
        mood: mood,
        activity: activity,
  duration: (response.data?.tracks || []).reduce((acc, track) => acc + (track.duration_ms || 0), 0)
      };

  setGeneratedPlaylist(playlist);
    } catch (error) {
      console.error('Error generating mood playlist:', error);
      
      // Fallback: tentar apenas com gênero e características do mood
      try {
        console.log('Trying fallback with genre only...');
        const fallbackResponse = await spotifyAPI.getRecommendations({
          seed_genres: chosenGenre,
          market: 'BR',
          limit: 20,
          // Usar as características originais do mood no fallback
          target_valence: mood.seeds.target_valence || 0.5,
          target_energy: mood.seeds.target_energy || 0.5,
        });

        const fallbackPlaylist = {
          name: `${mood.name} (Modo Seguro) • ${new Date().toLocaleDateString()}`,
          description: `Playlist gerada em modo de fallback`,
          tracks: Array.isArray(fallbackResponse.data?.tracks) ? fallbackResponse.data.tracks : [],
          mood: mood,
          activity: activity,
          duration: (fallbackResponse.data?.tracks || []).reduce((acc, track) => acc + (track.duration_ms || 0), 0)
        };

        if (fallbackResponse?.data?.fallback) {
          setFallbackMessage('Modo seguro ativado: usando resultados alternativos.');
        }

        setGeneratedPlaylist(fallbackPlaylist);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        alert('Erro ao gerar playlist. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateTimeBasedRecommendations = async () => {
    const hour = new Date().getHours();
    let timeParams = {};

    if (hour >= 6 && hour < 12) {
      // Manhã: energético e positivo
      timeParams = { target_valence: 0.7, target_energy: 0.6, target_danceability: 0.6 };
    } else if (hour >= 12 && hour < 18) {
      // Tarde: equilibrado
      timeParams = { target_valence: 0.6, target_energy: 0.5, target_acousticness: 0.4 };
    } else if (hour >= 18 && hour < 22) {
      // Noite: mais relaxante
      timeParams = { target_valence: 0.5, target_energy: 0.4, target_acousticness: 0.6 };
    } else {
      // Madrugada: calmo e introspectivo
      timeParams = { target_valence: 0.3, target_energy: 0.2, target_acousticness: 0.8 };
    }

    try {
      setFallbackMessage('');
      const response = await spotifyAPI.getRecommendations({
        seed_genres: 'pop', // Usar apenas um gênero seguro
        limit: 20,
        ...timeParams
      });
      if (response?.data?.fallback) setFallbackMessage('Resultados limitados (modo fallback)');
      setTimeBasedRecs(response.data.tracks);
    } catch (error) {
      console.error('Error getting time-based recommendations:', error);
      // Fallback simples
      try {
        setFallbackMessage('');
        const fallback = await spotifyAPI.getRecommendations({
          seed_genres: 'pop',
          limit: 20
        });
        if (fallback?.data?.fallback) setFallbackMessage('Resultados limitados (modo fallback)');
        setTimeBasedRecs(fallback.data.tracks);
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError);
      }
    }
  };

  const findEmergingArtists = async () => {
    try {
  setFallbackMessage('');
      // Buscar recomendações com artistas de baixa popularidade
      const response = await spotifyAPI.getRecommendations({
        seed_genres: 'indie', // Usar apenas um gênero válido
        limit: 20,
        max_popularity: 30, // Artistas menos conhecidos
        target_energy: 0.4
      });

  if (response?.data?.fallback) setFallbackMessage('Resultados limitados ao buscar artistas emergentes.');

  const tracks = response.data.tracks.filter(track => 
        track.artists.some(artist => !artist.popularity || artist.popularity < 40)
      );

      setEmergingArtists(tracks);
    } catch (error) {
      console.error('Error finding emerging artists:', error);
    }
  };

  const exploreGenreMix = async (genreMix) => {
    try {
      setLoading(true);
  setSelectedGenreMix([genreMix]);
  setFallbackMessage('');

      // Usar apenas o primeiro gênero para garantir que seja válido
      const genre = genreMix.genres[0];

  const response = await spotifyAPI.getRecommendations({
        seed_genres: genre,
        limit: 25,
        target_valence: 0.5,
        target_energy: 0.6
      });

  if (response?.data?.fallback) setFallbackMessage('Resultados limitados para esse mix de gêneros.');
  setSimilarTracks(response.data.tracks);
    } catch (error) {
      console.error('Error exploring genre mix:', error);
      // Fallback com pop
      try {
        setFallbackMessage('');
        const fallback = await spotifyAPI.getRecommendations({
          seed_genres: 'pop',
          limit: 25
        });
        setSimilarTracks(fallback.data.tracks);
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const exploreWorldMusic = async (region) => {
    try {
      setLoading(true);
  setFallbackMessage('');

      // Usar apenas o primeiro gênero da região
      const genre = region.genres[0];

      const response = await spotifyAPI.getRecommendations({
        seed_genres: genre,
        limit: 20,
        target_valence: 0.6
      });

  if (response?.data?.fallback) setFallbackMessage('Resultados limitados ao explorar música mundial.');
  setWorldMusic(response.data.tracks);
    } catch (error) {
      console.error('Error exploring world music:', error);
      // Fallback com pop
      try {
        setFallbackMessage('');
        const fallback = await spotifyAPI.getRecommendations({
          seed_genres: 'pop',
          limit: 20
        });
        setWorldMusic(fallback.data.tracks);
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = async (track, trackList = [], index = 0) => {
    try {
      await playTrack(track, trackList, index);
    } catch (error) {
      console.error('Erro ao reproduzir música:', error);
      alert('Erro ao reproduzir música. Verifique se você tem o Spotify aberto e um dispositivo ativo.');
    }
  };

  const handlePlayPlaylist = async (playlist) => {
    try {
      if (!playlist?.tracks || playlist.tracks.length === 0) {
        alert('Playlist vazia');
        return;
      }
      await playTrack(playlist.tracks[0], playlist.tracks, 0);
    } catch (error) {
      console.error('Erro ao reproduzir playlist:', error);
      alert('Erro ao reproduzir playlist. Verifique se você tem o Spotify aberto e um dispositivo ativo.');
    }
  };

  const savePlaylistToSpotify = async (playlist) => {
    try {
      const trackUris = playlist.tracks.map(track => track.uri);
      
      const newPlaylist = await spotifyAPI.createPlaylist({
        name: playlist.name,
        description: playlist.description,
        public: false
      });

      await spotifyAPI.addTracksToPlaylist(newPlaylist.data.id, trackUris);
      
      alert('Playlist salva no seu Spotify com sucesso!');
    } catch (error) {
      console.error('Error saving playlist:', error);
      alert('Erro ao salvar playlist');
    }
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
  };

  if (loading && !generatedPlaylist && !similarTracks.length) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent flex items-center">
                <Compass className="w-10 h-10 mr-4 text-purple-400" />
                Descobertas Musicais
              </h1>
              <p className="text-gray-300 text-lg mt-3">
                Explore novos horizontes musicais personalizados para você
              </p>
              {fallbackMessage && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-400/20 text-yellow-300 rounded">
                  {fallbackMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navegação por abas */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-1 p-1 bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg">
            {[
              { id: 'mood-generator', label: 'Gerador por Clima', icon: Heart },
              { id: 'time-based', label: 'Por Horário', icon: Clock },
              { id: 'genre-mixer', label: 'Mix de Gêneros', icon: Shuffle },
              { id: 'world-explorer', label: 'Explorador Mundial', icon: Globe },
              { id: 'emerging', label: 'Artistas Emergentes', icon: TrendingUp }
            ].map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center space-x-3 px-4 py-2.5 rounded-md font-medium transition-all duration-300 ease-out overflow-hidden ${
                    isActive ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <div className="absolute bottom-0 left-0 h-0.5 bg-purple-400 rounded-full w-full"></div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-md transition-all duration-300 ${
                      isActive ? 'bg-purple-400/20 text-purple-400' : 'bg-gray-600/30 text-gray-500 group-hover:bg-gray-500/30 group-hover:text-gray-300'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="space-y-8">
          {/* Mensagem de Fallback Global */}
          {fallbackMessage && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">Modo Adaptativo:</span>
                <span>{fallbackMessage}</span>
              </div>
            </div>
          )}

          {/* Gerador por Clima/Mood */}
          {activeTab === 'mood-generator' && (
            <div className="space-y-8">
              <Card>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Heart className="w-6 h-6 mr-3 text-purple-400" />
                  Gerador de Playlist por Clima
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {moods.map((mood) => {
                    const Icon = mood.icon;
                    return (
                      <button
                        key={mood.id}
                        onClick={() => generatePlaylistByMood(mood)}
                        className={`p-6 rounded-xl bg-gradient-to-br ${mood.color} text-white hover:scale-105 transition-transform duration-200 ${
                          selectedMood?.id === mood.id ? 'ring-2 ring-white' : ''
                        }`}
                      >
                        <Icon className="w-8 h-8 mx-auto mb-3" />
                        <h3 className="font-semibold">{mood.name}</h3>
                      </button>
                    );
                  })}
                </div>

                {selectedMood && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Escolha uma atividade (opcional):</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {activities.map((activity) => {
                        const Icon = activity.icon;
                        return (
                          <button
                            key={activity.id}
                            onClick={() => generatePlaylistByMood(selectedMood, activity)}
                            className={`p-4 rounded-lg bg-black/20 hover:bg-black/30 transition-colors flex items-center space-x-3 ${
                              selectedActivity?.id === activity.id ? 'ring-1 ring-purple-400' : ''
                            }`}
                          >
                            <Icon className="w-5 h-5 text-purple-400" />
                            <div className="text-left">
                              <p className="font-medium">{activity.name}</p>
                              <p className="text-sm text-gray-400">{activity.duration} min</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>

              {/* Playlist Gerada */}
              {generatedPlaylist && (
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold">{generatedPlaylist.name}</h3>
                      <p className="text-gray-400">{generatedPlaylist.tracks.length} músicas • {formatDuration(generatedPlaylist.duration)}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handlePlayPlaylist(generatedPlaylist)}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        <span>Reproduzir</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          const shuffledTracks = [...generatedPlaylist.tracks].sort(() => Math.random() - 0.5);
                          handlePlayTrack(shuffledTracks[0], shuffledTracks, 0);
                        }}
                        className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Shuffle className="w-4 h-4" />
                        <span>Shuffle</span>
                      </button>
                      
                      <button
                        onClick={() => savePlaylistToSpotify(generatedPlaylist)}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Salvar</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <Share className="w-4 h-4" />
                        <span>Compartilhar</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {generatedPlaylist.tracks.map((track, index) => (
                      <div key={track.id} className="flex items-center space-x-4 p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                        <span className="text-gray-400 text-sm w-8">{index + 1}</span>
                        <img
                          src={track.album.images[0]?.url}
                          alt={track.album.name}
                          className="w-12 h-12 rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white truncate">{track.name}</h4>
                          <p className="text-gray-400 text-sm truncate">
                            {track.artists.map(artist => artist.name).join(', ')}
                          </p>
                        </div>
                        <button 
                          onClick={() => handlePlayTrack(track, generatedPlaylist.tracks, index)}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                          {currentTrack?.id === track.id && isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Recomendações por Horário */}
          {activeTab === 'time-based' && (
            <Card>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Clock className="w-6 h-6 mr-3 text-purple-400" />
                Recomendações para Este Horário
              </h2>
              
              <div className="mb-6">
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
                  <h3 className="font-semibold mb-2">
                    {new Date().getHours() >= 6 && new Date().getHours() < 12 && '🌅 Bom dia! Músicas energizantes para começar o dia'}
                    {new Date().getHours() >= 12 && new Date().getHours() < 18 && '☀️ Boa tarde! Trilha sonora equilibrada para sua tarde'}
                    {new Date().getHours() >= 18 && new Date().getHours() < 22 && '🌆 Boa noite! Músicas relaxantes para o final do dia'}
                    {(new Date().getHours() >= 22 || new Date().getHours() < 6) && '🌙 Boa madrugada! Sons calmos para a noite'}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Baseado na hora atual ({new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}), 
                    selecionamos músicas que combinam com este momento do dia.
                  </p>
                </div>
              </div>

              {timeBasedRecs.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">{timeBasedRecs.length} recomendações para agora</span>
                  <button
                    onClick={() => handlePlayTrack(timeBasedRecs[0], timeBasedRecs, 0)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>Reproduzir Playlist do Horário</span>
                  </button>
                </div>
              )}

              {timeBasedRecs.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Carregando recomendações para este horário...</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {timeBasedRecs.map((track, index) => (
                  <div key={track.id} className="flex items-center space-x-4 p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                    <img
                      src={track.album.images[0]?.url}
                      alt={track.album.name}
                      className="w-16 h-16 rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">{track.name}</h4>
                      <p className="text-gray-400 text-sm truncate">
                        {track.artists.map(artist => artist.name).join(', ')}
                      </p>
                      <p className="text-gray-500 text-xs">{track.album.name}</p>
                    </div>
                    <button 
                      onClick={() => handlePlayTrack(track, timeBasedRecs, index)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Mix de Gêneros */}
          {activeTab === 'genre-mixer' && (
            <div className="space-y-8">
              <Card>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Shuffle className="w-6 h-6 mr-3 text-purple-400" />
                  Combinações Únicas de Gêneros
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {genreMixes.map((mix) => {
                    const Icon = mix.icon;
                    return (
                      <button
                        key={mix.id}
                        onClick={() => exploreGenreMix(mix)}
                        className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30 hover:scale-105 transition-transform duration-200"
                      >
                        <Icon className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                        <h3 className="font-semibold text-center">{mix.name}</h3>
                        <p className="text-gray-400 text-sm text-center mt-1">
                          {mix.genres.join(' + ')}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Resultado da exploração */}
              {similarTracks.length > 0 && (
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">
                      Explorando: {selectedGenreMix[0]?.name}
                    </h3>
                    <button
                      onClick={() => handlePlayTrack(similarTracks[0], similarTracks, 0)}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      <span>Reproduzir Mix</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {similarTracks.map((track) => (
                      <div key={track.id} className="flex items-center space-x-4 p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                        <img
                          src={track.album.images[0]?.url}
                          alt={track.album.name}
                          className="w-16 h-16 rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white truncate">{track.name}</h4>
                          <p className="text-gray-400 text-sm truncate">
                            {track.artists.map(artist => artist.name).join(', ')}
                          </p>
                        </div>
                        <button 
                          onClick={() => handlePlayTrack(track, similarTracks, similarTracks.indexOf(track))}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                          {currentTrack?.id === track.id && isPlaying ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Explorador Mundial */}
          {activeTab === 'world-explorer' && (
            <div className="space-y-8">
              <Card>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Globe className="w-6 h-6 mr-3 text-purple-400" />
                  Música ao Redor do Mundo
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {regions.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => exploreWorldMusic(region)}
                      className="p-6 bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-xl border border-blue-500/30 hover:scale-105 transition-transform duration-200 text-center"
                    >
                      <div className="text-4xl mb-3">{region.flag}</div>
                      <h3 className="font-semibold">{region.name}</h3>
                      <p className="text-gray-400 text-sm mt-1">
                        {region.genres.join(', ')}
                      </p>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Música mundial encontrada */}
              {worldMusic.length > 0 && (
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Descobertas Musicais</h3>
                    <button
                      onClick={() => handlePlayTrack(worldMusic[0], worldMusic, 0)}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      <span>Reproduzir Todos</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {worldMusic.map((track) => (
                      <div key={track.id} className="flex items-center space-x-4 p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                        <img
                          src={track.album.images[0]?.url}
                          alt={track.album.name}
                          className="w-16 h-16 rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white truncate">{track.name}</h4>
                          <p className="text-gray-400 text-sm truncate">
                            {track.artists.map(artist => artist.name).join(', ')}
                          </p>
                        </div>
                        <button 
                          onClick={() => handlePlayTrack(track, worldMusic, worldMusic.indexOf(track))}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                          {currentTrack?.id === track.id && isPlaying ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Artistas Emergentes */}
          {activeTab === 'emerging' && (
            <Card>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-3 text-purple-400" />
                Artistas Emergentes
              </h2>
              
              <div className="mb-6">
                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4 border border-green-500/30">
                  <h3 className="font-semibold mb-2">🌟 Descubra Talentos Emergentes</h3>
                  <p className="text-gray-300 text-sm">
                    Artistas com menos de 40% de popularidade mas com grande potencial. 
                    Seja um dos primeiros a descobrir os próximos sucessos!
                  </p>
                </div>
              </div>

              {emergingArtists.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">{emergingArtists.length} artistas encontrados</span>
                  <button
                    onClick={() => handlePlayTrack(emergingArtists[0], emergingArtists, 0)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>Reproduzir Todos</span>
                  </button>
                </div>
              )}

              {emergingArtists.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-400">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Carregando artistas emergentes...</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emergingArtists.map((track) => (
                  <div key={track.id} className="flex items-center space-x-4 p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                    <img
                      src={track.album.images[0]?.url}
                      alt={track.album.name}
                      className="w-16 h-16 rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">{track.name}</h4>
                      <p className="text-gray-400 text-sm truncate">
                        {track.artists.map(artist => artist.name).join(', ')}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                          Emergente
                        </span>
                        <span className="text-gray-500 text-xs">
                          Pop: {track.popularity || 'Baixa'}%
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handlePlayTrack(track, emergingArtists, emergingArtists.indexOf(track))}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discoveries;
