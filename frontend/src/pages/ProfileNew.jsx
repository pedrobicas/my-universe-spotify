import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Mail, MapPin, User, Music, Calendar, Clock, Heart, Users, 
  History, Settings, Shield, Globe, Trophy, Headphones,
  Download, Share, Edit3, Camera, Star, Award, Target,
  Bookmark, Archive, RefreshCw, Filter, Search, ChevronDown,
  Volume2, Mic, Radio, Disc3, Timer, Zap
} from 'lucide-react';
import api from '../services/api';

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
      const [recent, savedTracks, followed] = await Promise.all([
        api.get('/api/recently-played?limit=50'),
        api.get('/api/me/saved-tracks?limit=50'),
        api.get('/api/me/followed-artists?limit=50')
      ]);

      const recentData = recent.data.items || [];
      setRecentTracks(recentData);
      setListeningHistory(processListeningHistory(recentData));
      setAccountInsights(calculateAccountInsights(user, savedTracks.data, followed.data));
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
    
    return {
      accountAge: daysSinceJoin,
      totalSavedTracks: savedTracks.total || 0,
      totalFollowedArtists: followedArtists.artists?.total || 0,
      subscriptionType: user.product,
      averageTracksPerDay: Math.round((savedTracks.total || 0) / Math.max(daysSinceJoin, 1)),
      country: user.country,
      explicit_content: user.explicit_content
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
    if (navigator.share) {
      navigator.share({
        title: `Perfil do Spotify de ${user.display_name}`,
        text: `Confira meu perfil no Spotify! Tenho ${accountInsights.totalSavedTracks} músicas curtidas e sigo ${accountInsights.totalFollowedArtists} artistas.`,
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
      <div className="bg-spotify-dark rounded-lg p-6 hover:bg-gray-700 transition-colors">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-spotify-green/20 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-spotify-green" />
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
              <div className="flex items-center space-x-4 text-sm text-spotify-light">
                <span>{dayData.stats.total} reproduções</span>
                <span>{dayData.stats.unique} músicas únicas</span>
                {dayData.stats.mostActiveHour && (
                  <span>Pico: {dayData.stats.mostActiveHour}h</span>
                )}
              </div>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-spotify-light transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
        
        {expanded && (
          <div className="mt-6 space-y-3">
            {dayData.tracks.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-spotify-bg rounded-lg">
                <img 
                  src={item.track.album.images[0]?.url || '/default-track.jpg'} 
                  alt={item.track.name}
                  className="w-12 h-12 rounded-md"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">{item.track.name}</h4>
                  <p className="text-spotify-light text-sm truncate">
                    {item.track.artists.map(artist => artist.name).join(', ')}
                  </p>
                </div>
                <div className="text-spotify-light text-sm">
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const AccountInsightCard = ({ icon: Icon, title, value, subtitle, color = "text-spotify-green" }) => (
    <div className="bg-spotify-dark rounded-lg p-6 hover:bg-gray-700 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-spotify-light text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-spotify-light text-xs mt-1">{subtitle}</p>}
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="container mx-auto p-8 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-spotify-green mx-auto"></div>
          <p className="mt-4 text-spotify-light">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 text-white min-h-screen">
      {/* Header do Perfil */}
      <div className="bg-gradient-to-r from-spotify-green/20 to-spotify-dark rounded-xl p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <div className="relative group">
            <img 
              src={user.images?.[0]?.url || '/default-user.svg'} 
              alt={user.display_name}
              className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-spotify-green shadow-2xl"
            />
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="mt-6 md:mt-0 md:ml-8 text-center md:text-left flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl md:text-5xl font-bold">{user.display_name}</h1>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <Edit3 className="w-5 h-5 text-spotify-light" />
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-spotify-green text-black px-3 py-1 rounded-full text-sm font-semibold">
                {user.product.toUpperCase()}
              </span>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                <Globe className="w-4 h-4 mr-1" />
                {user.country}
              </span>
              <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {user.followers?.total || 0} seguidores
              </span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={exportProfileData}
                className="flex items-center space-x-2 bg-spotify-green text-black px-4 py-2 rounded-full font-semibold hover:bg-spotify-green/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Dados</span>
              </button>
              
              <button
                onClick={shareProfile}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors"
              >
                <Share className="w-4 h-4" />
                <span>Compartilhar</span>
              </button>
              
              <button className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded-full font-semibold hover:bg-gray-600 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Insights da Conta */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <AccountInsightCard 
          icon={Timer} 
          title="Dias no Spotify" 
          value={accountInsights.accountAge || '?'} 
          subtitle="Desde que se cadastrou"
        />
        <AccountInsightCard 
          icon={Heart} 
          title="Músicas Curtidas" 
          value={accountInsights.totalSavedTracks || 0} 
          subtitle="Na sua biblioteca"
        />
        <AccountInsightCard 
          icon={Users} 
          title="Artistas Seguidos" 
          value={accountInsights.totalFollowedArtists || 0} 
          subtitle="Que você acompanha"
        />
        <AccountInsightCard 
          icon={Target} 
          title="Média Diária" 
          value={accountInsights.averageTracksPerDay || 0} 
          subtitle="Músicas curtidas/dia"
        />
      </div>

      {/* Navegação por Tabs */}
      <div className="bg-spotify-dark rounded-lg p-2 mb-8">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'listening-history', label: 'Histórico de Escuta', icon: History },
            { id: 'account-info', label: 'Informações da Conta', icon: User },
            { id: 'privacy-settings', label: 'Privacidade', icon: Shield },
            { id: 'achievements', label: 'Conquistas', icon: Trophy }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'bg-spotify-green text-black font-semibold' 
                  : 'text-spotify-light hover:text-white hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="bg-spotify-bg rounded-lg p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto"></div>
            <p className="mt-4 text-spotify-light">Carregando dados...</p>
          </div>
        ) : (
          <>
            {activeTab === 'listening-history' && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <h2 className="text-2xl font-bold mb-4 md:mb-0 flex items-center">
                    <History className="w-6 h-6 mr-3 text-spotify-green" />
                    Histórico Detalhado de Escuta
                  </h2>
                  
                  <div className="flex flex-wrap gap-3">
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="bg-spotify-dark text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-spotify-green focus:outline-none"
                    >
                      <option value="today">Hoje</option>
                      <option value="week">Última Semana</option>
                      <option value="month">Último Mês</option>
                      <option value="all">Todos</option>
                    </select>
                    
                    <button
                      onClick={fetchProfileData}
                      className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
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
                      <Music className="w-16 h-16 text-spotify-light mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Nenhum histórico encontrado</h3>
                      <p className="text-spotify-light">Não há reproduções para o período selecionado.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'account-info' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <User className="w-6 h-6 mr-3 text-spotify-green" />
                  Informações da Conta
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-spotify-dark p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">Detalhes Pessoais</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-spotify-light">Nome de exibição:</span>
                          <span className="text-white font-medium">{user.display_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-spotify-light">Email:</span>
                          <span className="text-white font-medium">{user.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-spotify-light">País:</span>
                          <span className="text-white font-medium">{user.country}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-spotify-light">ID do usuário:</span>
                          <span className="text-white font-medium font-mono text-sm">{user.id}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-spotify-dark p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">Configurações de Conteúdo</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-spotify-light">Conteúdo explícito:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            user.explicit_content?.filter_enabled ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {user.explicit_content?.filter_enabled ? 'Filtrado' : 'Permitido'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-spotify-dark p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">Assinatura</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-spotify-light">Tipo de conta:</span>
                          <span className="text-white font-medium capitalize">{user.product}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-spotify-light">Seguidores:</span>
                          <span className="text-white font-medium">{user.followers?.total || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-spotify-dark p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">Estatísticas da Biblioteca</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-spotify-light">Músicas curtidas:</span>
                          <span className="text-white font-medium">{accountInsights.totalSavedTracks || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-spotify-light">Artistas seguidos:</span>
                          <span className="text-white font-medium">{accountInsights.totalFollowedArtists || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-spotify-light">Tempo estimado no Spotify:</span>
                          <span className="text-white font-medium">{accountInsights.accountAge || '?'} dias</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy-settings' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-spotify-green" />
                  Configurações de Privacidade
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-spotify-dark p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Visibilidade do Perfil</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Perfil público</p>
                          <p className="text-spotify-light text-sm">Permite que outros vejam seu perfil</p>
                        </div>
                        <div className="bg-green-600 w-12 h-6 rounded-full flex items-center justify-end px-1">
                          <div className="bg-white w-4 h-4 rounded-full"></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Mostrar atividade recente</p>
                          <p className="text-spotify-light text-sm">Exibe suas músicas tocadas recentemente</p>
                        </div>
                        <div className="bg-gray-600 w-12 h-6 rounded-full flex items-center justify-start px-1">
                          <div className="bg-white w-4 h-4 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-spotify-dark p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Dados e Privacidade</h3>
                    <div className="space-y-3">
                      <button className="w-full text-left p-3 bg-spotify-bg rounded-lg hover:bg-gray-700 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-white">Baixar meus dados</span>
                          <Download className="w-5 h-5 text-spotify-light" />
                        </div>
                      </button>
                      
                      <button className="w-full text-left p-3 bg-spotify-bg rounded-lg hover:bg-gray-700 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-white">Gerenciar cookies</span>
                          <Settings className="w-5 h-5 text-spotify-light" />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Trophy className="w-6 h-6 mr-3 text-spotify-green" />
                  Suas Conquistas Musicais
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Conquistas baseadas nos dados do usuário */}
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
                      {accountInsights.totalFollowedArtists >= 50 ? 'Conquistado!' : 'Em progresso'}
                      {accountInsights.totalFollowedArtists >= 50 ? 
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
                  
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between mb-4">
                      <Music className="w-8 h-8" />
                      <Star className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Melômano</h3>
                    <p className="text-sm opacity-90">
                      Baseado no seu histórico de escuta diário
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between mb-4">
                      <Heart className="w-8 h-8" />
                      <Star className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Fã Dedicado</h3>
                    <p className="text-sm opacity-90">
                      Ouça o mesmo artista por vários dias seguidos
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between mb-4">
                      <Clock className="w-8 h-8" />
                      <Star className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Madrugador</h3>
                    <p className="text-sm opacity-90">
                      Ouça música antes das 6h da manhã
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
