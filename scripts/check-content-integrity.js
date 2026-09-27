#!/usr/bin/env node

/**
 * Content Integrity Checker
 * Verifies repository structural integrity, duplicate detection, roadmap sequence markers,
 * manifest file mapping, and orphan curriculum detection.
 */

const fs = require('fs');
const path = require('path');

let hasErrors = false;

function logError(checkName, message) {
  console.error(`❌ [${checkName}] ${message}`);
  hasErrors = true;
}

function logSuccess(checkName, message) {
  console.log(`✅ [${checkName}] ${message}`);
}

const ROOT_DIR = path.resolve(__dirname, '..');

// Helper to recursively find JSON files
function findJsonFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== '_archive' && file !== '_schema' && file !== '_out_of_scope') {
        findJsonFiles(fullPath, fileList);
      }
    } else if (file.endsWith('.json')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

// ---------------------------------------------------------------------------
// Check 1: Duplicate Curriculum & Roadmap Detection
// ---------------------------------------------------------------------------
function checkDuplicates() {
  console.log('\n🔍 Check 1: Duplicate Curriculum & Roadmap Detection...');
  let checkPassed = true;

  // 1a: Curriculum duplicates
  const currDir = path.join(ROOT_DIR, 'curriculums');
  const currFiles = findJsonFiles(currDir);
  const currMap = new Map();

  for (const filePath of currFiles) {
    const relPath = path.relative(currDir, filePath);
    const parts = relPath.split(path.sep);
    if (parts.length >= 3) {
      const lang = parts[0].toLowerCase();
      const track = parts[1].toLowerCase();
      const level = path.basename(parts[2], '.json').toLowerCase();
      const key = `${lang}:${track}:${level}`;

      if (!currMap.has(key)) currMap.set(key, []);
      currMap.get(key).push(relPath);
    }
  }

  for (const [key, files] of currMap.entries()) {
    if (files.length > 1) {
      logError('Check 1 (Duplicates)', `Multiple curriculum files for ${key}: ${files.join(', ')}`);
      checkPassed = false;
    }
  }

  // 1b: Roadmap duplicates
  const roadmapsDir = path.join(ROOT_DIR, 'roadmaps');
  const roadmapMap = new Map();

  if (fs.existsSync(roadmapsDir)) {
    const rmFiles = fs.readdirSync(roadmapsDir).filter(f => f.endsWith('.json'));

    for (const rmFile of rmFiles) {
      const slug = rmFile.replace(/\.json$/, '');
      let key;

      if (slug === 'introductory-english') {
        key = 'en:introductory:all';
      } else {
        const match = slug.match(/^([a-z-]+)-([a-z]{2})-([a-z0-9]+)$/);
        if (match) {
          const track = match[1].toLowerCase();
          const lang = match[2].toLowerCase();
          const level = match[3].toLowerCase();
          key = `${lang}:${track}:${level}`;
        } else {
          key = `unknown:${slug}`;
        }
      }

      if (!roadmapMap.has(key)) roadmapMap.set(key, []);
      roadmapMap.get(key).push(rmFile);
    }

    for (const [key, files] of roadmapMap.entries()) {
      if (files.length > 1) {
        logError('Check 1 (Duplicates)', `Multiple roadmap files for ${key}: ${files.join(', ')}`);
        checkPassed = false;
      }
    }
  }

  if (checkPassed) {
    logSuccess('Check 1 (Duplicates)', 'No duplicate curriculums or roadmaps found.');
  }
}

// ---------------------------------------------------------------------------
// Check 2: Unresolved / Undeclared Roadmap Sequence Entries
// ---------------------------------------------------------------------------
function checkRoadmapSequenceEntries() {
  console.log('\n🔍 Check 2: Roadmap Sequence Entries Validation...');
  let checkPassed = true;
  const roadmapsDir = path.join(ROOT_DIR, 'roadmaps');

  if (fs.existsSync(roadmapsDir)) {
    const rmFiles = fs.readdirSync(roadmapsDir).filter(f => f.endsWith('.json'));

    for (const rmFile of rmFiles) {
      const fullPath = path.join(roadmapsDir, rmFile);
      try {
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        const sequence = data.sequence || [];

        sequence.forEach((entry, idx) => {
          const hasLessonFile = Boolean(entry.lessonFile && entry.lessonFile.trim());
          const isPlanned = entry.status === 'planned';

          if (!hasLessonFile && !isPlanned) {
            logError(
              'Check 2 (Roadmap Entries)',
              `In roadmaps/${rmFile} (entry #${idx + 1} "${entry.id || entry.title}"): missing "lessonFile" and no explicit "status": "planned" marker.`
            );
            checkPassed = false;
          }
        });
      } catch (err) {
        logError('Check 2 (Roadmap Entries)', `Failed to parse JSON in roadmaps/${rmFile}: ${err.message}`);
        checkPassed = false;
      }
    }
  }

  if (checkPassed) {
    logSuccess('Check 2 (Roadmap Entries)', 'All roadmap sequence entries are properly mapped or marked as planned.');
  }
}

// ---------------------------------------------------------------------------
// Check 3: FULL_MANIFEST Referenced Files Check
// ---------------------------------------------------------------------------
function parseFullManifest() {
  const authGuardPath = path.join(ROOT_DIR, 'shared', 'js', 'auth-guard.js');
  if (!fs.existsSync(authGuardPath)) {
    logError('Check 3 (Manifest)', 'shared/js/auth-guard.js does not exist.');
    return [];
  }

  const content = fs.readFileSync(authGuardPath, 'utf8');
  const startIdx = content.indexOf('window.CosyAuth.FULL_MANIFEST = [');
  if (startIdx === -1) {
    logError('Check 3 (Manifest)', 'Could not find FULL_MANIFEST in shared/js/auth-guard.js.');
    return [];
  }

  const bracketStart = content.indexOf('[', startIdx);
  const bracketEnd = content.indexOf('];', bracketStart);
  if (bracketEnd === -1) {
    logError('Check 3 (Manifest)', 'Could not locate end of FULL_MANIFEST array in shared/js/auth-guard.js.');
    return [];
  }

  const jsonStr = content.substring(bracketStart, bracketEnd + 1);
  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    logError('Check 3 (Manifest)', `Failed to parse FULL_MANIFEST JSON: ${err.message}`);
    return [];
  }
}

function checkManifestFilesExist() {
  console.log('\n🔍 Check 3: FULL_MANIFEST Active Files Check...');
  let checkPassed = true;
  const manifest = parseFullManifest();

  for (const course of manifest) {
    const status = course.status || 'active';
    if (status === 'not_yet_available') {
      continue; // Explicitly marked as planned / coming soon
    }

    const courseId = course.id;
    const lang = course.lang ? course.lang.toLowerCase() : '';
    const track = course.track ? course.track.toLowerCase() : '';
    const levelUpper = course.level ? course.level.toUpperCase() : '';
    const levelLower = course.level ? course.level.toLowerCase() : '';

    const possiblePaths = [
      path.join(ROOT_DIR, 'roadmaps', `${courseId}.json`),
      path.join(ROOT_DIR, 'curriculums', lang, track, `${levelUpper}.json`),
      path.join(ROOT_DIR, 'curriculums', lang, track, `${levelLower}.json`)
    ];

    const fileExists = possiblePaths.some(p => fs.existsSync(p));

    if (!fileExists) {
      logError(
        'Check 3 (Manifest)',
        `Active manifest course "${courseId}" (${course.title}) has no corresponding roadmap or curriculum file on disk.`
      );
      checkPassed = false;
    }
  }

  if (checkPassed) {
    logSuccess('Check 3 (Manifest)', 'All active manifest courses have corresponding files on disk.');
  }
}

// ---------------------------------------------------------------------------
// Check 4: Orphan Curriculum Check
// ---------------------------------------------------------------------------
function checkOrphanCurriculums() {
  console.log('\n🔍 Check 4: Orphan Curriculum Check...');
  let checkPassed = true;
  const manifest = parseFullManifest();

  const manifestSet = new Set();
  for (const m of manifest) {
    const lang = m.lang ? m.lang.toLowerCase() : '';
    const track = m.track ? m.track.toLowerCase() : '';
    const level = m.level ? m.level.toLowerCase() : '';
    manifestSet.add(`${lang}:${track}:${level}`);
  }

  const currDir = path.join(ROOT_DIR, 'curriculums');
  const currFiles = findJsonFiles(currDir);

  for (const filePath of currFiles) {
    const relPath = path.relative(currDir, filePath);
    const parts = relPath.split(path.sep);
    if (parts.length >= 3) {
      const lang = parts[0].toLowerCase();
      const track = parts[1].toLowerCase();
      const level = path.basename(parts[2], '.json').toLowerCase();
      const key = `${lang}:${track}:${level}`;

      if (!manifestSet.has(key)) {
        logError(
          'Check 4 (Orphan Curriculums)',
          `Curriculum file "${relPath}" (${key}) has no corresponding manifest entry in FULL_MANIFEST.`
        );
        checkPassed = false;
      }
    }
  }

  if (checkPassed) {
    logSuccess('Check 4 (Orphan Curriculums)', 'All curriculum files are tracked in FULL_MANIFEST.');
  }
}

// ---------------------------------------------------------------------------
// Main Runner
// ---------------------------------------------------------------------------
function main() {
  console.log('🏁 Running COSYplatform Content Integrity Checks...');

  checkDuplicates();
  checkRoadmapSequenceEntries();
  checkManifestFilesExist();
  checkOrphanCurriculums();

  console.log('\n---------------------------------------------------');
  if (hasErrors) {
    console.error('❌ Content integrity checks failed! See errors above.');
    process.exit(1);
  } else {
    console.log('✨ All content integrity checks passed successfully!');
    process.exit(0);
  }
}

main();
