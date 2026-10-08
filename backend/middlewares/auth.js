const axios = require('axios');

const REFRESH_COOKIE_MAX_AGE = 180 * 24 * 60 * 60 * 1000;

const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  ...(maxAge ? { maxAge } : {})
});

const clearAuthCookies = (res) => {
  res.clearCookie('spotify_access_token', cookieOptions());
  res.clearCookie('spotify_refresh_token', cookieOptions());
};

const fetchProfile = (accessToken) => axios.get('https://api.spotify.com/v1/me', {
  headers: { Authorization: `Bearer ${accessToken}` }
});

const refreshAccessToken = async (refreshToken) => {
  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return response.data;
};

const authenticateToken = async (req, res, next) => {
  try {
    const bearer = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;
    let accessToken = bearer || req.cookies.spotify_access_token;
    const refreshToken = req.cookies.spotify_refresh_token;

    if (!accessToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const profile = await fetchProfile(accessToken);
      req.user = profile.data;
      req.accessToken = accessToken;
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      if (error.response?.status !== 401 || bearer || !refreshToken) {
        if (error.response?.status === 401) clearAuthCookies(res);
        return res.status(error.response?.status === 403 ? 403 : 401).json({ error: 'Spotify session is not valid' });
      }
    }

    try {
      const refreshed = await refreshAccessToken(refreshToken);
      accessToken = refreshed.access_token;
      res.cookie('spotify_access_token', accessToken, cookieOptions((refreshed.expires_in || 3600) * 1000));
      if (refreshed.refresh_token) {
        res.cookie('spotify_refresh_token', refreshed.refresh_token, cookieOptions(REFRESH_COOKIE_MAX_AGE));
      }

      const profile = await fetchProfile(accessToken);
      req.user = profile.data;
      req.accessToken = accessToken;
      req.refreshToken = refreshed.refresh_token || refreshToken;
      return next();
    } catch (refreshError) {
      console.error('Spotify session refresh failed:', refreshError.response?.status || refreshError.message);
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Spotify session expired' });
    }
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = { authenticateToken };
