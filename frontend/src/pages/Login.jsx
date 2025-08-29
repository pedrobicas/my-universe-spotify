import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Music2, Waves, Headphones, Disc, Radio, Mic, Guitar } from 'lucide-react'
import Button from '../components/Button'

const Login = () => {
  const { login, loading, error } = useAuth()
  const [animate, setAnimate] = useState(false)
  const [particles, setParticles] = useState([])

  useEffect(() => {
    setAnimate(true)
    generateParticles()
  }, [])

  const generateParticles = () => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3
    }))
    setParticles(newParticles)
  }

  const handleSpotifyLogin = async () => {
    try {
      await login()
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const icons = [Music2, Headphones, Disc, Radio, Mic, Guitar]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Partículas flutuantes */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDuration: `${particle.speed}s`
          }}
        />
      ))}

      {/* Background com ondas */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="max-w-md w-full">
          {/* Logo e título */}
          <div className="text-center mb-12">
            <div className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-6 transform transition-all duration-1000 ${animate ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
              <Music2 className="w-12 h-12 text-white" />
            </div>
            
            <h1 className={`text-5xl font-bold bg-gradient-to-r from-green-400 via-green-500 to-green-600 bg-clip-text text-transparent mb-4 transform transition-all duration-1000 delay-300 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              My Universe
            </h1>
            
            <p className={`text-xl text-gray-300 mb-2 transform transition-all duration-1000 delay-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              Descubra seu universo musical
            </p>
            
            <p className={`text-gray-400 transform transition-all duration-1000 delay-700 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              Conecte-se com o Spotify e explore suas estatísticas
            </p>
          </div>

          {/* Card de login */}
          <div className={`bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl transform transition-all duration-1000 delay-1000 ${animate ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">
                Bem-vindo de volta
              </h2>
              <p className="text-gray-400">
                Faça login para continuar sua jornada musical
              </p>
            </div>

            {/* Botão de login do Spotify */}
            <Button
              onClick={handleSpotifyLogin}
              disabled={loading}
              className={`w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-xl text-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                  Conectando...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  {/* SVG do logo do Spotify */}
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="12" fill="#1DB954" />
                    <path d="M17.25 16.13c-.38 0-.62-.12-.87-.25-2.37-1.37-5.37-1.5-7.5-.87-.37.12-.75.25-1.12.25-.5 0-.87-.37-.87-.87 0-.5.25-.87.75-1 2.62-.75 6.12-.62 8.87.87.37.25.62.5.62.87 0 .5-.37.87-.88.87zm1.12-2.5c-.5 0-.75-.25-1.12-.37-2.75-1.62-7.12-2-10.12-1.12-.5.12-1 .25-1.37.25-.62 0-1-.37-1-.87 0-.5.25-.87.75-1 3.5-.87 8.37-.5 11.62 1.25.37.25.62.5.62.87 0 .5-.37.87-.88.87zm1.13-2.62c-.5 0-.87-.12-1.25-.37-3.12-1.87-8.25-2.12-11.25-1.12-.5.12-1 .25-1.5.25-.62 0-1-.37-1-.87 0-.5.25-.87.75-1 3.62-1 9.12-.75 12.62 1.25.37.25.62.5.62.87 0 .5-.37.87-.88.87z" fill="#fff"/>
                  </svg>
                  Conectar com Spotify
                </div>
              )}
            </Button>

            {/* Mensagem de erro */}
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Informações adicionais */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Ao fazer login, você concorda com nossos{' '}
                <a href="#" className="text-green-400 hover:text-green-300 underline">
                  Termos de Serviço
                </a>
              </p>
            </div>
          </div>

          {/* Recursos destacados */}
          <div className={`mt-12 grid grid-cols-2 gap-4 transform transition-all duration-1000 delay-1200 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            {icons.map((Icon, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105 group"
              >
                                 <Icon className="w-8 h-8 text-green-400 mx-auto mb-2 group-hover:text-green-300 transition-colors" />
                <p className="text-gray-300 text-sm font-medium">
                  {['Músicas', 'Playlists', 'Artistas', 'Rádio', 'Podcasts', 'Shows'][index]}
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className={`mt-12 text-center transform transition-all duration-1000 delay-1400 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <p className="text-gray-500 text-sm">
              © 2024 My Universe Spotify. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>

      {/* Elementos decorativos flutuantes */}
      <div className="absolute top-20 left-10 opacity-20 animate-bounce" style={{ animationDelay: '0.5s' }}>
                       <Waves className="w-8 h-8 text-green-400" />
      </div>
      
      <div className="absolute top-40 right-20 opacity-20 animate-bounce" style={{ animationDelay: '1s' }}>
                       <Headphones className="w-6 h-6 text-green-400" />
      </div>
      
      <div className="absolute bottom-40 left-20 opacity-20 animate-bounce" style={{ animationDelay: '1.5s' }}>
                       <Disc className="w-8 h-8 text-green-400" />
      </div>
      
      <div className="absolute bottom-20 right-10 opacity-20 animate-bounce" style={{ animationDelay: '2s' }}>
                       <Radio className="w-6 h-6 text-green-400" />
      </div>

      {/* Linhas de conexão */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(147, 51, 234, 0.3)" />
            <stop offset="100%" stopColor="rgba(236, 72, 153, 0.3)" />
          </linearGradient>
        </defs>
        
        {/* Linhas diagonais */}
        <line
          x1="0"
          y1="100"
          x2="100"
          y2="0"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          opacity="0.1"
        />
        <line
          x1="100"
          y1="100"
          x2="0"
          y2="0"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          opacity="0.1"
        />
      </svg>

      {/* Efeito de brilho no fundo */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-pulse" style={{ animationDuration: '4s' }} />
    </div>
  )
}

export default Login
