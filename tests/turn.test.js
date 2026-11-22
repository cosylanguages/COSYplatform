'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const code = fs.readFileSync(path.join(__dirname, '..', 'shared', 'js', 'turn.js'), 'utf8');
const STUN = [{ urls: 'stun:stun.l.google.com:19302' }];

function loadTurn({ config = {}, fetchImpl, session = {} } = {}) {
  const store = new Map(Object.entries(session));
  const window = {
    COSY_CONFIG: { ICE_SERVERS: STUN, ...config },
    sessionStorage: {
      getItem: key => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, value),
      removeItem: key => store.delete(key)
    },
    CosyAuth: {
      getSupabaseClient: () => ({
        auth: { getSession: async () => ({ data: { session: { access_token: 'test-token' } } }) }
      })
    }
  };
  const context = {
    window,
    fetch: fetchImpl || (async () => { throw new Error('fetch should not be called'); }),
    console,
    Date,
    JSON,
    Set,
    sessionStorage: window.sessionStorage
  };
  vm.runInNewContext(code, context, { filename: 'shared/js/turn.js' });
  return { turn: window.CosyTurn, store };
}

test('TURN disabled: returns the configured STUN servers without a request', async () => {
  const { turn } = loadTurn({ config: { TURN_ENABLED: false } });
  assert.deepStrictEqual(JSON.parse(JSON.stringify(await turn.getIceServers())), STUN);
});

test('TURN enabled: merges STUN and ephemeral TURN credentials', async () => {
  let requested = null;
  const { turn, store } = loadTurn({
    config: { TURN_ENABLED: true, SUPABASE_URL: 'https://example.supabase.co' },
    fetchImpl: async (url, options) => {
      requested = { url, options };
      return {
        ok: true,
        json: async () => ({
          iceServers: [{ urls: ['turn:turn.example.com:3478'], username: '123:user', credential: 'abc' }],
          ttl: 600
        })
      };
    }
  });
  const servers = await turn.getIceServers();
  assert.strictEqual(requested.url, 'https://example.supabase.co/functions/v1/get-turn-credentials');
  assert.strictEqual(requested.options.headers.Authorization, 'Bearer test-token');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(servers)), [
    ...STUN,
    { urls: ['turn:turn.example.com:3478'], username: '123:user', credential: 'abc' }
  ]);
  assert.ok(store.has('cosy_turn_ice_v1'));
});

test('TURN enabled: a failed request falls back to STUN', async () => {
  const { turn } = loadTurn({
    config: { TURN_ENABLED: true, TURN_CREDENTIALS_URL: 'https://example.test/turn' },
    fetchImpl: async () => ({ ok: false, status: 503 })
  });
  assert.deepStrictEqual(JSON.parse(JSON.stringify(await turn.getIceServers())), STUN);
});

test('TURN enabled: a fresh cache is used without a request', async () => {
  const cached = [{ urls: 'turn:cached.example.com:3478', username: 'u', credential: 'c' }];
  const { turn } = loadTurn({
    config: { TURN_ENABLED: true, TURN_CREDENTIALS_URL: 'https://example.test/turn' },
    fetchImpl: async () => { throw new Error('fetch should not be called'); },
    session: {
      cosy_turn_ice_v1: JSON.stringify({ iceServers: cached, expiresAt: Date.now() + 60_000 })
    }
  });
  assert.deepStrictEqual(JSON.parse(JSON.stringify(await turn.getIceServers())), [...STUN, ...cached]);
});
