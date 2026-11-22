import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Missing Authorization header' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !anonKey) return json({ error: 'Supabase environment is not configured' }, 500);

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return json({ error: 'Unauthorized' }, 401);

  const turnUrl = Deno.env.get('TURN_URL');
  const turnSecret = Deno.env.get('TURN_SECRET');
  if (!turnUrl || !turnSecret) return json({ error: 'TURN is not configured' }, 503);

  const ttl = Math.max(60, Math.min(86400, Number(Deno.env.get('TURN_TTL') || 3600)));
  const expiry = Math.floor(Date.now() / 1000) + ttl;
  const username = `${expiry}:${user.id}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(turnSecret),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(username));
  const credential = btoa(String.fromCharCode(...new Uint8Array(signature)));
  const urls = turnUrl.split(',').map(url => url.trim()).filter(Boolean);

  return json({
    iceServers: [{ urls, username, credential }],
    ttl
  });
});
