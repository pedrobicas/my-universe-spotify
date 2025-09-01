import React from 'react'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  className = '', 
  onClick, 
  type = 'button',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed '
  
  const variants = {
    primary: 'bg-green-500/90 text-white hover:bg-green-500 border border-green-400/30 hover:border-green-400/50 shadow-lg hover:shadow-xl hover:shadow-green-500/25 backdrop-blur-sm hover:scale-105',
    secondary: 'bg-white/5 text-white border border-white/20 hover:bg-white/10 hover:border-white/30 backdrop-blur-sm hover:scale-105',
    success: 'bg-green-500/90 text-white hover:bg-green-500 border border-green-400/30 hover:border-green-400/50 shadow-lg hover:shadow-xl hover:shadow-green-500/25 backdrop-blur-sm hover:scale-105',
    danger: 'bg-red-500/90 text-white hover:bg-red-500 border border-red-400/30 hover:border-red-400/50 shadow-lg hover:shadow-xl hover:shadow-red-500/25 backdrop-blur-sm hover:scale-105',
    warning: 'bg-yellow-500/90 text-white hover:bg-yellow-500 border border-yellow-400/30 hover:border-yellow-400/50 shadow-lg hover:shadow-xl hover:shadow-yellow-500/25 backdrop-blur-sm hover:scale-105',
    info: 'bg-blue-500/90 text-white hover:bg-blue-500 border border-blue-400/30 hover:border-blue-400/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 backdrop-blur-sm hover:scale-105',
    ghost: 'bg-transparent hover:bg-white/5 text-white border border-white/10 hover:border-white/20 backdrop-blur-sm hover:scale-105',
    outline: 'bg-transparent text-white border-2 border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50 backdrop-blur-sm hover:scale-105'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-2xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
    xl: 'px-10 py-5 text-xl rounded-3xl'
  }
  
  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button 
      className={`${baseClasses} ${variants[variant] || ''} ${sizes[size] || sizes.md} ${widthClass} ${className}`}
      onClick={onClick} 
      disabled={disabled} 
      type={type} 
      {...props}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>Carregando...</span>
        </div>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="mr-2">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="ml-2">{icon}</span>
          )}
        </>
      )}
    </button>
  )
}

export default Button
