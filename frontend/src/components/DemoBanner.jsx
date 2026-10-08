import { FlaskConical } from 'lucide-react'
import { useDemo } from '../contexts/DemoContext'

const DemoBanner = () => {
  const { isDemoMode } = useDemo()
  if (!isDemoMode) return null

  return (
    <div className="demo-ribbon" role="status">
      <FlaskConical size={14} />
      <span>Demo</span>
      <span className="demo-ribbon-separator">•</span>
      <span>dados simulados</span>
    </div>
  )
}

export default DemoBanner
