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
  email: 'ada@example.com',
  created_at: '2026-01-02T00:00:00Z',
  last_sign_in_at: '2026-11-24T10:00:00Z'
};

function makeClient() {
  return {
    from(table) {
      const state = { count: false };
      const result = () => {
        if (state.count) {
          return { count: table === 'lesson_progress' ? 3 : 4, error: null };
        }
        if (table === 'profiles') {
          return {
            data: {
              id: user.id,
              role: 'student',
              display_name: 'Ada Lovelace',
              language_access: ['en', 'fr'],
              course_level: 'b1',
              created_at: user.created_at
            },
            error: null
          };
        }
        if (table === 'access_grants') {
          return {
            data: [
              { grant_id: 'grant-1', course_id: 'general-en-b1', valid_from: '2026-01-01', valid_until: '2027-01-01', expires_at: null, created_at: '2026-01-01' },
              { grant_id: 'grant-2', course_id: 'spoken-fr-a2', valid_from: '2025-01-01', valid_until: '2025-12-31', expires_at: null, created_at: '2025-01-01' }
            ],
            error: null
          };
        }
        if (table === 'courses') {
          return {
            data: [
              { id: 'general-en-b1', title: 'General English B1', language: 'en', cefr: 'b1' },
              { id: 'spoken-fr-a2', title: 'Spoken French A2', language: 'fr', cefr: 'a2' }
            ],
            error: null
          };
        }
        if (table === 'lesson_submissions') {
          return { data: [{ id: 's1', lesson_id: 'studio:one', kind: 'essay', status: 'submitted', created_at: '2026-11-20T10:00:00Z' }], error: null };
        }
        if (table === 'lesson_notes') {
          return { data: [{ id: 'n1', lesson_id: 'lesson/one', updated_at: '2026-11-21T10:00:00Z' }], error: null };
        }
        if (table === 'study_events') {
          return { data: [{ id: 'e1', lesson_id: 'studio:one', kind: 'game', score: 4, total: 5, created_at: '2026-11-22T10:00:00Z' }], error: null };
        }
        return { data: [], error: null };
      };

      const query = {
        select(columns, options) { state.count = Boolean(options && options.head); return query; },
        eq() { return query; },
        or() { return query; },
        order() { return query; },
        limit() { return query; },
        in() { return query; },
        maybeSingle: async () => result(),
        then(resolve, reject) { return Promise.resolve(result()).then(resolve, reject); }
      };
      return query;
    }
  };
}

test('profile page renders identity, access, stats and recent activity', async () => {
  const dom = new JSDOM(html, {
    url: 'https://cosylanguages.github.io/COSYplatform/profile.html',
    runScripts: 'dangerously',
    beforeParse(window) {
      window.CosyAuth = {
        client: makeClient(),
        getAuthAndProfile: async () => ({
          user,
          session: { user },
          profile: { id: user.id, role: 'student', language_access: ['en', 'fr'], course_level: 'b1' }
        }),
        logout() {}
      };
    }
  });

  await new Promise(resolve => setTimeout(resolve, 300));
  const document = dom.window.document;

  assert.equal(document.getElementById('profile-name').textContent, 'Ada Lovelace');
  assert.equal(document.getElementById('profile-email').textContent, 'ada@example.com');
  assert.equal(document.getElementById('detail-languages').textContent, 'EN, FR');
  assert.equal(document.getElementById('detail-level').textContent, 'B1');
  assert.equal(document.getElementById('stat-active-courses').textContent, '1');
  assert.equal(document.getElementById('stat-lessons-practised').textContent, '3');
  assert.equal(document.getElementById('stat-tasks-submitted').textContent, '4');
  assert.equal(document.getElementById('stat-study-events').textContent, '4');
  assert.equal(document.querySelectorAll('#profile-grants tbody tr').length, 2);
  assert.equal(document.querySelectorAll('#profile-activity li').length, 3);
  assert.equal(document.getElementById('header-workspace-link').getAttribute('href'), 'student.html');
  assert.equal(document.getElementById('profile-content').hidden, false);

  dom.window.close();
});
