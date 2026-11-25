'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');

function loadAuthGuard() {
  const window = {
    COSY_CONFIG: { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'public-anon-key' },
    location: {
      href: 'https://cosylanguages.github.io/COSYplatform/student.html?course=en-a1',
      origin: 'https://cosylanguages.github.io',
      pathname: '/COSYplatform/student.html',
      search: '?course=en-a1',
      hash: ''
    },
    addEventListener() {},
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} }
  };
  window.window = window;
  const document = { body: { innerHTML: '' }, addEventListener() {}, readyState: 'complete' };
  const context = { window, document, console, URL, URLSearchParams, Promise, Array, String, Object };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'shared/js/auth-guard.js'), 'utf8'), context);
  return window;
}

test('an unauthenticated visit returns to the page that requested sign-in', () => {
  const window = loadAuthGuard();
  window.CosyAuth.redirectToLogin();
  const target = new URL(window.location.href, 'https://cosylanguages.github.io/COSYplatform/');
  assert.equal(target.pathname.endsWith('/COSYplatform/login.html'), true);
  assert.equal(target.searchParams.get('redirect'), 'https://cosylanguages.github.io/COSYplatform/student.html?course=en-a1');
  assert.match(target.searchParams.get('v') || '', /^20261125-2$/);
});

test('the sign-in page has no role-based destination', () => {
  const html = fs.readFileSync(path.join(root, 'login.html'), 'utf8');
  assert.doesNotMatch(html, /COSY_MANUALS_URL/);
  assert.match(html, /auth-sso\.js\?v=\d+/);
});

test('hub, 404 and classroom sign-in links carry the current page and cache version', () => {
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const notFound = fs.readFileSync(path.join(root, '404.html'), 'utf8');
  const classroom = fs.readFileSync(path.join(root, 'classroom.html'), 'utf8');

  assert.ok(index.includes('const signInUrl = `login.html?redirect=${encodeURIComponent(window.location.href)}&v=20261125-2`;'));
  assert.ok(index.includes('href="${signInUrl}"'));
  assert.ok(notFound.includes("loginUrl = basePath + 'login.html?redirect='"));
  assert.ok(notFound.includes("encodeURIComponent(window.location.href) + '&v=20261125-2'"));
  assert.ok(notFound.includes('signInBtn.href = loginUrl'));
  assert.match(classroom, /login\.html\?redirect=classroom\.html&v=\d+/);
});

function loadSso(search) {
  const location = {
    href: 'https://cosylanguages.github.io/COSYplatform/login.html' + search,
    origin: 'https://cosylanguages.github.io',
    pathname: '/COSYplatform/login.html',
    search,
    hash: ''
  };
  const window = {
    location,
    addEventListener() {},
    history: { replaceState() {} },
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} }
  };
  window.window = window;
  const document = { readyState: 'complete', addEventListener() {}, title: 'COSY' };
  const context = { window, document, console, URL, URLSearchParams, Promise, Array, String, Object, Set };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'shared/js/auth-sso.js'), 'utf8'), context);
  return window;
}

function fakeProfileClient(role) {
  return {
    from() {
      return {
        select() { return this; },
        eq() { return this; },
        maybeSingle: async () => ({ data: { role }, error: null })
      };
    }
  };
}

test('an existing session returns to the profile instead of the public catalog', async () => {
  const target = encodeURIComponent('https://cosylanguages.github.io/COSYplatform/');
  const window = loadSso(`?redirect=${target}`);
  await window.CosySSO.autoRedirectFromLogin(fakeProfileClient('teacher'), { id: 'user-1' });
  assert.equal(window.location.href, 'profile.html');
});

test('an existing session keeps a catalog deep link', async () => {
  const target = encodeURIComponent('https://cosylanguages.github.io/COSYplatform/index.html?lesson=studio:one');
  const window = loadSso(`?redirect=${target}`);
  await window.CosySSO.autoRedirectFromLogin(fakeProfileClient('student'), { id: 'user-1' });
  assert.equal(window.location.href, 'index.html?lesson=studio:one');
});

test('an existing session returns to another COSY app root unchanged', async () => {
  const target = encodeURIComponent('https://cosylanguages.github.io/COSYmanuals/');
  const window = loadSso(`?redirect=${target}`);
  await window.CosySSO.autoRedirectFromLogin(fakeProfileClient('student'), { id: 'user-1' });
  assert.equal(window.location.href, 'https://cosylanguages.github.io/COSYmanuals/');
});

test('an existing session treats the app root without a trailing slash as the catalog', async () => {
  const target = encodeURIComponent('https://cosylanguages.github.io/COSYplatform');
  const window = loadSso(`?redirect=${target}`);
  await window.CosySSO.autoRedirectFromLogin(fakeProfileClient('student'), { id: 'user-1' });
  assert.equal(window.location.href, 'profile.html');
});

test('an existing session returns to the exact page it left', async () => {
  const target = encodeURIComponent('https://cosylanguages.github.io/COSYplatform/student.html?course=en-a1');
  const window = loadSso(`?redirect=${target}`);
  await window.CosySSO.autoRedirectFromLogin(fakeProfileClient('student'), { id: 'user-1' });
  assert.equal(window.location.href, 'student.html?course=en-a1');
});

test('the platform sign-in page keeps root redirects', () => {
  const html = fs.readFileSync(path.join(root, 'login.html'), 'utf8');
  assert.match(html, /\(relPath \|\| 'index\.html'\)/);
});

test('the sign-in page sends a plain catalog sign-in to the profile', () => {
  const html = fs.readFileSync(path.join(root, 'login.html'), 'utf8');
  assert.ok(html.includes('function isCatalogRoot('));
  assert.ok(html.includes('function postLoginDestination('));
  assert.ok(html.includes("isCatalogRoot(safeTarget) ? 'profile.html' : safeTarget"));
});

test('the public catalog offers profile links to signed-in users', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(html.includes('renderPublicCatalog(authState)'));
  assert.ok(html.includes('href="profile.html"'));
  assert.ok(html.includes('Open workspace →'));
});
