import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { spotifyAPI } from '../services/api'
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  Heart, 
  Music, 
  Users, 
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Moon,
  Sun,
  CloudRain,
  Star,
  Eye,
  Brain,
  Sparkles
} from 'lucide-react'
import Card from '../components/Card'
import Loading from '../components/Loading'
import ChartWrapper from '../components/ChartWrapper'

const Analytics = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('short_term')
  const [topTracks, setTopTracks] = useState([])
  const [topArtists, setTopArtists] = useState([])
  const [audioFeatures, setAudioFeatures] = useState({})
  const [recentTracks, setRecentTracks] = useState([])
  const [insights, setInsights] = useState({})
  const [activeInsight, setActiveInsight] = useState('overview')

  const timeRanges = [
    { value: 'short_term', label: '4 Semanas', icon: Calendar, color: 'from-green-500 to-green-600' },
    { value: 'medium_term', label: '6 Meses', icon: Calendar, color: 'from-blue-500 to-blue-600' },
    { value: 'long_term', label: '1 Ano', icon: Calendar, color: 'from-purple-500 to-purple-600' }
  ]

  const insightTabs = [
    { id: 'overview', name: 'Visão Geral', icon: Eye, description: 'Resumo dos seus hábitos musicais' },
    { id: 'mood', name: 'Análise de Humor', icon: Heart, description: 'Como a música afeta seu estado de espírito' },
    { id: 'patterns', name: 'Padrões', icon: Brain, description: 'Seus horários e rotinas de escuta' },
    { id: 'diversity', name: 'Diversidade', icon: Sparkles, description: 'Variedade de gêneros e artistas' }
  ]

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const [tracksRes, artistsRes, recentRes] = await Promise.all([
        spotifyAPI.getTopTracks(timeRange, 50),
        spotifyAPI.getTopArtists(timeRange, 50),
        spotifyAPI.getRecentlyPlayed(50)
      ])

      setTopTracks(tracksRes.data.items)
      setTopArtists(artistsRes.data.items)
      setRecentTracks(recentRes.data.items)

      // Get audio features for analysis
      if (tracksRes.data.items.length > 0) {
        try {
          const trackIds = tracksRes.data.items.map(track => track.id)
          const featuresRes = await spotifyAPI.getAudioFeatures(trackIds)
          setAudioFeatures(featuresRes.data.audio_features)
        } catch (error) {
          console.warn('Could not load audio features:', error.message)
          setAudioFeatures({})
        }
      }

      // Generate insights
      generateInsights(tracksRes.data.items, artistsRes.data.items, recentRes.data.items)
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateInsights = (tracks, artists, recent) => {
    const insights = {
      totalListeningTime: tracks.reduce((acc, track) => acc + track.duration_ms, 0),
      averagePopularity: tracks.reduce((acc, track) => acc + track.popularity, 0) / tracks.length,
      topGenres: getTopGenres(artists),
      moodAnalysis: analyzeMood(tracks),
      listeningPatterns: analyzeListeningPatterns(recent),
      artistDiversity: analyzeArtistDiversity(artists),
      tempoAnalysis: analyzeTempo(tracks),
      energyLevels: analyzeEnergyLevels(tracks),
      listeningScore: calculateListeningScore(tracks, artists, recent),
      genreExploration: calculateGenreExploration(artists),
      timeConsistency: calculateTimeConsistency(recent)
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
      .slice(0, 10)
      .map(([genre, count]) => ({ genre, count }))
  }

  const analyzeMood = (tracks) => {
    if (!audioFeatures || Object.keys(audioFeatures).length === 0) return null

    const features = ['valence', 'energy', 'danceability']
    const avgValues = features.map(feature => {
      const values = Object.values(audioFeatures).map(track => track[feature])
      return values.reduce((a, b) => a + b, 0) / values.length
    })

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
  }

  const getFallbackMoodData = () => {
    if (topTracks.length === 0) return null

    const highPopularity = topTracks.filter(track => track.popularity > 70).length
    const mediumPopularity = topTracks.filter(track => track.popularity > 40 && track.popularity <= 70).length
    const lowPopularity = topTracks.filter(track => track.popularity <= 40).length

    return {
      labels: ['Alta Popularidade', 'Média Popularidade', 'Baixa Popularidade'],
      datasets: [{
        label: 'Distribuição por Popularidade',
        data: [highPopularity, mediumPopularity, lowPopularity],
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

  const analyzeListeningPatterns = (recent) => {
    const hourlyData = new Array(24).fill(0)
    recent.forEach(item => {
      const hour = new Date(item.played_at).getHours()
      hourlyData[hour]++
    })

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
  }

  const analyzeArtistDiversity = (artists) => {
    const genres = getTopGenres(artists)
    return {
      labels: genres.map(g => g.genre),
      datasets: [{
        label: 'Distribuição de Gêneros',
        data: genres.map(g => g.count),
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
    }
  }

  const analyzeTempo = (tracks) => {
    if (!audioFeatures || Object.keys(audioFeatures).length === 0) return null

    const tempos = Object.values(audioFeatures).map(track => track.tempo)
    const avgTempo = tempos.reduce((a, b) => a + b, 0) / tempos.length

    return {
      labels: ['Tempo Médio'],
      datasets: [{
        label: 'BPM',
        data: [Math.round(avgTempo)],
        backgroundColor: 'rgba(236, 72, 153, 0.8)',
        borderColor: 'rgba(236, 72, 153, 1)',
        borderWidth: 2
      }]
    }
  }

  const getFallbackTempoData = () => {
    if (topTracks.length === 0) return null

    const shortTracks = topTracks.filter(track => track.duration_ms < 180000).length
    const mediumTracks = topTracks.filter(track => track.duration_ms >= 180000 && track.duration_ms < 300000).length
    const longTracks = topTracks.filter(track => track.duration_ms >= 300000).length

    return {
      labels: ['Músicas Curtas (<3min)', 'Músicas Médias (3-5min)', 'Músicas Longas (>5min)'],
      datasets: [{
        label: 'Distribuição por Duração',
        data: [shortTracks, mediumTracks, longTracks],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2
      }]
    }
  }

  const analyzeEnergyLevels = (tracks) => {
    if (!audioFeatures || Object.keys(audioFeatures).length === 0) return null

    const energyLevels = Object.values(audioFeatures).map(track => track.energy)
    const lowEnergy = energyLevels.filter(e => e < 0.3).length
    const mediumEnergy = energyLevels.filter(e => e >= 0.3 && e < 0.7).length
    const highEnergy = energyLevels.filter(e => e >= 0.7).length

    return {
      labels: ['Baixa Energia', 'Média Energia', 'Alta Energia'],
      datasets: [{
        label: 'Distribuição de Energia',
        data: [lowEnergy, mediumEnergy, highEnergy],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2
      }]
    }
  }

  const getFallbackEnergyData = () => {
    if (topTracks.length === 0) return null

    const lowPopularity = topTracks.filter(track => track.popularity < 33).length
    const mediumPopularity = topTracks.filter(track => track.popularity >= 33 && track.popularity < 66).length
    const highPopularity = topTracks.filter(track => track.popularity >= 66).length

    return {
      labels: ['Baixa Popularidade', 'Média Popularidade', 'Alta Popularidade'],
      datasets: [{
        label: 'Distribuição por Popularidade',
        data: [lowPopularity, mediumPopularity, highPopularity],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2
      }]
    }
  }

  const calculateListeningScore = (tracks, artists, recent) => {
    const allGenres = artists
      .filter(a => a.genres && Array.isArray(a.genres))
      .map(a => a.genres)
      .flat()
    const diversityScore = Math.min(100, (new Set(allGenres).size / 20) * 100)
    const consistencyScore = recent.length > 0 ? Math.min(100, (recent.length / 50) * 100) : 0
    const popularityScore = tracks.length > 0 ? tracks.reduce((acc, track) => acc + track.popularity, 0) / tracks.length : 0
    
    return Math.round((diversityScore + consistencyScore + popularityScore) / 3)
  }

  const calculateGenreExploration = (artists) => {
    const allGenres = artists
      .filter(a => a.genres && Array.isArray(a.genres))
      .map(a => a.genres)
      .flat()
    const uniqueGenres = new Set(allGenres)
    return Math.min(100, (uniqueGenres.size / 25) * 100)
  }

  const calculateTimeConsistency = (recent) => {
    if (recent.length === 0) return 0
    
    const hours = recent.map(item => new Date(item.played_at).getHours())
    const uniqueHours = new Set(hours)
    return Math.min(100, (uniqueHours.size / 24) * 100)
  }

  const formatDuration = (ms) => {
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const getTimeRangeLabel = (range) => {
    const labels = {
      short_term: '4 Semanas',
      medium_term: '6 Meses',
      long_term: '1 Ano'
    }
    return labels[range] || range
  }

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header melhorado */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent mb-3">
                Análises Avançadas 🧠
              </h1>
              <p className="text-gray-300 text-lg">
                Insights profundos sobre seus hábitos musicais e preferências
              </p>
            </div>
            
            {/* Seletor de período melhorado */}
            <div className="flex flex-wrap gap-3">
              {timeRanges.map((period) => {
                const Icon = period.icon
                return (
                  <button
                    key={period.value}
                    onClick={() => setTimeRange(period.value)}
                    className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      timeRange === period.value
                        ? `bg-gradient-to-r ${period.color} text-white shadow-lg scale-105`
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:scale-105'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{period.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Cards de estatísticas principais - Layout melhorado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-600 to-green-700 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-sm font-medium">Tempo Total</p>
                <p className="text-3xl font-bold text-white">
                  {insights.totalListeningTime ? formatDuration(insights.totalListeningTime) : 'N/A'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-sm font-medium">Popularidade Média</p>
                <p className="text-3xl font-bold text-white">
                  {insights.averagePopularity ? Math.round(insights.averagePopularity) : 'N/A'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Music className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-sm font-medium">Total de Tracks</p>
                <p className="text-3xl font-bold text-white">{topTracks.length}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-pink-600 to-pink-700 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-sm font-medium">Artistas Únicos</p>
                <p className="text-3xl font-bold text-white">{topArtists.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Navegação por insights */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {insightTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveInsight(tab.id)}
                  className={`flex flex-col items-center space-y-2 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
                    activeInsight === tab.id
                      ? 'bg-green-600 text-white shadow-lg scale-105'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:scale-105'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm">{tab.name}</span>
                  <span className="text-xs opacity-75 text-center max-w-24">
                    {tab.description}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Conteúdo dos insights */}
        {activeInsight === 'overview' && (
          <div className="space-y-8">
            {/* Score geral de escuta */}
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <div className="text-center py-8">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-4xl mb-4">
                  {insights.listeningScore || 0}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Seu Score Musical</h3>
                <p className="text-gray-300 text-lg">
                  Baseado em diversidade, consistência e popularidade
                </p>
              </div>
            </Card>

            {/* Gráficos principais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Perfil de Humor */}
              {(insights.moodAnalysis || getFallbackMoodData()) && (
                <Card className="bg-black/20 backdrop-blur-sm border border-white/10 hover:border-green-500/30 transition-all duration-300">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <Heart className="w-6 h-6 mr-3 text-green-400" />
                    {insights.moodAnalysis ? 'Perfil de Humor Musical' : 'Distribuição por Popularidade'}
                  </h3>
                  <div className="h-80">
                    <ChartWrapper
                      type={insights.moodAnalysis ? 'radar' : 'doughnut'}
                      data={insights.moodAnalysis || getFallbackMoodData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        ...(insights.moodAnalysis ? {
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
                          }
                        } : {}),
                        plugins: {
                          legend: {
                            labels: { color: 'rgba(255, 255, 255, 0.9)' }
                          }
                        }
                      }}
                    />
                  </div>
                  {!insights.moodAnalysis && (
                    <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-300 text-sm">
                        ⚠️ Audio features não disponíveis. Mostrando distribuição por popularidade como alternativa.
                      </p>
                    </div>
                  )}
                </Card>
              )}

              {/* Padrões de Escuta */}
              {insights.listeningPatterns && (
                <Card className="bg-black/20 backdrop-blur-sm border border-white/10 hover:border-green-500/30 transition-all duration-300">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <Activity className="w-6 h-6 mr-3 text-blue-400" />
                    Padrões de Escuta por Hora
                  </h3>
                  <div className="h-80">
                    <ChartWrapper
                      type="line"
                      data={insights.listeningPatterns}
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
            </div>
          </div>
        )}

        {/* Insight: Análise de Humor */}
        {activeInsight === 'mood' && (
          <div className="space-y-8">
            {/* Score de humor */}
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <div className="text-center py-8">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-4xl mb-4">
                  {insights.moodAnalysis ? 
                    Math.round(insights.moodAnalysis.datasets[0].data[0] * 100) : 
                    Math.round(insights.averagePopularity || 0)
                  }
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Seu Humor Musical</h3>
                <p className="text-gray-300 text-lg">
                  {insights.moodAnalysis ? 
                    'Baseado em positividade, energia e dançabilidade' :
                    'Baseado na popularidade das suas músicas favoritas'
                  }
                </p>
              </div>
            </Card>

            {/* Gráficos de humor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Análise de Energia */}
              {(insights.energyLevels || getFallbackEnergyData()) && (
                <Card className="bg-black/20 backdrop-blur-sm border border-white/10 hover:border-green-500/30 transition-all duration-300">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <Zap className="w-6 h-6 mr-3 text-yellow-400" />
                    {insights.energyLevels ? 'Níveis de Energia' : 'Distribuição por Popularidade'}
                  </h3>
                  <div className="h-80">
                    <ChartWrapper
                      type="bar"
                      data={insights.energyLevels || getFallbackEnergyData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: {
                            ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                          },
                          y: {
                            ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
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
                  {!insights.energyLevels && (
                    <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-300 text-sm">
                        ⚠️ Audio features não disponíveis. Mostrando distribuição por popularidade como alternativa.
                      </p>
                    </div>
                  )}
                </Card>
              )}

              {/* Análise de Tempo */}
              {(insights.tempoAnalysis || getFallbackTempoData()) && (
                <Card className="bg-black/20 backdrop-blur-sm border border-white/10 hover:border-green-500/30 transition-all duration-300">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-3 text-purple-400" />
                    {insights.tempoAnalysis ? 'Análise de Tempo (BPM)' : 'Distribuição por Duração'}
                  </h3>
                  <div className="h-80">
                    <ChartWrapper
                      type="bar"
                      data={insights.tempoAnalysis || getFallbackTempoData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: {
                            ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                          },
                          y: {
                            ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
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
                  {insights.tempoAnalysis ? (
                    <div className="mt-4 text-center">
                      <p className="text-gray-300 text-sm">
                        Tempo médio: <span className="text-white font-bold">
                          {insights.tempoAnalysis.datasets[0].data[0]} BPM
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-300 text-sm">
                        ⚠️ Audio features não disponíveis. Mostrando distribuição por duração como alternativa.
                      </p>
                    </div>
                  )}
                </Card>
              )}
            </div>

            {/* Resumo de humor */}
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Brain className="w-6 h-6 mr-3 text-pink-400" />
                Resumo do Seu Humor Musical
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-8 h-8 text-green-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Positividade</h4>
                  <p className="text-gray-400 text-sm">
                    {insights.moodAnalysis ? 
                      (insights.moodAnalysis.datasets[0].data[0] > 0.6 ? 'Músicas positivas e animadas' :
                       insights.moodAnalysis.datasets[0].data[0] > 0.4 ? 'Músicas equilibradas' :
                       'Músicas mais introspectivas') :
                      'Análise não disponível'
                    }
                  </p>
                </div>

                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-8 h-8 text-blue-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Energia</h4>
                  <p className="text-gray-400 text-sm">
                    {insights.moodAnalysis ? 
                      (insights.moodAnalysis.datasets[0].data[1] > 0.6 ? 'Músicas energéticas e vibrantes' :
                       insights.moodAnalysis.datasets[0].data[1] > 0.4 ? 'Músicas com energia moderada' :
                       'Músicas mais calmas e relaxantes') :
                      'Análise não disponível'
                    }
                  </p>
                </div>

                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Music className="w-8 h-8 text-purple-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Dançabilidade</h4>
                  <p className="text-gray-400 text-sm">
                    {insights.moodAnalysis ? 
                      (insights.moodAnalysis.datasets[0].data[2] > 0.6 ? 'Músicas dançantes e rítmicas' :
                       insights.moodAnalysis.datasets[0].data[2] > 0.4 ? 'Músicas com ritmo moderado' :
                       'Músicas mais contemplativas') :
                      'Análise não disponível'
                    }
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Insight: Padrões */}
        {activeInsight === 'patterns' && (
          <div className="space-y-8">
            {/* Score de consistência */}
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <div className="text-center py-8">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-4xl mb-4">
                  {insights.timeConsistency || 0}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Sua Consistência</h3>
                <p className="text-gray-300 text-lg">
                  Baseado na distribuição dos seus horários de escuta
                </p>
              </div>
            </Card>

            {/* Gráficos de padrões */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Padrões de Escuta por Hora */}
              {insights.listeningPatterns && (
                <Card className="bg-black/20 backdrop-blur-sm border border-white/10 hover:border-green-500/30 transition-all duration-300">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <Clock className="w-6 h-6 mr-3 text-blue-400" />
                    Padrões de Escuta por Hora
                  </h3>
                  <div className="h-80">
                    <ChartWrapper
                      type="line"
                      data={insights.listeningPatterns}
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

              {/* Distribuição de Gêneros */}
              {insights.artistDiversity && (
                <Card className="bg-black/20 backdrop-blur-sm border border-white/10 hover:border-green-500/30 transition-all duration-300">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <PieChart className="w-6 h-6 mr-3 text-green-400" />
                    Distribuição de Gêneros
                  </h3>
                  <div className="h-80">
                    <ChartWrapper
                      type="doughnut"
                      data={insights.artistDiversity}
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
            </div>

            {/* Análise de padrões */}
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Target className="w-6 h-6 mr-3 text-blue-400" />
                Análise dos Seus Padrões
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-white/5 rounded-xl">
                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-400" />
                    Horários de Pico
                  </h4>
                  <div className="space-y-2">
                    {insights.listeningPatterns && (() => {
                      const data = insights.listeningPatterns.datasets[0].data
                      const maxIndex = data.indexOf(Math.max(...data))
                      const minIndex = data.indexOf(Math.min(...data))
                      return (
                        <>
                          <p className="text-gray-300 text-sm">
                            <span className="text-green-400 font-medium">Pico:</span> {maxIndex}:00h 
                            ({data[maxIndex]} reproduções)
                          </p>
                          <p className="text-gray-300 text-sm">
                            <span className="text-red-400 font-medium">Baixa:</span> {minIndex}:00h 
                            ({data[minIndex]} reproduções)
                          </p>
                        </>
                      )
                    })()}
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl">
                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-green-400" />
                    Consistência Temporal
                  </h4>
                  <div className="space-y-2">
                    <p className="text-gray-300 text-sm">
                      <span className="text-blue-400 font-medium">Score:</span> {insights.timeConsistency || 0}/100
                    </p>
                    <p className="text-gray-300 text-sm">
                      {insights.timeConsistency > 70 ? 'Você escuta música em horários variados' :
                       insights.timeConsistency > 40 ? 'Você tem alguns horários preferidos' :
                       'Você é muito consistente com seus horários'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Insight: Diversidade */}
        {activeInsight === 'diversity' && (
          <div className="space-y-8">
            {/* Score de diversidade */}
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <div className="text-center py-8">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-4xl mb-4">
                  {insights.genreExploration || 0}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Sua Diversidade Musical</h3>
                <p className="text-gray-300 text-lg">
                  Baseado na variedade de gêneros e artistas
                </p>
              </div>
            </Card>

            {/* Gráficos de diversidade */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Gêneros */}
              {insights.topGenres && (
                <Card className="bg-black/20 backdrop-blur-sm border border-white/10 hover:border-green-500/30 transition-all duration-300">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-3 text-purple-400" />
                    Top 10 Gêneros
                  </h3>
                  <div className="space-y-3">
                    {insights.topGenres.slice(0, 10).map((genre, index) => (
                      <div key={genre.genre} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-8 text-center text-green-400 font-bold">#{index + 1}</div>
                        <div className="flex-1">
                          <p className="font-medium text-white capitalize">{genre.genre}</p>
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(genre.count / insights.topGenres[0].count) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{genre.count}</div>
                          <div className="text-gray-400 text-xs">artistas</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Distribuição de Artistas */}
              {insights.artistDiversity && (
                <Card className="bg-black/20 backdrop-blur-sm border border-white/10 hover:border-green-500/30 transition-all duration-300">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <Users className="w-6 h-6 mr-3 text-blue-400" />
                    Distribuição de Gêneros
                  </h3>
                  <div className="h-80">
                    <ChartWrapper
                      type="doughnut"
                      data={insights.artistDiversity}
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
            </div>

            {/* Análise de diversidade */}
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Sparkles className="w-6 h-6 mr-3 text-purple-400" />
                Análise da Sua Diversidade
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Music className="w-8 h-8 text-green-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Gêneros Únicos</h4>
                  <p className="text-gray-300 text-sm">
                    {insights.topGenres ? insights.topGenres.length : 0} gêneros diferentes
                  </p>
                  <p className="text-green-400 text-xs mt-1">
                    {insights.genreExploration > 70 ? 'Excelente variedade!' :
                     insights.genreExploration > 40 ? 'Boa diversidade' :
                     'Você pode explorar mais'}
                  </p>
                </div>

                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Artistas Únicos</h4>
                  <p className="text-gray-300 text-sm">
                    {topArtists.length} artistas diferentes
                  </p>
                  <p className="text-blue-400 text-xs mt-1">
                    {topArtists.length > 30 ? 'Você explora muito!' :
                     topArtists.length > 15 ? 'Boa variedade' :
                     'Você é fiel aos favoritos'}
                  </p>
                </div>

                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-8 h-8 text-purple-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Popularidade Média</h4>
                  <p className="text-gray-300 text-sm">
                    {Math.round(insights.averagePopularity || 0)}/100
                  </p>
                  <p className="text-purple-400 text-xs mt-1">
                    {insights.averagePopularity > 70 ? 'Você gosta de hits!' :
                     insights.averagePopularity > 40 ? 'Gostos equilibrados' :
                     'Você é um explorador!'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Outros insights serão implementados aqui */}
        {activeInsight !== 'overview' && activeInsight !== 'mood' && activeInsight !== 'patterns' && activeInsight !== 'diversity' && (
          <Card className="bg-black/20 backdrop-blur-sm border border-white/10 text-center py-12">
            <div className="w-24 h-24 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-12 h-12 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {insightTabs.find(tab => tab.id === activeInsight)?.name}
            </h3>
            <p className="text-gray-400 text-lg">
              {insightTabs.find(tab => tab.id === activeInsight)?.description}
            </p>
            <p className="text-gray-500 mt-4">
              Em desenvolvimento - Em breve você verá análises ainda mais detalhadas!
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Analytics
