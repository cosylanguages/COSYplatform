#!/usr/bin/env node
/* Fails when a lesson's declared language disagrees with its folder or roadmap. */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FOLDER_LANGUAGE = {
  'spoken-en': 'en',
  'discussion-en': 'en',
  'spoken-fr': 'fr',
  'spoken-ru': 'ru',
  'english-b2': 'en',
  'english-c1': 'en',
  'english-pronunciation': 'en',
  'french-pronunciation': 'fr',
  'russian-pronunciation': 'ru',
  'general-english-a0': 'en',
  'general-english-a1': 'en',
  'general-english-a2': 'en',
  'science-en': 'en',
  introductory: 'en'
};

const failures = [];

function lessonLanguage(file) {
  const content = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.xml')) {
    const root = content.match(/<cosy-lesson\b([^>]*)>/i) || content.match(/<lesson\b([^>]*)>/i);
    if (!root) return null;
    const match = root[1].match(/\blanguage=["']([^"']+)["']/i);
    return match ? match[1].toLowerCase() : null;
  }
  if (file.endsWith('.json')) {
    try {
      const data = JSON.parse(content);
      return data.language ? String(data.language).toLowerCase() : null;
    } catch {
      return null;
    }
  }
  return null;
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.name.endsWith('.xml') || entry.name.endsWith('.json')) checkFolder(target);
  }
}

function checkFolder(file) {
  const folder = path.basename(path.dirname(file));
  const expected = FOLDER_LANGUAGE[folder];
  const actual = lessonLanguage(file);
  if (expected && actual && actual !== expected) {
    failures.push(`${path.relative(ROOT, file)} declares "${actual}" but lives in ${folder}/ (expected "${expected}")`);
  }
}

function checkRoadmaps() {
  const dir = path.join(ROOT, 'roadmaps');
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir).filter(name => name.endsWith('.json'))) {
    const match = name.match(/^[a-z-]+-([a-z]{2})-[a-z0-9]+\.json$/);
    if (!match) continue;
    const expected = match[1];
    const data = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
    const entries = Array.isArray(data.sequence) ? data.sequence : [];
    for (const entry of entries) {
      if (!entry.lessonFile) continue;
      const file = path.join(ROOT, entry.lessonFile);
      if (!fs.existsSync(file)) {
        failures.push(`roadmaps/${name} references missing ${entry.lessonFile}`);
        continue;
      }
      const actual = lessonLanguage(file);
      if (actual && actual !== expected) {
        failures.push(`roadmaps/${name} is "${expected}" but ${entry.lessonFile} declares "${actual}"`);
      }
    }
  }
}

walk(path.join(ROOT, 'lessons'));
checkRoadmaps();

if (failures.length) {
  console.error('Lesson language mismatches:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log('Lesson language check OK: folders and roadmaps agree with lesson metadata.');
