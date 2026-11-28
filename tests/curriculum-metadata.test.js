const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const base = path.join(root, 'curriculums');
const themeIds = new Set(
  JSON.parse(fs.readFileSync(path.join(root, 'cefr', 'data', 'themes.json'), 'utf8')).map((t) => t.id),
);
const vocabId = /^[a-z]{2}:[a-z0-9-]+:(noun|verb|adjective|adverb|phrase|idiom|number|pronoun|preposition|determiner|conjunction|article)$/;
const threadId = /^T([1-9]|1[0-4])$/;

function curriculumFiles() {
  const out = [];
  for (const lang of fs.readdirSync(base)) {
    if (lang.startsWith('_')) continue;
    for (const track of fs.readdirSync(path.join(base, lang))) {
      if (track.startsWith('_')) continue;
      const dir = path.join(base, lang, track);
      if (!fs.statSync(dir).isDirectory()) continue;
      for (const file of fs.readdirSync(dir).filter((n) => n.endsWith('.json'))) {
        out.push(path.join(dir, file));
      }
    }
  }
  return out;
}

test('every theme id used by a curriculum exists in cefr/data/themes.json', () => {
  const bad = [];
  for (const file of curriculumFiles()) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const unit of data.units || []) {
      if (unit.theme && !themeIds.has(unit.theme)) bad.push(`${file} unit ${unit.unit}: ${unit.theme}`);
      for (const theme of unit.secondaryThemes || []) {
        if (!themeIds.has(theme)) bad.push(`${file} unit ${unit.unit}: ${theme}`);
      }
    }
  }
  assert.deepEqual(bad, []);
});

test('secondary themes never repeat the primary theme', () => {
  const bad = [];
  for (const file of curriculumFiles()) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const unit of data.units || []) {
      if ((unit.secondaryThemes || []).includes(unit.theme)) bad.push(`${file} unit ${unit.unit}`);
      const unique = new Set(unit.secondaryThemes || []);
      if (unique.size !== (unit.secondaryThemes || []).length) bad.push(`${file} unit ${unit.unit}: duplicate`);
    }
  }
  assert.deepEqual(bad, []);
});

test('macroFunction, vocabularyIds, recycledIds and grammarThreads keep their shape', () => {
  const bad = [];
  for (const file of curriculumFiles()) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const unit of data.units || []) {
      if (unit.macroFunction !== undefined && (typeof unit.macroFunction !== 'string' || unit.macroFunction.trim().length < 3)) {
        bad.push(`${file} unit ${unit.unit}: macroFunction`);
      }
      for (const lesson of unit.lessons || []) {
        for (const id of lesson.vocabularyIds || []) if (!vocabId.test(id)) bad.push(`${file} ${id}`);
        for (const id of lesson.recycledIds || []) if (typeof id !== 'string' || !id) bad.push(`${file} recycledIds`);
        for (const thread of lesson.grammarThreads || []) if (!threadId.test(thread)) bad.push(`${file} ${thread}`);
      }
    }
  }
  assert.deepEqual(bad, []);
});

test('the French B1 pilot carries a theme on every unit', () => {
  const file = path.join(base, 'fr', 'general', 'B1.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const missing = data.units.filter((u) => !u.theme).map((u) => u.unit);
  assert.deepEqual(missing, []);
  assert.equal(data.units.length, 13);
});

test('declared unit metadata and the curriculum do not drift', () => {
  const map = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'data', 'unit-metadata.json'), 'utf8'));
  const bad = [];
  for (const [course, spec] of Object.entries(map)) {
    const [track, lang, level] = course.split('-');
    const file = path.join(base, lang, track, `${level.toUpperCase()}.json`);
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const [number, meta] of Object.entries(spec.units)) {
      const unit = data.units.find((u) => String(u.unit) === number);
      if (!unit) { bad.push(`${course} unit ${number} missing`); continue; }
      if (unit.theme !== meta.theme) bad.push(`${course} unit ${number} theme`);
      if (unit.macroFunction !== meta.macroFunction) bad.push(`${course} unit ${number} macroFunction`);
      assert.deepEqual(unit.secondaryThemes || [], meta.secondaryThemes || []);
    }
  }
  assert.deepEqual(bad, []);
});
