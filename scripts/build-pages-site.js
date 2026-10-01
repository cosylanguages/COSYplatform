const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, '.pages-site');
const EXCLUDED_PATHS = new Set([
  '.cache',
  '.git',
  '.github',
  '.pages-site',
  'activities',
  'lessons',
  'manuals',
  'node_modules',
  'reference',
  'reports',
  'student-workbooks',
  'teacher-guides',
  'test-results'
]);

function buildPagesSite() {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const entry of fs.readdirSync(ROOT_DIR)) {
    if (EXCLUDED_PATHS.has(entry) || entry.startsWith('.') || entry.endsWith('.log')) continue;

    const source = path.join(ROOT_DIR, entry);
    const target = path.join(OUTPUT_DIR, entry);
    fs.cpSync(source, target, {
      recursive: true,
      filter(sourcePath) {
        const relativePath = path.relative(ROOT_DIR, sourcePath);
        return !relativePath.split(path.sep).some(part => EXCLUDED_PATHS.has(part) || part.startsWith('.')) &&
          !relativePath.endsWith('.log');
      }
    });
  }
  return OUTPUT_DIR;
}

if (require.main === module) {
  const outputDir = buildPagesSite();
  console.log(`GitHub Pages site assembled at ${path.relative(ROOT_DIR, outputDir)} without gated content.`);
}

module.exports = { buildPagesSite, EXCLUDED_PATHS };