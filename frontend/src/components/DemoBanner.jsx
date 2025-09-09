import React from 'react'
import { Code, Info } from 'lucide-react'
import { useDemo } from '../contexts/DemoContext'

const DemoBanner = () => {
  const { isDemoMode } = useDemo()

  if (!isDemoMode) return null

  return (
    <div className="bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-sm border-b border-purple-400/30">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-center space-x-3">
          <Code className="w-5 h-5 text-white" />
          <span className="text-white font-medium text-sm">
            Modo Demonstração Ativo
          </span>
          <div className="flex items-center space-x-1 text-purple-100">
            <Info className="w-4 h-4" />
            <span className="text-xs">Dados simulados</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemoBanner
