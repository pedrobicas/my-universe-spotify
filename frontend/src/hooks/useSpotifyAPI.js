// Hook para usar a API apropriada (real ou demo)
import { useDemo } from '../contexts/DemoContext'

export const useSpotifyAPI = () => {
  const { getAPI } = useDemo()
  return getAPI()
}

export default useSpotifyAPI
