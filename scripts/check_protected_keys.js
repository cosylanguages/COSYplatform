/**
 * CI Check Script: Prevent Protected Keys in Public Content
 *
 * Scans roadmaps/ and lessons/ directories to ensure no files contain prohibited keys:
 * - answers
 * - teacherNotes
 * - answer-key
 *
 * Exit code 0 on success, exit code 1 if protected keys are found.
 */

const fs = require('fs');
const path = require('path');

const TARGET_DIRS = [
  path.join(__dirname, '../roadmaps'),
  path.join(__dirname, '../lessons')
];

const PROHIBITED_KEYS = ['answers', 'teacherNotes', 'answer-key'];

function scanDirectory(dir, violations) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath, violations);
    } else if (entry.isFile()) {
      const content = fs.readFileSync(fullPath, 'utf8');

      PROHIBITED_KEYS.forEach(key => {
        // Match JSON key patterns or XML/text patterns
        const jsonPattern = new RegExp(`"${key}"\\s*:`, 'i');
        const keyMatch = jsonPattern.test(content) || content.includes(`key="${key}"`) || content.includes(`<${key}>`);

        if (keyMatch) {
          violations.push({
            file: path.relative(path.join(__dirname, '..'), fullPath),
            key
          });
        }
      });
    }
  }
}

function checkProtectedKeys() {
  console.log('=== CI Check: Verifying No Protected Keys in Public Folders ===');

  const violations = [];

  TARGET_DIRS.forEach(dir => {
    scanDirectory(dir, violations);
  });

  if (violations.length > 0) {
    console.error('\n❌ CRITICAL SECURITY FAILURE: Prohibited keys found in public content!');
    violations.forEach(v => {
      console.error(`  - File: ${v.file} | Key: "${v.key}"`);
    });
    console.error('\nProtected keys (answers, teacherNotes, answer-key) must be removed and stored in lesson_protected Supabase table.');
    process.exit(1);
  }

  console.log('✅ PASS: No protected keys found in roadmaps/ or lessons/. All public files clean.');
}

if (require.main === module) {
  checkProtectedKeys();
}

module.exports = { checkProtectedKeys };
