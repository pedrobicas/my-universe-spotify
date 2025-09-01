import React from 'react'

const Card = ({ children, className = '', onClick, hover = true, glassmorphism = true, ...props }) => {
  const baseClasses = `
    relative overflow-hidden transition-all duration-500 ease-out
    ${glassmorphism ? 'backdrop-blur-xl bg-white/5 border border-white/10' : 'bg-gray-900/90'}
    ${hover ? 'hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-500/30' : ''}
    ${onClick ? 'cursor-pointer' : ''}
  `

  const glassmorphismClasses = glassmorphism ? `
    before:absolute before:inset-0 before:bg-gradient-to-br before:from-green-500/5 before:via-transparent before:to-green-500/5 before:opacity-0 before:transition-opacity before:duration-500
    hover:before:opacity-100
  ` : ''

  return (
    <div
      className={`${baseClasses} ${glassmorphismClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {/* Efeito de brilho sutil no hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/3 via-transparent to-green-500/3 opacity-0 hover:opacity-100 transition-opacity duration-500" />
      
      {/* Conteúdo principal */}
      <div className="relative z-10 p-6">
        {children}
      </div>

      {/* Borda de brilho sutil no hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 via-green-500/5 to-green-500/10 blur-sm" />
      </div>

      {/* Partículas decorativas sutis */}
      <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-green-400/20 rounded-full animate-pulse" />
      <div className="absolute bottom-3 left-3 w-1 h-1 bg-green-400/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
    </div>
  )
}

export default Card
