import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [settings, setSettings] = useState({
    displayName: '',
    email: '',
    
    darkMode: true,
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
    shareActivity: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('myUniverse_settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings(prevSettings => ({
            ...prevSettings,
            ...parsed,
            displayName: user?.display_name || parsed.displayName || '',
            email: user?.email || parsed.email || ''
          }));
        } else if (user) {
          setSettings(prevSettings => ({
            ...prevSettings,
            displayName: user.display_name || '',
            email: user.email || ''
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        setError('Erro ao carregar configurações');
      }
    };

    loadSettings();
  }, [user]);

  useEffect(() => {
    if (settings.displayName || settings.email) {
      try {
        localStorage.setItem('myUniverse_settings', JSON.stringify(settings));
      } catch (error) {
        console.error('Erro ao salvar configurações:', error);
      }
    }
  }, [settings]);

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#000000';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
    }
  }, [settings.darkMode]);

  useEffect(() => {
    document.documentElement.lang = settings.language.split('-')[0];
  }, [settings.language]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${settings.fontSize}px`;
  }, [settings.fontSize]);

  useEffect(() => {
    if (settings.compactView) {
      document.body.classList.add('compact-view');
    } else {
      document.body.classList.remove('compact-view');
    }
  }, [settings.compactView]);

  useEffect(() => {
    if (settings.animationsEnabled) {
      document.body.classList.remove('no-animations');
    } else {
      document.body.classList.add('no-animations');
    }
  }, [settings.animationsEnabled]);

  useEffect(() => {
    if (settings.highContrastMode) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [settings.highContrastMode]);

  const updateSetting = (key, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value
    }));
  };

  const updateMultipleSettings = (newSettings) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };

  const saveSettings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('myUniverse_settings', JSON.stringify(settings));
    
      
      return { success: true, message: 'Configurações salvas com sucesso!' };
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setError('Erro ao salvar configurações');
      return { success: false, message: 'Erro ao salvar configurações' };
    } finally {
      setIsLoading(false);
    }
  };

  const resetSettings = () => {
    const defaultSettings = {
      displayName: user?.display_name || '',
      email: user?.email || '',
      darkMode: true,
      compactView: false,
      language: 'pt-BR',
      fontSize: 16,
      autoSave: true,
      showLyrics: true,
      showMiniPlayer: true,
      animationsEnabled: true,
      highContrastMode: false,
      browserNotifications: true,
      soundNotifications: false,
      saveHistory: true,
      shareActivity: false
    };
    
    setSettings(defaultSettings);
    localStorage.setItem('myUniverse_settings', JSON.stringify(defaultSettings));
  };

  const clearCache = async () => {
    setIsLoading(true);
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('spotify_') || key.startsWith('music_cache_'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
  
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return { success: true, message: 'Cache limpo com sucesso!' };
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      return { success: false, message: 'Erro ao limpar cache' };
    } finally {
      setIsLoading(false);
    }
  };

  const getStorageUsage = () => {
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
        }
      }
      
      const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
      return {
        totalSizeMB: sizeMB,
        totalSizeBytes: totalSize,
        itemCount: Object.keys(localStorage).length
      };
    } catch (error) {
      console.error('Erro ao calcular uso de armazenamento:', error);
      return { totalSizeMB: '0.00', totalSizeBytes: 0, itemCount: 0 };
    }
  };

  const exportSettings = () => {
    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `myuniverse-settings-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      return { success: true, message: 'Configurações exportadas com sucesso!' };
    } catch (error) {
      console.error('Erro ao exportar configurações:', error);
      return { success: false, message: 'Erro ao exportar configurações' };
    }
  };

  const importSettings = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          
          const validKeys = Object.keys(settings);
          const filteredSettings = {};
          
          for (const key of validKeys) {
            if (importedSettings.hasOwnProperty(key)) {
              filteredSettings[key] = importedSettings[key];
            }
          }
          
          filteredSettings.displayName = user?.display_name || settings.displayName;
          filteredSettings.email = user?.email || settings.email;
          
          setSettings(prevSettings => ({
            ...prevSettings,
            ...filteredSettings
          }));
          
          resolve({ success: true, message: 'Configurações importadas com sucesso!' });
        } catch (error) {
          console.error('Erro ao importar configurações:', error);
          resolve({ success: false, message: 'Arquivo de configurações inválido' });
        }
      };
      reader.readAsText(file);
    });
  };

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
    setError
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
