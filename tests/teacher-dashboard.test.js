'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('teacher workspace defaults to a catalog-first layout', () => {
  const html = read('teacher.html');

  for (const marker of [
    'teacher-catalog-panel',
    'teacher-catalog-head',
    'teacher-catalog-language',
    'teacher-catalog-tab',
    'teacher-catalog-search',
    'teacher-catalog-toggle',
    'teacher-catalog-box',
    'teacher-catalog-matrix',
    'teacher-category-card',
    'teacher-course-link'
  ]) {
    assert.ok(html.includes(marker), `${marker} is present`);
  }

  assert.ok(html.includes('renderTeacherCatalogMatrix'));
  assert.ok(html.includes('changeTeacherCatalogLanguage'));
  assert.ok(html.includes('filterTeacherCatalog'));
  assert.ok(html.includes('toggleTeacherCatalogVisibility'));
  assert.ok(html.includes("(viewParam || '').toLowerCase() === 'dashboard'"));
  assert.ok(html.includes('renderTeacherCatalog(authData.profile, fullManifest)'));
});

test('teacher dashboard view keeps live metrics', () => {
  const html = read('teacher.html');

  for (const marker of [
    'teacher-dashboard-shell',
    'teacher-sidebar',
    'teacher-dashboard-grid',
    'teacher-kpi-grid',
    'teacher-timeline',
    'quality-status-pill',
    'data-teacher-nav',
    'kpi-students',
    'kpi-reviews',
    'sidebar-review-count'
  ]) {
    assert.ok(html.includes(marker), `${marker} is present`);
  }

  assert.ok(html.includes('refreshTeacherDashboardMetrics'));
  assert.ok(html.includes("setTeacherText('kpi-students'"));
  assert.ok(html.includes('teacher-week-sessions'));
});

test('workspace guards keep student, teacher and founder data separate', () => {
  const teacher = read('teacher.html');
  assert.ok(teacher.includes("requireRole(['teacher', 'founder'])"));
  assert.ok(teacher.includes("serverProfile.role !== 'teacher' && serverProfile.role !== 'founder'"));
  assert.ok(teacher.includes('.eq("role", "student")'));
  assert.ok(!teacher.includes('.neq("role", "founder")'));

  const student = read('student.html');
  assert.ok(student.includes("requireRole(['student', 'founder'])"));
  assert.ok(!student.includes("requireRole(['student', 'teacher', 'founder'])"));
  assert.ok(student.includes("!['student', 'founder'].includes(serverProfile.role)"));

  const founder = read('founder.html');
  assert.ok(founder.includes("requireRole(['founder'])"));
  assert.ok(founder.includes("serverProfile.role !== 'founder'"));
});

test('lesson studio is hidden until a teacher or founder is verified', () => {
  const studio = read('lesson-studio.html');
  assert.ok(studio.includes("requireRole(['teacher', 'founder'])"));
  assert.ok(studio.includes('data-auth-pending'));
});
