import { Music2 } from 'lucide-react'

const Loading = () => (
  <div className="loading-screen" role="status" aria-live="polite">
    <div className="loading-mark">
      <span className="loading-pulse"><Music2 size={16} /></span>
      <span>Carregando sua biblioteca…</span>
    </div>
  </div>
)

export default Loading
