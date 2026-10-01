const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, '.pages-site');

const ALLOWED_ROOT_FILES = new Set([
  'index.html',
  'login.html',
  'hub.html',
  'student.html',
  'teacher.html',
  'founder.html',
  'classroom.html',
  'teacher-english.html',
  'teacher-french.html',
  'teacher-russian.html',
  '404.html'
]);

const ALLOWED_ROOT_DIRS = new Set([
  'shared',
  'roadmaps',
  'curriculums',
  'data'
]);

const EXCLUDED_PATHS = new Set([
  '.cache',
  '.git',
  '.github',
  '.pages-site',
  'activities',
  'docs',
  'fixtures',
  'lessons',
  'manuals',
  'node_modules',
  'reference',
  'reports',
  'schemas',
  'scripts',
  'student-workbooks',
  'supabase',
  'teacher-guides',
  'templates',
  'test-results'
]);

function shouldInclude(sourcePath) {
  const relPath = path.relative(ROOT_DIR, sourcePath).replace(/\\/g, '/');
  if (!relPath) return true; // root dir itself

  const parts = relPath.split('/');
  const topDir = parts[0];

  // Top level checks
  if (parts.length === 1) {
    if (ALLOWED_ROOT_FILES.has(topDir)) return true;
    if (ALLOWED_ROOT_DIRS.has(topDir)) return true;
    return false;
  }

  // Under top level allowed directories
  if (!ALLOWED_ROOT_DIRS.has(topDir)) return false;

  // Specific data/ filter: only data/platform-stats.json
  if (topDir === 'data') {
    if (relPath === 'data/platform-stats.json') return true;
    return false;
  }

  // General exclusion rules for allowed directories (shared, roadmaps, curriculums)
  if (parts.some(p => p === 'templates' || p.startsWith('.'))) return false;
  if (relPath.endsWith('.md')) return false;

  return true;
}

function copyDirectoryRecursive(src, dest) {
  if (!shouldInclude(src)) return;

  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      const srcChild = path.join(src, entry);
      const destChild = path.join(dest, entry);
      copyDirectoryRecursive(srcChild, destChild);
    }
  } else if (stat.isFile()) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

function buildPagesSite() {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const entry of fs.readdirSync(ROOT_DIR)) {
    const srcPath = path.join(ROOT_DIR, entry);
    const destPath = path.join(OUTPUT_DIR, entry);
    if (shouldInclude(srcPath)) {
      copyDirectoryRecursive(srcPath, destPath);
    }
  }

  return OUTPUT_DIR;
}

if (require.main === module) {
  const outputDir = buildPagesSite();
  console.log(`GitHub Pages site assembled at ${path.relative(ROOT_DIR, outputDir)} using allowlist.`);
}

module.exports = { buildPagesSite, ALLOWED_ROOT_FILES, ALLOWED_ROOT_DIRS, EXCLUDED_PATHS };
