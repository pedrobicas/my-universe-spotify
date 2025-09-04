const axios = require('axios');

class AuthController {
  // Redirect to Spotify OAuth
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

  // Handle OAuth callback
  async callback(req, res) {
    try {
      const { code } = req.query;

      if (!code) {
        return res.status(400).json({ 
          error: 'Authorization code not provided',
          message: 'Missing authorization code' 
        });
      }

      // Exchange code for tokens
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
        }
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;
      // Logar os scopes retornados pelo Spotify para depuração
      if (tokenResponse.data.scope) {
        console.log('Scopes retornados pelo Spotify:', tokenResponse.data.scope);
      } else {
        console.log('Nenhum scope retornado pelo Spotify. Resposta:', tokenResponse.data);
      }

      console.log('Setting cookies with tokens...');
      
      // Set tokens in httpOnly cookies
      res.setCookie('spotify_access_token', access_token, {
        httpOnly: true,
        secure: false, // Force false for development
        maxAge: expires_in * 1000 // Convert seconds to milliseconds
      });

      res.setCookie('spotify_refresh_token', refresh_token, {
        httpOnly: true,
        secure: false, // Force false for development
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      
      console.log('Cookies set successfully');

      // Redirect to frontend dashboard
      res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    } catch (error) {
      console.error('Callback error:', error);
      
      if (error.response) {
        console.error('Spotify error response:', error.response.data);
      }

      // Redirect to frontend with error
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }

  // Refresh access token
  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.spotify_refresh_token;

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

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      // Set new tokens in cookies
      res.setCookie('spotify_access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: expires_in * 1000
      });

      if (refresh_token) {
        res.setCookie('spotify_refresh_token', refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 30 * 24 * 60 * 60 * 1000
        });
      }

      res.json({ 
        message: 'Token refreshed successfully',
        expires_in 
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      
      // Clear invalid tokens
      res.clearCookie('spotify_access_token');
      res.clearCookie('spotify_refresh_token');
      
      res.status(401).json({ 
        error: 'Token refresh failed',
        message: 'Please login again' 
      });
    }
  }

  // Logout user
  async logout(req, res) {
    try {
      // Clear all cookies
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

  // Check authentication status
  async checkAuth(req, res) {
    try {
      console.log('Checking auth... Cookies:', Object.keys(req.cookies));
      const accessToken = req.cookies.spotify_access_token;
      
      if (!accessToken) {
        console.log('No access token found in cookies');
        return res.status(401).json({ 
          authenticated: false,
          message: 'No access token found' 
        });
      }
      
      console.log('Access token found, length:', accessToken.length);

      // Verify token with Spotify
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
        // Token is invalid, clear cookies
        res.clearCookie('spotify_access_token');
        res.clearCookie('spotify_refresh_token');
        
        return res.status(401).json({ 
          authenticated: false,
          message: 'Invalid token' 
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
