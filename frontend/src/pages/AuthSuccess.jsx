import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/Loading';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const expiresIn = searchParams.get('expires_in');

      if (accessToken && refreshToken) {
        // Salvar tokens no localStorage
        localStorage.setItem('spotify_access_token', accessToken);
        localStorage.setItem('spotify_refresh_token', refreshToken);
        localStorage.setItem('spotify_expires_at', 
          Date.now() + (parseInt(expiresIn) * 1000)
        );

        // Atualizar o contexto de autenticação
        await login();

        // Limpar a URL e redirecionar
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login?error=auth_failed', { replace: true });
      }
    };

    handleAuthSuccess();
  }, [searchParams, navigate, login]);

  return <Loading />;
};

export default AuthSuccess;
