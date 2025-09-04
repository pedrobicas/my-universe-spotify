import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Mail, MapPin, User, Music, Calendar, Clock, Heart, Users, 
  History, Settings, Shield, Globe, Trophy, Headphones,
  Download, Share, Edit3, Camera, Star, Award, Target,
  Bookmark, Archive, RefreshCw, Filter, Search, ChevronDown,
  Volume2, Mic, Radio, Disc3, Timer, Zap, Info
} from 'lucide-react';
import api from '../services/api';
import Card from '../components/Card';
import Loading from '../components/Loading';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('listening-history');
  const [recentTracks, setRecentTracks] = useState([]);
  const [listeningHistory, setListeningHistory] = useState([]);
  const [userPreferences, setUserPreferences] = useState({});
  const [accountInsights, setAccountInsights] = useState({});
  const [socialData, setSocialData] = useState({});
  const [loading, setLoading] = useState(true);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('week');

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user, dateRange]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Fetch data individually to handle permission errors gracefully
      let recentData = [];
      let savedTracksData = { total: 0 };
      let followedArtistsData = { artists: { total: 0 } };

      try {
        const recent = await api.get('/api/recently-played?limit=50');
        recentData = recent.data.items || [];
      } catch (error) {
        console.warn('Could not fetch recent tracks:', error.message);
      }

      try {
        const savedTracks = await api.get('/api/me/saved-tracks?limit=50');
        savedTracksData = savedTracks.data;
      } catch (error) {
        console.warn('Could not fetch saved tracks:', error.message);
      }

      try {
        const followed = await api.get('/api/me/followed-artists?limit=50');
        followedArtistsData = followed.data;
      } catch (error) {
        console.warn('Could not fetch followed artists (permission issue):', error.message);
        // Set to empty data instead of failing
        followedArtistsData = { artists: { total: 0 } };
      }

      setRecentTracks(recentData);
      setListeningHistory(processListeningHistory(recentData));
      setAccountInsights(calculateAccountInsights(user, savedTracksData, followedArtistsData));
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processListeningHistory = (tracks) => {
    const history = {};
    const dailyStats = {};
    
    tracks.forEach(item => {
      const date = new Date(item.played_at).toDateString();
      const hour = new Date(item.played_at).getHours();
      
      if (!history[date]) {
        history[date] = [];
        dailyStats[date] = { total: 0, unique: new Set(), hours: {} };
      }
      
      history[date].push({
        ...item,
        time: new Date(item.played_at).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      });
      
      dailyStats[date].total++;
      dailyStats[date].unique.add(item.track.id);
      dailyStats[date].hours[hour] = (dailyStats[date].hours[hour] || 0) + 1;
    });

    return Object.entries(history).map(([date, tracks]) => ({
      date,
      tracks,
      stats: {
        ...dailyStats[date],
        unique: dailyStats[date].unique.size,
        mostActiveHour: Object.entries(dailyStats[date].hours || {})
          .sort(([,a], [,b]) => b - a)[0]?.[0] || null
      }
    })).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const calculateAccountInsights = (user, savedTracks, followedArtists) => {
    const joinDate = new Date(2020, 0, 1); // Placeholder - Spotify doesn't provide join date
    const daysSinceJoin = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24));
    
    const totalSavedTracks = savedTracks?.total || 0;
    const totalFollowedArtists = followedArtists?.artists?.total || 0;
    
    return {
      accountAge: daysSinceJoin,
      totalSavedTracks,
      totalFollowedArtists,
      subscriptionType: user?.product || 'free',
      averageTracksPerDay: Math.round(totalSavedTracks / Math.max(daysSinceJoin, 1)),
      country: user?.country || 'BR',
      explicit_content: user?.explicit_content || { filter_enabled: false }
    };
  };

  const exportProfileData = () => {
    const exportData = {
      profile: {
        name: user.display_name,
        email: user.email,
        country: user.country,
        subscription: user.product,
        followers: user.followers?.total || 0
      },
      listeningHistory: listeningHistory.slice(0, 10),
      accountInsights,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spotify-profile-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const shareProfile = () => {
    const followedText = accountInsights.totalFollowedArtists > 0 
      ? ` e sigo ${accountInsights.totalFollowedArtists} artistas` 
      : '';
    
    if (navigator.share) {
      navigator.share({
        title: `Perfil do Spotify de ${user.display_name}`,
        text: `Confira meu perfil no Spotify! Tenho ${accountInsights.totalSavedTracks} músicas curtidas${followedText}.`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const filteredHistory = listeningHistory.filter(day => {
    if (dateRange === 'today') {
      return day.date === new Date().toDateString();
    } else if (dateRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(day.date) >= weekAgo;
    } else if (dateRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return new Date(day.date) >= monthAgo;
    }
    return true;
  });

  const ListeningHistoryDay = ({ dayData }) => {
    const [expanded, setExpanded] = useState(false);
    
    return (
      <Card hover={false}>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-400/20 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">
                {new Date(dayData.date).toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>{dayData.stats.total} reproduções</span>
                <span>{dayData.stats.unique} músicas únicas</span>
                {dayData.stats.mostActiveHour && (
                  <span>Pico: {dayData.stats.mostActiveHour}h</span>
                )}
              </div>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
        
        {expanded && (
          <div className="mt-6 space-y-3">
            {dayData.tracks.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                <img 
                  src={item.track.album.images[0]?.url || '/default-track.jpg'} 
                  alt={item.track.name}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">{item.track.name}</h4>
                  <p className="text-gray-400 text-sm truncate">
                    {item.track.artists.map(artist => artist.name).join(', ')}
                  </p>
                </div>
                <div className="text-gray-400 text-sm">
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  if (!user) {
    return <Loading />
  }

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Estilos CSS personalizados para animações */}
      <style jsx>{`
        .tab-button {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Header com informações do usuário */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <img
                  src={user?.images?.[0]?.url || '/default-avatar.jpg'}
                  alt="Avatar"
                  className="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-green-500/30 shadow-lg object-cover"
                  onError={(e) => {
                    e.target.src = '/default-avatar.jpg'
                  }}
                />
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                  {user?.display_name || 'Usuário'} 👤
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {user?.product?.toUpperCase() || 'FREE'}
                  </span>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    {user?.country || 'BR'}
                  </span>
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {user?.followers?.total || 0} seguidores
                  </span>
                </div>
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={exportProfileData}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 bg-green-600 text-white shadow-lg shadow-green-600/25 hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
              
              <button
                onClick={shareProfile}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
              >
                <Share className="w-4 h-4" />
                <span>Compartilhar</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200  bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white">
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Cards de Insights da Conta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Dias no Spotify</p>
                <p className="text-2xl font-bold text-white">{accountInsights.accountAge || '?'}</p>
                <p className="text-gray-400 text-xs mt-1">Desde que se cadastrou</p>
              </div>
              <Timer className="w-8 h-8 text-green-400" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Músicas Curtidas</p>
                <p className="text-2xl font-bold text-white">{accountInsights.totalSavedTracks || 0}</p>
                <p className="text-gray-400 text-xs mt-1">Na sua biblioteca</p>
              </div>
              <Heart className="w-8 h-8 text-green-400" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Artistas Seguidos</p>
                <p className="text-2xl font-bold text-white">{accountInsights.totalFollowedArtists || 'N/A'}</p>
                <p className="text-gray-400 text-xs mt-1">{accountInsights.totalFollowedArtists > 0 ? "Que você acompanha" : "Sem permissão"}</p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Média Diária</p>
                <p className="text-2xl font-bold text-white">{accountInsights.averageTracksPerDay || 0}</p>
                <p className="text-gray-400 text-xs mt-1">Músicas curtidas/dia</p>
              </div>
              <Target className="w-8 h-8 text-green-400" />
            </div>
          </Card>
        </div>

        {/* Aviso sobre Permissões */}
        {accountInsights.totalFollowedArtists === 0 && (
          <Card className="bg-yellow-900/20 border border-yellow-600/30 mb-8">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-yellow-500" />
              <div>
                <h3 className="text-yellow-400 font-medium">Permissões do Spotify</h3>
                <p className="text-yellow-100 text-sm">
                  Alguns dados podem não estar disponíveis devido às configurações de privacidade ou limitações da API do Spotify.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Navegação por abas */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-1 p-1 bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg">
            {[
              { id: 'listening-history', label: 'Histórico de Escuta', icon: History },
              { id: 'account-info', label: 'Informações da Conta', icon: User },
              { id: 'privacy-settings', label: 'Privacidade', icon: Shield },
              { id: 'achievements', label: 'Conquistas', icon: Trophy }
            ].map((tab, index) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center space-x-3 px-4 py-2.5 rounded-md font-medium transition-all duration-300 ease-out tab-button overflow-hidden ${
                    isActive ? 'active' : ''
                  } ${
                    isActive
                      ? 'text-green-400'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Linha de progresso para botão ativo */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 h-0.5 bg-green-400 rounded-full animate-progress"></div>
                  )}
                  
                  {/* Conteúdo do botão */}
                  <div className="flex items-center space-x-3">
                    <div className={`icon-container p-1.5 rounded-md transition-all duration-300 ${
                      isActive 
                        ? 'bg-green-400/20 text-green-400' 
                        : 'bg-gray-600/30 text-gray-500 group-hover:bg-gray-500/30 group-hover:text-gray-300'
                    }`}>
                      <Icon className={`w-4 h-4 transition-all duration-300 ${
                        isActive ? 'text-green-400' : 'text-gray-500 group-hover:text-gray-300'
                      }`} />
                    </div>
                    <span className={`text-sm font-medium transition-all duration-300 ${
                      isActive ? 'text-green-400' : 'text-gray-500 group-hover:text-gray-300'
                    }`}>
                      {tab.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="space-y-8">
          {activeTab === 'listening-history' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-2xl font-bold mb-4 md:mb-0 flex items-center">
                  <History className="w-6 h-6 mr-3 text-green-400" />
                  Histórico Detalhado de Escuta
                </h2>
                
                <div className="flex flex-wrap gap-3">
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="bg-black/20 text-white px-4 py-2 rounded-lg border border-white/10 focus:border-green-400 focus:outline-none"
                  >
                    <option value="today">Hoje</option>
                    <option value="week">Última Semana</option>
                    <option value="month">Último Mês</option>
                    <option value="all">Todos</option>
                  </select>
                  
                  <button
                    onClick={fetchProfileData}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200  bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Atualizar</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((dayData, index) => (
                    <ListeningHistoryDay key={index} dayData={dayData} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Nenhum histórico encontrado</h3>
                    <p className="text-gray-400">Não há reproduções para o período selecionado.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'account-info' && (
            <Card>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <User className="w-6 h-6 mr-3 text-green-400" />
                Informações da Conta
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Detalhes Pessoais</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nome de exibição:</span>
                      <span className="text-white font-medium">{user?.display_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white font-medium">{user?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">País:</span>
                      <span className="text-white font-medium">{user?.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">ID do usuário:</span>
                      <span className="text-white font-medium font-mono text-sm">{user?.id}</span>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Estatísticas da Biblioteca</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Músicas curtidas:</span>
                      <span className="text-white font-medium">{accountInsights.totalSavedTracks || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Artistas seguidos:</span>
                      <span className="text-white font-medium">
                        {accountInsights.totalFollowedArtists > 0 ? 
                          accountInsights.totalFollowedArtists : 
                          'Sem permissão'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tempo estimado no Spotify:</span>
                      <span className="text-white font-medium">{accountInsights.accountAge || '?'} dias</span>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          )}

          {activeTab === 'privacy-settings' && (
            <Card>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-3 text-green-400" />
                Configurações de Privacidade
              </h2>
              
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Visibilidade do Perfil</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Perfil público</p>
                        <p className="text-gray-400 text-sm">Permite que outros vejam seu perfil</p>
                      </div>
                      <div className="bg-green-600 w-12 h-6 rounded-full flex items-center justify-end px-1">
                        <div className="bg-white w-4 h-4 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Dados e Privacidade</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 bg-black/20 rounded-lg hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Baixar meus dados</span>
                        <Download className="w-5 h-5 text-gray-400" />
                      </div>
                    </button>
                  </div>
                </Card>
              </div>
            </Card>
          )}

          {activeTab === 'achievements' && (
            <Card>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Trophy className="w-6 h-6 mr-3 text-green-400" />
                Suas Conquistas Musicais
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-lg text-black">
                  <div className="flex items-center justify-between mb-4">
                    <Trophy className="w-8 h-8" />
                    <Star className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Colecionador</h3>
                  <p className="text-sm opacity-90">
                    {accountInsights.totalSavedTracks >= 100 ? 'Conquistado!' : 'Em progresso'} 
                    {accountInsights.totalSavedTracks >= 100 ? 
                      ` Você tem ${accountInsights.totalSavedTracks} músicas curtidas!` :
                      ` Curta ${100 - (accountInsights.totalSavedTracks || 0)} músicas para desbloquear`
                    }
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8" />
                    <Star className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Descobridor</h3>
                  <p className="text-sm opacity-90">
                    {accountInsights.totalFollowedArtists === 0 ? 'Sem dados disponíveis' :
                      accountInsights.totalFollowedArtists >= 50 ? 'Conquistado!' : 'Em progresso'
                    }
                    {accountInsights.totalFollowedArtists === 0 ? 
                      ' - Permissões necessárias para acessar artistas seguidos' :
                      accountInsights.totalFollowedArtists >= 50 ? 
                      ` Você segue ${accountInsights.totalFollowedArtists} artistas!` :
                      ` Siga ${50 - (accountInsights.totalFollowedArtists || 0)} artistas para desbloquear`
                    }
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Headphones className="w-8 h-8" />
                    <Star className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Veterano</h3>
                  <p className="text-sm opacity-90">
                    {accountInsights.accountAge >= 365 ? 'Conquistado!' : 'Em progresso'}
                    {accountInsights.accountAge >= 365 ? 
                      ` ${Math.floor(accountInsights.accountAge / 365)} anos no Spotify!` :
                      ` ${365 - (accountInsights.accountAge || 0)} dias restantes`
                    }
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
