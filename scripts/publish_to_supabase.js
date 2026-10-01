#!/usr/bin/env node

/**
 * publish_to_supabase.js
 *
 * Script run locally or in CI to read gated content from:
 * - lessons/ (XML/JSON)
 * - student-workbooks/
 * - activities/
 * - manuals/
 * - teacher-guides/
 * - reference/
 *
 * and upsert into Supabase `lesson_content` and `student_lesson_content` tables.
 */

const fs = require('fs');
const path = require('path');
const { sanitizeStudentLessonContent } = require('./sanitize-student-lesson');

// Basic .env parser for LOCAL execution
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        process.env[key.trim()] = value;
      }
    });
  }
}

// Folders containing gated lesson & teaching content
const GATED_DIRECTORIES = [
  'lessons',
  'student-workbooks',
  'activities',
  'manuals',
  'teacher-guides',
  'reference'
];

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.xml', '.json', '.md', '.html'].includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

function getFolderLanguage(relativePath) {
  const norm = relativePath.replace(/\\/g, '/');
  if (!norm.startsWith('lessons/')) return null;
  const parts = norm.split('/');
  if (parts.length < 2) return null;
  const folder = parts[1];

  if (
    folder === 'spoken-en' ||
    folder === 'discussion-en' ||
    folder === 'introductory' ||
    folder.startsWith('english-') ||
    folder.startsWith('general-english-')
  ) {
    return 'en';
  }
  if (
    folder === 'spoken-fr' ||
    folder.startsWith('french-') ||
    folder.startsWith('general-french-')
  ) {
    return 'fr';
  }
  if (
    folder === 'spoken-ru' ||
    folder.startsWith('russian-') ||
    folder.startsWith('general-russian-')
  ) {
    return 'ru';
  }
  if (folder.startsWith('general-italian-')) {
    return 'it';
  }
  if (folder.startsWith('general-greek-')) {
    return 'el';
  }
  return null;
}

function parseContentMetadata(filePath, fileContent) {
  const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
  const filename = path.basename(filePath, path.extname(filePath));

  let lessonId = filename;
  let level = 'all';
  let ownLanguage = null;

  if (filePath.endsWith('.xml')) {
    // Read level and language ONLY from the root lesson element's attributes
    const rootTagMatch = fileContent.match(/<cosy-lesson\b([^>]*)>/i) || fileContent.match(/<lesson\b([^>]*)>/i);
    if (rootTagMatch) {
      const attrs = rootTagMatch[1];
      const idMatch = attrs.match(/\bid=["']([^"']+)["']/i);
      const levelMatch = attrs.match(/\blevel=["']([^"']+)["']/i);
      const langMatch = attrs.match(/\blanguage=["']([^"']+)["']/i);

      if (idMatch && idMatch[1]) lessonId = idMatch[1];
      if (levelMatch && levelMatch[1]) level = levelMatch[1];
      if (langMatch && langMatch[1]) ownLanguage = langMatch[1];
    }
  } else if (filePath.endsWith('.json')) {
    try {
      const parsed = JSON.parse(fileContent);
      if (parsed.id) lessonId = parsed.id;
      if (parsed.level) level = parsed.level;
      if (parsed.language) ownLanguage = parsed.language;
    } catch (e) {
      // Non-JSON or malformed JSON fallback
    }
  }

  const folderLang = getFolderLanguage(relativePath);
  const language = folderLang || ownLanguage || 'en';

  const disagreement = (folderLang && ownLanguage && ownLanguage !== folderLang)
    ? { relativePath, ownLanguage, folderLang }
    : null;

  // Infer level from path if missing or 'all'
  const normalizedPath = relativePath.toLowerCase();
  if (level === 'all') {
    const levelMatch = normalizedPath.match(/\b(a0|a1|a2|b1|b2|c1|c2)\b/);
    if (levelMatch) level = levelMatch[1].toUpperCase();
  }

  return {
    primaryKey: lessonId,
    relativePath,
    level,
    language,
    ownLanguage,
    folderLang,
    disagreement
  };
}

async function publishToSupabase() {
  loadEnv();
  const isDryRun = process.argv.includes('--dry-run');
  const supabaseUrl = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isDryRun && (!supabaseUrl || !SUPABASE_SERVICE_ROLE_KEY)) {
    console.log("::warning:: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable is missing. Skipping Supabase publish.");
    process.exit(0);
  }

  console.log("🚀 Gathering gated material files...");
  let allFiles = [];
  GATED_DIRECTORIES.forEach(dir => {
    const fullDir = path.join(process.cwd(), dir);
    allFiles = getAllFiles(fullDir, allFiles);
  });

  console.log(`📦 Found ${allFiles.length} gated content files.`);

  const recordsToUpsert = [];
  const studentRecordsToUpsert = [];
  const disagreements = [];
  const countsMap = {};

  for (const filePath of allFiles) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const meta = parseContentMetadata(filePath, fileContent);

    if (meta.disagreement) {
      disagreements.push(meta.disagreement);
      console.log(`⚠️ Disagreement in ${meta.relativePath}: own language field '${meta.ownLanguage}' disagrees with folder language '${meta.folderLang}'. Using '${meta.folderLang}'.`);
    }

    const key = `${meta.language}|${meta.level}`;
    countsMap[key] = (countsMap[key] || 0) + 1;

    // Upsert primary key as lesson_id
    recordsToUpsert.push({
      lesson_id: meta.primaryKey,
      level: meta.level,
      language: meta.language,
      xml_content: fileContent,
      updated_at: new Date().toISOString()
    });

    // Also upsert with relativePath as secondary key if different
    if (meta.relativePath !== meta.primaryKey) {
      recordsToUpsert.push({
        lesson_id: meta.relativePath,
        level: meta.level,
        language: meta.language,
        xml_content: fileContent,
        updated_at: new Date().toISOString()
      });
    }

    if (meta.relativePath.startsWith('lessons/')) {
      studentRecordsToUpsert.push({
        lesson_id: meta.relativePath,
        level: meta.level,
        language: meta.language,
        content: sanitizeStudentLessonContent(meta.relativePath, fileContent),
        updated_at: new Date().toISOString()
      });
    }
  }

  if (isDryRun) {
    console.log("\n📊 --- DRY-RUN PUBLISH SUMMARY ---");
    const tableData = Object.keys(countsMap).sort().map(k => {
      const [language, level] = k.split('|');
      return { language, level, count: countsMap[k] };
    });
    console.table(tableData);

    console.log(`\n⚠️ Total Disagreements: ${disagreements.length}`);
    if (disagreements.length > 0) {
      disagreements.forEach(d => {
        console.log(`  - ${d.relativePath}: own='${d.ownLanguage}' vs folder='${d.folderLang}'`);
      });
    }
    console.log("🏁 Dry-run complete. No data sent to Supabase.");
    return;
  }

  // Deduplicate by lesson_id
  const dedupedMap = new Map();
  for (const record of recordsToUpsert) {
    dedupedMap.set(record.lesson_id, record);
  }
  const dedupedRecords = Array.from(dedupedMap.values());
  console.log(`🧹 Deduplicated ${recordsToUpsert.length} records down to ${dedupedRecords.length} unique lesson_id rows.`);

  async function upsertRecords(table, records) {
    const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${table}`;
    const chunkSize = 50;
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(chunk)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Batch upload to ${table} failed (rows ${i} to ${i + chunk.length}): ${errorText}`);
      }
      console.log(`✅ ${table}: uploaded batch ${Math.floor(i / chunkSize) + 1}/${Math.ceil(records.length / chunkSize)}`);
    }
  }

  await upsertRecords('student_lesson_content', studentRecordsToUpsert);
  await upsertRecords('lesson_content', dedupedRecords);

  console.log("🎉 Publishing to Supabase complete!");
}

if (require.main === module) {
  publishToSupabase().catch(err => {
    console.error("❌ Fatal error in publish_to_supabase:", err);
    process.exit(1);
  });
}

module.exports = { parseContentMetadata, getAllFiles, getFolderLanguage };
