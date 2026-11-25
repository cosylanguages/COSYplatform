'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.join(__dirname, '..');
const LANGS = ['en', 'fr', 'ru', 'it', 'el'];

function loadDictionary(lang) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'shared', 'i18n', `${lang}.json`), 'utf8'));
}

function contentKeys(dictionary) {
  return new Set(Object.keys(dictionary).filter(key => !key.startsWith('_')));
}

function usedHtmlKeys() {
  const used = new Set();
  for (const file of fs.readdirSync(ROOT).filter(name => name.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
    for (const match of html.matchAll(/data-i18n(?:-[a-z]+)?=["']([^"'${}]+)["']/g)) {
      used.add(match[1]);
    }
  }
  return used;
}

test('all locale dictionaries have the same keys as English', () => {
  const english = contentKeys(loadDictionary('en'));
  for (const lang of LANGS.filter(code => code !== 'en')) {
    const keys = contentKeys(loadDictionary(lang));
    assert.deepEqual([...english].sort(), [...keys].sort(), `${lang}.json key set differs from en.json`);
  }
});

test('every static data-i18n key exists in English and every locale', () => {
  const used = usedHtmlKeys();
  assert.ok(used.size > 0, 'no data-i18n keys found in root pages');
  for (const lang of LANGS) {
    const keys = contentKeys(loadDictionary(lang));
    const missing = [...used].filter(key => !keys.has(key)).sort();
    assert.deepEqual(missing, [], `${lang}.json is missing static HTML keys`);
  }
});
