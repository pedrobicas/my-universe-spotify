import React from 'react'

const Card = ({ children, className = '', onClick, hover = true, glassmorphism = true, ...props }) => {
  const baseClasses = `
    relative overflow-hidden transition-all duration-300 ease-out
    ${glassmorphism ? 'backdrop-blur-xl bg-black/20 border border-white/10' : 'bg-gray-900/90'}
    ${hover ? 'hover:scale-[1.02] hover:shadow-2xl hover:border-white/20' : ''}
    ${onClick ? 'cursor-pointer' : ''}
  `

  const glassmorphismClasses = glassmorphism ? `
    before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300
    hover:before:opacity-100
    after:absolute after:inset-0 after:bg-gradient-to-br after:from-green-500/10 after:via-transparent after:to-green-500/10 after:opacity-0 after:transition-opacity after:duration-300
    hover:after:opacity-100
  ` : ''

  return (
    <div
      className={`${baseClasses} ${glassmorphismClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {/* Efeito de brilho interno */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      {/* Conteúdo principal */}
      <div className="relative z-10 p-6">
        {children}
      </div>

      {/* Borda de brilho no hover */}
      <div className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500/20 via-green-500/20 to-green-500/20 blur-sm" />
      </div>

      {/* Partículas decorativas */}
      <div className="absolute top-2 right-2 w-2 h-2 bg-green-400/30 rounded-full animate-pulse" />
      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-green-400/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-1/2 right-3 w-1 h-1 bg-green-400/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  )
}

export default Card
