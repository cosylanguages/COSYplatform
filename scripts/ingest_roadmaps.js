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
 * Support for reading lesson content from external sources without merging branches:
 *   --source <local folder path OR git ref>
 *
 * Usage:
 *   node scripts/ingest_roadmaps.js --dry-run
 *   node scripts/ingest_roadmaps.js --source ./seed_data --dry-run
 *   node scripts/ingest_roadmaps.js --source origin/pr/13 --dry-run
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/ingest_roadmaps.js --source origin/pr/13
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROADMAPS_DIR = path.join(__dirname, '../roadmaps');
const LOCAL_SOURCE_DIRS = [
  path.join(__dirname, '../seed_data'),
  path.join(__dirname, '../local_content'),
  path.join(__dirname, '../lessons')
];

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const isDryRun = process.argv.includes('--dry-run') || SUPABASE_URL.includes('example.supabase.co');

function getSourceArg() {
  const idx = process.argv.indexOf('--source');
  if (idx !== -1 && idx + 1 < process.argv.length) {
    return process.argv[idx + 1];
  }
  return null;
}

const customSource = getSourceArg();

function parseFilenameMetadata(filename) {
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

function fetchContentFromSource(relativeFilePath, source) {
  if (!relativeFilePath) return null;
  const normalizedRelPath = relativeFilePath.replace(/^\.\//, '');

  if (source) {
    // 1. Check if source is a local directory
    const resolvedPath = path.resolve(source, normalizedRelPath.replace(/^lessons\//, ''));
    if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
      return fs.readFileSync(resolvedPath, 'utf8');
    }
    const resolvedDirect = path.resolve(source, normalizedRelPath);
    if (fs.existsSync(resolvedDirect) && fs.statSync(resolvedDirect).isFile()) {
      return fs.readFileSync(resolvedDirect, 'utf8');
    }

    // 2. Check if source is a git ref
    try {
      const gitOutput = execSync(`git show ${source}:${normalizedRelPath}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      if (gitOutput && gitOutput.trim().length > 0) {
        return gitOutput;
      }
    } catch (e) {
      // Git show failed for this path
    }
  }

  // Fallback to local default search dirs
  for (const baseDir of LOCAL_SOURCE_DIRS) {
    const fullPath = path.join(baseDir, normalizedRelPath.replace(/^lessons\//, ''));
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return fs.readFileSync(fullPath, 'utf8');
    }
  }

  return null;
}

const SENSITIVE_JSON_KEYS = new Set(['answers','answer','answerkey','answer_key','correctanswer','correct_answer','iscorrect','correct','solution','teachernotes','teacher_notes','explanation']);
function parseJsonLesson(raw) {
  if (typeof raw !== 'string' || !raw.trim().startsWith('{')) return null;
  try { const v=JSON.parse(raw); return v && typeof v==='object' && !Array.isArray(v) ? v : null; }
  catch (_) { throw new Error('Lesson source looks like JSON but cannot be parsed safely.'); }
}
function extractProtectedContent(raw) {
  const out=[]; if(typeof raw!=='string')return out; const lesson=parseJsonLesson(raw);
  if(lesson){
    const keys={},notes=[];
    if(lesson.teacherNotes!=null)notes.push({location:'lesson',notes:lesson.teacherNotes});
    (lesson.slides||[]).forEach((slide,si)=>{
      if(slide.teacherNotes!=null)notes.push({location:'slide:'+(slide.id||si),notes:slide.teacherNotes});
      (slide.elements||[]).forEach((el,ei)=>{
        const field='s'+si+'_el_'+ei;
        if(Array.isArray(el.answers)&&el.answers.length){if(!['input','test'].includes(String(el.type||'').toLowerCase()))throw new Error('Unsupported answer-bearing element type at '+field+'.');keys[field]=el.answers;}
        if(typeof el.explanation==='string'&&el.explanation.trim())notes.push({location:field,explanation:el.explanation.trim()});
      });
    });
    if(Object.keys(keys).length)out.push({kind:'answer-key',content:JSON.stringify(keys)});
    if(notes.length)out.push({kind:'teacher-notes',content:JSON.stringify(notes)});
    return out;
  }
  if(/<(?:cosy-input-item|cosy-select-item|cosy-test-item)\b|\b(?:answer|correct|solution)\s*=/i.test(raw))throw new Error('XML source contains answer metadata; structural XML migration is required before safe ingestion.');
  const notes=raw.match(/<cosy-teacher-notes[\s\S]*?<\/cosy-teacher-notes>|<teacher-notes[\s\S]*?<\/teacher-notes>/gi);
  if(notes)notes.forEach(n=>out.push({kind:'teacher-notes',content:n.replace(/<\/?(?:cosy-)?teacher-notes[^>]*>/gi,'').trim()}));
  return out;
}
function sanitizeStudentContent(raw) {
  if(typeof raw!=='string')return '';
  const lesson=parseJsonLesson(raw);
  if(lesson){
    const strip=v=>{if(Array.isArray(v))return v.map(strip);if(!v||typeof v!=='object')return v;const clean={};for(const [k,x] of Object.entries(v))if(!SENSITIVE_JSON_KEYS.has(k.toLowerCase()))clean[k]=strip(x);return clean;};
    return JSON.stringify(strip(lesson));
  }
  if(/<(?:cosy-input-item|cosy-select-item|cosy-test-item)\b|\b(?:answer|correct|solution)\s*=/i.test(raw))throw new Error('XML source contains answer metadata; structural XML migration is required before safe ingestion.');
  return raw.replace(/<cosy-teacher-notes[\s\S]*?<\/cosy-teacher-notes>/gi,'').replace(/<teacher-notes[\s\S]*?<\/teacher-notes>/gi,'').trim();
}


async function ingestRoadmaps() {
  console.log('=== COSYplatform Roadmap Ingestion Tool ===');
  console.log(`Dry run mode: ${isDryRun ? 'YES' : 'NO'}`);
  if (customSource) {
    console.log(`Source location / git ref: ${customSource}`);
  }

  const files = fs.readdirSync(ROADMAPS_DIR).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} roadmap files in roadmaps/\n`);

  const coursesMap = new Map();
  const lessonsMap = new Map();
  const courseLessonsMap = new Map();
  const studentContentMap = new Map();
  const protectedContentMap = new Map();

  const fileToRoadmaps = {};
  const idToRoadmaps = {};
  const missingSources = new Set();
  const unsafeSources = new Map();

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
        const rawContent = fetchContentFromSource(item.lessonFile, customSource);
        if (!rawContent) { missingSources.add(item.lessonFile); return; }
        try {
          const protectedItems = extractProtectedContent(rawContent);
          const sanitized = sanitizeStudentContent(rawContent);
          if (!sanitized) throw new Error('Sanitized student body is empty.');
          if (/<cosy-teacher-notes\b|<teacher-notes\b/i.test(sanitized)) throw new Error('Teacher-note markup remains in student body.');
          if (parseJsonLesson(sanitized) && /"(?:answers|answerKey|answer_key|correctAnswer|correct_answer|isCorrect|solution|teacherNotes|teacher_notes|explanation)"\s*:/i.test(sanitized)) throw new Error('Sensitive JSON fields remain in student body.');
          studentContentMap.set(canonicalLessonId,{lesson_id:canonicalLessonId,body:sanitized});
          if(protectedItems.length)protectedContentMap.set(canonicalLessonId,protectedItems.map(p=>({lesson_id:canonicalLessonId,kind:p.kind,content:p.content})));
        } catch(error) { unsafeSources.set(item.lessonFile,error.message); }
      }
    });
  });

  console.log('=== Ingestion Summary ===');
  console.log(`- Total roadmaps parsed: ${coursesMap.size}`);
  console.log(`- Total sequence items across roadmaps: ${totalSequenceCount}`);
  console.log(`- Total lessonFile references: ${totalLessonFileRefs}`);
  console.log(`- Deduplicated unique lessons: ${lessonsMap.size}`);
  console.log(`- Total placement records: ${courseLessonsMap.size}`);
  console.log(`- Student bodies safely prepared: ${studentContentMap.size}`);
  console.log(`- Protected records prepared: ${Array.from(protectedContentMap.values()).reduce((n,rows)=>n+rows.length,0)}`);
  console.log(`- Missing sources: ${missingSources.size}; unsafe/unsupported sources: ${unsafeSources.size}`);
  for(const p of Array.from(missingSources).slice(0,50))console.log('MISSING: '+p);
  for(const [p,reason] of Array.from(unsafeSources.entries()).slice(0,50))console.log('UNSAFE: '+p+' — '+reason);

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
    if(missingSources.size||unsafeSources.size){console.error('\\n[Dry Run] BLOCKED: source coverage/sanitization incomplete; no writes attempted.');process.exitCode=2;}
    else console.log('\\n[Dry Run] Source coverage and sanitization preflight passed. No writes attempted.');
    return;
  }
  if(!SUPABASE_KEY)throw new Error('SUPABASE_SERVICE_ROLE_KEY is required; anon-key writes are disabled.');
  if(missingSources.size||unsafeSources.size)throw new Error('Ingestion blocked: all lesson sources must exist and pass sanitization before any writes.');

  let createClient;
  try {
    createClient = require('@supabase/supabase-js').createClient;
  } catch (e) {
    console.error('Package @supabase/supabase-js not installed. Run with --dry-run or install dependency.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  async function checkedWrite(label,query){const {error}=await query;if(error)throw new Error(label+' failed: '+(error.message||error));}
  console.log('\\nWriting records to Supabase...');
  await checkedWrite('Courses upsert',supabase.from('courses').upsert(Array.from(coursesMap.values())));
  await checkedWrite('Lessons upsert',supabase.from('lessons').upsert(Array.from(lessonsMap.values())));
  await checkedWrite('Course placements upsert',supabase.from('course_lessons').upsert(Array.from(courseLessonsMap.values())));
  await checkedWrite('Sanitized student content upsert',supabase.from('lesson_student_content').upsert(Array.from(studentContentMap.values())));
  const migratedIds=Array.from(studentContentMap.keys());
  if(migratedIds.length){
    await checkedWrite('Delete previous protected records',supabase.from('lesson_protected').delete().in('lesson_id',migratedIds));
    const protectedRows=Array.from(protectedContentMap.values()).flat();
    if(protectedRows.length)await checkedWrite('Insert protected records',supabase.from('lesson_protected').insert(protectedRows));
  }
  console.log('Ingestion completed. Verify row counts and run Supabase RLS tests before enabling student access.');
}

if (require.main === module) {
  ingestRoadmaps().catch(err => {
    console.error('Ingestion failed:', err);
    process.exit(1);
  });
}

module.exports = { ingestRoadmaps, sanitizeStudentContent, extractProtectedContent };
