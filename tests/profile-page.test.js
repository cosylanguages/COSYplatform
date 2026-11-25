const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('profile page is the post-login landing page', () => {
  const login = read('login.html');
  const sso = read('shared/js/auth-sso.js');

  assert.ok(login.includes("safeTarget || 'profile.html'"));
  assert.ok(sso.includes("safeTarget || 'profile.html'"));
  assert.ok(login.includes('profile.html'));
});

test('profile page loads and renders the signed-in user data', () => {
  const html = read('profile.html');

  for (const id of [
    'profile-name',
    'profile-email',
    'profile-role-pill',
    'stat-active-courses',
    'stat-lessons-practised',
    'stat-tasks-submitted',
    'stat-study-events',
    'profile-grants',
    'profile-activity',
    'detail-languages',
    'detail-level',
    'detail-member-since',
    'detail-last-signin'
  ]) {
    assert.ok(html.includes(`id="${id}"`), `${id} is rendered`);
  }

  assert.ok(html.includes('window.CosyAuth.getAuthAndProfile()'));
  assert.ok(html.includes("from('profiles')"));
  assert.ok(html.includes("from('access_grants')"));
  assert.ok(html.includes("'lesson_progress'"));
  assert.ok(html.includes("from('lesson_submissions')"));
  assert.ok(html.includes("from('study_events')"));
});

test('workspace pages link back to the profile', () => {
  for (const file of ['hub.html', 'student.html', 'teacher.html', 'founder.html']) {
    assert.ok(read(file).includes('href="profile.html"'), `${file} links to profile.html`);
  }
});
