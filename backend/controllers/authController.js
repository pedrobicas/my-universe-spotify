const crypto = require('crypto');
const axios = require('axios');

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_ME_URL = 'https://api.spotify.com/v1/me';
const OAUTH_STATE_MAX_AGE = 10 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE = 180 * 24 * 60 * 60 * 1000;

const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  ...(maxAge ? { maxAge } : {})
});

const clearCookie = (res, name) => {
  res.clearCookie(name, cookieOptions());
};

const stateMatches = (received, stored) => {
  if (!received || !stored) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(stored);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const exchangeRefreshToken = async (refreshToken) => {
  const tokenResponse = await axios.post(
    SPOTIFY_TOKEN_URL,
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  return tokenResponse.data;
};

const persistTokens = (res, tokenData) => {
  const { access_token, refresh_token, expires_in = 3600 } = tokenData;
  if (access_token) {
    res.cookie('spotify_access_token', access_token, cookieOptions(expires_in * 1000));
  }
  if (refresh_token) {
    res.cookie('spotify_refresh_token', refresh_token, cookieOptions(REFRESH_COOKIE_MAX_AGE));
  }
};

const fetchSpotifyUser = (accessToken) => axios.get(SPOTIFY_ME_URL, {
  headers: { Authorization: `Bearer ${accessToken}` }
});

class AuthController {
  async login(req, res) {
    try {
      if (!process.env.SPOTIFY_CLIENT_ID || !process.env.REDIRECT_URI) {
        return res.status(500).json({ error: 'Spotify OAuth is not configured' });
      }

      const scopes = [
        'user-read-private',
        'user-top-read',
        'playlist-read-private',
        'playlist-modify-public',
        'playlist-modify-private',
        'user-read-recently-played',
        'user-library-read',
        'user-library-modify',
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-follow-read'
      ].join(' ');

      const state = crypto.randomBytes(32).toString('hex');
      res.cookie('spotify_oauth_state', state, cookieOptions(OAUTH_STATE_MAX_AGE));

      const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scopes,
        redirect_uri: process.env.REDIRECT_URI,
        state
      })}`;

      if (req.query.redirect === '1') return res.redirect(authUrl);
      return res.json({ authUrl });
    } catch (error) {
      console.error('Login error:', error.message);
      return res.status(500).json({ error: 'Failed to generate auth URL' });
    }
  }

  async callback(req, res) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    try {
      const { code, state, error: spotifyError } = req.query;
      const storedState = req.cookies.spotify_oauth_state;
      clearCookie(res, 'spotify_oauth_state');

      if (spotifyError) {
        return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(spotifyError)}`);
      }

      if (!stateMatches(state, storedState)) {
        return res.redirect(`${frontendUrl}/login?error=invalid_oauth_state`);
      }

      if (!code) {
        return res.redirect(`${frontendUrl}/login?error=missing_authorization_code`);
      }

      const tokenResponse = await axios.post(
        SPOTIFY_TOKEN_URL,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: process.env.REDIRECT_URI,
          client_id: process.env.SPOTIFY_CLIENT_ID,
          client_secret: process.env.SPOTIFY_CLIENT_SECRET
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      persistTokens(res, tokenResponse.data);
      return res.redirect(`${frontendUrl}/auth/success`);
    } catch (error) {
      const status = error.response?.status;
      console.error('OAuth callback failed:', status || error.message);
      const code = status === 403 ? 'user_not_authorized' : 'auth_failed';
      return res.redirect(`${frontendUrl}/login?error=${code}`);
    }
  }

  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.spotify_refresh_token;
      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token not found' });
      }

      const tokenData = await exchangeRefreshToken(refreshToken);
      persistTokens(res, tokenData);
      return res.json({ authenticated: true, expires_in: tokenData.expires_in || 3600 });
    } catch (error) {
      console.error('Token refresh failed:', error.response?.status || error.message);
      clearCookie(res, 'spotify_access_token');
      clearCookie(res, 'spotify_refresh_token');
      return res.status(401).json({ error: 'Token refresh failed' });
    }
  }

  async logout(req, res) {
    clearCookie(res, 'spotify_access_token');
    clearCookie(res, 'spotify_refresh_token');
    clearCookie(res, 'spotify_oauth_state');
    return res.json({ message: 'Logged out successfully' });
  }

  async checkAuth(req, res) {
    const refreshToken = req.cookies.spotify_refresh_token;
    let accessToken = req.cookies.spotify_access_token;

    try {
      if (!accessToken && refreshToken) {
        const tokenData = await exchangeRefreshToken(refreshToken);
        persistTokens(res, tokenData);
        accessToken = tokenData.access_token;
      }

      if (!accessToken) {
        return res.status(401).json({ authenticated: false });
      }

      try {
        const userResponse = await fetchSpotifyUser(accessToken);
        return res.json({ authenticated: true, user: userResponse.data });
      } catch (error) {
        if (error.response?.status !== 401 || !refreshToken) throw error;
      }

      const tokenData = await exchangeRefreshToken(refreshToken);
      persistTokens(res, tokenData);
      const userResponse = await fetchSpotifyUser(tokenData.access_token);
      return res.json({ authenticated: true, user: userResponse.data });
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        clearCookie(res, 'spotify_access_token');
        clearCookie(res, 'spotify_refresh_token');
        return res.status(401).json({ authenticated: false });
      }
      if (error.response?.status === 403) {
        return res.status(403).json({ authenticated: false, code: 'USER_NOT_AUTHORIZED' });
      }
      console.error('Auth check failed:', error.response?.status || error.message);
      return res.status(500).json({ error: 'Auth check failed' });
    }
  }
}

module.exports = new AuthController();
