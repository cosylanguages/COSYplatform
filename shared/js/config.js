// The anon key is public by design (protected by Row Level Security); never put a service_role key in this repo.
window.COSY_CONFIG = {
  SUPABASE_URL: "https://iajkejcmoykubthlwfra.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhamtlamNtb3lrdWJ0aGx3ZnJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjYwOTUsImV4cCI6MjA5NjQwMjA5NX0.mGY94U3Ei9eLoFbWPIcUfdGRCfjQ2OBYixQ1eyZai-U",
  // STUN & ICE Servers for PeerJS WebRTC live classroom connections
  // Note: For production TURN relay servers, fetch ephemeral HMAC credentials dynamically via Edge Function
  // to avoid hardcoding static credentials in client JavaScript.
  ICE_SERVERS: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
};
