// The anon key is public by design (protected by Row Level Security); never put a service_role key in this repo.
window.COSY_CONFIG = {
  SUPABASE_URL: "https://iajkejcmoykubthlwfra.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhamtlamNtb3lrdWJ0aGx3ZnJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjYwOTUsImV4cCI6MjA5NjQwMjA5NX0.mGY94U3Ei9eLoFbWPIcUfdGRCfjQ2OBYixQ1eyZai-U",
  // STUN & ICE Servers for PeerJS WebRTC live classroom connections.
  // TURN credentials are never hardcoded here. Set TURN_ENABLED to true after
  // deploying the get-turn-credentials Edge Function; shared/js/turn.js fetches
  // short-lived HMAC credentials and falls back to these STUN servers.
  TURN_ENABLED: false,
  TURN_CREDENTIALS_URL: "",
  ICE_SERVERS: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
};

/* Shared HTML escaper for values interpolated into innerHTML. */
window.cosyEscapeHtml = function (value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
  });
};
