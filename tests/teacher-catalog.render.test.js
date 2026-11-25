'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'teacher.html'), 'utf8');
const inline = html.match(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/i)[1];

const manifest = [
  { id: 'general-en-a1', title: 'General English A1', level: 'a1', lang: 'en', track: 'General' },
  { id: 'general-en-b1', title: 'General English B1', level: 'b1', lang: 'en', track: 'General' },
  { id: 'grammar-en-b1', title: 'Grammar Practice B1', level: 'b1', lang: 'en', track: 'Grammar' },
  { id: 'professional-en-b2', title: 'Professional EN B2', level: 'b2', lang: 'en', track: 'Professional' },
  { id: 'exam-en-c1', title: 'Exam EN C1', level: 'c1', lang: 'en', track: 'Exam', status: 'not_yet_available' },
  { id: 'general-fr-a2', title: 'General FR A2', level: 'a2', lang: 'fr', track: 'General' }
];

async function renderCatalog() {
  const dom = new JSDOM(html, {
    url: 'https://cosylanguages.github.io/COSYplatform/teacher.html',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  const { window } = dom;
  window.eval(inline + `
    window.renderTeacherCatalog = renderTeacherCatalog;
    window.renderTeacherCatalogMatrix = renderTeacherCatalogMatrix;
    window.filterTeacherCatalog = filterTeacherCatalog;
    window.changeTeacherCatalogLanguage = changeTeacherCatalogLanguage;
    window.toggleTeacherCatalogVisibility = toggleTeacherCatalogVisibility;
  `);
  window.onload = null;
  window.currentTeacherName = 'Damir';
  window.CosyAuth = { isCourseAccessible: () => true, requireRole: async () => null };
  await window.renderTeacherCatalog({ role: 'teacher', language_access: ['en', 'fr'] }, manifest);
  return { dom, window, document: window.document };
}

test('teacher catalog renders categories, search, language switch and hide control', async () => {
  const { window, document } = await renderCatalog();

  assert.ok(document.querySelector('.teacher-catalog-panel'));
  assert.ok(document.querySelector('.teacher-sidebar__nav a.is-active').textContent.includes('Lesson catalog'));
  assert.equal(document.querySelector('#teacher-catalog-language').value, 'en');
  assert.ok(document.querySelector('#teacher-catalog-matrix').textContent.includes('General English A1'));
  assert.ok(document.querySelector('#teacher-catalog-matrix').textContent.includes('General English B1'));
  assert.ok(document.querySelector('#teacher-catalog-matrix').textContent.includes('Grammar Practice B1'));
  assert.ok(document.querySelector('#teacher-catalog-matrix').textContent.includes('Soon'));
  assert.ok(!document.querySelector('#teacher-catalog-matrix').textContent.includes('General FR A2'));

  window.filterTeacherCatalog('grammar');
  assert.ok(document.querySelector('#teacher-catalog-matrix').textContent.includes('Grammar Practice B1'));
  assert.ok(!document.querySelector('#teacher-catalog-matrix').textContent.includes('General English A1'));
  assert.ok(document.querySelector('#teacher-catalog-count').textContent.includes('1 course shown'));

  window.filterTeacherCatalog('');
  window.changeTeacherCatalogLanguage('fr');
  assert.ok(document.querySelector('#teacher-catalog-matrix').textContent.includes('General FR A2'));
  assert.ok(!document.querySelector('#teacher-catalog-matrix').textContent.includes('General English A1'));
  assert.ok(window.location.search.includes('lang=fr'));

  window.toggleTeacherCatalogVisibility();
  assert.ok(document.querySelector('#teacher-catalog-box').classList.contains('is-hidden'));
  assert.equal(document.querySelector('#teacher-catalog-toggle').textContent, '+ Show catalog');
  window.toggleTeacherCatalogVisibility();
  assert.ok(!document.querySelector('#teacher-catalog-box').classList.contains('is-hidden'));
});
