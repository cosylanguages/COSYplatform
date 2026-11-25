const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('profile page is the post-login landing page', () => {
  const login = read('login.html');
  const sso = read('shared/js/auth-sso.js');

  assert.ok(login.includes("isCatalogRoot(safeTarget) ? 'profile.html' : safeTarget"));
  assert.ok(sso.includes("isCatalogRoot(safeTarget) ? 'profile.html' : safeTarget"));
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
    'student-continue',
    'student-assignments',
    'student-sessions',
    'teacher-review-queue',
    'teacher-student-list',
    'teacher-coverage',
    'founder-new-members',
    'founder-language-coverage',
    'founder-health',
    'action-download-data',
    'action-copy-id',
    'detail-teacher',
    'detail-user-id',
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
  assert.ok(html.includes("from('teacher_students')"));
  assert.ok(html.includes("from('session_content')"));
  assert.ok(html.includes('downloadProfileData'));
  assert.ok(html.includes('cosy-profile.json'));
});

test('workspace pages link back to the profile', () => {
  for (const file of ['hub.html', 'student.html', 'teacher.html', 'founder.html']) {
    assert.ok(read(file).includes('href="profile.html"'), `${file} links to profile.html`);
  }
});

test('profile page has role panels and a founder-only mode switcher', () => {
  const html = read('profile.html');

  for (const mode of ['student', 'teacher', 'founder']) {
    assert.ok(html.includes(`data-panel="${mode}"`), `${mode} panel exists`);
    assert.ok(html.includes(`data-mode="${mode}"`), `${mode} tab exists`);
  }
  assert.ok(html.includes('id="mode-switcher"'));
  assert.ok(html.includes('Founder-only: switch between all modes'));
  assert.ok(html.includes("if (role !== 'founder' && mode !== role) return Promise.resolve();"));
  assert.ok(html.includes('id="teacher-stat-students"'));
  assert.ok(html.includes('id="teacher-sessions"'));
  assert.ok(html.includes("from('session_content')"));
  assert.ok(html.includes('id="founder-stat-courses"'));

  assert.ok(html.includes('id="profile-section-nav"'));
  assert.ok(html.includes('id="profile-nav-buttons"'));
  assert.ok(html.includes('data-section="homework"'));
  assert.ok(html.includes('data-section="vocabulary"'));
  assert.ok(html.includes('data-section="account"'));
  assert.ok(html.includes('id="profile-account-section"'));
  assert.ok(html.includes('SECTION_CONFIG'));
  assert.ok(html.includes('showSection'));
  assert.ok(html.includes('id="vocab-search"'));
});

test('workspace headers expose the founder-only mode switcher', () => {
  for (const [file, active] of [['student.html', 'student'], ['teacher.html', 'teacher'], ['founder.html', 'founder'], ['hub.html', '']]) {
    const html = read(file);
    assert.ok(html.includes('shared/js/mode-switcher.js'), `${file} loads the switcher`);
    assert.ok(html.includes('id="founder-mode-switcher"'), `${file} has a switcher host`);
    assert.ok(html.includes(`active: '${active}'`), `${file} marks its active mode`);
  }
  const switcher = read('shared/js/mode-switcher.js');
  assert.ok(switcher.includes("role !== 'founder'"), 'switcher hides for non-founders');
});
