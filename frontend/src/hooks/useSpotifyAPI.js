import { useDemo } from '../contexts/DemoContext'

export const useSpotifyAPI = () => {
  const { getAPI } = useDemo()
  return getAPI()
}

export default useSpotifyAPI
