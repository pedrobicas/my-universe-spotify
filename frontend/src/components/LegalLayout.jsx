import { ArrowLeft, Music2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const LegalLayout = ({ eyebrow, title, intro, children }) => {
  const navigate = useNavigate()
  return (
    <div className="legal-page">
      <header className="legal-topbar"><button onClick={() => navigate(-1)}><ArrowLeft size={16} /> Voltar</button><span><Music2 size={16} /> MY UNIVERSE</span></header>
      <main className="legal-shell">
        <div className="legal-intro"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{intro}</p><small>Última revisão: 07/10/2026</small></div>
        <article className="legal-document">{children}</article>
      </main>
    </div>
  )
}

export default LegalLayout
