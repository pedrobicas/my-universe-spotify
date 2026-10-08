import { ArrowLeft, ArrowRight, BarChart3, Compass, Library, Music2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDemo } from '../contexts/DemoContext'
import { useAuth } from '../hooks/useAuth'
import { demoTopTracks, demoUser } from '../data/demoData'

const DemoLogin = () => {
  const navigate = useNavigate()
  const { enableDemoMode } = useDemo()
  const { setUser } = useAuth()

  const enterDemo = () => {
    enableDemoMode()
    setUser(demoUser)
    localStorage.setItem('spotify_demo_user', JSON.stringify(demoUser))
    navigate('/dashboard')
  }

  const features = [
    { icon: BarChart3, title: 'Visão geral', text: 'Rankings, perfil de áudio e hábitos de escuta.' },
    { icon: Library, title: 'Playlists', text: 'Biblioteca, filtros e gerenciamento de coleções.' },
    { icon: Compass, title: 'Descoberta', text: 'Recomendações, moods e combinações de gêneros.' },
  ]

  return (
    <div className="demo-login-page">
      <button className="demo-back" onClick={() => navigate('/login')}><ArrowLeft size={16} /> Login</button>
      <div className="demo-login-shell">
        <section className="demo-preview">
          <div className="demo-preview-top"><span><Music2 size={17} /> MY UNIVERSE</span><small>PREVIEW</small></div>
          <div className="demo-album-stack">
            {demoTopTracks.slice(0, 4).map((track, index) => (
              <div key={track.id} style={{ '--index': index }}><img src={track.album?.images?.[0]?.url} alt="" /></div>
            ))}
          </div>
          <div className="demo-preview-copy"><span>DADOS SIMULADOS</span><strong>Veja o produto antes de conectar sua conta.</strong></div>
        </section>

        <section className="demo-login-content">
          <span className="eyebrow">MODO DEMO</span>
          <h1>A experiência inteira. Sem login.</h1>
          <p>Entre com um perfil fictício e teste o fluxo completo do My Universe. Nenhuma informação da sua conta é necessária.</p>

          <div className="demo-feature-list">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title}><i><Icon size={18} /></i><span><strong>{title}</strong><small>{text}</small></span></div>
            ))}
          </div>

          <button className="demo-enter" onClick={enterDemo}>Entrar na demonstração <ArrowRight size={17} /></button>
          <small className="demo-disclaimer">Os dados exibidos são apenas ilustrativos e não representam um usuário real.</small>
        </section>
      </div>
    </div>
  )
}

export default DemoLogin
