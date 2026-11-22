#!/usr/bin/env node

/**
 * seed-workbooks.js
 *
 * Reads protected workbook JSON from the git-ignored student-workbooks/ folder
 * and splits each topic into:
 * - lessons (kind='workbook')
 * - lesson_student_content (exercises without answers or feedback)
 * - lesson_protected (kind='answer-key', full exercises)
 *
 * Usage:
 *   node scripts/seed-workbooks.js --dry-run
 *   node scripts/seed-workbooks.js
 *   node scripts/seed-workbooks.js --source path/to/workbooks
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const DEFAULT_SOURCE = path.join(REPO_ROOT, 'student-workbooks', 'data', 'workbooks');

const SENSITIVE_EXERCISE_KEYS = new Set([
  'ans',
  'answer',
  'answers',
  'answerkey',
  'correct',
  'correctanswer',
  'solution',
  'solutions',
  'fb',
  'feedback'
]);

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [key, ...valueParts] = trimmed.split('=');
    process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
}

function isSensitiveKey(key) {
  return SENSITIVE_EXERCISE_KEYS.has(key.replace(/[^a-z]/gi, '').toLowerCase());
}

function stripSensitive(value) {
  if (Array.isArray(value)) return value.map(stripSensitive);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !isSensitiveKey(key))
        .map(([key, entry]) => [key, stripSensitive(entry)])
    );
  }
  return value;
}

function buildRecordsFromWorkbook(data, sourceLabel = 'workbook') {
  if (!data || typeof data !== 'object') {
    throw new Error(`Invalid workbook in ${sourceLabel}: expected an object`);
  }

  const language = String(data.language || '').toLowerCase();
  const level = String(data.level || '').toLowerCase();
  if (!language || !level) {
    throw new Error(`Invalid workbook in ${sourceLabel}: language and level are required`);
  }
  if (!Array.isArray(data.topics)) {
    throw new Error(`Invalid workbook in ${sourceLabel}: topics must be an array`);
  }

  const lessons = [];
  const studentRows = [];
  const protectedRows = [];
  const seen = new Set();

  for (const topic of data.topics) {
    if (!topic || !topic.id) {
      throw new Error(`Invalid topic in ${sourceLabel}: id is required`);
    }

    const lessonId = `workbook/${topic.id}`;
    if (seen.has(lessonId)) {
      throw new Error(`Duplicate workbook topic id in ${sourceLabel}: ${topic.id}`);
    }
    seen.add(lessonId);

    const topicLanguage = String(topic.lang || language).toLowerCase();
    const topicLevel = String(topic.level || level).toLowerCase();
    const exercises = Array.isArray(topic.exercises) ? topic.exercises : [];

    lessons.push({
      id: lessonId,
      language: topicLanguage,
      cefr: topicLevel,
      kind: 'workbook',
      slug: String(topic.id),
      title: String(topic.title || topic.id),
      summary: String(topic.desc || ''),
      updated_at: new Date().toISOString()
    });

    studentRows.push({
      lesson_id: lessonId,
      body: JSON.stringify(stripSensitive(topic)),
      updated_at: new Date().toISOString()
    });

    protectedRows.push({
      lesson_id: lessonId,
      kind: 'answer-key',
      content: JSON.stringify({ topicId: topic.id, exercises })
    });
  }

  return { lessons, studentRows, protectedRows };
}

function collectWorkbookFiles(sourceDir) {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(
      `Workbook source not found: ${sourceDir}\n` +
      'Copy the protected workbooks into student-workbooks/data/workbooks first.'
    );
  }

  const files = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (entry.isFile() && entry.name.endsWith('.json')) files.push(fullPath);
    }
  })(sourceDir);

  return files.sort();
}

function buildWorkbookRecords(sourceDir = DEFAULT_SOURCE) {
  const files = collectWorkbookFiles(sourceDir);
  const lessons = [];
  const studentRows = [];
  const protectedRows = [];
  const seen = new Set();

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const records = buildRecordsFromWorkbook(data, path.relative(REPO_ROOT, file));

    for (const lesson of records.lessons) {
      if (seen.has(lesson.id)) {
        throw new Error(`Duplicate workbook lesson id across files: ${lesson.id}`);
      }
      seen.add(lesson.id);
    }

    lessons.push(...records.lessons);
    studentRows.push(...records.studentRows);
    protectedRows.push(...records.protectedRows);
  }

  return { lessons, studentRows, protectedRows };
}

async function supabaseRequest(url, key, pathname, options = {}) {
  const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/${pathname}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${pathname} failed: ${await response.text()}`);
  }
}

async function upsertRows(url, key, table, rows, conflictColumn) {
  const chunkSize = 50;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    await supabaseRequest(url, key, `${table}?on_conflict=${conflictColumn}`, {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify(chunk)
    });
    console.log(`✅ ${table}: ${Math.min(i + chunkSize, rows.length)}/${rows.length}`);
  }
}

async function insertRows(url, key, table, rows) {
  const chunkSize = 50;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    await supabaseRequest(url, key, table, {
      method: 'POST',
      body: JSON.stringify(chunk)
    });
    console.log(`✅ ${table}: ${Math.min(i + chunkSize, rows.length)}/${rows.length}`);
  }
}

async function replaceProtectedRows(url, key, rows) {
  for (const row of rows) {
    const filter = `lesson_id=eq.${encodeURIComponent(row.lesson_id)}&kind=eq.${encodeURIComponent(row.kind)}`;
    await supabaseRequest(url, key, `lesson_protected?${filter}`, { method: 'DELETE' });
  }
  await insertRows(url, key, 'lesson_protected', rows);
}

function printDryRun(records) {
  console.log('📊 --- WORKBOOK DRY-RUN ---');
  console.log(`Workbook lessons: ${records.lessons.length}`);
  console.log(`Student rows: ${records.studentRows.length}`);
  console.log(`Protected rows: ${records.protectedRows.length}`);

  const sampleStudent = records.studentRows[0];
  const sampleProtected = records.protectedRows[0];
  if (sampleStudent) {
    const body = JSON.parse(sampleStudent.body);
    console.log(`Sample student lesson: ${sampleStudent.lesson_id}`);
    console.log(`Sample student exercise keys: ${Object.keys(body.exercises?.[0] || {}).join(', ') || '(none)'}`);
  }
  if (sampleProtected) {
    const key = JSON.parse(sampleProtected.content);
    console.log(`Sample protected lesson: ${sampleProtected.lesson_id}`);
    console.log(`Sample protected exercise keys: ${Object.keys(key.exercises?.[0] || {}).join(', ') || '(none)'}`);
  }
  console.log('No data sent to Supabase.');
}

function parseArgs(argv) {
  const args = { dryRun: false, source: DEFAULT_SOURCE };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dry-run') args.dryRun = true;
    else if (argv[i] === '--source' && argv[i + 1]) args.source = path.resolve(argv[++i]);
  }
  return args;
}

async function main() {
  loadEnv();
  const args = parseArgs(process.argv.slice(2));
  const records = buildWorkbookRecords(args.source);

  if (records.lessons.length === 0) {
    throw new Error(`No workbook topics found in ${args.source}`);
  }

  if (args.dryRun) {
    printDryRun(records);
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required (or use --dry-run).');
  }

  await upsertRows(supabaseUrl, serviceRoleKey, 'lessons', records.lessons, 'id');
  await upsertRows(supabaseUrl, serviceRoleKey, 'lesson_student_content', records.studentRows, 'lesson_id');
  await replaceProtectedRows(supabaseUrl, serviceRoleKey, records.protectedRows);
  console.log('🎉 Workbook seed complete!');
}

if (require.main === module) {
  main().catch(error => {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  SENSITIVE_EXERCISE_KEYS,
  buildRecordsFromWorkbook,
  buildWorkbookRecords,
  stripSensitive
};
