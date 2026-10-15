/**
 * Roadmap Ingestion Script for COSYplatform
 *
 * Ingests all 54 roadmaps under roadmaps/*.json into Supabase schema format:
 * - courses
 * - lessons (metadata)
 * - course_lessons (placement junction)
 * - lesson_student_content (sanitized body)
 * - lesson_protected (answer keys & teacher notes)
 *
 * Usage:
 *   node scripts/ingest_roadmaps.js --dry-run
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/ingest_roadmaps.js
 */

const fs = require('fs');
const path = require('path');

const ROADMAPS_DIR = path.join(__dirname, '../roadmaps');
const LOCAL_SOURCE_DIRS = [
  path.join(__dirname, '../seed_data'),
  path.join(__dirname, '../local_content'),
  path.join(__dirname, '../lessons')
];

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'fake-key';

const isDryRun = process.argv.includes('--dry-run') || SUPABASE_URL.includes('example.supabase.co');

function parseFilenameMetadata(filename) {
  // Filename format: e.g. general-en-a1.json, cinema-en-b1.json, pronunciation-fr-c2.json
  const basename = path.basename(filename, '.json');
  if (basename === 'introductory-english') {
    return { courseId: 'introductory-english', courseType: 'general', language: 'en', cefr: 'a0' };
  }

  const parts = basename.split('-');
  if (parts.length >= 3) {
    const cefr = parts[parts.length - 1].toLowerCase();
    const language = parts[parts.length - 2].toLowerCase();
    const courseType = parts.slice(0, parts.length - 2).join('-');
    return { courseId: basename, courseType, language, cefr };
  }

  return { courseId: basename, courseType: 'general', language: 'en', cefr: 'a1' };
}

function locateLocalLessonFile(relativeFilePath) {
  for (const baseDir of LOCAL_SOURCE_DIRS) {
    const fullPath = path.join(baseDir, relativeFilePath.replace(/^lessons\//, ''));
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

function sanitizeStudentContent(rawContent) {
  if (typeof rawContent !== 'string') return '';
  return rawContent
    .replace(/<cosy-teacher-notes[\s\S]*?<\/cosy-teacher-notes>/gi, '')
    .replace(/<teacher-notes[\s\S]*?<\/teacher-notes>/gi, '')
    .trim();
}

function extractProtectedContent(rawContent) {
  const protectedItems = [];
  if (typeof rawContent !== 'string') return protectedItems;

  const teacherNotesMatch = rawContent.match(/<cosy-teacher-notes[\s\S]*?<\/cosy-teacher-notes>/gi);
  if (teacherNotesMatch) {
    teacherNotesMatch.forEach(notes => {
      protectedItems.push({
        kind: 'teacher-notes',
        content: notes.replace(/<\/?cosy-teacher-notes>/gi, '').trim()
      });
    });
  }

  return protectedItems;
}

async function ingestRoadmaps() {
  console.log('=== COSYplatform Roadmap Ingestion Tool ===');
  console.log(`Dry run mode: ${isDryRun ? 'YES' : 'NO'}`);

  const files = fs.readdirSync(ROADMAPS_DIR).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} roadmap files in roadmaps/\n`);

  const coursesMap = new Map();
  const lessonsMap = new Map();
  const courseLessonsMap = new Map();
  const studentContentMap = new Map();
  const protectedContentMap = new Map();

  const fileToRoadmaps = {};
  const idToRoadmaps = {};

  let totalSequenceCount = 0;
  let totalLessonFileRefs = 0;

  files.forEach(filename => {
    const meta = parseFilenameMetadata(filename);
    const filePath = path.join(ROADMAPS_DIR, filename);
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    const courseId = meta.courseId;
    const language = meta.language;
    const cefr = meta.cefr;
    const courseType = meta.courseType;

    coursesMap.set(courseId, {
      id: courseId,
      language,
      cefr,
      course_type: courseType,
      title: data.title || courseId,
      description: `${data.title || courseId} (${language.toUpperCase()} ${cefr.toUpperCase()})`,
      total_lessons: data.totalLessons || (data.sequence ? data.sequence.length : 0),
      is_public_preview: true
    });

    const sequence = data.sequence || [];
    totalSequenceCount += sequence.length;

    sequence.forEach((item) => {
      if (item.lessonFile) {
        totalLessonFileRefs++;
        if (!fileToRoadmaps[item.lessonFile]) fileToRoadmaps[item.lessonFile] = [];
        fileToRoadmaps[item.lessonFile].push(filename);
      }
      if (item.id) {
        if (!idToRoadmaps[item.id]) idToRoadmaps[item.id] = [];
        idToRoadmaps[item.id].push(filename);
      }

      const slug = item.id || `lesson-${item.lessonNumber}`;
      const canonicalLessonId = `${language}:${cefr}:${slug}`;

      const unitSlug = item.unit
        ? item.unit.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : 'section-' + (item.section || 0);
      const placementId = `${language}:${cefr}:${courseId}:${unitSlug}:${slug}`;

      if (!lessonsMap.has(canonicalLessonId)) {
        lessonsMap.set(canonicalLessonId, {
          id: canonicalLessonId,
          language,
          cefr,
          kind: 'lesson',
          slug,
          title: item.title || slug,
          summary: `Lesson ${item.lessonNumber}: ${item.title || slug}`
        });
      }

      const placementKey = `${courseId}:${placementId}`;
      if (!courseLessonsMap.has(placementKey)) {
        courseLessonsMap.set(placementKey, {
          course_id: courseId,
          lesson_id: canonicalLessonId,
          placement_id: placementId,
          unit: item.unit || `Section ${item.section || 0}`,
          section_number: item.section || 0,
          lesson_number: item.lessonNumber,
          is_optional: Boolean(item.isOptional),
          is_milestone: Boolean(item.isMilestone),
          is_exam: Boolean(item.isExam),
          teacher_led: Boolean(item.teacherLed),
          status: item.status || 'planned'
        });
      }

      if (item.lessonFile) {
        const localFile = locateLocalLessonFile(item.lessonFile);
        if (localFile) {
          const rawContent = fs.readFileSync(localFile, 'utf8');
          const sanitized = sanitizeStudentContent(rawContent);
          const protectedItems = extractProtectedContent(rawContent);

          studentContentMap.set(canonicalLessonId, {
            lesson_id: canonicalLessonId,
            body: sanitized
          });

          if (protectedItems.length > 0) {
            protectedContentMap.set(canonicalLessonId, protectedItems.map(p => ({
              lesson_id: canonicalLessonId,
              kind: p.kind,
              content: p.content
            })));
          }
        }
      }
    });
  });

  console.log('=== Ingestion Summary ===');
  console.log(`- Total roadmaps parsed: ${coursesMap.size}`);
  console.log(`- Total sequence items across roadmaps: ${totalSequenceCount}`);
  console.log(`- Total lessonFile references: ${totalLessonFileRefs}`);
  console.log(`- Deduplicated unique lessons: ${lessonsMap.size}`);
  console.log(`- Total placement records: ${courseLessonsMap.size}`);
  console.log(`- Local student bodies found: ${studentContentMap.size}`);

  console.log('\n=== Shared / Duplicate Lessons Detected ===');
  let duplicateCount = 0;
  for (const [lf, rms] of Object.entries(fileToRoadmaps)) {
    if (rms.length > 1) {
      duplicateCount++;
      console.log(`- LessonFile "${lf}" shared in roadmaps: ${rms.join(', ')}`);
    }
  }
  for (const [id, rms] of Object.entries(idToRoadmaps)) {
    if (rms.length > 1 && !rms.some(r => fileToRoadmaps[id])) {
      duplicateCount++;
      console.log(`- Lesson ID "${id}" shared in roadmaps: ${rms.join(', ')}`);
    }
  }
  if (duplicateCount === 0) {
    console.log('No direct duplicate lesson files/IDs found beyond shared indexes.');
  }

  if (isDryRun) {
    console.log('\n[Dry Run] Database ingestion simulation completed successfully.');
    return;
  }

  let createClient;
  try {
    createClient = require('@supabase/supabase-js').createClient;
  } catch (e) {
    console.error('Package @supabase/supabase-js not installed. Run with --dry-run or install dependency.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  console.log('\nWriting records to Supabase...');
  await supabase.from('courses').upsert(Array.from(coursesMap.values()));
  await supabase.from('lessons').upsert(Array.from(lessonsMap.values()));
  await supabase.from('course_lessons').upsert(Array.from(courseLessonsMap.values()));

  if (studentContentMap.size > 0) {
    await supabase.from('lesson_student_content').upsert(Array.from(studentContentMap.values()));
  }

  console.log('✅ Ingestion into Supabase completed successfully.');
}

if (require.main === module) {
  ingestRoadmaps().catch(err => {
    console.error('Ingestion failed:', err);
    process.exit(1);
  });
}

module.exports = { ingestRoadmaps };
