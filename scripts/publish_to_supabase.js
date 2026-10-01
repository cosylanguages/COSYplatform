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

function buildLiveSet(roadmapsDir = path.join(process.cwd(), 'roadmaps')) {
  const LIVE = new Set();
  let roadmapParseFailed = false;

  if (!fs.existsSync(roadmapsDir)) {
    return { LIVE, roadmapParseFailed: true };
  }

  try {
    const rmFiles = fs.readdirSync(roadmapsDir).filter(f => f.endsWith('.json'));
    if (rmFiles.length === 0) {
      roadmapParseFailed = true;
    }

    for (const file of rmFiles) {
      const fullPath = path.join(roadmapsDir, file);
      try {
        const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

        function traverse(obj) {
          if (!obj || typeof obj !== 'object') return;
          if (obj.lessonFile && obj.status !== 'planned') {
            const normPath = obj.lessonFile.replace(/\\/g, '/');
            if (fs.existsSync(path.join(process.cwd(), normPath))) {
              LIVE.add(normPath);
            }
          }
          for (const key of Object.keys(obj)) {
            if (typeof obj[key] === 'object') {
              traverse(obj[key]);
            }
          }
        }

        traverse(content);
      } catch (err) {
        console.error(`❌ Error parsing roadmap file ${file}:`, err.message);
        roadmapParseFailed = true;
      }
    }
  } catch (err) {
    console.error(`❌ Error reading roadmaps directory:`, err.message);
    roadmapParseFailed = true;
  }

  return { LIVE, roadmapParseFailed };
}

async function fetchAllLessonIds(table, supabaseUrl, serviceRoleKey) {
  const limit = 1000;
  let offset = 0;
  const allIds = [];
  while (true) {
    const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${table}?select=lesson_id&limit=${limit}&offset=${offset}`;
    const resp = await fetch(endpoint, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Failed to fetch lesson_ids from ${table}: ${errText}`);
    }
    const rows = await resp.json();
    for (const r of rows) {
      allIds.push(r.lesson_id);
    }
    if (rows.length < limit) break;
    offset += limit;
  }
  return allIds;
}

async function deleteLessonIdsChunked(table, idsToDelete, supabaseUrl, serviceRoleKey) {
  const chunkSize = 50;
  for (let i = 0; i < idsToDelete.length; i += chunkSize) {
    const chunk = idsToDelete.slice(i, i + chunkSize);
    const param = chunk.map(id => `"${id.replace(/"/g, '""')}"`).map(encodeURIComponent).join(',');
    const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${table}?lesson_id=in.(${param})`;
    const resp = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Failed to delete chunk from ${table}: ${errText}`);
    }
  }
}

async function publishToSupabase() {
  loadEnv();
  const isDryRun = process.argv.includes('--dry-run');
  const isPrune = process.argv.includes('--prune');
  const supabaseUrl = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isDryRun && (!supabaseUrl || !SUPABASE_SERVICE_ROLE_KEY)) {
    console.log("::warning:: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable is missing. Skipping Supabase publish.");
    process.exit(0);
  }

  const { LIVE, roadmapParseFailed } = buildLiveSet();

  if (isPrune) {
    if (roadmapParseFailed) {
      console.error("❌ Safety guard: Roadmaps could not be parsed. Aborting prune.");
      process.exit(1);
    }
    if (LIVE.size < 100) {
      console.error(`❌ Safety guard: LIVE set has fewer than 100 entries (${LIVE.size}). Aborting prune.`);
      process.exit(1);
    }
  }

  console.log("🚀 Gathering gated material files...");
  let allFiles = [];
  GATED_DIRECTORIES.forEach(dir => {
    const fullDir = path.join(process.cwd(), dir);
    allFiles = getAllFiles(fullDir, allFiles);
  });

  const recordsToUpsert = [];
  const studentRecordsToUpsert = [];
  const disagreements = [];
  const countsMap = {};

  const livePrimaryKeys = new Set();
  const draftPrimaryKeys = new Set();
  const draftLessonFiles = [];
  const skippedFolderBreakdown = {};
  let skippedCount = 0;

  for (const filePath of allFiles) {
    const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');

    if (relativePath.startsWith('lessons/')) {
      if (!LIVE.has(relativePath)) {
        skippedCount++;
        const parts = relativePath.split('/');
        const topFolder = parts[1] || 'lessons';
        skippedFolderBreakdown[topFolder] = (skippedFolderBreakdown[topFolder] || 0) + 1;

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const meta = parseContentMetadata(filePath, fileContent);
        draftLessonFiles.push({ relativePath, primaryKey: meta.primaryKey });
        draftPrimaryKeys.add(meta.primaryKey);
        continue;
      }
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const meta = parseContentMetadata(filePath, fileContent);

    if (meta.disagreement) {
      disagreements.push(meta.disagreement);
      console.log(`⚠️ Disagreement in ${meta.relativePath}: own language field '${meta.ownLanguage}' disagrees with folder language '${meta.folderLang}'. Using '${meta.folderLang}'.`);
    }

    const key = `${meta.language}|${meta.level}`;
    countsMap[key] = (countsMap[key] || 0) + 1;

    livePrimaryKeys.add(meta.primaryKey);
    livePrimaryKeys.add(meta.relativePath);

    recordsToUpsert.push({
      lesson_id: meta.primaryKey,
      level: meta.level,
      language: meta.language,
      xml_content: fileContent,
      updated_at: new Date().toISOString()
    });

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

  console.log(`Live lessons to publish: ${LIVE.size}`);
  console.log(`Draft lessons skipped: ${skippedCount}`);
  console.log("Draft lessons skipped folder breakdown:");
  Object.keys(skippedFolderBreakdown).sort().forEach(folder => {
    console.log(`  ${folder}: ${skippedFolderBreakdown[folder]}`);
  });

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

    // Compute "Rows that would be pruned: P"
    let prunedCountText = "unknown";
    if (supabaseUrl && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const existingStudentIds = await fetchAllLessonIds('student_lesson_content', supabaseUrl, SUPABASE_SERVICE_ROLE_KEY);
        const existingLessonIds = await fetchAllLessonIds('lesson_content', supabaseUrl, SUPABASE_SERVICE_ROLE_KEY);

        const studentToPrune = existingStudentIds.filter(id => id.startsWith('lessons/') && !LIVE.has(id));
        const lessonToPrune = existingLessonIds.filter(id => {
          if (LIVE.has(id) || livePrimaryKeys.has(id)) return false;
          if (id.startsWith('lessons/')) return !LIVE.has(id);
          if (draftPrimaryKeys.has(id)) return true;
          return false;
        });

        prunedCountText = `${studentToPrune.length + lessonToPrune.length}`;
      } catch (err) {
        console.log(`⚠️ DB fetch for dry-run prune estimation failed: ${err.message}. Falling back to simulation.`);
      }
    }

    if (prunedCountText === "unknown") {
      try {
        const studentPruneSim = draftLessonFiles.map(f => f.relativePath);
        const lessonPruneSim = new Set();
        draftLessonFiles.forEach(f => {
          lessonPruneSim.add(f.relativePath);
          if (f.primaryKey && !livePrimaryKeys.has(f.primaryKey)) {
            lessonPruneSim.add(f.primaryKey);
          }
        });
        prunedCountText = `${studentPruneSim.length + lessonPruneSim.size}`;
      } catch (err) {
        prunedCountText = "unknown";
      }
    }

    console.log(`Rows that would be pruned: ${prunedCountText}`);
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

  if (isPrune) {
    console.log("🧹 Pruning draft lessons from Supabase...");
    const existingStudentIds = await fetchAllLessonIds('student_lesson_content', supabaseUrl, SUPABASE_SERVICE_ROLE_KEY);
    const existingLessonIds = await fetchAllLessonIds('lesson_content', supabaseUrl, SUPABASE_SERVICE_ROLE_KEY);

    const studentToPrune = existingStudentIds.filter(id => id.startsWith('lessons/') && !LIVE.has(id));
    const lessonToPrune = existingLessonIds.filter(id => {
      if (LIVE.has(id) || livePrimaryKeys.has(id)) return false;
      if (id.startsWith('lessons/')) return !LIVE.has(id);
      if (draftPrimaryKeys.has(id)) return true;
      return false;
    });

    console.log(`Pruning ${studentToPrune.length} rows from student_lesson_content...`);
    await deleteLessonIdsChunked('student_lesson_content', studentToPrune, supabaseUrl, SUPABASE_SERVICE_ROLE_KEY);

    console.log(`Pruning ${lessonToPrune.length} rows from lesson_content...`);
    await deleteLessonIdsChunked('lesson_content', lessonToPrune, supabaseUrl, SUPABASE_SERVICE_ROLE_KEY);

    console.log("✅ Prune complete.");
  }

  console.log("🎉 Publishing to Supabase complete!");
}

if (require.main === module) {
  publishToSupabase().catch(err => {
    console.error("❌ Fatal error in publish_to_supabase:", err);
    process.exit(1);
  });
}

module.exports = { parseContentMetadata, getAllFiles, getFolderLanguage, buildLiveSet, publishToSupabase };
