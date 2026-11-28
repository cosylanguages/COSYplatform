const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const slots = JSON.parse(fs.readFileSync(path.join(root, 'cefr', 'data', 'unit-slots.json'), 'utf8'));
const themes = new Set(
  JSON.parse(fs.readFileSync(path.join(root, 'cefr', 'data', 'themes.json'), 'utf8')).map((t) => t.id),
);
const report = fs.readFileSync(path.join(root, 'docs', 'B1_SLOT_ALIGNMENT.md'), 'utf8');

test('the canonical B1 grid is 13 consecutive slots with unique, existing themes', () => {
  assert.equal(slots.length, 13);
  assert.deepEqual(slots.map((s) => s.slot), Array.from({ length: 13 }, (_, i) => i + 1));
  const seen = new Set();
  for (const slot of slots) {
    assert.match(slot.theme, /^t\d{2}$/);
    assert.ok(themes.has(slot.theme), slot.theme);
    assert.ok(!seen.has(slot.theme), `duplicate ${slot.theme}`);
    seen.add(slot.theme);
  }
});

test('every slot states a macro-function and the five-moment lesson frame', () => {
  for (const slot of slots) {
    assert.ok(slot.macroFunction && slot.macroFunction.length > 3, slot.theme);
    assert.deepEqual(slot.frame, ['input', 'lexis', 'grammar moment', 'skills', 'consolidation']);
  }
});

function themedCourses(level) {
  const base = path.join(root, 'curriculums');
  const out = [];
  for (const lang of fs.readdirSync(base)) {
    if (lang.startsWith('_')) continue;
    for (const track of fs.readdirSync(path.join(base, lang))) {
      const file = path.join(base, lang, track, `${level}.json`);
      if (!fs.existsSync(file)) continue;
      const units = JSON.parse(fs.readFileSync(file, 'utf8')).units || [];
      const primary = new Set(units.map((u) => u.theme).filter(Boolean));
      if (primary.size === 0) continue;
      out.push({
        course: `${track}-${lang}-${level.toLowerCase()}`,
        covered: slots.filter((slot) => primary.has(slot.theme)).length,
      });
    }
  }
  return out;
}

test('every committed alignment report matches the curricula it was built from', () => {
  for (const level of ['B1', 'B2']) {
    const file = path.join(root, 'docs', `${level}_SLOT_ALIGNMENT.md`);
    if (!fs.existsSync(file)) continue;
    const report = fs.readFileSync(file, 'utf8');
    const courses = themedCourses(level);
    assert.ok(courses.length >= 2, `${level}: expected themed courses`);
    for (const { course, covered } of courses) {
      assert.match(report, new RegExp(`### ${course} — ${covered}/13 slots`), `${level} ${course}`);
    }
  }
});
