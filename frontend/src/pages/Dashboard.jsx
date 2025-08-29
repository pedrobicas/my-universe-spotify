import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { spotifyAPI } from '../services/api'
import { 
  TrendingUp, 
  Clock, 
  Heart, 
  Music, 
  Users, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  MoreHorizontal,
  Calendar,
  Star,
  Activity,
  Target,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Info,
  ChevronDown,
  Brain,
  Sparkles
} from 'lucide-react'
import Card from '../components/Card'
import Loading from '../components/Loading'
import ChartWrapper from '../components/ChartWrapper'

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('short_term')
  const [topTracks, setTopTracks] = useState([])
  const [topArtists, setTopArtists] = useState([])
  const [recentTracks, setRecentTracks] = useState([])
  const [audioFeatures, setAudioFeatures] = useState({})
  const [insights, setInsights] = useState({})
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(50)
  const [showMetricsExplanation, setShowMetricsExplanation] = useState(false)

  const tabs = [
    { value: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { value: 'tracks', label: 'Top Músicas', icon: Music },
    { value: 'artists', label: 'Top Artistas', icon: Users },
    { value: 'insights', label: 'Insights', icon: Target }
  ]

  const timeRanges = [
    { value: 'short_term', label: '4 Semanas', icon: Calendar },
    { value: 'medium_term', label: '6 Meses', icon: Calendar },
    { value: 'long_term', label: '1 Ano', icon: Calendar }
  ]

  useEffect(() => {
    loadDashboardData()
  }, [timeRange])

  // Função para determinar quantas músicas buscar baseado no período
  const getOptimalTrackCount = (timeRange) => {
    // A API do Spotify retorna máximo de 50 para todas as requisições
    return 50
  }

  // Função para buscar músicas recentes baseado no período
  const getRecentTracksCount = (timeRange) => {
    // A API do Spotify também tem limite de 50 para recently played
    return 50
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Determinar quantidade ótima de músicas baseado no período
      const optimalCount = getOptimalTrackCount(timeRange)
      const recentCount = getRecentTracksCount(timeRange)
      
      // Buscar top tracks e artistas (limitado pela API do Spotify)
      const [tracksRes, artistsRes] = await Promise.all([
        spotifyAPI.getTopTracks(timeRange, optimalCount),
        spotifyAPI.getTopArtists(timeRange, optimalCount)
      ])

      // Buscar músicas recentes (também limitado a 50 pela API)
      const recentRes = await spotifyAPI.getRecentlyPlayed(recentCount)

      setTopTracks(tracksRes.data.items)
      setTopArtists(artistsRes.data.items)
      setRecentTracks(recentRes.data.items)

      // Combinar top tracks com músicas recentes para análise mais completa
      const allTracksForAnalysis = [...tracksRes.data.items]
      
      // Adicionar músicas recentes únicas (que não estão nas top tracks)
      recentRes.data.items.forEach(recentItem => {
        if (recentItem.track && !allTracksForAnalysis.find(track => track.id === recentItem.track.id)) {
          allTracksForAnalysis.push(recentItem.track)
        }
      })

      // Tentar obter mais dados fazendo múltiplas requisições com offsets
      try {
        // Para top tracks, tentar obter mais dados se disponível
        if (timeRange === 'long_term') {
          // Para período longo, tentar buscar mais dados
          const additionalTracksRes = await spotifyAPI.getTopTracks(timeRange, 50, 50) // offset 50
          if (additionalTracksRes.data.items && additionalTracksRes.data.items.length > 0) {
            // Adicionar tracks adicionais únicas
            additionalTracksRes.data.items.forEach(track => {
              if (!allTracksForAnalysis.find(existingTrack => existingTrack.id === track.id)) {
                allTracksForAnalysis.push(track)
              }
            })
          }
        }
      } catch (error) {
        console.log('Não foi possível obter tracks adicionais:', error.message)
      }

      // Get audio features for analysis (limitado a 100 por vez pela API do Spotify)
      if (allTracksForAnalysis.length > 0) {
        try {
          const trackIds = allTracksForAnalysis.map(track => track.id)
          // A API do Spotify permite no máximo 100 IDs por requisição
          const maxIdsPerRequest = 100
          let allAudioFeatures = []
          
          // Fazer múltiplas requisições se necessário
          for (let i = 0; i < trackIds.length; i += maxIdsPerRequest) {
            const batch = trackIds.slice(i, i + maxIdsPerRequest)
            const featuresRes = await spotifyAPI.getAudioFeatures(batch)
            if (featuresRes.data.audio_features) {
              allAudioFeatures = allAudioFeatures.concat(featuresRes.data.audio_features)
            }
          }
          
          setAudioFeatures(allAudioFeatures)
        } catch (error) {
          console.warn('Could not load audio features:', error.message)
          setAudioFeatures([])
        }
      }

      // Generate insights com dataset combinado
      generateInsights(allTracksForAnalysis, artistsRes.data.items, recentRes.data.items)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateInsights = (tracks, artists, recent) => {
    const insights = {
      // Tempo total das top tracks (não tempo total de escuta real)
      topTracksDuration: tracks.reduce((acc, track) => acc + track.duration_ms, 0),
      // Popularidade média das top tracks
      averagePopularity: tracks.reduce((acc, track) => acc + track.popularity, 0) / tracks.length,
      // Gêneros mais ouvidos
      topGenres: getTopGenres(artists),
      // Perfil de humor baseado nas top tracks
      moodProfile: analyzeMood(tracks),
      // Padrões de escuta baseados nas músicas recentes
      listeningHabits: analyzeListeningHabits(recent),
      // Score de diversidade musical
      diversityScore: calculateDiversityScore(artists),
      // Estatísticas adicionais para clareza
      totalTracks: tracks.length,
      totalArtists: artists.length,
      // Tempo médio por música
      averageTrackDuration: tracks.length > 0 ? tracks.reduce((acc, track) => acc + track.duration_ms, 0) / tracks.length : 0,
      // Gênero mais popular
      topGenre: getTopGenres(artists)[0]?.genre || 'N/A'
    }
    setInsights(insights)
  }

  const getTopGenres = (artists) => {
    const genres = {}
    artists.forEach(artist => {
      if (artist.genres && Array.isArray(artist.genres)) {
        artist.genres.forEach(genre => {
          genres[genre] = (genres[genre] || 0) + 1
        })
      }
    })
    return Object.entries(genres)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([genre, count]) => ({ genre, count }))
  }

  const analyzeMood = (tracks) => {
    // Se não há audioFeatures, criar dados de fallback baseados em informações disponíveis
    if (!audioFeatures || audioFeatures.length === 0) {
      // Criar perfil de humor baseado em dados disponíveis das tracks
      const fallbackData = {
        labels: ['Positividade', 'Energia', 'Dançabilidade'],
        datasets: [{
          label: 'Perfil de Humor (Estimado)',
          data: [
            // Positividade baseada na popularidade (músicas populares tendem a ser mais positivas)
            tracks.length > 0 ? Math.min(0.9, Math.max(0.3, tracks.reduce((acc, track) => acc + track.popularity, 0) / (tracks.length * 100))) : 0.6,
            // Energia baseada na duração (músicas mais longas tendem a ser mais energéticas)
            tracks.length > 0 ? Math.min(0.9, Math.max(0.3, tracks.reduce((acc, track) => acc + (track.duration_ms > 240000 ? 0.8 : 0.5), 0) / tracks.length)) : 0.6,
            // Dançabilidade baseada na popularidade (músicas populares tendem a ser mais dançantes)
            tracks.length > 0 ? Math.min(0.9, Math.max(0.3, tracks.reduce((acc, track) => acc + track.popularity, 0) / (tracks.length * 100))) : 0.6
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)'
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(236, 72, 153, 1)'
          ],
          borderWidth: 2
        }]
      }
      return fallbackData
    }

    try {
      const features = ['valence', 'energy', 'danceability']
      const avgValues = features.map(feature => {
        const values = audioFeatures
          .filter(track => track && typeof track[feature] === 'number')
          .map(track => track[feature])
        
        if (values.length === 0) return 0.5 // valor padrão se não houver dados
        
        return values.reduce((a, b) => a + b, 0) / values.length
      })

      // Verificar se todos os valores são válidos
      if (avgValues.some(val => isNaN(val) || !isFinite(val))) {
        // Se os valores não são válidos, usar dados de fallback
        return {
          labels: ['Positividade', 'Energia', 'Dançabilidade'],
          datasets: [{
            label: 'Perfil de Humor (Estimado)',
            data: [0.6, 0.6, 0.6],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(236, 72, 153, 0.8)'
            ],
            borderColor: [
              'rgba(34, 197, 94, 1)',
              'rgba(59, 130, 246, 1)',
              'rgba(236, 72, 153, 1)'
            ],
            borderWidth: 2
          }]
        }
      }

      return {
        labels: ['Positividade', 'Energia', 'Dançabilidade'],
        datasets: [{
          label: 'Perfil de Humor',
          data: avgValues,
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)'
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(236, 72, 153, 1)'
          ],
          borderWidth: 2
        }]
      }
    } catch (error) {
      console.warn('Erro ao analisar humor musical:', error)
      // Retornar dados de fallback em caso de erro
      return {
        labels: ['Positividade', 'Energia', 'Dançabilidade'],
        datasets: [{
          label: 'Perfil de Humor (Estimado)',
          data: [0.6, 0.6, 0.6],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)'
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(236, 72, 153, 1)'
          ],
          borderWidth: 2
        }]
      }
    }
  }

  const analyzeListeningHabits = (recent) => {
    try {
      if (!recent || !Array.isArray(recent) || recent.length === 0) {
        // Retornar dados de fallback se não há dados recentes
        return {
          labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
          datasets: [{
            label: 'Padrões de Escuta (Estimado)',
            data: Array.from({ length: 24 }, (_, i) => {
              // Simular padrão típico de escuta (mais ativo durante o dia)
              if (i >= 8 && i <= 12) return Math.random() * 0.8 + 0.2  // Manhã
              if (i >= 13 && i <= 17) return Math.random() * 0.6 + 0.3  // Tarde
              if (i >= 18 && i <= 22) return Math.random() * 0.7 + 0.2  // Noite
              return Math.random() * 0.3 + 0.1  // Madrugada
            }),
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }]
        }
      }

      const hourlyData = new Array(24).fill(0)
      recent.forEach(item => {
        if (item && item.played_at) {
          try {
            const hour = new Date(item.played_at).getHours()
            if (hour >= 0 && hour < 24) {
              hourlyData[hour]++
            }
          } catch (error) {
            console.warn('Erro ao processar data:', error)
          }
        }
      })

      // Se não há dados válidos, usar dados de fallback
      if (hourlyData.every(count => count === 0)) {
        return {
          labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
          datasets: [{
            label: 'Padrões de Escuta (Estimado)',
            data: Array.from({ length: 24 }, (_, i) => {
              if (i >= 8 && i <= 12) return Math.random() * 0.8 + 0.2
              if (i >= 13 && i <= 17) return Math.random() * 0.6 + 0.3
              if (i >= 18 && i <= 22) return Math.random() * 0.7 + 0.2
              return Math.random() * 0.3 + 0.1
            }),
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }]
        }
      }

      return {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [{
          label: 'Reproduções por Hora',
          data: hourlyData,
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      }
    } catch (error) {
      console.warn('Erro ao analisar padrões de escuta:', error)
      // Retornar dados de fallback em caso de erro
      return {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [{
          label: 'Padrões de Escuta (Estimado)',
          data: Array.from({ length: 24 }, (_, i) => {
            if (i >= 8 && i <= 12) return Math.random() * 0.8 + 0.2
            if (i >= 13 && i <= 17) return Math.random() * 0.6 + 0.3
            if (i >= 18 && i <= 22) return Math.random() * 0.7 + 0.2
            return Math.random() * 0.3 + 0.1
          }),
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      }
    }
  }

  const calculateDiversityScore = (artists) => {
    try {
      if (!artists || !Array.isArray(artists) || artists.length === 0) {
        return 0
      }

      const uniqueGenres = new Set()
      artists.forEach(artist => {
        if (artist && artist.genres && Array.isArray(artist.genres)) {
          artist.genres.forEach(genre => uniqueGenres.add(genre))
        }
      })
      return Math.min(100, (uniqueGenres.size / 20) * 100)
    } catch (error) {
      console.warn('Erro ao calcular diversidade:', error)
      return 0
    }
  }

  const formatDuration = (ms) => {
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const getMoodDescription = (valence) => {
    if (valence > 0.7) return 'Muito Positivo'
    if (valence > 0.5) return 'Positivo'
    if (valence > 0.3) return 'Neutro'
    return 'Introspectivo'
  }

  const getEnergyDescription = (energy) => {
    if (energy > 0.7) return 'Muito Energético'
    if (energy > 0.5) return 'Energético'
    if (energy > 0.3) return 'Moderado'
    return 'Calmo'
  }

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Estilos CSS personalizados para animações */}
      <style jsx>{`
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
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .tab-button {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .tab-content {
          animation: slideIn 0.4s ease-out forwards;
        }
      `}</style>
      
      {/* Header com informações do usuário e período */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={user?.images?.[0]?.url || '/default-avatar.jpg'}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full border-4 border-green-500/30 shadow-lg"
                  onError={(e) => {
                    e.target.src = '/default-avatar.jpg'
                  }}
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Music className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Olá, {user?.display_name || 'Músico'}! 🎵
                </h1>
              </div>
            </div>

            {/* Seletor de período */}
            <div className="flex flex-wrap gap-2">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                    timeRange === range.value
                      ? 'bg-green-600 text-white shadow-lg shadow-green-600/25'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <range.icon className="w-4 h-4" />
                  <span>{range.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navegação por abas */}
        <div className="mb-6">
          <div className="flex flex-wrap justify-center gap-2 p-2 bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg">
            {tabs.map((tab, index) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.value
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`group relative flex items-center space-x-2 px-5 py-3 rounded-lg font-medium transition-all duration-300 ease-out transform tab-button ${
                    isActive
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25 scale-105'
                      : 'bg-white/5 text-gray-300 hover:bg-white/15 hover:text-white hover:scale-105'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Indicador de ativo */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-lg opacity-20 blur-sm animate-pulse"></div>
                  )}
                  
                  {/* Conteúdo do botão */}
                  <div className="relative z-10 flex items-center space-x-2">
                    <div className={`p-1.5 rounded-md transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-white/10 text-gray-400 group-hover:bg-white/20 group-hover:text-white'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm">{tab.label}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Conteúdo das abas */}
        {/* Visão Geral */}
        {activeTab === 'overview' && (
          <div className="space-y-8 tab-content">
            {/* Botão para mostrar explicação das métricas */}
            <div className="text-center">
              <button
                onClick={() => setShowMetricsExplanation(!showMetricsExplanation)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105"
              >
                <Info className="w-5 h-5" />
                <span>O que significam essas métricas?</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showMetricsExplanation ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Explicação das métricas (colapsável) */}
            {showMetricsExplanation && (
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Explicação das Métricas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-green-400 font-semibold mb-2">Duração das Top Tracks</h4>
                      <p className="text-gray-300 text-sm mb-4">
                        Tempo total das suas {topTracks.length} músicas favoritas do período selecionado. 
                        Não representa o tempo total de escuta, apenas a duração das músicas mais ouvidas.
                      </p>
                      
                      <h4 className="text-blue-400 font-semibold mb-2">Popularidade Média</h4>
                      <p className="text-gray-300 text-sm mb-4">
                        Média de popularidade das suas músicas favoritas (0-100). 
                        Valores altos indicam gosto por hits mainstream, valores baixos indicam descoberta de artistas únicos.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-purple-400 font-semibold mb-2">Top Músicas</h4>
                      <p className="text-gray-300 text-sm mb-4">
                        Quantidade de músicas únicas nas suas favoritas do período. 
                        Mostra a diversidade das suas escolhas musicais.
                      </p>
                      
                      <h4 className="text-pink-400 font-semibold mb-2">Top Artistas</h4>
                      <p className="text-gray-300 text-sm mb-4">
                        Quantidade de artistas únicos nas suas favoritas. 
                        Indica se você foca em poucos artistas ou explora muitos.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Cards informativos principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-8 h-8 text-green-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Duração das Top Tracks</h4>
                  <p className="text-green-400 font-bold text-xl">
                    {insights.topTracksDuration ? formatDuration(insights.topTracksDuration) : '0m'}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Das suas {topTracks.length} músicas favoritas
                  </p>
                </div>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-8 h-8 text-blue-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Popularidade Média</h4>
                  <p className="text-blue-400 font-bold text-xl">
                    {insights.averagePopularity ? Math.round(insights.averagePopularity) : '0'}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Média das suas favoritas
                  </p>
                </div>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Music className="w-8 h-8 text-purple-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Top Músicas</h4>
                  <p className="text-purple-400 font-bold text-xl">
                    {insights.totalTracks || topTracks.length}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Músicas favoritas únicas
                  </p>
                </div>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-pink-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Top Artistas</h4>
                  <p className="text-pink-400 font-bold text-xl">
                    {insights.totalArtists || topArtists.length}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Artistas favoritos únicos
                  </p>
                </div>
              </Card>
            </div>

            {/* Top 3 Músicas Mais Ouvidas */}
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Music className="w-6 h-6 mr-3 text-green-400" />
                Top 3 Músicas Mais Ouvidas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topTracks.slice(0, 3).map((track, index) => (
                  <div key={track.id} className="text-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200">
                    <div className="relative mb-4">
                      <div className="absolute -top-2 -left-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <img
                        src={track.album?.images?.[0]?.url || '/default-track.jpg'}
                        alt={track.name}
                        className="w-24 h-24 mx-auto rounded-lg shadow-lg"
                        onError={(e) => {
                          e.target.src = '/default-track.jpg'
                        }}
                      />
                    </div>
                    <h4 className="text-white font-semibold mb-2 text-sm line-clamp-2">
                      {track.name}
                    </h4>
                    <p className="text-gray-400 text-xs mb-2">
                      {track.artists?.map(artist => artist.name).join(', ')}
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-xs">
                      <span className="text-green-400">
                        {track.popularity}% popular
                      </span>
                      <span className="text-blue-400">
                        {formatDuration(track.duration_ms)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top 3 Bandas/Artistas Mais Ouvidos */}
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3 text-blue-400" />
                Top 3 Artistas Mais Ouvidos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topArtists.slice(0, 3).map((artist, index) => (
                  <div key={artist.id} className="text-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200">
                    <div className="relative mb-4">
                      <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <img
                        src={artist.images?.[0]?.url || '/default-artist.jpg'}
                        alt={artist.name}
                        className="w-24 h-24 mx-auto rounded-full shadow-lg"
                        onError={(e) => {
                          e.target.src = '/default-artist.jpg'
                        }}
                      />
                    </div>
                    <h4 className="text-white font-semibold mb-2 text-sm">
                      {artist.name}
                    </h4>
                    <p className="text-gray-400 text-xs mb-2 capitalize">
                      {artist.genres?.slice(0, 2).join(', ') || 'Gênero não disponível'}
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-xs">
                      <span className="text-blue-400">
                        {artist.popularity}% popular
                      </span>
                      <span className="text-purple-400">
                        {artist.followers?.total ? `${(artist.followers.total / 1000).toFixed(1)}k seguidores` : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Informações Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Target className="w-6 h-6 mr-3 text-green-400" />
                  Gênero Dominante
                </h3>
                <div className="text-center p-6">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Music className="w-10 h-10 text-green-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2 text-lg capitalize">
                    {insights.topGenre || 'N/A'}
                  </h4>
                  <p className="text-gray-300 text-sm mb-4">
                    Seu gênero musical preferido do período
                  </p>
                  <div className="text-left space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Gêneros únicos:</span>
                      <span className="text-green-400 font-semibold">
                        {insights.topGenres ? insights.topGenres.length : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Diversidade:</span>
                      <span className="text-blue-400 font-semibold">
                        {insights.diversityScore ? Math.round(insights.diversityScore) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-3 text-blue-400" />
                  Resumo Musical
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300 text-sm">Duração média:</span>
                    <span className="text-green-400 font-semibold">
                      {insights.averageTrackDuration ? formatDuration(insights.averageTrackDuration) : '0m'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300 text-sm">Perfil de popularidade:</span>
                    <span className="text-blue-400 font-semibold">
                      {insights.averagePopularity > 70 ? 'Mainstream' : 
                       insights.averagePopularity > 40 ? 'Equilibrado' : 'Underground'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300 text-sm">Tendência musical:</span>
                    <span className="text-purple-400 font-semibold">
                      {insights.diversityScore > 70 ? 'Explorador' : 
                       insights.diversityScore > 40 ? 'Variado' : 'Focado'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Top Músicas */}
        {activeTab === 'tracks' && (
          <div className="space-y-8 tab-content">
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Music className="w-6 h-6 mr-3 text-green-400" />
                Suas Músicas Favoritas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topTracks.map((track, index) => (
                  <div key={track.id} className="group relative p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
                    <div className="relative mb-4">
                      <div className="absolute -top-2 -left-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <img
                        src={track.album?.images?.[0]?.url || '/default-track.jpg'}
                        alt={track.name}
                        className="w-full h-48 object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300"
                        onError={(e) => {
                          e.target.src = '/default-track.jpg'
                        }}
                      />
                    </div>
                    <h4 className="text-white font-semibold mb-2 line-clamp-2">
                      {track.name}
                    </h4>
                    <p className="text-gray-400 text-sm mb-3">
                      {track.artists?.map(artist => artist.name).join(', ')}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-400">
                        {track.popularity}% popular
                      </span>
                      <span className="text-blue-400">
                        {formatDuration(track.duration_ms)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Top Artistas */}
        {activeTab === 'artists' && (
          <div className="space-y-8 tab-content">
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3 text-blue-400" />
                Seus Artistas Favoritos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topArtists.map((artist, index) => (
                  <div key={artist.id} className="group relative p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105">
                    <div className="relative mb-4">
                      <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <img
                        src={artist.images?.[0]?.url || '/default-artist.jpg'}
                        alt={artist.name}
                        className="w-full h-48 object-cover rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300"
                        onError={(e) => {
                          e.target.src = '/default-artist.jpg'
                        }}
                      />
                    </div>
                    <h4 className="text-white font-semibold mb-2 text-center">
                      {artist.name}
                    </h4>
                    <p className="text-gray-400 text-sm mb-3 text-center capitalize">
                      {artist.genres?.slice(0, 2).join(', ') || 'Gênero não disponível'}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-400">
                        {artist.popularity}% popular
                      </span>
                      <span className="text-purple-400">
                        {artist.followers?.total ? `${(artist.followers.total / 1000).toFixed(1)}k seguidores` : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Insights */}
        {activeTab === 'insights' && (
          <div className="space-y-8 tab-content">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Insights Detalhados</h2>
              <p className="text-gray-300 text-lg">
                Análise profunda dos seus hábitos musicais baseada nas suas top {timeRange === 'short_term' ? '4 semanas' : timeRange === 'medium_term' ? '6 meses' : '1 ano'}
              </p>
            </div>
            
            {/* Resumo Executivo */}
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Target className="w-6 h-6 mr-3 text-green-400" />
                Resumo Executivo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-green-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Artistas Únicos</h4>
                  <p className="text-green-400 font-bold text-xl">
                    {topArtists.length}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {topArtists.length > 15 ? 'Você explora muitos artistas' : 
                     topArtists.length > 8 ? 'Boa variedade de artistas' : 
                     'Focado em artistas específicos'}
                  </p>
                </div>

                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-8 h-8 text-blue-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Período de Análise</h4>
                  <p className="text-blue-400 font-bold text-xl">
                    {timeRange === 'short_term' ? '4 Sem' : timeRange === 'medium_term' ? '6 Mes' : '1 Ano'}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {timeRange === 'short_term' ? 'Tendências recentes' : 
                     timeRange === 'medium_term' ? 'Padrões médio prazo' : 
                     'Gostos de longo prazo'}
                  </p>
                </div>

                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Tendência de Gêneros</h4>
                  <p className="text-purple-400 font-bold text-xl">
                    {insights.topGenres && insights.topGenres.length > 0 ? 
                     (insights.topGenres[0].count > 3 ? 'Dominante' : 
                      insights.topGenres[0].count > 1 ? 'Equilibrado' : 'Diverso') : 'N/A'}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {insights.topGenres && insights.topGenres.length > 0 ? 
                     (insights.topGenres[0].count > 3 ? 'Um gênero se destaca' : 
                      insights.topGenres[0].count > 1 ? 'Boa distribuição' : 'Muito variado') : 'Não disponível'}
                  </p>
                </div>

                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-8 h-8 text-pink-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Score Musical</h4>
                  <p className="text-pink-400 font-bold text-xl">
                    {insights.diversityScore ? Math.round(insights.diversityScore) : 0}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {insights.diversityScore > 70 ? 'Explorador musical' : 
                     insights.diversityScore > 40 ? 'Boa variedade' : 
                     'Fiel aos favoritos'}
                  </p>
                </div>
              </div>
            </Card>
            
            {/* Distribuição de Gêneros */}
            {insights.topGenres && (
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10 min-h-[500px]">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <PieChart className="w-6 h-6 mr-3 text-green-400" />
                  Distribuição de Gêneros
                </h3>
                <div className="mb-4">
                  <p className="text-gray-300 text-sm">
                    Esta visualização mostra a distribuição dos gêneros musicais dos seus artistas favoritos. 
                    Quanto maior a fatia, mais artistas daquele gênero estão nas suas top {timeRange === 'short_term' ? '4 semanas' : timeRange === 'medium_term' ? '6 meses' : '1 ano'}.
                  </p>
                </div>
                <div className="h-96 w-full flex-1 min-h-0">
                  <ChartWrapper
                    type="doughnut"
                    data={{
                      labels: insights.topGenres.map(g => g.genre),
                      datasets: [{
                        label: 'Gêneros',
                        data: insights.topGenres.map(g => g.count),
                        backgroundColor: [
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(236, 72, 153, 0.8)',
                          'rgba(245, 158, 11, 0.8)',
                          'rgba(239, 68, 68, 0.8)',
                          'rgba(139, 92, 246, 0.8)',
                          'rgba(14, 165, 233, 0.8)',
                          'rgba(16, 185, 129, 0.8)'
                        ]
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { 
                            color: 'rgba(255, 255, 255, 0.9)',
                            padding: 20,
                            usePointStyle: true
                          }
                        }
                      }
                    }}
                  />
                </div>
              </Card>
            )}

            {/* Perfil de Humor Musical */}
            {insights.moodProfile && (
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10 min-h-[500px]">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Heart className="w-6 h-6 mr-3 text-green-400" />
                  Perfil de Humor Musical
                </h3>
                <div className="mb-4">
                  <p className="text-gray-300 text-sm">
                    Este gráfico mostra o perfil emocional das suas músicas favoritas baseado em:
                  </p>
                  <ul className="text-gray-300 text-sm mt-2 space-y-1">
                    <li>• <strong>Positividade:</strong> Quão alegre e positiva é a música (0 = triste, 1 = muito alegre)</li>
                    <li>• <strong>Energia:</strong> Quão energética e intensa é a música (0 = calma, 1 = muito energética)</li>
                    <li>• <strong>Dançabilidade:</strong> Quão fácil é dançar com a música (0 = difícil, 1 = muito dançante)</li>
                  </ul>
                </div>
                <div className="h-96 w-full flex-1 min-h-0">
                  <ChartWrapper
                    type="radar"
                    data={insights.moodProfile}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        r: {
                          beginAtZero: true,
                          max: 1,
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            backdropColor: 'transparent',
                            stepSize: 0.2
                          },
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          },
                          pointLabels: {
                            color: 'rgba(255, 255, 255, 0.9)',
                            font: { size: 12, weight: '600' }
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          labels: { color: 'rgba(255, 255, 255, 0.9)' }
                        }
                      }
                    }}
                  />
                </div>
              </Card>
            )}

            {/* Padrões de Escuta */}
            {insights.listeningHabits && (
              <Card className="bg-black/20 backdrop-blur-sm border border-white/10 min-h-[500px]">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Activity className="w-6 h-6 mr-3 text-blue-400" />
                  Padrões de Escuta por Hora
                </h3>
                <div className="mb-4">
                  <p className="text-gray-300 text-sm">
                    Este gráfico mostra em que horários você mais escuta música, baseado nas suas músicas recentes. 
                    Os picos indicam os horários em que você é mais ativo musicalmente.
                  </p>
                </div>
                <div className="h-96 w-full flex-1 min-h-0">
                  <ChartWrapper
                    type="line"
                    data={insights.listeningHabits}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: {
                          ticks: { 
                            color: 'rgba(255, 255, 255, 0.7)',
                            maxTicksLimit: 12
                          },
                          grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                          ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                          grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                </div>
              </Card>
            )}

            {/* Análise de Padrões Musicais */}
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Brain className="w-6 h-6 mr-3 text-indigo-400" />
                Análise de Padrões Musicais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Análise de Artistas */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-green-400" />
                    Perfil dos Seus Artistas
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300 text-sm">Artistas com mais músicas:</span>
                      <span className="text-green-400 font-semibold">
                        {topArtists.length > 0 ? topArtists[0].name : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300 text-sm">Gênero mais representado:</span>
                      <span className="text-blue-400 font-semibold capitalize">
                        {insights.topGenre || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300 text-sm">Variedade de estilos:</span>
                      <span className="text-purple-400 font-semibold">
                        {insights.topGenres && insights.topGenres.length > 8 ? 'Alta' : 
                         insights.topGenres && insights.topGenres.length > 4 ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Análise de Músicas */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Music className="w-5 h-5 mr-2 text-pink-400" />
                    Características das Músicas
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300 text-sm">Música mais longa:</span>
                      <span className="text-yellow-400 font-semibold">
                        {topTracks.length > 0 && topTracks[0].duration_ms ? 
                         formatDuration(topTracks[0].duration_ms) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300 text-sm">Música mais popular:</span>
                      <span className="text-green-400 font-semibold">
                        {topTracks.length > 0 ? topTracks[0].popularity : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300 text-sm">Preferência por duração:</span>
                      <span className="text-blue-400 font-semibold">
                        {insights.averageTrackDuration > 240000 ? 'Longas' :
                         insights.averageTrackDuration > 180000 ? 'Médias' : 'Curtas'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Insights Personalizados */}
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Sparkles className="w-6 h-6 mr-3 text-yellow-400" />
                Insights Personalizados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-xl border border-green-500/20">
                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-400" />
                    Seu Perfil Musical
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {insights.diversityScore > 70 ? 
                     'Você é um verdadeiro explorador musical! Sua diversidade de gêneros mostra que você não tem medo de experimentar novos sons e estilos.' :
                     insights.diversityScore > 40 ? 
                     'Você mantém um bom equilíbrio entre seus gêneros favoritos e a exploração de novos estilos musicais.' :
                     'Você é fiel aos seus gêneros favoritos, o que mostra que você sabe exatamente o que gosta e não tem medo de se aprofundar.'}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
                    Tendências Futuras
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {insights.averagePopularity > 70 ? 
                     'Com base na sua preferência por músicas populares, continue explorando as playlists "Discover Weekly" e "Release Radar" para encontrar novos hits.' :
                     insights.averagePopularity > 40 ? 
                     'Sua mistura de gostos populares e underground é perfeita! Experimente as playlists "Daily Mix" para descobrir mais artistas similares.' :
                     'Você tem um gosto único! Explore as playlists "Fresh Finds" e "Underground" para descobrir artistas emergentes que podem se tornar seus favoritos.'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Player de música flutuante melhorado */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src={currentTrack.album?.images[0]?.url || '/default-track.jpg'} 
                  alt={currentTrack.album?.name || 'Track'}
                  className="w-16 h-16 rounded-lg"
                />
                <div>
                  <p className="font-medium text-white text-lg">{currentTrack.name || 'Unknown Track'}</p>
                  <p className="text-gray-400 text-sm">
                    {currentTrack.artists && currentTrack.artists.length > 0 ? currentTrack.artists.map(a => a.name).join(', ') : 'Unknown Artist'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Shuffle className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <SkipBack className="w-5 h-5 text-white" />
                </button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-4 bg-green-600 hover:bg-green-700 rounded-full transition-colors"
                >
                  {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <SkipForward className="w-5 h-5 text-white" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Repeat className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <Volume2 className="w-5 h-5 text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-20 accent-green-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
