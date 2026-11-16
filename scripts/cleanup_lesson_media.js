#!/usr/bin/env node
/**
 * Remove uploaded lesson media that no published lesson and no saved draft uses.
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/cleanup_lesson_media.js           (dry run: lists only)
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/cleanup_lesson_media.js --delete  (deletes)
 *
 * Options: --min-age-days N (default 14, minimum 1).
 * Needs the npm package once: npm install --no-save @supabase/supabase-js
 * (the copy under vendor/ is the browser build and does not run in Node).
 * The service-role key is a server secret: run this on your own machine, never in the browser.
 * The list comes from the database function list_orphan_lesson_media; files are removed with the
 * Storage API so the stored data goes too. A published lesson that still uses a file is never listed.
 */
'use strict';

function parseArgs(argv) {
  const out = { del: false, minAge: 14 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--delete') out.del = true;
    else if (argv[i] === '--min-age-days') out.minAge = Number(argv[++i]);
    else throw new Error('Unknown option: ' + argv[i]);
  }
  if (!Number.isInteger(out.minAge) || out.minAge < 1) throw new Error('--min-age-days must be a whole number of at least 1');
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  const { createClient } = require('@supabase/supabase-js');
  const client = createClient(url, key, { auth: { persistSession: false } });

  const { data, error } = await client.rpc('list_orphan_lesson_media', { p_min_age_days: args.minAge });
  if (error) throw new Error(error.message);
  const rows = data || [];
  const total = rows.reduce((n, r) => n + Number(r.size_bytes || 0), 0);
  console.log(`${rows.length} unused file(s), ${(total / 1048576).toFixed(1)} MB, older than ${args.minAge} day(s).`);
  rows.forEach((r) => console.log('  ' + r.name + '  ' + r.created_at));
  if (!args.del) { console.log('Dry run. Nothing deleted. Add --delete to remove these files.'); return; }
  if (!rows.length) return;

  let removed = 0;
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100).map((r) => r.name);
    const res = await client.storage.from('lesson-media').remove(batch);
    if (res.error) throw new Error(res.error.message);
    removed += (res.data || []).length;
  }
  console.log(`Deleted ${removed} file(s).`);
}

if (require.main === module) main().catch((e) => { console.error('Error: ' + e.message); process.exit(1); });
module.exports = { parseArgs };
