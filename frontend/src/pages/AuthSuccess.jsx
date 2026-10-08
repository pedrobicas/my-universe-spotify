import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Loading from '../components/Loading'
import { useAuth } from '../hooks/useAuth'

const AuthSuccess = () => {
  const navigate = useNavigate()
  const { checkAuth } = useAuth()

  useEffect(() => {
    let active = true

    const finishLogin = async () => {
      const authenticated = await checkAuth()
      if (!active) return
      navigate(authenticated ? '/dashboard' : '/login?error=auth_failed', { replace: true })
    }

    finishLogin()
    return () => { active = false }
  }, [checkAuth, navigate])

  return <Loading />
}

export default AuthSuccess
