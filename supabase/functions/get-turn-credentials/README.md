# get-turn-credentials

Issues short-lived Coturn REST credentials to signed-in classroom users.

## Deploy

```bash
supabase functions deploy get-turn-credentials
supabase secrets set \
  TURN_URL="turn:turn.example.com:3478?transport=udp,turns:turn.example.com:5349?transport=tcp" \
  TURN_SECRET="<coturn static-auth-secret>" \
  TURN_TTL=3600
```

`TURN_URL` accepts a comma-separated list. `TURN_SECRET` must match the
`static-auth-secret` configured in `turnserver.conf`.

## Enable in the client

In `shared/js/config.js`:

```js
TURN_ENABLED: true,
TURN_CREDENTIALS_URL: "", // defaults to <SUPABASE_URL>/functions/v1/get-turn-credentials
```

`shared/js/turn.js` fetches the credentials, caches them in `sessionStorage`
until `ttl` expires, and falls back to the STUN servers in `ICE_SERVERS` if the
function is unavailable. Credentials are never hardcoded in the repository.

The function requires a valid Supabase user JWT; the classroom page supplies it
through `CosyAuth.getSupabaseClient().auth.getSession()`.
