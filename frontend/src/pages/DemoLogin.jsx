import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Code, Sparkles, BarChart3, Music, Users } from 'lucide-react'
import { useDemo } from '../contexts/DemoContext'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/Button'

const DemoLogin = () => {
  const navigate = useNavigate()
  const { enableDemoMode } = useDemo()
  const { setUser } = useAuth()
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(true)
  }, [])

  const handleDemoLogin = async () => {
    enableDemoMode()
    
    const demoUser = {
      id: 'demo-user-123',
      display_name: 'Demo User',
      email: 'demo.user@example.com',
      country: 'BR',
      followers: { total: 847 },
      images: [
        {
          url: '/default-user.svg'
        }
      ]
    }
    
    setUser(demoUser)
    localStorage.setItem('spotify_demo_user', JSON.stringify(demoUser))
    
    navigate('/dashboard')
  }

  const goBack = () => {
    navigate('/login')
  }

  const features = [
    {
      icon: BarChart3,
      title: 'Análises Completas',
      description: 'Visualize estatísticas detalhadas dos seus hábitos musicais'
    },
    {
      icon: Music,
      title: 'Gerenciar Playlists',
      description: 'Crie, edite e organize suas playlists favoritas'
    },
    {
      icon: Sparkles,
      title: 'Descoberta Musical',
      description: 'Encontre novas músicas baseadas no seu gosto'
    },
    {
      icon: Users,
      title: 'Perfil Musical',
      description: 'Veja seu perfil completo com insights personalizados'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="max-w-4xl w-full">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6 transform transition-all duration-1000 ${animate ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
              <Code className="w-12 h-12 text-white" />
            </div>
            
            <h1 className={`text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent mb-4 transform transition-all duration-1000 delay-300 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              Modo Demo
            </h1>
            
            <p className={`text-2xl text-gray-300 mb-4 transform transition-all duration-1000 delay-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              Explore todas as funcionalidades
            </p>
            
            <p className={`text-gray-400 text-lg max-w-2xl mx-auto transform transition-all duration-1000 delay-700 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              Demonstração completa com dados simulados - sem necessidade de conta do Spotify
            </p>
          </div>

          {/* Features Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 transform transition-all duration-1000 delay-900 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-black/30 transition-all duration-300 hover:scale-105 group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Botões de ação */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 transform transition-all duration-1000 delay-1100 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <Button
              onClick={handleDemoLogin}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-xl text-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-purple-500/30"
            >
              <div className="flex items-center justify-center">
                <Play className="w-6 h-6 mr-3" />
                Iniciar Demonstração
              </div>
            </Button>

            <Button
              onClick={goBack}
              className="w-full sm:w-auto bg-gray-700/50 hover:bg-gray-600/50 text-white font-medium py-4 px-8 rounded-xl border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300"
            >
              Voltar ao Login Real
            </Button>
          </div>

          {/* Informações adicionais */}
          <div className={`bg-black/20 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6 text-center transform transition-all duration-1000 delay-1300 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-yellow-400 mr-2" />
              <h3 className="text-yellow-400 font-semibold text-lg">O que você verá na demo</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Dados simulados de um perfil musical completo, incluindo estatísticas, playlists, 
              histórico de escuta e recomendações. Todas as funcionalidades estão disponíveis 
              para teste sem necessidade de autenticação.
            </p>
          </div>

          {/* Footer */}
          <div className={`mt-12 text-center transform transition-all duration-1000 delay-1500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <p className="text-gray-500 text-sm">
              © 2024 My Universe Spotify - Demonstração Interativa
            </p>
          </div>
        </div>
      </div>

      {/* Elementos decorativos */}
      <div className="absolute top-20 left-10 opacity-20 animate-bounce" style={{ animationDelay: '0.5s' }}>
        <Code className="w-8 h-8 text-purple-400" />
      </div>
      
      <div className="absolute top-40 right-20 opacity-20 animate-bounce" style={{ animationDelay: '1s' }}>
        <Music className="w-6 h-6 text-pink-400" />
      </div>
      
      <div className="absolute bottom-40 left-20 opacity-20 animate-bounce" style={{ animationDelay: '1.5s' }}>
        <BarChart3 className="w-8 h-8 text-purple-400" />
      </div>
      
      <div className="absolute bottom-20 right-10 opacity-20 animate-bounce" style={{ animationDelay: '2s' }}>
        <Sparkles className="w-6 h-6 text-pink-400" />
      </div>
    </div>
  )
}

export default DemoLogin
