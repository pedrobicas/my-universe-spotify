import { ArrowLeft, ArrowRight, BarChart3, Library, Music2, PlayCircle } from 'lucide-react'
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
    { icon: BarChart3, title: 'Dashboard', text: 'Top faixas, artistas e histórico usando um conjunto de dados coerente.' },
    { icon: Library, title: 'Biblioteca', text: 'Abra playlists, edite informações e reorganize faixas.' },
    { icon: PlayCircle, title: 'Player', text: 'Teste fila, play/pause e troca de faixas direto no navegador.' },
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
          <div className="demo-preview-copy"><span>BIBLIOTECA FICTÍCIA</span><strong>Uma sessão pronta para você mexer no produto.</strong></div>
        </section>

        <section className="demo-login-content">
          <span className="eyebrow">DEMONSTRAÇÃO</span>
          <h1>Entre e mexa no produto.</h1>
          <p>A demo carrega uma biblioteca fictícia local para testar dashboard, playlists, descoberta e player sem autenticar no Spotify.</p>

          <div className="demo-feature-list">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title}><i><Icon size={18} /></i><span><strong>{title}</strong><small>{text}</small></span></div>
            ))}
          </div>

          <button className="demo-enter" onClick={enterDemo}>Abrir demonstração <ArrowRight size={17} /></button>
          <small className="demo-disclaimer">Nada aqui pertence a uma conta real. Alterações na biblioteca ficam apenas nesta sessão do navegador.</small>
        </section>
      </div>
    </div>
  )
}

export default DemoLogin
