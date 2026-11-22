(function () {
  'use strict';

  const CACHE_KEY = 'cosy_turn_ice_v1';
  const DEFAULT_STUN = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ];
  let inFlight = null;

  const configuredServers = () => {
    const configured = window.COSY_CONFIG && window.COSY_CONFIG.ICE_SERVERS;
    return Array.isArray(configured) && configured.length ? configured : DEFAULT_STUN;
  };

  const readCache = () => {
    try {
      const raw = window.sessionStorage && window.sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.iceServers) || parsed.expiresAt < Date.now()) return null;
      return parsed.iceServers;
    } catch {
      return null;
    }
  };

  const writeCache = (iceServers, ttlSeconds) => {
    try {
      window.sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        iceServers,
        expiresAt: Date.now() + Math.max(60, ttlSeconds) * 1000
      }));
    } catch {
      // Private browsing or a full quota: the session still works with STUN.
    }
  };

  const mergeServers = (base, extra) => {
    const seen = new Set();
    return [...base, ...extra].filter(server => {
      const key = typeof server === 'string' ? server : JSON.stringify(server);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const fetchTurnCredentials = async () => {
    const config = window.COSY_CONFIG || {};
    const endpoint = config.TURN_CREDENTIALS_URL
      || (config.SUPABASE_URL ? `${String(config.SUPABASE_URL).replace(/\/$/, '')}/functions/v1/get-turn-credentials` : '');
    if (!config.TURN_ENABLED || !endpoint) return null;

    const headers = { Accept: 'application/json' };
    if (config.SUPABASE_ANON_KEY) headers.apikey = config.SUPABASE_ANON_KEY;

    try {
      const client = window.CosyAuth && window.CosyAuth.getSupabaseClient
        ? window.CosyAuth.getSupabaseClient()
        : null;
      if (client) {
        const { data } = await client.auth.getSession();
        if (data && data.session && data.session.access_token) {
          headers.Authorization = `Bearer ${data.session.access_token}`;
        }
      }
    } catch {
      // Anonymous fetch: the Edge Function can still rate-limit by IP.
    }

    const response = await fetch(endpoint, { headers });
    if (!response.ok) throw new Error(`TURN endpoint returned ${response.status}`);
    const payload = await response.json();
    const iceServers = Array.isArray(payload.iceServers)
      ? payload.iceServers
      : (payload.urls ? [{ urls: payload.urls, username: payload.username, credential: payload.credential }] : []);
    if (!iceServers.length) throw new Error('TURN endpoint returned no ICE servers');
    return { iceServers, ttl: Number(payload.ttl) || 3600 };
  };

  const getIceServers = async () => {
    if (inFlight) return inFlight;
    const cached = readCache();
    if (cached) return mergeServers(configuredServers(), cached);

    inFlight = fetchTurnCredentials()
      .then(result => {
        if (!result) return configuredServers();
        writeCache(result.iceServers, result.ttl);
        return mergeServers(configuredServers(), result.iceServers);
      })
      .catch(error => {
        console.warn('[COSY TURN] Falling back to STUN:', error.message);
        return configuredServers();
      })
      .finally(() => {
        inFlight = null;
      });
    return inFlight;
  };

  window.CosyTurn = {
    getIceServers,
    clearCache: () => {
      try { window.sessionStorage.removeItem(CACHE_KEY); } catch { /* no-op */ }
    }
  };
})();
