'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');

function loadAccessRules() {
  const window = {};
  window.window = window;
  const context = { window, console, String, Array, Object };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'shared/js/access-rules.js'), 'utf8'), context);
  return window.CosyAccess;
}

test('staff roles can browse the catalog and students cannot', () => {
  const access = loadAccessRules();
  assert.equal(access.isStaff('teacher'), true);
  assert.equal(access.isStaff('founder'), true);
  assert.equal(access.isStaff('student'), false);
  assert.equal(access.isStaff('unknown'), false);
  assert.equal(access.isStaff('TEACHER'), true);
  assert.equal(access.isStaff(' TEACHER '), true);
  assert.equal(access.isStaff('Student'), false);
});

test('students are sent to their workspace from the catalog', () => {
  const access = loadAccessRules();
  assert.equal(access.catalogRedirect('student', ''), 'student.html');
  assert.equal(access.catalogRedirect('student', '?course=en-b1&level=b1'), 'student.html?course=en-b1&level=b1');
  assert.equal(access.catalogRedirect('teacher', '?course=en-b1'), null);
  assert.equal(access.catalogRedirect('founder', '?course=en-b1'), null);
  assert.equal(access.workspaceForRole('student'), 'student.html');
  assert.equal(access.workspaceForRole('teacher'), 'teacher.html');
  assert.equal(access.workspaceForRole('founder'), 'founder.html');
  assert.equal(access.normalizeRole('STUDENT'), 'student');
  assert.equal(access.normalizeRole('TEACHER'), 'teacher');
  assert.equal(access.normalizeRole('FOUNDER'), 'founder');
});

test('the bare app root opens the profile while index.html stays the catalog', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(html.includes('const isBareAppRoot ='));
  assert.ok(html.includes("window.location.replace('profile.html')"));
  assert.ok(html.indexOf('if (isBareAppRoot') < html.indexOf('if (!isStaff)'));
});

test('the catalog page checks the signed-in role before rendering', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(html.includes('shared/js/access-rules.js'));
  assert.ok(html.includes('const authState = await checkAuthentication();'));
  assert.ok(html.includes('if (!authState.authenticated)'));
  assert.ok(html.includes('window.CosyAccess.isStaff(role)'));
  assert.ok(html.includes('window.CosyAccess.catalogRedirect(role, window.location.search)'));
  assert.ok(html.indexOf('if (!authState.authenticated)') < html.indexOf('renderPublicCatalog(authState)'));
});

test('the hub page checks the signed-in role before rendering', () => {
  const html = fs.readFileSync(path.join(root, 'hub.html'), 'utf8');
  assert.ok(html.includes('shared/js/access-rules.js'));
  assert.ok(html.includes('window.CosyAccess.isStaff(role)'));
  assert.ok(html.includes('window.CosyAccess.catalogRedirect(role, window.location.search)'));
  assert.ok(html.indexOf('if (!isStaff)') < html.indexOf('renderHubCatalog('));
});
