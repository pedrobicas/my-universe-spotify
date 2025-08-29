import React from 'react'
import { Music, Disc, Waves } from 'lucide-react'

const Loading = ({ size = 'md', text = 'Carregando...', showIcon = true }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      {/* Container principal com gradiente */}
      <div className="relative">
        {/* Círculo principal rotativo */}
        <div className={`${sizeClasses[size]} relative`}>
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-green-600 to-green-500 rounded-full animate-spin" />
          <div className="absolute inset-1 bg-black/90 rounded-full flex items-center justify-center">
            {showIcon && <Music className="w-1/2 h-1/2 text-white" />}
          </div>
        </div>

        {/* Círculos orbitais */}
        <div className="absolute inset-0 animate-ping">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-green-400 rounded-full" />
        </div>
        <div className="absolute inset-0 animate-ping" style={{ animationDelay: '0.5s' }}>
          <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-green-400 rounded-full" />
        </div>
        <div className="absolute inset-0 animate-ping" style={{ animationDelay: '1s' }}>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 bg-green-400 rounded-full" />
        </div>
        <div className="absolute inset-0 animate-ping" style={{ animationDelay: '1.5s' }}>
          <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-green-400 rounded-full" />
        </div>

        {/* Ondas de propagação */}
        <div className="absolute inset-0 animate-pulse">
          <div className="absolute inset-0 border-2 border-green-500/30 rounded-full animate-ping" />
        </div>
        <div className="absolute inset-0 animate-pulse" style={{ animationDelay: '0.3s' }}>
          <div className="absolute inset-0 border-2 border-green-500/30 rounded-full animate-ping" />
        </div>
        <div className="absolute inset-0 animate-pulse" style={{ animationDelay: '0.6s' }}>
          <div className="absolute inset-0 border-2 border-green-500/30 rounded-full animate-ping" />
        </div>
      </div>

      {/* Texto de loading com animação */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <span className={`${textSizes[size]} font-medium text-white animate-pulse`}>
            {text}
          </span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
        
        {/* Barra de progresso animada */}
        <div className="w-32 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-500 via-green-600 to-green-500 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Elementos decorativos flutuantes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 opacity-20 animate-bounce">
          <Disc className="w-6 h-6 text-green-400" />
        </div>
        <div className="absolute top-32 right-24 opacity-20 animate-bounce" style={{ animationDelay: '0.5s' }}>
          <Waves className="w-5 h-5 text-green-400" />
        </div>
        <div className="absolute bottom-32 left-32 opacity-20 animate-bounce" style={{ animationDelay: '1s' }}>
          <Music className="w-4 h-4 text-green-400" />
        </div>
        <div className="absolute bottom-20 right-20 opacity-20 animate-bounce" style={{ animationDelay: '1.5s' }}>
          <Disc className="w-5 h-5 text-green-400" />
        </div>
      </div>

      {/* Partículas flutuantes */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full animate-ping"
          style={{
            left: `${20 + (i * 10)}%`,
            top: `${30 + (i * 10)}%`,
            animationDelay: `${i * 0.2}s`,
            animationDuration: `${2 + (i * 0.5)}s`
          }}
        />
      ))}

      {/* Efeito de brilho de fundo */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-pulse" style={{ animationDuration: '3s' }} />
    </div>
  )
}

export default Loading
