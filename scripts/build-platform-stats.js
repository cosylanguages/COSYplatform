#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AUTH_GUARD = path.join(ROOT, 'shared', 'js', 'auth-guard.js');
const ROADMAPS_DIR = path.join(ROOT, 'roadmaps');
const LESSONS_DIR = path.join(ROOT, 'lessons');
const OUTPUT = path.join(ROOT, 'data', 'platform-stats.json');
const CHECK_MODE = process.argv.includes('--check');

function readManifest() {
  const source = fs.readFileSync(AUTH_GUARD, 'utf8');
  const start = source.indexOf('window.CosyAuth.FULL_MANIFEST = [');
  const bracketStart = source.indexOf('[', start);
  const bracketEnd = source.indexOf('];', bracketStart);
  if (start === -1 || bracketEnd === -1) {
    throw new Error('Could not read FULL_MANIFEST from shared/js/auth-guard.js');
  }
  return JSON.parse(source.slice(bracketStart, bracketEnd + 1));
}

function walkFiles(dir, extension, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, extension, out);
    else if (path.extname(entry.name).toLowerCase() === extension) out.push(full);
  }
  return out;
}

function lessonFilesOnDisk() {
  return [
    ...walkFiles(LESSONS_DIR, '.json'),
    ...walkFiles(LESSONS_DIR, '.xml')
  ].filter(file => path.basename(file) !== 'manifest.json');
}

function relative(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function buildStats() {
  const manifest = readManifest();
  const active = new Map(
    manifest
      .filter(course => course.status !== 'not_yet_available')
      .map(course => [course.id, course])
  );

  const roadmapFiles = fs.readdirSync(ROADMAPS_DIR).filter(file => file.endsWith('.json'));
  const referencedLessons = new Set();
  let totalLessons = 0;
  let availableLessons = 0;

  for (const file of roadmapFiles) {
    const courseId = path.basename(file, '.json');
    const roadmap = JSON.parse(fs.readFileSync(path.join(ROADMAPS_DIR, file), 'utf8'));
    const sequence = Array.isArray(roadmap.sequence) ? roadmap.sequence : [];
    totalLessons += sequence.length;
    if (active.has(courseId)) availableLessons += sequence.length;

    for (const item of sequence) {
      if (item.lessonFile) referencedLessons.add(item.lessonFile);
    }
  }

  const diskFiles = lessonFilesOnDisk();
  const unlinked = diskFiles.filter(file => !referencedLessons.has(relative(file)));
  const languages = [...new Set(manifest.map(course => course.lang).filter(Boolean))].sort();
  const availableLanguages = [...new Set([...active.values()].map(course => course.lang).filter(Boolean))].sort();

  return {
    languages: {
      total: languages.length,
      withAvailableCourse: availableLanguages.length,
      codes: availableLanguages
    },
    courses: {
      available: active.size,
      total: manifest.length
    },
    lessons: {
      available: availableLessons,
      planned: totalLessons - availableLessons,
      total: totalLessons
    },
    lessonFilesOnDisk: diskFiles.length,
    unlinkedLessonFiles: unlinked.length,
    generatedAt: new Date().toISOString().slice(0, 10)
  };
}

function comparable(stats) {
  const copy = JSON.parse(JSON.stringify(stats));
  delete copy.generatedAt;
  return JSON.stringify(copy, null, 2);
}

const stats = buildStats();

if (CHECK_MODE) {
  if (!fs.existsSync(OUTPUT)) {
    console.error('data/platform-stats.json is missing. Run npm run stats:build.');
    process.exit(1);
  }
  const current = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
  if (comparable(current) !== comparable(stats)) {
    console.error('data/platform-stats.json is stale. Run npm run stats:build and commit the result.');
    console.error('\nExpected:\n' + comparable(stats));
    console.error('\nActual:\n' + comparable(current));
    process.exit(1);
  }
  console.log('data/platform-stats.json matches the current manifest, roadmaps and lesson files.');
  process.exit(0);
}

fs.writeFileSync(OUTPUT, JSON.stringify(stats, null, 2) + '\n');
console.log(`Wrote ${path.relative(ROOT, OUTPUT)}: ${stats.courses.available}/${stats.courses.total} courses, ` +
  `${stats.lessons.available}/${stats.lessons.total} lesson slots, ${stats.lessonFilesOnDisk} lesson files.`);
