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
 * It also lists, WITHOUT failing, other spellings that usually hold answers or teacher notes
 * (see ADVISORY_KEYS). Those exist today in public lessons that are not yet served through
 * Supabase; the list shows how much remains to be moved. Move a key into PROHIBITED_KEYS once
 * its files are clean so it can never come back.
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
// 'explanation' is deliberately not listed: it is normal public teaching text in grammar references.
// 'correct' and 'teacher_notes' are not listed: 'correct' is the shown fix in error-correction examples and
// 'teacher_notes' is a syllabus metadata field in curriculums/, both intended to be public.
const ADVISORY_KEYS = ['answer', 'ans', 'answerKey', 'answer_key', 'isCorrect', 'correctAnswer', 'correct_answer', 'solution', 'teacher-notes'];

function isIgnored(relativeFilePath) {
  return IGNORED_PATHS.some(ignored =>
    relativeFilePath === ignored || relativeFilePath.startsWith(ignored + '/')
  );
}

function scanDirectory(dir, violations, advisories) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(REPO_ROOT, fullPath);

    if (isIgnored(relPath)) continue;

    if (entry.isDirectory()) {
      scanDirectory(fullPath, violations, advisories);
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

        if (advisories) {
          ADVISORY_KEYS.forEach(key => {
            if (new RegExp(`"${key}"\\s*:`, 'i').test(content)) advisories.push({ file: relPath, item: key });
          });
        }

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

  const advisories = [];
  scanDirectory(REPO_ROOT, violations, advisories);

  if (violations.length > 0) {
    console.error('\n❌ CRITICAL SECURITY FAILURE: Prohibited keys/tags found in public files!');
    violations.forEach(v => {
      console.error(`  - File: ${v.file} | ${v.type}: "${v.item}"`);
    });
    console.error('\nProtected keys and teacher notes must be removed and stored in lesson_protected Supabase table.');
    process.exit(1);
  }

  if (advisories.length > 0) {
    const byKey = {};
    advisories.forEach(a => { (byKey[a.item] = byKey[a.item] || new Set()).add(a.file); });
    console.log('\nℹ️  Advisory (does not fail the check): possible answer/teacher-note fields in public files:');
    Object.keys(byKey).sort().forEach(k => {
      const files = Array.from(byKey[k]);
      console.log(`  "${k}": ${files.length} file(s), e.g. ${files.slice(0, 2).join(', ')}`);
    });
    console.log('');
  }

  console.log('✅ PASS: No protected keys or teacher notes found repository-wide. All public files clean.');
}

if (require.main === module) {
  checkProtectedKeys();
}

module.exports = { checkProtectedKeys };
