'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function manifestIds() {
  const source = read('shared/js/auth-guard.js');
  const start = source.indexOf('window.CosyAuth.FULL_MANIFEST = [');
  const end = source.indexOf('];', start);
  return new Set(JSON.parse(source.slice(source.indexOf('[', start), end + 1)).map(course => course.id));
}

test('every hardcoded lesson path points to a real lesson file', () => {
  const pattern = /lessons\/[A-Za-z0-9_\-./]+\.(?:json|xml)/g;
  const files = fs.readdirSync(root).filter(file => file.endsWith('.html'));
  const missing = [];
  for (const file of files) {
    for (const match of read(file).matchAll(pattern)) {
      if (!fs.existsSync(path.join(root, match[0]))) missing.push(`${file}: ${match[0]}`);
    }
  }
  assert.deepEqual(missing, []);
});

test('every hardcoded course link points to a manifest course', () => {
  const ids = manifestIds();
  const pattern = /[?&]course=(?:%22|"|')?([A-Za-z0-9_\-]+)/g;
  const files = fs.readdirSync(root).filter(file => file.endsWith('.html'));
  const unknown = [];
  for (const file of files) {
    for (const match of read(file).matchAll(pattern)) {
      if (!ids.has(match[1])) unknown.push(`${file}: ${match[1]}`);
    }
  }
  assert.deepEqual(unknown, []);
});

test('student and teacher course deep links honour course access rules', () => {
  for (const file of ['student.html', 'teacher.html']) {
    const html = read(file);
    const courseBranch = html.indexOf('} else if (courseParam) {');
    assert.notEqual(courseBranch, -1, `${file} handles direct course links`);
    const branch = html.slice(courseBranch, courseBranch + 420);
    assert.ok(branch.includes('canAccessCourseId(courseParam'), `${file} checks course access`);
    assert.ok(branch.indexOf('canAccessCourseId') < branch.indexOf('renderCourseRoadmap'), `${file} checks access before rendering`);
  }

  const index = read('index.html');
  assert.ok(index.includes("role === 'founder' ||"));
  assert.ok(index.includes('window.CosyAuth.canAccessCourseId(courseParam, authState)'));
  assert.ok(index.indexOf('canOpenCourse') < index.indexOf('renderPublicRoadmap(courseParam, levelParam)'));
});

test('classroom uses the editorial shell and restricts its lesson catalog', () => {
  const classroom = read('classroom.html');
  assert.ok(classroom.includes('classroom-shell'));
  assert.ok(classroom.includes('classroom-role-chip'));
  assert.ok(classroom.includes('editorial.css'));
  assert.ok(classroom.includes('const accessible = manifest.filter'));
  assert.ok(classroom.includes('isCourseAccessible(c, userProfile)'));
  assert.ok(classroom.indexOf('isCourseAccessible') < classroom.indexOf('for (const c of accessible)'));
});

test('student workspace does not show placeholder teacher, session or lesson data', () => {
  const student = read('student.html');
  assert.ok(!student.includes('Elena Rostova'));
  assert.ok(!student.includes('unit1-travel'));
  assert.ok(!student.includes('Assigned Homework'));
  assert.ok(student.includes('const planCourses = fullManifest.filter'));
  assert.ok(student.includes('Published in your access plan'));
});

test('editorial skin includes classroom tokens for light and dark themes', () => {
  const css = read('shared/css/editorial.css');
  assert.ok(css.includes('/* ── Live classroom'));
  assert.ok(css.includes('body.classroom-shell'));
  assert.ok(css.includes('--classroom-deep'));
  assert.ok(css.includes('.classroom-role-chip[data-role="student"]'));
  assert.ok(css.includes('.classroom-role-chip[data-role="founder"]'));
});
