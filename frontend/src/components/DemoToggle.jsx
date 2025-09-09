import React, { useState } from 'react'
import { Play, Code, AlertCircle, X, ExternalLink } from 'lucide-react'
import { useDemo } from '../contexts/DemoContext'
import Button from './Button'

const DemoToggle = () => {
  const { isDemoMode, toggleDemoMode } = useDemo()
  const [showInfo, setShowInfo] = useState(false)

  return (
    <>
      {/* Botão Toggle */}
      <div className="fixed bottom-4 left-4 z-50">
        <div className="flex flex-col items-start space-y-2">
          {/* Botão principal */}
          <Button
            onClick={toggleDemoMode}
            className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
              isDemoMode 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30' 
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30'
            } hover:scale-105`}
          >
            <div className="flex items-center space-x-2">
              {isDemoMode ? <Code className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isDemoMode ? 'Modo Demo' : 'Modo Real'}</span>
            </div>
          </Button>

          {/* Botão de info */}
          <Button
            onClick={() => setShowInfo(true)}
            className="px-2 py-1 bg-black/50 text-white rounded text-xs hover:bg-black/70 transition-colors"
          >
            <AlertCircle className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Modal de informação */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Modos de Demonstração</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Modo Real */}
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Play className="w-4 h-4 text-green-400" />
                  <h4 className="font-semibold text-green-400">Modo Real</h4>
                </div>
                <p className="text-gray-300 text-sm">
                  Conecta com sua conta do Spotify real. Requer autenticação e 
                  permissões do desenvolvedor para novos usuários.
                </p>
              </div>

              {/* Modo Demo */}
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Code className="w-4 h-4 text-purple-400" />
                  <h4 className="font-semibold text-purple-400">Modo Demo</h4>
                </div>
                <p className="text-gray-300 text-sm">
                  Usa dados simulados para demonstrar todas as funcionalidades 
                  sem precisar de autenticação do Spotify.
                </p>
              </div>

              {/* Status atual */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-purple-400' : 'bg-green-400'}`} />
                  <span className="text-blue-400 font-medium">Status Atual</span>
                </div>
                <p className="text-gray-300 text-sm">
                  {isDemoMode 
                    ? 'Modo Demo ativo - usando dados simulados' 
                    : 'Modo Real ativo - usando API do Spotify'
                  }
                </p>
              </div>

              {/* Link para demo direto */}
              <div className="pt-2 border-t border-white/10">
                <a
                  href="?demo=true"
                  className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 text-sm transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Acessar Demo Diretamente</span>
                </a>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setShowInfo(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Entendi
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DemoToggle
