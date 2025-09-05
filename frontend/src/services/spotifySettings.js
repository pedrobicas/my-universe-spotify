// Serviço para integrar com configurações reais do Spotify via API
import { api } from './api';

class SpotifySettingsService {
  // ✅ FUNCIONALIDADES POSSÍVEIS via Spotify API:
  
  /**
   * Controlar reprodução (play/pause/skip)
   */
  async controlPlayback(action, deviceId = null) {
    try {
      const endpoint = `/api/spotify/player/${action}`;
      const data = deviceId ? { device_id: deviceId } : {};
      return await api.put(endpoint, data);
    } catch (error) {
      console.error('Erro ao controlar reprodução:', error);
      throw error;
    }
  }

  /**
   * Ajustar volume (0-100)
   */
  async setVolume(volumePercent, deviceId = null) {
    try {
      const params = new URLSearchParams({
        volume_percent: volumePercent
      });
      if (deviceId) params.append('device_id', deviceId);
      
      return await api.put(`/api/spotify/player/volume?${params}`);
    } catch (error) {
      console.error('Erro ao ajustar volume:', error);
      throw error;
    }
  }

  /**
   * Ativar/Desativar shuffle
   */
  async setShuffle(state, deviceId = null) {
    try {
      const params = new URLSearchParams({ state: state.toString() });
      if (deviceId) params.append('device_id', deviceId);
      
      return await api.put(`/api/spotify/player/shuffle?${params}`);
    } catch (error) {
      console.error('Erro ao alterar shuffle:', error);
      throw error;
    }
  }

  /**
   * Definir modo de repetição (off, track, context)
   */
  async setRepeat(state, deviceId = null) {
    try {
      const params = new URLSearchParams({ state });
      if (deviceId) params.append('device_id', deviceId);
      
      return await api.put(`/api/spotify/player/repeat?${params}`);
    } catch (error) {
      console.error('Erro ao alterar repeat:', error);
      throw error;
    }
  }

  /**
   * Transferir reprodução para outro dispositivo
   */
  async transferPlayback(deviceId, play = false) {
    try {
      return await api.put('/api/spotify/player', {
        device_ids: [deviceId],
        play
      });
    } catch (error) {
      console.error('Erro ao transferir reprodução:', error);
      throw error;
    }
  }

  /**
   * Obter dispositivos disponíveis
   */
  async getDevices() {
    try {
      const response = await api.get('/api/spotify/player/devices');
      return response.data.devices;
    } catch (error) {
      console.error('Erro ao obter dispositivos:', error);
      throw error;
    }
  }

  /**
   * Seguir/Deixar de seguir artista
   */
  async followArtist(artistId, follow = true) {
    try {
      const method = follow ? 'PUT' : 'DELETE';
      return await api.request({
        method,
        url: `/api/spotify/following`,
        params: { type: 'artist', ids: artistId }
      });
    } catch (error) {
      console.error('Erro ao seguir/deixar de seguir artista:', error);
      throw error;
    }
  }

  // ❌ FUNCIONALIDADES NÃO DISPONÍVEIS via API:
  /*
   * - Qualidade de áudio (controlada pelo app Spotify)
   * - Crossfade (apenas no app desktop)
   * - Downloads offline (apenas apps móveis/desktop)
   * - Configurações de notificação (internas do Spotify)
   * - Configurações de privacidade (apenas no site/app oficial)
   */

  // ✅ FUNCIONALIDADES LOCAIS (apenas para sua aplicação):
  
  /**
   * Salvar preferências locais
   */
  saveLocalPreferences(preferences) {
    try {
      localStorage.setItem('spotify_local_preferences', JSON.stringify(preferences));
      return { success: true };
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Carregar preferências locais
   */
  loadLocalPreferences() {
    try {
      const preferences = localStorage.getItem('spotify_local_preferences');
      return preferences ? JSON.parse(preferences) : null;
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
      return null;
    }
  }

  /**
   * Configurações de interface da aplicação
   */
  applyInterfaceSettings(settings) {
    // Aplicar tema
    if (settings.darkMode !== undefined) {
      document.documentElement.classList.toggle('dark', settings.darkMode);
    }

    // Aplicar idioma
    if (settings.language) {
      document.documentElement.lang = settings.language.split('-')[0];
    }

    // Aplicar fonte/tamanho (se configurado)
    if (settings.fontSize) {
      document.documentElement.style.fontSize = `${settings.fontSize}px`;
    }

    return { success: true };
  }
}

export const spotifySettingsService = new SpotifySettingsService();
