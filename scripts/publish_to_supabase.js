#!/usr/bin/env node

/**
 * publish_to_supabase.js
 *
 * LOCAL ONLY script run by the founder to read gated content from:
 * - lessons/ (XML/JSON)
 * - student-workbooks/
 * - activities/
 * - manuals/
 * - teacher-guides/
 * - reference/
 *
 * and upsert into Supabase `lesson_content` table using service_role key from .env.
 */

const fs = require('fs');
const path = require('path');

// Basic .env parser for LOCAL ONLY execution
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

loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in local .env file.");
  process.exit(1);
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

function parseContentMetadata(filePath, fileContent) {
  const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
  const filename = path.basename(filePath, path.extname(filePath));

  let lessonId = filename;
  let level = 'all';
  let language = 'en';

  if (filePath.endsWith('.xml')) {
    const idMatch = fileContent.match(/id=["']([^"']+)["']/i);
    const levelMatch = fileContent.match(/level=["']([^"']+)["']/i);
    const langMatch = fileContent.match(/language=["']([^"']+)["']/i);

    if (idMatch && idMatch[1]) lessonId = idMatch[1];
    if (levelMatch && levelMatch[1]) level = levelMatch[1];
    if (langMatch && langMatch[1]) language = langMatch[1];
  } else if (filePath.endsWith('.json')) {
    try {
      const parsed = JSON.parse(fileContent);
      if (parsed.id) lessonId = parsed.id;
      if (parsed.level) level = parsed.level;
      if (parsed.language) language = parsed.language;
    } catch (e) {
      // Non-JSON or malformed JSON fallback
    }
  }

  // Infer level or language from path if missing
  const normalizedPath = relativePath.toLowerCase();
  if (level === 'all') {
    const levelMatch = normalizedPath.match(/\b(a0|a1|a2|b1|b2|c1|c2)\b/);
    if (levelMatch) level = levelMatch[1].toUpperCase();
  }
  if (language === 'en') {
    if (normalizedPath.includes('/fr/') || normalizedPath.includes('-fr-')) language = 'fr';
    if (normalizedPath.includes('/ru/') || normalizedPath.includes('-ru-')) language = 'ru';
    if (normalizedPath.includes('/es/') || normalizedPath.includes('-es-')) language = 'es';
    if (normalizedPath.includes('/de/') || normalizedPath.includes('-de-')) language = 'de';
    if (normalizedPath.includes('/it/') || normalizedPath.includes('-it-')) language = 'it';
    if (normalizedPath.includes('/el/') || normalizedPath.includes('-el-')) language = 'el';
  }

  return {
    primaryKey: lessonId,
    relativePath,
    level,
    language
  };
}

async function publishToSupabase() {
  console.log("🚀 Gathering gated material files...");
  let allFiles = [];
  GATED_DIRECTORIES.forEach(dir => {
    const fullDir = path.join(process.cwd(), dir);
    allFiles = getAllFiles(fullDir, allFiles);
  });

  console.log(`📦 Found ${allFiles.length} gated content files to publish.`);

  const recordsToUpsert = [];

  for (const filePath of allFiles) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const meta = parseContentMetadata(filePath, fileContent);

    // Upsert primary key as lesson_id
    recordsToUpsert.push({
      lesson_id: meta.primaryKey,
      level: meta.level,
      language: meta.language,
      xml_content: fileContent,
      updated_at: new Date().toISOString()
    });

    // Also upsert with relativePath as secondary key if different (so lookups by path or ID both work)
    if (meta.relativePath !== meta.primaryKey) {
      recordsToUpsert.push({
        lesson_id: meta.relativePath,
        level: meta.level,
        language: meta.language,
        xml_content: fileContent,
        updated_at: new Date().toISOString()
      });
    }
  }

  console.log(`📤 Upserting ${recordsToUpsert.length} records into Supabase 'lesson_content' table...`);

  const endpoint = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/lesson_content`;

  // Batch upsert in chunks of 50
  const CHUNK_SIZE = 50;
  for (let i = 0; i < recordsToUpsert.length; i += CHUNK_SIZE) {
    const chunk = recordsToUpsert.slice(i, i + CHUNK_SIZE);

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
      console.error(`❌ Batch upload failed (rows ${i} to ${i + chunk.length}):`, errorText);
    } else {
      console.log(`✅ Uploaded batch ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(recordsToUpsert.length / CHUNK_SIZE)}`);
    }
  }

  console.log("🎉 Publishing to Supabase complete!");
}

if (require.main === module) {
  publishToSupabase().catch(err => {
    console.error("❌ Fatal error in publish_to_supabase:", err);
    process.exit(1);
  });
}

module.exports = { parseContentMetadata, getAllFiles };
