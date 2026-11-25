'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'profile.html'), 'utf8');

const user = {
  id: 'user-1',
  email: 'founder@example.com',
  created_at: '2026-01-02T00:00:00Z',
  last_sign_in_at: '2026-11-24T10:00:00Z'
};

function makeClient(profile) {
  return {
    from(table) {
      const state = { head: false, eqs: {} };
      const result = () => {
        if (state.head) {
          if (table === 'profiles') {
            if (state.eqs.role === 'student') return { count: 5, error: null };
            if (state.eqs.role === 'teacher') return { count: 2, error: null };
            return { count: 7, error: null };
          }
          return { count: table === 'lesson_notes' ? 3 : 4, error: null };
        }
        if (table === 'profiles') return { data: profile, error: null };
        if (table === 'teacher_languages') return { data: [{ language: 'en' }, { language: 'fr' }], error: null };
        if (table === 'lesson_notes') {
          return { data: [{ id: 'n1', lesson_id: 'lesson/one', updated_at: '2026-11-21T10:00:00Z' }], error: null };
        }
        if (table === 'teacher_students') return { data: [{ student_id: 's1' }], error: null };
        if (table === 'session_content') {
          return {
            data: [{
              session_id: 'event-1',
              full_notes: 'Session notes',
              recording_url: 'https://example.com/recording',
              updated_at: '2026-11-19T10:00:00Z'
            }],
            error: null
          };
        }
        return { data: [], error: null };
      };

      const query = {
        select(columns, options) { state.head = Boolean(options && options.head); return query; },
        eq(column, value) { state.eqs[column] = value; return query; },
        neq() { return query; },
        or() { return query; },
        in() { return query; },
        order() { return query; },
        limit() { return query; },
        maybeSingle: async () => result(),
        then(resolve, reject) { return Promise.resolve(result()).then(resolve, reject); }
      };
      return query;
    }
  };
}

function makeDom(role) {
  const profile = {
    id: user.id,
    role,
    display_name: role === 'founder' ? 'Fiona Founder' : 'Sam Student',
    language_access: role === 'founder' ? ['*'] : ['en'],
    course_level: '*',
    hosted_sessions: ['event-1'],
    created_at: user.created_at
  };

  return new JSDOM(html, {
    url: 'https://cosylanguages.github.io/COSYplatform/profile.html',
    runScripts: 'dangerously',
    beforeParse(window) {
      window.CosyAuth = {
        client: makeClient(profile),
        getAuthAndProfile: async () => ({
          user,
          session: { user },
          profile: { id: user.id, role, language_access: profile.language_access, course_level: '*' }
        }),
        logout() {},
        FULL_MANIFEST: [
          { id: 'general-en-a1', lang: 'en', status: 'available' },
          { id: 'general-en-a2', lang: 'en', status: 'available' },
          { id: 'general-fr-a1', lang: 'fr', status: 'available' }
        ]
      };
    }
  });
}

test('founders see the mode switcher and land in the founder profile', async () => {
  const dom = makeDom('founder');
  await new Promise(resolve => setTimeout(resolve, 300));
  const document = dom.window.document;

  assert.equal(document.getElementById('mode-switcher').hidden, false);
  assert.equal(document.querySelector('[data-panel="founder"]').hidden, false);
  assert.equal(document.querySelector('[data-panel="student"]').hidden, true);
  assert.equal(document.getElementById('header-workspace-link').getAttribute('href'), 'founder.html');
  assert.equal(document.getElementById('profile-viewing-pill').hidden, false);
  assert.equal(document.getElementById('profile-viewing-pill').textContent, 'Viewing as Founder');

  dom.window.close();
});

test('founders can switch to the teacher profile', async () => {
  const dom = makeDom('founder');
  await new Promise(resolve => setTimeout(resolve, 300));
  const document = dom.window.document;

  document.querySelector('.mode-tab[data-mode="teacher"]').click();
  await new Promise(resolve => setTimeout(resolve, 200));

  assert.equal(document.querySelector('[data-panel="teacher"]').hidden, false);
  assert.equal(document.querySelector('[data-panel="founder"]').hidden, true);
  assert.equal(document.getElementById('header-workspace-link').getAttribute('href'), 'teacher.html');
  assert.equal(document.getElementById('profile-viewing-pill').textContent, 'Viewing as Teacher');
  assert.equal(document.getElementById('mode-preview-banner').hidden, false);
  assert.equal(document.getElementById('teacher-stat-languages').textContent, '2');
  assert.equal(document.getElementById('teacher-stat-students').textContent, '7');
  assert.ok(document.getElementById('teacher-spaces').innerHTML.includes('teacher.html?lang=en'));
  assert.ok(document.getElementById('teacher-sessions').innerHTML.includes('event-1'));
  assert.ok(document.getElementById('teacher-sessions').innerHTML.includes('Notes'));
  assert.ok(document.getElementById('teacher-sessions').innerHTML.includes('Recording'));

  dom.window.close();
});

test('teachers get their own profile with real hosted session content', async () => {
  const dom = makeDom('teacher');
  await new Promise(resolve => setTimeout(resolve, 300));
  const document = dom.window.document;

  assert.equal(document.getElementById('mode-switcher').hidden, true);
  assert.equal(document.querySelector('[data-panel="teacher"]').hidden, false);
  assert.equal(document.querySelector('[data-panel="student"]').hidden, true);
  assert.equal(document.querySelector('[data-panel="founder"]').hidden, true);
  assert.equal(document.getElementById('header-workspace-link').getAttribute('href'), 'teacher.html');
  assert.equal(document.getElementById('teacher-stat-sessions').textContent, '1');
  assert.ok(document.getElementById('teacher-sessions').innerHTML.includes('event-1'));
  assert.ok(document.getElementById('teacher-sessions').innerHTML.includes('Notes'));
  assert.ok(document.getElementById('teacher-sessions').innerHTML.includes('Recording'));

  dom.window.close();
});

test('students do not get a mode switcher', async () => {
  const dom = makeDom('student');
  await new Promise(resolve => setTimeout(resolve, 300));
  const document = dom.window.document;

  assert.equal(document.getElementById('mode-switcher').hidden, true);
  assert.equal(document.querySelector('[data-panel="student"]').hidden, false);
  assert.equal(document.querySelector('[data-panel="founder"]').hidden, true);
  assert.equal(document.getElementById('header-workspace-link').getAttribute('href'), 'student.html');

  dom.window.close();
});

test('the shared mode switcher only renders links for founders', () => {
  const dom = new JSDOM('<div id="host"></div>', { runScripts: 'dangerously' });
  dom.window.eval(fs.readFileSync(path.join(root, 'shared/js/mode-switcher.js'), 'utf8'));

  const host = dom.window.document.getElementById('host');
  assert.equal(dom.window.CosyModeSwitcher.mount(host, { role: 'teacher', active: 'teacher' }), null);
  assert.equal(host.hidden, true);
  assert.equal(host.innerHTML, '');

  dom.window.CosyModeSwitcher.mount(host, { role: 'founder', active: 'teacher' });
  assert.equal(host.hidden, false);
  assert.ok(host.innerHTML.includes('href="student.html"'));
  assert.ok(host.innerHTML.includes('href="teacher.html"'));
  assert.ok(host.innerHTML.includes('href="founder.html"'));
  assert.ok(host.innerHTML.includes('is-active'));

  dom.window.close();
});

