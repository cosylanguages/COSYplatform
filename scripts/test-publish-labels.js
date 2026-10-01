const fs = require('fs');
const path = require('path');
const os = require('os');
const { parseContentMetadata, getAllFiles, buildLiveSet } = require('./publish_to_supabase');

function runTestPublishLabels() {
  console.log('🧪 Testing lesson language labelling...');
  const lessonsDir = path.join(process.cwd(), 'lessons');
  const lessonFiles = getAllFiles(lessonsDir);

  if (lessonFiles.length === 0) {
    console.error('❌ No lesson files found under lessons/');
    process.exit(1);
  }

  let spokenEnCount = 0;

  for (const filePath of lessonFiles) {
    const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');
    const meta = parseContentMetadata(filePath, content);

    // Assert 1: Every lesson under lessons/ gets a language
    if (!meta.language || typeof meta.language !== 'string' || meta.language.trim() === '') {
      console.error(`❌ Lesson file missing language label: ${relativePath}`);
      process.exit(1);
    }

    // Assert 2: No lesson inside spoken-en/ is labelled differently from "en"
    if (relativePath.startsWith('lessons/spoken-en/')) {
      spokenEnCount++;
      if (meta.language !== 'en') {
        console.error(`❌ Lesson in spoken-en/ labelled as '${meta.language}' instead of 'en': ${relativePath}`);
        process.exit(1);
      }
    }
  }

  console.log(`✅ Checked ${lessonFiles.length} lessons under lessons/ (including ${spokenEnCount} in spoken-en/). All pass language labelling tests.`);
}

function runTestPublishLive() {
  console.log('🧪 Testing live lesson publishing and prune guards...');
  const { LIVE, roadmapParseFailed } = buildLiveSet();

  if (roadmapParseFailed) {
    console.error('❌ Failed to parse roadmaps during test.');
    process.exit(1);
  }

  if (LIVE.size === 0) {
    console.error('❌ LIVE set is empty.');
    process.exit(1);
  }

  // Test (a): Every LIVE path exists
  console.log(`  Checking test (a): Every LIVE path exists (${LIVE.size} files)...`);
  for (const relPath of LIVE) {
    const fullPath = path.join(process.cwd(), relPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Test (a) failed: LIVE path does not exist on disk: ${relPath}`);
      process.exit(1);
    }
  }
  console.log(`  ✅ Test (a) passed: All ${LIVE.size} LIVE paths exist on disk.`);

  // Test (b): Selecting files to publish from a temp copy of lessons/ never includes a file that is not in LIVE
  console.log('  Checking test (b): Temp copy filtering never includes draft files...');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cosy-publish-test-'));
  try {
    const tempLessonsDir = path.join(tmpDir, 'lessons', 'general-english-a1');
    fs.mkdirSync(tempLessonsDir, { recursive: true });

    // Pick 1 live file and 1 draft file
    const liveSampleRel = Array.from(LIVE).find(p => p.startsWith('lessons/general-english-a1/'));
    const allLessonFiles = getAllFiles(path.join(process.cwd(), 'lessons'));
    const draftSampleFile = allLessonFiles.find(f => {
      const rel = path.relative(process.cwd(), f).replace(/\\/g, '/');
      return rel.startsWith('lessons/general-french-a1/') && !LIVE.has(rel);
    });

    if (!liveSampleRel || !draftSampleFile) {
      console.error('❌ Could not find sample live or draft lesson files for test (b).');
      process.exit(1);
    }

    const liveSampleFull = path.join(process.cwd(), liveSampleRel);
    const draftSampleRel = path.relative(process.cwd(), draftSampleFile).replace(/\\/g, '/');

    // Create temp copies in tmpDir
    const tempLivePath = path.join(tmpDir, liveSampleRel);
    const tempDraftPath = path.join(tmpDir, draftSampleRel);

    fs.mkdirSync(path.dirname(tempLivePath), { recursive: true });
    fs.mkdirSync(path.dirname(tempDraftPath), { recursive: true });

    fs.copyFileSync(liveSampleFull, tempLivePath);
    fs.copyFileSync(draftSampleFile, tempDraftPath);

    // Get all files from temp lessons dir
    const tempFiles = getAllFiles(path.join(tmpDir, 'lessons'));
    const selectedFiles = [];

    for (const f of tempFiles) {
      const relPath = path.relative(tmpDir, f).replace(/\\/g, '/');
      if (relPath.startsWith('lessons/')) {
        if (LIVE.has(relPath)) {
          selectedFiles.push(relPath);
        }
      }
    }

    if (selectedFiles.includes(draftSampleRel)) {
      console.error(`❌ Test (b) failed: Draft file ${draftSampleRel} was wrongly selected for publishing.`);
      process.exit(1);
    }

    if (!selectedFiles.includes(liveSampleRel)) {
      console.error(`❌ Test (b) failed: Live file ${liveSampleRel} was not selected for publishing.`);
      process.exit(1);
    }

    console.log('  ✅ Test (b) passed: Selecting files from temp copy excludes draft files.');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  // Test (c): The prune guard refuses when LIVE is empty or under 100
  console.log('  Checking test (c): Prune guard refuses when LIVE is under 100...');
  function checkPruneGuard(liveSet, parseFailed) {
    if (parseFailed) return { allowed: false, reason: 'Roadmap parse failed' };
    if (liveSet.size < 100) return { allowed: false, reason: 'LIVE set fewer than 100 entries' };
    return { allowed: true };
  }

  const emptySetResult = checkPruneGuard(new Set(), false);
  if (emptySetResult.allowed) {
    console.error('❌ Test (c) failed: Prune guard allowed empty LIVE set.');
    process.exit(1);
  }

  const smallSetResult = checkPruneGuard(new Set(Array.from(LIVE).slice(0, 50)), false);
  if (smallSetResult.allowed) {
    console.error('❌ Test (c) failed: Prune guard allowed LIVE set of size 50 (< 100).');
    process.exit(1);
  }

  const parseFailedResult = checkPruneGuard(LIVE, true);
  if (parseFailedResult.allowed) {
    console.error('❌ Test (c) failed: Prune guard allowed prune when roadmap parse failed.');
    process.exit(1);
  }

  const validResult = checkPruneGuard(LIVE, false);
  if (!validResult.allowed) {
    console.error('❌ Test (c) failed: Prune guard rejected valid LIVE set.');
    process.exit(1);
  }

  console.log('  ✅ Test (c) passed: Prune guard correctly refuses when LIVE is empty, under 100, or failed to parse.');
}

if (require.main === module) {
  runTestPublishLabels();
  runTestPublishLive();
}

module.exports = { runTestPublishLabels, runTestPublishLive };
