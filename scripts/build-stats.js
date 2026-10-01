const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

function getPlatformStats() {
  // 1. Languages & Courses from FULL_MANIFEST in shared/js/auth-guard.js
  const authGuardPath = path.join(ROOT_DIR, 'shared/js/auth-guard.js');
  const authGuardContent = fs.readFileSync(authGuardPath, 'utf8');
  const manifestMatch = authGuardContent.match(/window\.CosyAuth\.FULL_MANIFEST\s*=\s*(\[\s*\{[\s\S]*?\}\s*\]);/);
  if (!manifestMatch) {
    throw new Error('Could not parse window.CosyAuth.FULL_MANIFEST from shared/js/auth-guard.js');
  }
  const fullManifest = JSON.parse(manifestMatch[1]);

  const allLangCodes = [...new Set(fullManifest.map(c => c.lang))].sort();
  const availableCourses = fullManifest.filter(c => c.status !== 'not_yet_available');
  const liveLangCodes = [...new Set(availableCourses.map(c => c.lang))].sort();

  const languages = {
    total: allLangCodes.length,
    withAvailableCourse: liveLangCodes.length,
    codes: liveLangCodes
  };

  const courses = {
    available: availableCourses.length,
    total: fullManifest.length
  };

  // 2. Lessons from roadmaps/*.json
  const roadmapsDir = path.join(ROOT_DIR, 'roadmaps');
  const roadmapFiles = fs.readdirSync(roadmapsDir).filter(f => f.endsWith('.json'));

  let lessonsAvailable = 0;
  let lessonsPlanned = 0;
  const linkedLessonFiles = new Set();

  roadmapFiles.forEach(file => {
    const filePath = path.join(roadmapsDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (data.sequence && Array.isArray(data.sequence)) {
      data.sequence.forEach(item => {
        const hasLessonFile = item.lessonFile && typeof item.lessonFile === 'string' && item.lessonFile.trim() !== '';
        const isAvailable = hasLessonFile && item.status !== 'planned';

        if (isAvailable) {
          lessonsAvailable++;
        } else {
          lessonsPlanned++;
        }

        if (hasLessonFile) {
          const normalizedPath = item.lessonFile.trim().replace(/\\/g, '/');
          linkedLessonFiles.add(normalizedPath);
        }
      });
    }
  });

  const lessons = {
    available: lessonsAvailable,
    planned: lessonsPlanned,
    total: lessonsAvailable + lessonsPlanned
  };

  // 3. Lesson files on disk (.json + .xml under lessons/) & unlinked count
  function scanLessonFiles(dir) {
    let files = [];
    const list = fs.readdirSync(dir);
    list.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        files = files.concat(scanLessonFiles(fullPath));
      } else if (item.endsWith('.json') || item.endsWith('.xml')) {
        const relativePath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');
        files.push(relativePath);
      }
    });
    return files;
  }

  const lessonsDir = path.join(ROOT_DIR, 'lessons');
  const lessonFilesOnDiskList = scanLessonFiles(lessonsDir);
  const lessonFilesOnDisk = lessonFilesOnDiskList.length;

  let unlinkedLessonFiles = 0;
  lessonFilesOnDiskList.forEach(fileRelPath => {
    if (!linkedLessonFiles.has(fileRelPath)) {
      unlinkedLessonFiles++;
    }
  });

  // 4. ISO Date (YYYY-MM-DD only)
  const generatedAt = new Date().toISOString().split('T')[0];

  return {
    languages,
    courses,
    lessons,
    lessonFilesOnDisk,
    unlinkedLessonFiles,
    generatedAt
  };
}

function main() {
  const isCheck = process.argv.includes('--check');
  const stats = getPlatformStats();
  const targetPath = path.join(ROOT_DIR, 'data/platform-stats.json');

  if (isCheck) {
    if (!fs.existsSync(targetPath)) {
      console.error(`❌ platform-stats.json check failed: File does not exist at ${targetPath}`);
      process.exit(1);
    }

    const existingContent = fs.readFileSync(targetPath, 'utf8');
    const existingStats = JSON.parse(existingContent);

    // Compare without generatedAt
    const { generatedAt: _, ...calculatedMinusDate } = stats;
    const { generatedAt: __, ...existingMinusDate } = existingStats;

    const calcJson = JSON.stringify(calculatedMinusDate, null, 2);
    const existJson = JSON.stringify(existingMinusDate, null, 2);

    if (calcJson !== existJson) {
      console.error('❌ platform-stats.json check failed! The committed file differs from calculated stats.');
      console.error('\nExpected:\n' + calcJson);
      console.error('\nFound:\n' + existJson);
      process.exit(1);
    }

    console.log('✅ platform-stats.json check passed! (Data matches repo state)');
    process.exit(0);
  } else {
    // Make sure data directory exists
    const dataDir = path.join(ROOT_DIR, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const content = JSON.stringify(stats, null, 2) + '\n';
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log(`✨ Successfully generated ${targetPath}`);
  }
}

main();
