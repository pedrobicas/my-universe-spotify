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
  const baseClasses = 'px-4 py-2 rounded transition-colors duration-200 '
  const variants = {
    primary: 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl hover:shadow-green-500/25',
    secondary: 'bg-transparent border border-green-500 text-green-500 hover:bg-green-500 hover:text-white',
    success: 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl hover:shadow-green-500/25',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl hover:shadow-red-500/25',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg hover:shadow-xl hover:shadow-yellow-500/25',
    info: 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl hover:shadow-green-500/25',
    ghost: 'bg-transparent hover:bg-green-500/10 text-white border border-green-500/20 hover:border-green-500/30',
    outline: 'bg-transparent text-white border-2 border-green-500/20 hover:bg-green-500/10 hover:border-green-500/30'
  }
  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button 
      className={`${baseClasses} ${variants[variant] || ''} ${widthClass} ${className}`}
      onClick={onClick} 
      disabled={disabled} 
      type={type} 
      {...props}
    >
      {loading ? 'Carregando...' : children}
    </button>
  )
}

export default Button
