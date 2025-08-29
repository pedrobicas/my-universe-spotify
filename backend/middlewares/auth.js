const axios = require('axios');

const authenticateToken = async (req, res, next) => {
  try {
    const accessToken = req.cookies.spotify_access_token;
    
    if (!accessToken) {
      return res.status(401).json({ 
        error: 'Access token not found',
        message: 'Please login with Spotify first' 
      });
    }

    // Verify token by making a request to Spotify API
    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      // Add user info to request object
      req.user = response.data;
      req.accessToken = accessToken;
      next();
    } catch (spotifyError) {
      if (spotifyError.response && spotifyError.response.status === 401) {
        // Token expired, try to refresh
        const refreshToken = req.cookies.spotify_refresh_token;
        
        if (!refreshToken) {
          return res.status(401).json({ 
            error: 'Token expired and no refresh token available',
            message: 'Please login again' 
          });
        }

        try {
          const refreshResponse = await axios.post('https://accounts.spotify.com/api/token', 
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

          const { access_token, refresh_token } = refreshResponse.data;
          
          // Set new tokens in cookies
          res.cookie('spotify_access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600000 // 1 hour
          });

          if (refresh_token) {
            res.cookie('spotify_refresh_token', refresh_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });
          }

          // Update request with new token
          req.accessToken = access_token;
          
          // Get user info with new token
          const userResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
              'Authorization': `Bearer ${access_token}`
            }
          });
          
          req.user = userResponse.data;
          next();
        } catch (refreshError) {
          // Refresh failed, clear cookies and require re-login
          res.clearCookie('spotify_access_token');
          res.clearCookie('spotify_refresh_token');
          
          return res.status(401).json({ 
            error: 'Token refresh failed',
            message: 'Please login again' 
          });
        }
      } else {
        throw spotifyError;
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      message: 'Internal server error' 
    });
  }
};

module.exports = {
  authenticateToken
};
