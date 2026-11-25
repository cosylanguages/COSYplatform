'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'teacher.html'), 'utf8');

const user = {
  id: 'teacher-1',
  email: 'teacher@example.com',
  created_at: '2026-01-02T00:00:00Z'
};

const profile = {
  id: user.id,
  role: 'teacher',
  display_name: 'James York',
  language_access: ['en'],
  course_level: '*'
};

function makeClient() {
  const empty = { data: [], error: null, count: 0 };
  return {
    from(table) {
      const query = {
        select() { return query; },
        eq() { return query; },
        or() { return query; },
        order() { return query; },
        limit() { return query; },
        in() { return query; },
        range() { return query; },
        neq() { return query; },
        maybeSingle: async () => ({ data: table === 'profiles' ? profile : null, error: null }),
        single: async () => ({ data: table === 'profiles' ? profile : {}, error: null }),
        upsert: async () => ({ data: null, error: null }),
        insert: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null }),
        delete: async () => ({ data: null, error: null }),
        then(resolve) { return Promise.resolve(empty).then(resolve); }
      };
      return query;
    },
    auth: {
      getSession: async () => ({ data: { session: { user } }, error: null })
    }
  };
}

async function openDashboard() {
  const dom = new JSDOM(html, {
    url: 'https://cosylanguages.github.io/COSYplatform/teacher.html?view=dashboard',
    runScripts: 'dangerously',
    beforeParse(window) {
      window.CosyAuth = {
        client: makeClient(),
        FULL_MANIFEST: [],
        isCourseAccessible: () => true,
        getAuthAndProfile: async () => ({ user, session: { user }, profile }),
        requireRole: async () => ({ user, session: { user }, profile }),
        logout() {}
      };
    }
  });
  await new Promise(resolve => setTimeout(resolve, 1200));
  return dom;
}

function findButton(document, text) {
  return Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === text);
}

test('teacher can delete one session without touching the rest of the schedule', async () => {
  const dom = await openDashboard();
  const document = dom.window.document;
  const sessions = document.querySelectorAll('[data-session-id]');
  assert.equal(sessions.length, 4, 'four sessions are scheduled');

  const wednesdayKirill = Array.from(sessions).find(button =>
    button.getAttribute('data-student') === 'Kirill' && button.getAttribute('data-time') === '18:00'
  );
  assert.ok(wednesdayKirill, 'the Wednesday Kirill session is present');
  wednesdayKirill.click();

  const deleteButton = findButton(document, 'Delete Session…');
  assert.ok(deleteButton, 'the lesson modal offers deletion');
  deleteButton.click();

  const keep = findButton(document, 'Delete this session');
  assert.ok(keep, 'one-session delete is the default');
  keep.click();
  await new Promise(resolve => setTimeout(resolve, 60));

  assert.equal(document.querySelectorAll('[data-session-id]').length, 3, 'only one session is removed');
  assert.equal(
    Array.from(document.querySelectorAll('[data-session-id]')).some(button => button.getAttribute('data-student') === 'Kirill' && button.getAttribute('data-time') === '18:00'),
    false
  );
  assert.equal(document.getElementById('kpi-sessions').textContent, '3');

  dom.window.close();
});

test('teacher can delete every session with one student at once', async () => {
  const dom = await openDashboard();
  const document = dom.window.document;
  const sessions = document.querySelectorAll('[data-session-id]');
  const firstValerii = Array.from(sessions).find(button => button.getAttribute('data-student') === 'Valerii');
  assert.ok(firstValerii, 'a Valerii session is present');
  firstValerii.click();

  findButton(document, 'Delete Session…').click();
  const allOption = Array.from(document.querySelectorAll('.teacher-scope-option')).find(label => label.textContent.includes('All sessions with Valerii'));
  assert.ok(allOption, 'all-sessions option is offered');
  allOption.querySelector('input').click();

  const confirm = document.getElementById('teacher-delete-confirm');
  assert.equal(confirm.textContent, 'Delete all sessions');
  confirm.click();
  await new Promise(resolve => setTimeout(resolve, 60));

  assert.equal(document.querySelectorAll('[data-session-id]').length, 2, 'both Valerii sessions are removed');
  assert.equal(
    Array.from(document.querySelectorAll('[data-session-id]')).some(button => button.getAttribute('data-student') === 'Valerii'),
    false
  );
  assert.equal(document.getElementById('kpi-sessions').textContent, '2');

  dom.window.close();
});
