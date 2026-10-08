import { AlertCircle, ArrowRight, Music2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { demoTopTracks } from '../data/demoData'

const Login = () => {
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
  const [urlError, setUrlError] = useState('')
  const demoOnly = import.meta.env.VITE_DEMO_ONLY === 'true'

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')
    const message = params.get('message')
    if (errorParam === 'user_not_authorized') setUrlError('Esta conta ainda não foi autorizada para acessar a aplicação.')
    else if (errorParam === 'invalid_oauth_state') setUrlError('A sessão de login expirou ou não pôde ser validada. Inicie a conexão novamente.')
    else if (errorParam === 'missing_authorization_code') setUrlError('O Spotify não retornou a autorização necessária. Tente conectar novamente.')
    else if (errorParam === 'session_expired') setUrlError('Sua sessão expirou. Conecte sua conta novamente.')
    else if (errorParam === 'access_denied') setUrlError('O acesso ao Spotify foi cancelado.')
    else if (errorParam === 'auth_failed') setUrlError('Não foi possível concluir a autenticação. Tente novamente.')
    else if (message) setUrlError(decodeURIComponent(message))
  }, [])

  const artwork = useMemo(() => {
    const images = demoTopTracks.map((track) => track.album?.images?.[0]?.url).filter(Boolean)
    return [...images.slice(0, 6), ...images.slice(0, 3)]
  }, [])

  const handleSpotifyLogin = async () => {
    try {
      await login()
    } catch (loginError) {
      console.error('Login failed:', loginError)
    }
  }

  return (
    <div className="login-page">
      <section className="login-visual" aria-hidden="true">
        <div className="login-collage">
          {artwork.map((src, index) => <img key={`${src}-${index}`} src={src} alt="" />)}
        </div>
        <div className="login-brand"><i><Music2 size={18} /></i><span>MY UNIVERSE</span></div>
        <div className="login-visual-copy">
          <span>Seu Spotify, lido de outro jeito</span>
          <h1>O som que você repete diz muito.</h1>
          <p>Rankings, hábitos, artistas e descoberta musical em uma interface feita para colocar sua biblioteca — não o dashboard — no centro.</p>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <span>ENTRAR</span>
          <h2>Conecte sua conta.</h2>
          <p>Usamos seus dados do Spotify para montar a experiência. Você pode entrar no modo demo sem conectar nada.</p>

          {!demoOnly && (
            <>
              <button className="login-action login-action--spotify" onClick={handleSpotifyLogin} disabled={loading}>
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.58 14.42a.62.62 0 0 1-.85.2c-2.34-1.43-5.29-1.75-8.76-.96a.62.62 0 0 1-.28-1.2c3.8-.87 7.06-.5 9.69 1.1.29.18.38.56.2.86Zm1.22-2.72a.77.77 0 0 1-1.06.25c-2.68-1.65-6.77-2.12-9.94-1.16a.77.77 0 1 1-.45-1.48c3.63-1.1 8.13-.57 11.2 1.32.36.22.47.7.25 1.07Zm.1-2.83C14.68 8.96 9.38 8.78 6.3 9.7a.93.93 0 1 1-.53-1.78c3.54-1.06 9.4-.84 13.08 1.34a.93.93 0 0 1-.95 1.6Z" />
                </svg>
                {loading ? 'Conectando…' : 'Continuar com Spotify'}
              </button>
              <div className="login-divider">ou</div>
            </>
          )}

          <button className="login-action login-action--demo" onClick={() => navigate('/demo-login')}>
            Explorar a demonstração <ArrowRight size={17} />
          </button>

          <div className="login-note">
            {demoOnly
              ? 'O login real está desabilitado nesta implantação. A demonstração mantém a experiência completa com dados simulados.'
              : 'O modo demo não exige conta do Spotify e não envia dados pessoais.'}
          </div>

          {(error || urlError) && (
            <div className="login-error"><AlertCircle size={16} /><span>{urlError || error}</span></div>
          )}

          <div className="login-links"><Link to="/privacy">Privacidade</Link><Link to="/terms">Termos</Link></div>
        </div>
      </section>
    </div>
  )
}

export default Login
