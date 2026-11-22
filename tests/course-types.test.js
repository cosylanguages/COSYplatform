const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..', 'curriculums');
const list = JSON.parse(fs.readFileSync(path.join(base, '_schema', 'course-types.json'), 'utf8'));
const types = Object.keys(list.types).sort();

function schemaEnum(node) {
  if (node && typeof node === 'object') {
    if (node.course_type && node.course_type.enum) return node.course_type.enum;
    for (const v of Object.values(node)) { const r = schemaEnum(v); if (r) return r; }
  }
  return null;
}

test('schema enum equals the course-types list', () => {
  const schema = JSON.parse(fs.readFileSync(path.join(base, '_schema', 'curriculum.schema.json'), 'utf8'));
  assert.deepEqual([...schemaEnum(schema)].sort(), types);
});

test('manual-only names are not course types', () => {
  for (const name of Object.keys(list.manualOnly)) assert.ok(!types.includes(name), name);
});

test('every curriculum folder and course_type field uses a listed type', () => {
  const bad = [];
  for (const lang of fs.readdirSync(base)) {
    if (lang.startsWith('_')) continue;
    const langDir = path.join(base, lang);
    if (!fs.statSync(langDir).isDirectory()) continue;
    for (const track of fs.readdirSync(langDir)) {
      const trackDir = path.join(langDir, track);
      if (track.startsWith('_') || !fs.statSync(trackDir).isDirectory()) continue;
      if (!types.includes(track)) bad.push(`${lang}/${track}: folder is not a course type`);
      for (const f of fs.readdirSync(trackDir).filter((n) => n.endsWith('.json'))) {
        let d; try { d = JSON.parse(fs.readFileSync(path.join(trackDir, f), 'utf8')); } catch (_) { continue; }
        if (d.course_type !== track) bad.push(`${lang}/${track}/${f}: course_type=${d.course_type}`);
      }
    }
  }
  assert.deepEqual(bad, []);
});
