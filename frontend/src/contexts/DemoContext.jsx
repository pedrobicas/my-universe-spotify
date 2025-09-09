import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import demoAPI from '../services/demoAPI'

const DemoContext = createContext()

export const useDemo = () => {
  const context = useContext(DemoContext)
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider')
  }
  return context
}

export const DemoProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    return localStorage.getItem('spotify_demo_mode') === 'true'
  })
  const [showDemoDialog, setShowDemoDialog] = useState(false)

  // Verificar se deve ativar modo demo automaticamente
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const demoParam = urlParams.get('demo')
    
    if (demoParam === 'true') {
      enableDemoMode()
    }
  }, [])

  const enableDemoMode = () => {
    setIsDemoMode(true)
    localStorage.setItem('spotify_demo_mode', 'true')
    
    // Importar os dados demo e atualizar o localStorage
    import('../data/demoData').then(({ demoUser }) => {
      localStorage.setItem('spotify_demo_user', JSON.stringify(demoUser))
    })
    
    console.log('🎵 Modo Demo Ativado - Usando dados simulados')
  }

  const disableDemoMode = () => {
    setIsDemoMode(false)
    localStorage.removeItem('spotify_demo_mode')
    localStorage.removeItem('spotify_demo_user')
    console.log('🎵 Modo Demo Desativado - Voltando ao Spotify real')
  }

  const toggleDemoMode = () => {
    if (isDemoMode) {
      disableDemoMode()
    } else {
      enableDemoMode()
    }
  }

  // Retornar a API apropriada baseada no modo
  const getAPI = () => {
    return isDemoMode ? demoAPI : api
  }

  const value = {
    isDemoMode,
    enableDemoMode,
    disableDemoMode,
    toggleDemoMode,
    getAPI,
    showDemoDialog,
    setShowDemoDialog
  }

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  )
}

export default DemoContext
