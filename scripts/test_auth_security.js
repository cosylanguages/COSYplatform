#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');

function loadSso() {
  const location = {
    href: 'https://cosylanguages.github.io/COSYplatformm/login.html',
    origin: 'https://cosylanguages.github.io',
    pathname: '/COSYplatformm/login.html',
    search: '',
    hash: ''
  };
  const window = { location, addEventListener() {}, history: { replaceState() {} } };
  const document = { readyState: 'complete', addEventListener() {}, title: 'COSY' };
  const context = { window, document, URL, URLSearchParams, console, Promise };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'shared/js/auth-sso.js'), 'utf8'), context);
  return window.CosySSO;
}

function loadAuthGuard({ profileResult, sessionError = null } = {}) {
  const user = { id: 'user-1' };
  const client = {
    auth: { getSession: async () => ({
      data: { session: sessionError ? null : { user } },
      error: sessionError
    }) },
    from(table) {
      assert.equal(table, 'profiles');
      return {
        select() { return this; },
        eq(column, value) { assert.equal(column, 'id'); assert.equal(value, user.id); return this; },
        maybeSingle: async () => profileResult
      };
    }
  };
  const window = {
    COSY_CONFIG: { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'public-anon-key' },
    supabase: { createClient: () => client },
    location: { href: 'https://cosylanguages.github.io/COSYplatformm/founder.html' }
  };
  window.window = window;
  const document = { body: { innerHTML: '' } };
  const context = { window, document, console, URL, URLSearchParams, Promise, Array, String, Object };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'shared/js/auth-guard.js'), 'utf8'), context);
  return { auth: window.CosyAuth, document };
}

async function main() {
  const sso = loadSso();
  const hostile = 'https://attacker.example/COSYplatform';
  assert.equal(
    sso.buildEcosystemUrlWithTokens(hostile, 'access-secret', 'refresh-secret'),
    hostile,
    'must not attach session tokens to an untrusted origin'
  );

  const insecure = 'http://cosylanguages.github.io/COSYlanguages/';
  assert.equal(
    sso.buildEcosystemUrlWithTokens(insecure, 'access-secret', 'refresh-secret'),
    insecure,
    'must not transfer tokens over HTTP'
  );

  const trusted = 'https://cosylanguages.github.io/COSYlanguages/login.html?from=platform#existing=value';
  const transferred = new URL(sso.buildEcosystemUrlWithTokens(trusted, 'access-secret', 'refresh-secret'));
  assert.equal(transferred.origin, 'https://cosylanguages.github.io');
  assert.equal(transferred.searchParams.get('from'), 'platform');
  assert.equal(transferred.hash.includes('existing=value'), true);
  assert.equal(new URLSearchParams(transferred.hash.slice(1)).get('access_token'), 'access-secret');
  assert.equal(new URLSearchParams(transferred.hash.slice(1)).get('refresh_token'), 'refresh-secret');

  const missingProfile = loadAuthGuard({ profileResult: { data: null, error: null } });
  assert.equal(await missingProfile.auth.getAuthAndProfile(), null);
  assert.match(missingProfile.document.body.innerHTML, /Account Access Unavailable/);

  const failedProfileRead = loadAuthGuard({ profileResult: { data: null, error: { message: 'offline' } } });
  assert.equal(await failedProfileRead.auth.getAuthAndProfile(), null);
  assert.match(failedProfileRead.document.body.innerHTML, /Account Access Unavailable/);

  const invalidRole = loadAuthGuard({ profileResult: { data: { id: 'user-1', role: 'admin' }, error: null } });
  assert.equal(await invalidRole.auth.getAuthAndProfile(), null);
  assert.match(invalidRole.document.body.innerHTML, /Account Access Unavailable/);

  const validStudent = loadAuthGuard({
    profileResult: { data: { id: 'user-1', role: 'student', language_access: ['en'], course_level: 'a1' }, error: null }
  });
  const authData = await validStudent.auth.getAuthAndProfile();
  assert.equal(authData.user.id, 'user-1');
  assert.equal(authData.profile.role, 'student');

  console.log('PASS: SSO tokens stay on trusted HTTPS origins.');
  console.log('PASS: missing, failed, and invalid profiles fail closed.');
  console.log('PASS: a valid student profile is accepted.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
