import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const STORAGE_KEY = 'myUniverse_settings'
const SettingsContext = createContext(null)

const baseSettings = {
  displayName: '',
  compactView: false,
  language: 'pt-BR',
  fontSize: 16,
  autoSave: true,
  showMiniPlayer: true,
  animationsEnabled: true,
  highContrastMode: false,
  browserNotifications: true,
  soundNotifications: false,
  saveHistory: true,
  shareActivity: false,
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used within a SettingsProvider')
  return context
}

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth()
  const [settings, setSettings] = useState(baseSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      setSettings((current) => ({
        ...current,
        ...saved,
        displayName: user?.display_name || saved.displayName || current.displayName,
      }))
    } catch (loadError) {
      console.error('Settings load failed:', loadError)
      setError('Não foi possível carregar suas preferências locais.')
    }
  }, [user])

  useEffect(() => {
    if (!settings.autoSave) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (saveError) {
      console.error('Settings persistence failed:', saveError)
    }
  }, [settings])

  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.documentElement.lang = settings.language.split('-')[0]
    document.documentElement.style.fontSize = `${settings.fontSize}px`
    document.body.classList.toggle('compact-view', settings.compactView)
    document.body.classList.toggle('no-animations', !settings.animationsEnabled)
    document.body.classList.toggle('high-contrast', settings.highContrastMode)
  }, [settings.language, settings.fontSize, settings.compactView, settings.animationsEnabled, settings.highContrastMode])

  const updateSetting = (key, value) => setSettings((current) => ({ ...current, [key]: value }))
  const updateMultipleSettings = (next) => setSettings((current) => ({ ...current, ...next }))

  const saveSettings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      return { success: true, message: 'Preferências salvas.' }
    } catch (saveError) {
      console.error('Settings save failed:', saveError)
      setError('Não foi possível salvar as preferências.')
      return { success: false, message: 'Não foi possível salvar as preferências.' }
    } finally {
      setIsLoading(false)
    }
  }

  const resetSettings = () => {
    const defaults = { ...baseSettings, displayName: user?.display_name || '' }
    setSettings(defaults)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults))
  }

  const clearCache = async () => {
    setIsLoading(true)
    try {
      const keysToRemove = []
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index)
        if (key && (key.startsWith('music_cache_') || key.startsWith('myUniverse_cache_'))) keysToRemove.push(key)
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key))
      return { success: true, message: 'Cache local limpo.' }
    } catch (cacheError) {
      console.error('Cache clear failed:', cacheError)
      return { success: false, message: 'Não foi possível limpar o cache.' }
    } finally {
      setIsLoading(false)
    }
  }

  const getStorageUsage = () => {
    try {
      let totalSize = 0
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index)
        const value = key ? localStorage.getItem(key) : null
        if (value) totalSize += value.length
      }
      return {
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        totalSizeBytes: totalSize,
        itemCount: localStorage.length,
      }
    } catch (storageError) {
      console.error('Storage usage failed:', storageError)
      return { totalSizeMB: '0.00', totalSizeBytes: 0, itemCount: 0 }
    }
  }

  const exportSettings = () => {
    try {
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(settings, null, 2))}`
      const link = document.createElement('a')
      link.href = dataUri
      link.download = `my-universe-settings-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      return { success: true, message: 'Preferências exportadas.' }
    } catch (exportError) {
      console.error('Settings export failed:', exportError)
      return { success: false, message: 'Não foi possível exportar as preferências.' }
    }
  }

  const importSettings = (file) => new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result)
        const filtered = Object.fromEntries(
          Object.keys(baseSettings)
            .filter((key) => Object.prototype.hasOwnProperty.call(imported, key))
            .map((key) => [key, imported[key]])
        )
        filtered.displayName = user?.display_name || filtered.displayName || settings.displayName
        setSettings((current) => ({ ...current, ...filtered }))
        resolve({ success: true, message: 'Preferências importadas.' })
      } catch (importError) {
        console.error('Settings import failed:', importError)
        resolve({ success: false, message: 'Arquivo de preferências inválido.' })
      }
    }
    reader.readAsText(file)
  })

  const value = {
    settings,
    updateSetting,
    updateMultipleSettings,
    saveSettings,
    resetSettings,
    clearCache,
    getStorageUsage,
    exportSettings,
    importSettings,
    isLoading,
    error,
    setError,
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
