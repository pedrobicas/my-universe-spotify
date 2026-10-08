import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import api from '../services/api'
import demoAPI from '../services/demoAPI'
import { demoUser } from '../data/demoData'

const DemoContext = createContext(null)

export const useDemo = () => {
  const context = useContext(DemoContext)
  if (!context) throw new Error('useDemo must be used within a DemoProvider')
  return context
}

export const DemoProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    const forcedByUrl = new URLSearchParams(window.location.search).get('demo') === 'true'
    return forcedByUrl || localStorage.getItem('spotify_demo_mode') === 'true'
  })
  const [showDemoDialog, setShowDemoDialog] = useState(false)

  const enableDemoMode = useCallback(() => {
    setIsDemoMode(true)
    localStorage.setItem('spotify_demo_mode', 'true')
    localStorage.setItem('spotify_demo_user', JSON.stringify(demoUser))
  }, [])

  const disableDemoMode = useCallback(() => {
    setIsDemoMode(false)
    localStorage.removeItem('spotify_demo_mode')
    localStorage.removeItem('spotify_demo_user')
  }, [])

  const toggleDemoMode = useCallback(() => {
    if (isDemoMode) disableDemoMode()
    else enableDemoMode()
  }, [disableDemoMode, enableDemoMode, isDemoMode])

  const getAPI = useCallback(() => isDemoMode ? demoAPI : api, [isDemoMode])

  const value = useMemo(() => ({
    isDemoMode,
    enableDemoMode,
    disableDemoMode,
    toggleDemoMode,
    getAPI,
    showDemoDialog,
    setShowDemoDialog,
  }), [isDemoMode, enableDemoMode, disableDemoMode, toggleDemoMode, getAPI, showDemoDialog])

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export default DemoContext
