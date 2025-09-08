import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../contexts/SettingsContext';
import {
  User,
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Music,
  Volume2,
  Download,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Globe,
  Save,
  ArrowLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Upload,
  FileDown,
  RotateCcw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const { 
    settings, 
    updateSetting, 
    saveSettings, 
    resetSettings, 
    clearCache, 
    getStorageUsage, 
    exportSettings, 
    importSettings,
    isLoading,
    error,
    setError
  } = useSettings();
  
  const [activeTab, setActiveTab] = useState('account');
  const [savedMessage, setSavedMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef(null);
  const [storageUsage, setStorageUsage] = useState(getStorageUsage());

  const tabs = [
    { id: 'account', name: 'Conta', icon: User },
    { id: 'interface', name: 'Interface', icon: Palette },
    { id: 'application', name: 'Aplicação', icon: SettingsIcon },
    { id: 'privacy', name: 'Privacidade', icon: Shield }
  ];

  const handleSave = async () => {
    try {
      const result = await saveSettings();
      if (result.success) {
        setSavedMessage(result.message);
        setTimeout(() => setSavedMessage(''), 3000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setError('Erro inesperado ao salvar configurações');
    }
  };

  const handleReset = async () => {
    try {
      resetSettings();
      setSavedMessage('Configurações restauradas para o padrão!');
      setTimeout(() => setSavedMessage(''), 3000);
      setShowResetConfirm(false);
    } catch (error) {
      console.error('Erro ao resetar configurações:', error);
      setError('Erro ao resetar configurações');
    }
  };

  const handleClearCache = async () => {
    try {
      const result = await clearCache();
      if (result.success) {
        setSavedMessage(result.message);
        setStorageUsage(getStorageUsage());
        setTimeout(() => setSavedMessage(''), 3000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      setError('Erro ao limpar cache');
    }
  };

  const handleExport = () => {
    try {
      const result = exportSettings();
      if (result.success) {
        setSavedMessage(result.message);
        setTimeout(() => setSavedMessage(''), 3000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Erro ao exportar configurações:', error);
      setError('Erro ao exportar configurações');
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const result = await importSettings(file);
        if (result.success) {
          setSavedMessage(result.message);
          setTimeout(() => setSavedMessage(''), 3000);
        } else {
          setError(result.message);
        }
      } catch (error) {
        console.error('Erro ao importar configurações:', error);
        setError('Erro ao importar configurações');
      }
    }
    event.target.value = '';
  };

  const handleDeleteAccount = () => {
    alert('Funcionalidade de exclusão de conta não implementada nesta demo');
    setShowDeleteConfirm(false);
  };

  const renderAccountTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-green-600/20 to-green-400/20 border border-green-400/30 rounded-xl">
        {user?.images?.[0]?.url ? (
          <img
            src={user.images[0].url}
            alt={user.display_name}
            className="w-16 h-16 rounded-full border-2 border-green-400"
          />
        ) : (
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold text-white">{user?.display_name}</h3>
          <p className="text-green-400">{user?.email}</p>
          <p className="text-gray-400 text-sm">Conectado via Spotify</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nome de exibição
          </label>
          <input
            type="text"
            value={settings.displayName}
            onChange={(e) => updateSetting('displayName', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={settings.email}
            disabled
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
        </div>

        <div className="flex items-center justify-between p-4 bg-red-600/10 border border-red-400/30 rounded-lg">
          <div>
            <h4 className="font-medium text-red-400">Zona de Perigo</h4>
            <p className="text-sm text-gray-400">Ações irreversíveis</p>
          </div>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir Conta</span>
          </button>
        </div>

        {/* Modal de confirmação de exclusão */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-red-400/30 rounded-xl p-6 max-w-md mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <h3 className="text-lg font-semibold text-red-400">Confirmar Exclusão</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderInterfaceTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Aparência e Interface</h3>
      <div className="space-y-4">
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              {settings.darkMode ? <Moon className="w-5 h-5 text-gray-400" /> : <Sun className="w-5 h-5 text-gray-400" />}
              <div>
                <p className="text-gray-300">Modo Escuro</p>
                <p className="text-sm text-gray-500">Tema escuro para melhor visualização</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => updateSetting('darkMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Monitor className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-gray-300">Visualização Compacta</p>
                <p className="text-sm text-gray-500">Mostrar mais conteúdo na tela</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.compactView}
                onChange={(e) => updateSetting('compactView', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <Globe className="w-5 h-5 text-gray-400" />
            <p className="text-gray-300">Idioma</p>
          </div>
          <select
            value={settings.language}
            onChange={(e) => updateSetting('language', e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-colors"
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English (US)</option>
            <option value="es-ES">Español</option>
            <option value="fr-FR">Français</option>
          </select>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Monitor className="w-5 h-5 text-gray-400" />
              <p className="text-gray-300">Tamanho da Fonte</p>
            </div>
            <span className="text-green-400">{settings.fontSize}px</span>
          </div>
          <input
            type="range"
            min="12"
            max="20"
            value={settings.fontSize}
            onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Pequena</span>
            <span>Média</span>
            <span>Grande</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApplicationTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Configurações da Aplicação</h3>
      <div className="space-y-4">
        {[
          { 
            key: 'autoSave', 
            label: 'Salvamento Automático', 
            desc: 'Salvar configurações automaticamente',
            icon: Save
          },
          { 
            key: 'showMiniPlayer', 
            label: 'Mini Player', 
            desc: 'Mostrar player flutuante na interface',
            icon: Smartphone
          },
          { 
            key: 'animationsEnabled', 
            label: 'Animações', 
            desc: 'Ativar animações e transições na interface',
            icon: RefreshCw
          },
          { 
            key: 'highContrastMode', 
            label: 'Alto Contraste', 
            desc: 'Modo de alto contraste para melhor acessibilidade',
            icon: Eye
          },
          { 
            key: 'browserNotifications', 
            label: 'Notificações do Navegador', 
            desc: 'Permitir notificações do navegador',
            icon: Bell
          },
          { 
            key: 'soundNotifications', 
            label: 'Sons de Notificação', 
            desc: 'Reproduzir sons para notificações',
            icon: Volume2
          }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-300">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[item.key]}
                  onChange={(e) => updateSetting(item.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          );
        })}

        <div className="p-4 bg-blue-600/10 border border-blue-400/30 rounded-lg">
          <h4 className="font-medium text-blue-400 mb-2">Armazenamento Local</h4>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Cache da Aplicação</span>
            <span className="text-white">{storageUsage.totalSizeMB} MB</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Itens Salvos</span>
            <span className="text-white">{storageUsage.itemCount}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min((parseFloat(storageUsage.totalSizeMB) / 10) * 100, 100)}%` }}
            ></div>
          </div>
          <button 
            onClick={handleClearCache}
            disabled={isLoading}
            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Limpar Cache</span>
          </button>
        </div>

        {/* Demo das funcionalidades */}
        <div className="p-4 bg-green-600/10 border border-green-400/30 rounded-lg">
          <h4 className="font-medium text-green-400 mb-3">✨ Prévia das Configurações</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Mini Player:</span>
              <span className={settings.showMiniPlayer ? "text-green-400" : "text-red-400"}>
                {settings.showMiniPlayer ? "Visível" : "Oculto"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Animações:</span>
              <span className={settings.animationsEnabled ? "text-green-400" : "text-red-400"}>
                {settings.animationsEnabled ? "Ativadas" : "Desativadas"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Alto Contraste:</span>
              <span className={settings.highContrastMode ? "text-green-400" : "text-red-400"}>
                {settings.highContrastMode ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Privacidade Local</h3>
      <div className="space-y-4">
        <div className="p-4 bg-yellow-600/10 border border-yellow-400/30 rounded-lg">
          <h4 className="font-medium text-yellow-400 mb-2">ℹ️ Apenas Configurações Locais</h4>
          <p className="text-sm text-gray-400">
            Estas configurações afetam apenas esta aplicação, não sua conta do Spotify
          </p>
        </div>

        {[
          { 
            key: 'saveHistory', 
            label: 'Salvar Histórico Local', 
            desc: 'Manter histórico de reprodução na aplicação'
          },
          { 
            key: 'shareActivity', 
            label: 'Compartilhar Atividade', 
            desc: 'Permitir que outros vejam sua atividade na aplicação'
          }
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-gray-300">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings[item.key]}
                onChange={(e) => updateSetting(item.key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        ))}

        <div className="p-4 bg-green-600/10 border border-green-400/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="w-5 h-5 text-green-400" />
            <h4 className="font-medium text-green-400">Dados Coletados</h4>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            Esta aplicação coleta apenas dados necessários para seu funcionamento:
          </p>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Configurações de interface</li>
            <li>• Histórico de reprodução local</li>
            <li>• Preferências da aplicação</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account': return renderAccountTab();
      case 'interface': return renderInterfaceTab();
      case 'application': return renderApplicationTab();
      case 'privacy': return renderPrivacyTab();
      default: return renderAccountTab();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
                  Configurações
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">Personalize sua experiência musical</p>
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-2">
              <button
                onClick={handleExport}
                className="flex items-center justify-center xs:justify-start space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                title="Exportar configurações"
              >
                <FileDown className="w-4 h-4" />
                <span className="xs:hidden sm:block">Exportar</span>
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center xs:justify-start space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                title="Importar configurações"
              >
                <Upload className="w-4 h-4" />
                <span className="xs:hidden sm:block">Importar</span>
              </button>
              
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center justify-center xs:justify-start space-x-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm"
                title="Resetar configurações"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="xs:hidden sm:block">Resetar</span>
              </button>
            </div>
          </div>
          
          {savedMessage && (
            <div className="flex items-center space-x-2 p-3 bg-green-600/20 border border-green-400/30 rounded-lg text-green-400 text-sm mb-4">
              <CheckCircle className="w-4 h-4" />
              <span>{savedMessage}</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-600/20 border border-red-400/30 rounded-lg text-red-400 text-sm mb-4">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Modal de confirmação de reset */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-yellow-400/30 rounded-xl p-6 max-w-md mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <RotateCcw className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold text-yellow-400">Resetar Configurações</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Todas as configurações serão restauradas para os valores padrão. Esta ação não pode ser desfeita.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Sidebar com tabs */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/30 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-4 lg:sticky lg:top-6">
              <nav className="space-y-1 sm:space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-left transition-all duration-200 text-sm sm:text-base ${
                        activeTab === tab.id
                          ? 'bg-green-600/20 text-green-400 border border-green-400/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="font-medium">{tab.name}</span>
                      <ChevronRight className={`w-4 h-4 ml-auto transition-transform flex-shrink-0 ${
                        activeTab === tab.id ? 'rotate-90' : ''
                      }`} />
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800/30 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6">
              {renderTabContent()}
              
              {/* Botão de salvar */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  <span>{isLoading ? 'Salvando...' : 'Salvar Configurações'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estilos CSS personalizados */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #065f46;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #065f46;
        }
      `}</style>
    </div>
  );
};

export default Settings;
