#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const IGNORED_DIRS = new Set(['.git', 'node_modules', '.pages-site', 'dist', 'screenshots', 'verification', 'test-results']);
const IGNORED_PATHS = new Set([
  'scripts/check-legacy-table-references.js',
  'docs/legacy-table-cleanup.md',
  'docs/ecosystem-audit.md'
]);
const CODE_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.html', '.ts', '.tsx', '.jsx']);
const REFERENCES = [
  /\.from\(\s*['"]lesson_content['"]\s*\)/,
  /\.from\(\s*['"]student_lesson_content['"]\s*\)/,
  /rest\/v1\/lesson_content\b/,
  /rest\/v1\/student_lesson_content\b/,
  /saveLessonToSupabase/
];

const findings = [];

function scan(file) {
  const relative = path.relative(ROOT, file).split(path.sep).join('/');
  if (IGNORED_PATHS.has(relative)) return;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    if (REFERENCES.some(pattern => pattern.test(line))) {
      findings.push({ file: relative, line: index + 1, text: line.trim() });
    }
  });
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) walk(path.join(dir, entry.name));
      continue;
    }
    if (CODE_EXTENSIONS.has(path.extname(entry.name))) scan(path.join(dir, entry.name));
  }
}

walk(ROOT);

if (findings.length === 0) {
  console.log('No live references to lesson_content or student_lesson_content were found.');
  process.exit(0);
}

console.error('Legacy Supabase tables are still referenced. Do not drop them yet:\n');
for (const finding of findings) {
  console.error(`  ${finding.file}:${finding.line}  ${finding.text}`);
}
console.error('\nMigrate these call sites first; see docs/legacy-table-cleanup.md.');
process.exit(1);
