/**
 * Pilot Seed Script for COSYplatform - general-en-a1
 *
 * Seeds the pilot roadmap general-en-a1 and its lessons into Supabase database tables:
 * - courses
 * - lessons (metadata)
 * - lesson_student_content (sanitized student body)
 * - lesson_protected (teacher notes & answer keys)
 * - course_lessons (placement junction)
 *
 * Reads lesson content from a local, git-ignored source folder (e.g. seed_data/ or lessons/).
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROADMAP_PATH = path.join(__dirname, '../roadmaps/general-en-a1.json');
const LOCAL_SOURCE_DIRS = [
  path.join(__dirname, '../seed_data'),
  path.join(__dirname, '../local_content'),
  path.join(__dirname, '../lessons')
];

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'fake-key';

const isDryRun = process.argv.includes('--dry-run') || SUPABASE_URL.includes('example.supabase.co');

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
  // Strip teacher notes tags or fields if XML/HTML
  let sanitized = rawContent
    .replace(/<cosy-teacher-notes[\s\S]*?<\/cosy-teacher-notes>/gi, '')
    .replace(/<teacher-notes[\s\S]*?<\/teacher-notes>/gi, '');

  return sanitized.trim();
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

async function seedPilot() {
  console.log('=== Pilot Seed Script: general-en-a1 ===');
  console.log(`Dry run mode: ${isDryRun ? 'YES' : 'NO'}`);

  if (!fs.existsSync(ROADMAP_PATH)) {
    console.error(`Roadmap file not found at ${ROADMAP_PATH}`);
    process.exit(1);
  }

  const roadmapData = JSON.parse(fs.readFileSync(ROADMAP_PATH, 'utf8'));
  const courseId = 'general-en-a1';
  const language = 'en';
  const cefr = 'a1';
  const courseType = 'general';

  console.log(`\nProcessing Course: ${roadmapData.title} (${courseId})`);

  const coursePayload = {
    id: courseId,
    language,
    cefr,
    course_type: courseType,
    title: roadmapData.title,
    description: 'Elementary English course focusing on foundational grammar, vocabulary, and everyday communication.',
    total_lessons: roadmapData.totalLessons || (roadmapData.sequence ? roadmapData.sequence.length : 0),
    is_public_preview: true
  };

  const sequence = roadmapData.sequence || [];
  const lessonsPayload = [];
  const studentContentPayload = [];
  const protectedContentPayload = [];
  const courseLessonsPayload = [];

  sequence.forEach((item) => {
    const slug = item.id || `lesson-${item.lessonNumber}`;
    const canonicalLessonId = `${language}:${cefr}:${slug}`;

    const unitSlug = item.unit ? item.unit.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'section-' + (item.section || 0);
    const placementId = `${language}:${cefr}:${courseId}:${unitSlug}:${slug}`;

    // Metadata
    lessonsPayload.push({
      id: canonicalLessonId,
      language,
      cefr,
      kind: 'lesson',
      slug,
      title: item.title,
      summary: `Lesson ${item.lessonNumber}: ${item.title}`
    });

    // Placement
    courseLessonsPayload.push({
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

    // Content processing if local file exists
    if (item.lessonFile) {
      const localFile = locateLocalLessonFile(item.lessonFile);
      if (localFile) {
        const rawContent = fs.readFileSync(localFile, 'utf8');
        const sanitized = sanitizeStudentContent(rawContent);
        const protectedItems = extractProtectedContent(rawContent);

        studentContentPayload.push({
          lesson_id: canonicalLessonId,
          body: sanitized
        });

        protectedItems.forEach(prot => {
          protectedContentPayload.push({
            lesson_id: canonicalLessonId,
            kind: prot.kind,
            content: prot.content
          });
        });
      }
    }
  });

  console.log(`- Course metadata: 1 course`);
  console.log(`- Lessons metadata: ${lessonsPayload.length} records`);
  console.log(`- Course placements: ${courseLessonsPayload.length} records`);
  console.log(`- Student bodies found: ${studentContentPayload.length} records`);
  console.log(`- Protected records found: ${protectedContentPayload.length} records`);

  if (isDryRun) {
    console.log('\n[Dry Run] Database writes skipped.');
    console.log('Sample course record:', JSON.stringify(coursePayload, null, 2));
    console.log('Sample lesson metadata:', JSON.stringify(lessonsPayload[0], null, 2));
    console.log('Sample placement record:', JSON.stringify(courseLessonsPayload[0], null, 2));
    return;
  }

  let createClient;
  try {
    createClient = require('@supabase/supabase-js').createClient;
  } catch (e) {
    console.error('Package @supabase/supabase-js not installed. Set SUPABASE_URL or run --dry-run.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // 1. Upsert course
  const { error: courseErr } = await supabase.from('courses').upsert(coursePayload);
  if (courseErr) console.error('Error upserting course:', courseErr);

  // 2. Upsert lessons metadata
  const { error: lessonsErr } = await supabase.from('lessons').upsert(lessonsPayload);
  if (lessonsErr) console.error('Error upserting lessons:', lessonsErr);

  // 3. Upsert course_lessons
  const { error: clErr } = await supabase.from('course_lessons').upsert(courseLessonsPayload);
  if (clErr) console.error('Error upserting course_lessons:', clErr);

  // 4. Upsert student content
  if (studentContentPayload.length > 0) {
    const { error: scErr } = await supabase.from('lesson_student_content').upsert(studentContentPayload);
    if (scErr) console.error('Error upserting student content:', scErr);
  }

  // 5. Insert protected content
  if (protectedContentPayload.length > 0) {
    const { error: pcErr } = await supabase.from('lesson_protected').insert(protectedContentPayload);
    if (pcErr) console.error('Error inserting protected content:', pcErr);
  }

  console.log('\n✅ Pilot seed completed successfully.');
}

if (require.main === module) {
  seedPilot().catch(err => {
    console.error('Pilot seed failed:', err);
    process.exit(1);
  });
}

module.exports = { seedPilot, sanitizeStudentContent, extractProtectedContent };
