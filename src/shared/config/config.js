// Single source of truth for environment + cross-repo URLs.
// When a repo is renamed or moved, change it here (or in .env), nowhere else.
const env = import.meta.env;

export const config = {
  supabaseUrl: env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY || '',
  // Hash routing works on any static host without a custom domain or 404 tricks.
  routerMode: env.VITE_ROUTER === 'browser' ? 'browser' : 'hash',
  basePath: env.BASE_URL || '/',

  // Ecosystem sites (used by footer links and tool deep links).
  ecosystem: {
    languages: env.VITE_URL_LANGUAGES || 'https://cosylanguages.github.io/COSYlanguages/',
    data: env.VITE_URL_DATA || 'https://cosylanguages.github.io/COSYdata/',
    tools: env.VITE_URL_TOOLS || 'https://cosylanguages.github.io/COSYtools/',
    games: env.VITE_URL_GAMES || 'https://cosylanguages.github.io/COSYgames/',
    events: env.VITE_URL_EVENTS || 'https://cosylanguages.github.io/COSYevents/',
  },

  // JSON index published by COSYdata. Replaces the bundled 951 KB vocab-index.js.
  cosydataIndexUrl: env.VITE_COSYDATA_INDEX_URL || '',

  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    ...(env.VITE_TURN_URL
      ? [{ urls: env.VITE_TURN_URL, username: env.VITE_TURN_USERNAME, credential: env.VITE_TURN_CREDENTIAL }]
      : []),
  ],
};

export const isSupabaseConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey);
