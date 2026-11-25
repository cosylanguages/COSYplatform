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
  const studentProfile = {
    id: 's1',
    display_name: 'Sam Learner',
    role: 'student',
    course_level: 'a2',
    language_access: ['en'],
    created_at: '2026-02-01T00:00:00Z'
  };
  const submissions = [
    { id: 'sub-1', student_id: 's1', lesson_id: 'studio:one', kind: 'essay', status: 'submitted', feedback: null, created_at: '2026-11-22T10:00:00Z' },
    { id: 'sub-2', student_id: user.id, lesson_id: 'studio:two', kind: 'audio', status: 'reviewed', feedback: 'Great pronunciation', created_at: '2026-11-20T10:00:00Z' },
    { id: 'sub-3', student_id: user.id, lesson_id: 'studio:three', kind: 'essay', status: 'submitted', feedback: null, created_at: '2026-11-23T09:00:00Z' }
  ];

  return {
    from(table) {
      const state = { head: false, eqs: {}, inColumn: null, inValues: [], single: false };
      const result = () => {
        if (state.head) {
          if (table === 'profiles') {
            if (state.eqs.role === 'student') return { count: 5, error: null };
            if (state.eqs.role === 'teacher') return { count: 2, error: null };
            return { count: 7, error: null };
          }
          return { count: table === 'lesson_notes' ? 3 : 4, error: null };
        }
        if (table === 'profiles') {
          if (state.inColumn === 'id') return { data: [studentProfile], error: null };
          if (state.single) {
            if (state.eqs.id === 'teacher-1') return { data: { display_name: 'Tara Teacher' }, error: null };
            return { data: profile, error: null };
          }
          if (state.eqs.role === 'student') return { data: [studentProfile], error: null };
          return { data: [profile, studentProfile], error: null };
        }
        if (table === 'teacher_languages') return { data: [{ language: 'en' }, { language: 'fr' }], error: null };
        if (table === 'lesson_notes') {
          return { data: [{ id: 'n1', lesson_id: 'lesson/one', updated_at: '2026-11-21T10:00:00Z' }], error: null };
        }
        if (table === 'teacher_students') {
          if (state.single) return { data: { teacher_id: 'teacher-1' }, error: null };
          return { data: [{ student_id: 's1' }], error: null };
        }
        if (table === 'session_content') {
          return {
            data: [
              { session_id: 'event-1', full_notes: 'Session notes', recording_url: 'https://example.com/recording', updated_at: '2026-11-19T10:00:00Z' },
              { session_id: 'event-2', full_notes: 'Student session notes', recording_url: 'https://example.com/recording-2', updated_at: '2026-11-18T10:00:00Z' }
            ],
            error: null
          };
        }
        if (table === 'lesson_progress') {
          return {
            data: [{ lesson_id: 'studio:one', answered: 12, correct: 9, incorrect: 3, last_activity: '2026-11-23T10:00:00Z' }],
            error: null
          };
        }
        if (table === 'lesson_submissions') {
          let rows = submissions;
          if (state.eqs.student_id) rows = rows.filter(row => row.student_id === state.eqs.student_id);
          if (state.inColumn === 'student_id') rows = rows.filter(row => state.inValues.includes(row.student_id));
          return { data: rows, error: null };
        }
        return { data: [], error: null };
      };

      const query = {
        select(columns, options) { state.head = Boolean(options && options.head); return query; },
        eq(column, value) { state.eqs[column] = value; return query; },
        neq() { return query; },
        or() { return query; },
        in(column, values) { state.inColumn = column; state.inValues = values; return query; },
        order() { return query; },
        limit() { return query; },
        maybeSingle: async () => { state.single = true; return result(); },
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
    enrolled_sessions: ['event-2'],
    created_at: user.created_at
  };

  return new JSDOM(html, {
    url: 'https://cosylanguages.github.io/COSYplatform/profile.html',
    runScripts: 'dangerously',
    beforeParse(window) {
      window.fetch = async () => ({
        ok: true,
        json: async () => ({
          languages: { total: 13, withAvailableCourse: 2, codes: ['en', 'fr'] },
          courses: { available: 3, total: 4 },
          lessons: { available: 6, planned: 10, total: 10 },
          lessonFilesOnDisk: 6,
          unlinkedLessonFiles: 0,
          generatedAt: '2026-10-02'
        })
      });
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
  assert.ok(document.getElementById('founder-new-members').innerHTML.includes('Fiona Founder'));
  assert.ok(document.getElementById('founder-new-members').innerHTML.includes('role-badge founder'));
  assert.ok(document.getElementById('founder-language-coverage').innerHTML.includes('EN'));
  assert.ok(document.getElementById('founder-language-coverage').innerHTML.includes('2/2 courses'));
  assert.ok(document.getElementById('founder-health').innerHTML.includes('Lesson files on disk'));
  assert.ok(document.getElementById('founder-health').innerHTML.includes('6'));
  assert.equal(document.getElementById('action-results').hidden, false);
  assert.equal(document.getElementById('detail-user-id').textContent, 'user-1');

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
  assert.ok(document.getElementById('teacher-review-queue').innerHTML.includes('Sam Learner'));
  assert.ok(document.getElementById('teacher-review-queue').innerHTML.includes('studio:one'));
  assert.ok(document.getElementById('teacher-student-list').innerHTML.includes('Sam Learner'));
  assert.ok(document.getElementById('teacher-student-list').innerHTML.includes('A2'));
  assert.ok(document.getElementById('teacher-coverage').innerHTML.includes('EN'));
  assert.ok(document.getElementById('teacher-coverage').innerHTML.includes('2/2 courses'));

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
  assert.ok(document.getElementById('teacher-review-queue').innerHTML.includes('Sam Learner'));
  assert.ok(document.getElementById('teacher-review-queue').innerHTML.includes('studio:one'));
  assert.ok(document.getElementById('teacher-student-list').innerHTML.includes('Sam Learner'));
  assert.ok(document.getElementById('teacher-coverage').innerHTML.includes('EN'));

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
  assert.ok(document.getElementById('student-continue').innerHTML.includes('studio:one'));
  assert.ok(document.getElementById('student-continue').innerHTML.includes('Resume lesson'));
  assert.ok(document.getElementById('student-assignments').innerHTML.includes('Reviewed'));
  assert.ok(document.getElementById('student-assignments').innerHTML.includes('Great pronunciation'));
  assert.ok(document.getElementById('student-assignments').innerHTML.includes('Awaiting review'));
  assert.ok(document.getElementById('student-sessions').innerHTML.includes('event-2'));
  assert.ok(document.getElementById('student-sessions').innerHTML.includes('Notes'));
  assert.equal(document.getElementById('detail-teacher').textContent, 'Tara Teacher');
  assert.equal(document.getElementById('detail-user-id').textContent, 'user-1');
  assert.equal(document.getElementById('action-results').hidden, true);

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


test('student profile is tabbed and only the selected section is visible', async () => {
  const dom = makeDom('student');
  await new Promise(resolve => setTimeout(resolve, 300));
  const document = dom.window.document;
  const nav = document.getElementById('profile-nav-buttons');
  const labels = Array.from(nav.querySelectorAll('button[data-section]')).map(btn => btn.textContent.trim());

  assert.ok(labels.some(label => label.includes('Overview')));
  assert.ok(labels.some(label => label.includes('Homework')));
  assert.ok(labels.some(label => label.includes('Vocabulary')));
  assert.ok(labels.some(label => label.includes('Courses')));
  assert.ok(labels.some(label => label.includes('Account')));
  assert.ok(!labels.some(label => label.includes('Members')));

  const overview = document.querySelector('[data-panel="student"] .profile-section[data-section="overview"]');
  const homework = document.querySelector('[data-panel="student"] .profile-section[data-section="homework"]');
  assert.equal(overview.hidden, false);
  assert.equal(homework.hidden, true);
  assert.equal(document.getElementById('header-catalog-link').hidden, true);

  nav.querySelector('button[data-section="homework"]').click();
  await new Promise(resolve => setTimeout(resolve, 50));
  assert.equal(overview.hidden, true);
  assert.equal(homework.hidden, false);
  assert.ok(document.getElementById('student-assignments').innerHTML.includes('Great pronunciation'));

  nav.querySelector('button[data-section="vocabulary"]').click();
  await new Promise(resolve => setTimeout(resolve, 50));
  assert.equal(homework.hidden, true);
  assert.equal(document.querySelector('[data-panel="student"] .profile-section[data-section="vocabulary"]').hidden, false);
  assert.ok(document.getElementById('vocab-search'));
  assert.ok(document.getElementById('vocab-results').textContent.includes('Start typing'));

  nav.querySelector('button[data-section="account"]').click();
  await new Promise(resolve => setTimeout(resolve, 50));
  assert.equal(document.getElementById('profile-account-section').hidden, false);
  assert.equal(document.querySelector('[data-panel="student"]').hidden, true);
  assert.equal(document.getElementById('detail-user-id').textContent, 'user-1');

  nav.querySelector('button[data-section="overview"]').click();
  await new Promise(resolve => setTimeout(resolve, 50));
  assert.equal(document.getElementById('profile-account-section').hidden, true);
  assert.equal(document.querySelector('[data-panel="student"]').hidden, false);
  assert.equal(overview.hidden, false);

  dom.window.close();
});

test('teacher profile exposes teaching tabs without student homework or vocabulary', async () => {
  const dom = makeDom('teacher');
  await new Promise(resolve => setTimeout(resolve, 300));
  const document = dom.window.document;
  const nav = document.getElementById('profile-nav-buttons');
  const labels = Array.from(nav.querySelectorAll('button[data-section]')).map(btn => btn.textContent.trim());

  assert.ok(labels.some(label => label.includes('Students')));
  assert.ok(labels.some(label => label.includes('Sessions')));
  assert.ok(labels.some(label => label.includes('Coverage')));
  assert.ok(!labels.some(label => label.includes('Homework')));
  assert.ok(!labels.some(label => label.includes('Vocabulary')));
  assert.equal(document.getElementById('header-catalog-link').hidden, false);

  nav.querySelector('button[data-section="students"]').click();
  await new Promise(resolve => setTimeout(resolve, 50));
  assert.equal(document.querySelector('[data-panel="teacher"] .profile-section[data-section="students"]').hidden, false);
  assert.equal(document.querySelector('[data-panel="teacher"] .profile-section[data-section="overview"]').hidden, true);
  assert.ok(document.getElementById('teacher-student-list').innerHTML.includes('Sam Learner'));

  dom.window.close();
});

test('founder profile exposes founder tabs and can switch to student mode', async () => {
  const dom = makeDom('founder');
  await new Promise(resolve => setTimeout(resolve, 300));
  const document = dom.window.document;
  const nav = document.getElementById('profile-nav-buttons');
  const labels = Array.from(nav.querySelectorAll('button[data-section]')).map(btn => btn.textContent.trim());

  assert.ok(labels.some(label => label.includes('Overview')));
  assert.ok(labels.some(label => label.includes('Members')));
  assert.ok(labels.some(label => label.includes('Catalog')));
  assert.ok(labels.some(label => label.includes('Workspaces')));
  assert.ok(!labels.some(label => label.includes('Homework')));
  assert.equal(document.getElementById('header-catalog-link').hidden, false);

  nav.querySelector('button[data-section="members"]').click();
  await new Promise(resolve => setTimeout(resolve, 50));
  assert.equal(document.querySelector('[data-panel="founder"] .profile-section[data-section="members"]').hidden, false);
  assert.ok(document.getElementById('founder-new-members').innerHTML.includes('Fiona Founder'));

  document.querySelector('.mode-tab[data-mode="student"]').click();
  await new Promise(resolve => setTimeout(resolve, 300));
  const studentLabels = Array.from(document.querySelectorAll('#profile-nav-buttons button[data-section]')).map(btn => btn.textContent.trim());
  assert.ok(studentLabels.some(label => label.includes('Homework')));
  assert.ok(studentLabels.some(label => label.includes('Vocabulary')));
  assert.equal(document.querySelector('[data-panel="student"]').hidden, false);
  assert.equal(document.getElementById('header-catalog-link').hidden, false);

  dom.window.close();
});

