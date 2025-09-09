const axios = require('axios');

class AuthController {
  async login(req, res) {
    try {
      const scopes = [
        'user-read-private',
        'user-read-email',
        'user-top-read',
        'playlist-read-private',
        'playlist-modify-public',
        'playlist-modify-private',
        'user-read-recently-played',
        'user-library-read',
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-follow-read'
      ].join(' ');

      const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scopes,
        redirect_uri: process.env.REDIRECT_URI,
        state: Math.random().toString(36).substring(7)
      })}`;

      res.json({ authUrl });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        error: 'Failed to generate auth URL',
        message: 'Internal server error' 
      });
    }
  }

  async callback(req, res) {
    try {
      const { code } = req.query;

      if (!code) {
        return res.status(400).json({ 
          error: 'Authorization code not provided',
          message: 'Missing authorization code' 
        });
      }

      const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', 
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: process.env.REDIRECT_URI,
          client_id: process.env.SPOTIFY_CLIENT_ID,
          client_secret: process.env.SPOTIFY_CLIENT_SECRET
        }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token, refresh_token, expires_in } = tokenResponse.data;
      if (tokenResponse.data.scope) {
        console.log('Scopes retornados pelo Spotify:', tokenResponse.data.scope);
      } else {
        console.log('Nenhum scope retornado pelo Spotify. Resposta:', tokenResponse.data);
      }

      console.log('Sending tokens to frontend...');
      
      // Redirecionar para o frontend com tokens como query params (temporariamente)
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/success?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Callback error:', error);
      
      if (error.response) {
        console.error('Spotify error response:', error.response.data);
        
        if (error.response.status === 403) {
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=user_not_authorized&message=User not authorized to access this app`);
        }
      }

      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }

  async refreshToken(req, res) {
    try {
      let refreshToken = req.body.refresh_token;
      
      if (!refreshToken) {
        refreshToken = req.cookies.spotify_refresh_token;
      }

      if (!refreshToken) {
        return res.status(401).json({ 
          error: 'Refresh token not found',
          message: 'Please login again' 
        });
      }

      const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', 
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: process.env.SPOTIFY_CLIENT_ID,
          client_secret: process.env.SPOTIFY_CLIENT_SECRET
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const { access_token, refresh_token: new_refresh_token, expires_in } = tokenResponse.data;

      res.json({ 
        access_token,
        refresh_token: new_refresh_token || refreshToken,
        expires_in
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      
      res.status(401).json({ 
        error: 'Token refresh failed',
        message: 'Please login again' 
      });
    }
  }

  async logout(req, res) {
    try {
      res.clearCookie('spotify_access_token');
      res.clearCookie('spotify_refresh_token');
      
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        error: 'Logout failed',
        message: 'Internal server error' 
      });
    }
  }

  async checkAuth(req, res) {
    try {
      console.log('Checking auth... Cookies:', Object.keys(req.cookies));
      
      let accessToken = null;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
        console.log('Access token found in Authorization header');
      } else {
        accessToken = req.cookies.spotify_access_token;
        if (accessToken) {
          console.log('Access token found in cookies');
        }
      }
      
      if (!accessToken) {
        console.log('No access token found');
        return res.status(401).json({ 
          authenticated: false,
          message: 'No access token found' 
        });
      }
      
      console.log('Access token found, length:', accessToken.length);

      const userResponse = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      res.json({ 
        authenticated: true,
        user: userResponse.data
      });
    } catch (error) {
      console.error('Auth check error:', error);
      
      if (error.response && error.response.status === 401) {
        return res.status(401).json({ 
          authenticated: false,
          message: 'Invalid token' 
        });
      }

      if (error.response && error.response.status === 403) {
        return res.status(403).json({ 
          authenticated: false,
          message: 'Access forbidden. This user is not authorized to use this app. Please add the user in Spotify Developer Dashboard or contact the app administrator.',
          code: 'USER_NOT_AUTHORIZED'
        });
      }

      res.status(500).json({ 
        error: 'Auth check failed',
        message: 'Internal server error' 
      });
    }
  }
}

module.exports = new AuthController();
