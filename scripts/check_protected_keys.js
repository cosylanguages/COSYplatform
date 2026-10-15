/**
 * CI Check Script: Prevent Protected Keys in Public Repository Files
 *
 * Scans XML and JSON files repository-wide to ensure no files contain prohibited keys or tags:
 * - answers
 * - teacherNotes
 * - answer-key
 * - <cosy-teacher-notes>
 * - <teacher-notes>
 *
 * Exit code 0 on success, exit code 1 if protected keys are found.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const IGNORED_PATHS = [
  'node_modules',
  '.git',
  '.vscode',
  'package.json',
  'package-lock.json',
  'verification'
];

const PROHIBITED_KEYS = ['answers', 'teacherNotes', 'answer-key'];
const PROHIBITED_TAGS = ['<cosy-teacher-notes', '<teacher-notes'];

function isIgnored(relativeFilePath) {
  return IGNORED_PATHS.some(ignored =>
    relativeFilePath === ignored || relativeFilePath.startsWith(ignored + '/')
  );
}

function scanDirectory(dir, violations) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(REPO_ROOT, fullPath);

    if (isIgnored(relPath)) continue;

    if (entry.isDirectory()) {
      scanDirectory(fullPath, violations);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ext === '.json' || ext === '.xml') {
        const content = fs.readFileSync(fullPath, 'utf8');

        PROHIBITED_KEYS.forEach(key => {
          const jsonPattern = new RegExp(`"${key}"\\s*:`, 'i');
          const keyMatch = jsonPattern.test(content) || content.includes(`key="${key}"`) || content.includes(`<${key}>`);

          if (keyMatch) {
            violations.push({
              file: relPath,
              type: 'key',
              item: key
            });
          }
        });

        PROHIBITED_TAGS.forEach(tag => {
          if (content.toLowerCase().includes(tag.toLowerCase())) {
            violations.push({
              file: relPath,
              type: 'tag',
              item: tag
            });
          }
        });
      }
    }
  }
}

function checkProtectedKeys() {
  console.log('=== CI Check: Verifying No Protected Keys or Teacher Notes Repository-Wide ===');

  const violations = [];

  scanDirectory(REPO_ROOT, violations);

  if (violations.length > 0) {
    console.error('\n❌ CRITICAL SECURITY FAILURE: Prohibited keys/tags found in public files!');
    violations.forEach(v => {
      console.error(`  - File: ${v.file} | ${v.type}: "${v.item}"`);
    });
    console.error('\nProtected keys and teacher notes must be removed and stored in lesson_protected Supabase table.');
    process.exit(1);
  }

  console.log('✅ PASS: No protected keys or teacher notes found repository-wide. All public files clean.');
}

if (require.main === module) {
  checkProtectedKeys();
}

module.exports = { checkProtectedKeys };
