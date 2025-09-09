const axios = require('axios');

const authenticateToken = async (req, res, next) => {
  try {
    let accessToken = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7);
    } else {
      accessToken = req.cookies.spotify_access_token;
    }
    
    if (!accessToken) {
      return res.status(401).json({ 
        error: 'Access token not found',
        message: 'Please login with Spotify first' 
      });
    }

    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      req.user = response.data;
      req.accessToken = accessToken;
      next();
    } catch (spotifyError) {
      if (spotifyError.response && spotifyError.response.status === 401) {
        if (authHeader) {
          return res.status(401).json({ 
            error: 'Token expired',
            message: 'Token needs refresh' 
          });
        }
        
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
          
          res.cookie('spotify_access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600000
          });

          if (refresh_token) {
            res.cookie('spotify_refresh_token', refresh_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 30 * 24 * 60 * 60 * 1000
            });
          }

          req.accessToken = access_token;
          
          const userResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
              'Authorization': `Bearer ${access_token}`
            }
          });
          
          req.user = userResponse.data;
          next();
        } catch (refreshError) {
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
