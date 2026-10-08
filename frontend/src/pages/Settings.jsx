import { Check, Download, FileUp, Gauge, Languages, Monitor, RotateCcw, Save, Shield, Trash2, User } from 'lucide-react'
import { useRef, useState } from 'react'
import { useSettings } from '../contexts/SettingsContext'
import { useAuth } from '../hooks/useAuth'

const Toggle = ({ checked, onChange }) => (
  <button type="button" className={`settings-toggle${checked ? ' is-on' : ''}`} onClick={() => onChange(!checked)} role="switch" aria-checked={checked}><i /></button>
)

const Settings = () => {
  const { user } = useAuth()
  const { settings, updateSetting, saveSettings, resetSettings, clearCache, getStorageUsage, exportSettings, importSettings, isLoading, error, setError } = useSettings()
  const [activeTab, setActiveTab] = useState('interface')
  const [message, setMessage] = useState('')
  const fileRef = useRef(null)
  const storage = getStorageUsage()

  const flash = (text) => {
    setMessage(text)
    window.setTimeout(() => setMessage(''), 2600)
  }

  const handleSave = async () => {
    const result = await saveSettings()
    if (result.success) flash('Configurações salvas')
    else setError(result.message)
  }

  const handleImport = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const result = await importSettings(file)
    if (result.success) flash('Configurações importadas')
    else setError(result.message)
    event.target.value = ''
  }

  const tabs = [
    { id: 'interface', label: 'Interface', icon: Monitor },
    { id: 'application', label: 'Aplicação', icon: Gauge },
    { id: 'privacy', label: 'Privacidade', icon: Shield },
    { id: 'account', label: 'Conta', icon: User },
  ]

  return (
    <div className="page settings-page">
      <header className="page-heading settings-heading">
        <div><span className="eyebrow">PREFERÊNCIAS</span><h1>Configurações.</h1><p>Ajustes locais do My Universe neste navegador.</p></div>
        <button className="primary-round-button" onClick={handleSave} disabled={isLoading}><Save size={16} /> {isLoading ? 'Salvando…' : 'Salvar'}</button>
      </header>

      {(message || error) && <div className={`settings-toast${error ? ' is-error' : ''}`}><Check size={15} /> {error || message}</div>}

      <div className="settings-layout">
        <nav className="settings-nav">
          {tabs.map(({ id, label, icon: Icon }) => <button key={id} className={activeTab === id ? 'is-active' : ''} onClick={() => { setActiveTab(id); setError(null) }}><Icon size={17} /> {label}</button>)}
        </nav>

        <section className="settings-content content-panel">
          {activeTab === 'interface' && (
            <>
              <div className="settings-section-title"><span className="eyebrow">INTERFACE</span><h2>Como o app se comporta</h2><p>Preferências visuais aplicadas imediatamente neste dispositivo.</p></div>
              <div className="settings-list">
                <div className="setting-row"><span><strong>Visualização compacta</strong><small>Reduz espaçamentos e a altura do player.</small></span><Toggle checked={settings.compactView} onChange={(value) => updateSetting('compactView', value)} /></div>
                <div className="setting-row"><span><strong>Animações</strong><small>Transições e microinterações da interface.</small></span><Toggle checked={settings.animationsEnabled} onChange={(value) => updateSetting('animationsEnabled', value)} /></div>
                <div className="setting-row"><span><strong>Alto contraste</strong><small>Aumenta a diferença entre superfícies e texto.</small></span><Toggle checked={settings.highContrastMode} onChange={(value) => updateSetting('highContrastMode', value)} /></div>
                <div className="setting-row setting-row--stack"><span><strong>Tamanho do texto</strong><small>{settings.fontSize}px</small></span><input className="settings-range" type="range" min="14" max="20" step="1" value={settings.fontSize} onChange={(event) => updateSetting('fontSize', Number(event.target.value))} /></div>
                <div className="setting-row"><span><strong>Idioma</strong><small>Idioma preferido da interface.</small></span><label className="settings-select"><Languages size={15} /><select value={settings.language} onChange={(event) => updateSetting('language', event.target.value)}><option value="pt-BR">Português (Brasil)</option><option value="en-US">English (US)</option><option value="es-ES">Español</option></select></label></div>
              </div>
            </>
          )}

          {activeTab === 'application' && (
            <>
              <div className="settings-section-title"><span className="eyebrow">APLICAÇÃO</span><h2>Execução e armazenamento</h2><p>Controles locais para o comportamento do produto.</p></div>
              <div className="settings-list">
                <div className="setting-row"><span><strong>Player persistente</strong><small>Mantém o player global visível durante a navegação.</small></span><Toggle checked={settings.showMiniPlayer} onChange={(value) => updateSetting('showMiniPlayer', value)} /></div>
                <div className="setting-row"><span><strong>Salvar automaticamente</strong><small>Persiste preferências no navegador.</small></span><Toggle checked={settings.autoSave} onChange={(value) => updateSetting('autoSave', value)} /></div>
                <div className="setting-row"><span><strong>Armazenamento local</strong><small>{storage.totalSizeMB} MB em {storage.itemCount} itens.</small></span><button className="settings-inline-button" onClick={async () => { const result = await clearCache(); result.success ? flash('Cache limpo') : setError(result.message) }}><Trash2 size={15} /> Limpar cache</button></div>
                <div className="setting-row setting-row--actions"><span><strong>Backup das preferências</strong><small>Exporte ou importe apenas as configurações locais.</small></span><div><button className="settings-inline-button" onClick={() => { const result = exportSettings(); result.success ? flash('Arquivo exportado') : setError(result.message) }}><Download size={15} /> Exportar</button><button className="settings-inline-button" onClick={() => fileRef.current?.click()}><FileUp size={15} /> Importar</button><input ref={fileRef} type="file" accept="application/json" hidden onChange={handleImport} /></div></div>
              </div>
            </>
          )}

          {activeTab === 'privacy' && (
            <>
              <div className="settings-section-title"><span className="eyebrow">PRIVACIDADE</span><h2>O que fica salvo</h2><p>Preferências deste produto; permissões do Spotify continuam sob sua conta do Spotify.</p></div>
              <div className="settings-list">
                <div className="setting-row"><span><strong>Salvar histórico local</strong><small>Permite usar o histórico retornado para compor análises na sessão.</small></span><Toggle checked={settings.saveHistory} onChange={(value) => updateSetting('saveHistory', value)} /></div>
                <div className="setting-row"><span><strong>Compartilhar atividade</strong><small>Preferência para recursos sociais futuros.</small></span><Toggle checked={settings.shareActivity} onChange={(value) => updateSetting('shareActivity', value)} /></div>
                <div className="setting-row"><span><strong>Notificações do navegador</strong><small>Ativa avisos quando o navegador oferecer suporte.</small></span><Toggle checked={settings.browserNotifications} onChange={(value) => updateSetting('browserNotifications', value)} /></div>
              </div>
            </>
          )}

          {activeTab === 'account' && (
            <>
              <div className="settings-section-title"><span className="eyebrow">CONTA</span><h2>Conexão com o Spotify</h2><p>Informações recebidas da sua conta conectada.</p></div>
              <div className="settings-account-card"><img src={user?.images?.[0]?.url || '/default-user.svg'} alt="" /><span><strong>{user?.display_name || 'Spotify'}</strong><small>Conta conectada ao Spotify</small></span></div>
              <div className="settings-list">
                <div className="setting-row"><span><strong>Nome de exibição</strong><small>Usado apenas dentro do My Universe.</small></span><input className="settings-text" value={settings.displayName} onChange={(event) => updateSetting('displayName', event.target.value)} /></div>
                <div className="setting-row"><span><strong>Restaurar preferências</strong><small>Volta os ajustes locais ao padrão.</small></span><button className="settings-inline-button" onClick={() => { resetSettings(); flash('Preferências restauradas') }}><RotateCcw size={15} /> Restaurar</button></div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

export default Settings
