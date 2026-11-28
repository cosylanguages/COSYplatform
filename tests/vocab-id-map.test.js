const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const dir = path.join(root, 'docs', 'vocab-id-map');
const idRe = /^[a-z]{2}:[a-z0-9-]+:(noun|verb|adjective|adverb|phrase|idiom|number|pronoun|preposition|determiner|conjunction|article)$/;
const lessonKey = /^[a-z]{2}\/[a-z-]+\/[A-C][12]\/u\d{2}-l\d{2}$/;
const statuses = new Set(['exact', 'normalized', 'related', 'missing']);

function mappings() {
  return fs
    .readdirSync(dir)
    .filter((n) => n.startsWith('mapping-') && n.endsWith('.json'))
    .map((n) => JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8')));
}

function itemsOf(map) {
  return Object.values(map.lessons).flatMap((lesson) => lesson.items);
}

test('at least one mapping artifact exists', () => {
  assert.ok(mappings().length >= 1);
});

test('mapping summary adds up and matches the item list', () => {
  for (const map of mappings()) {
    const items = itemsOf(map);
    assert.equal(map.summary.items, items.length, map.course);
    const counted = ['exact', 'normalized', 'related', 'missing'].reduce((n, s) => n + map.summary[s], 0);
    assert.equal(counted, items.length, map.course);
    for (const item of items) assert.ok(statuses.has(item.status), `${map.course}: ${item.status}`);
  }
});

test('resolved items carry a well-formed id and unresolved ones do not', () => {
  for (const map of mappings()) {
    for (const item of itemsOf(map)) {
      if (item.status === 'exact' || item.status === 'normalized') {
        assert.match(item.id, idRe, `${map.course}: ${item.text}`);
        assert.ok(item.level, `${map.course}: ${item.text} has no level`);
        assert.equal(item.alternatives.length, 0);
      } else {
        assert.equal(item.id, null, `${map.course}: ${item.text}`);
        for (const candidate of item.alternatives) {
          assert.match(candidate.id, idRe);
          assert.ok(candidate.level);
          assert.ok(candidate.word);
        }
      }
    }
  }
});

test('lessons are keyed by course path and never repeat', () => {
  for (const map of mappings()) {
    for (const key of Object.keys(map.lessons)) {
      assert.match(key, lessonKey, map.course);
      assert.ok(key.startsWith(`${map.lang}/`), key);
      assert.ok(key.includes(`/${map.level}/`), key);
      assert.ok(map.lessons[key].code, `${key} has no lesson code`);
    }
  }
});

test('the CSV review sheet has one row per item plus a header', () => {
  for (const map of mappings()) {
    const csv = path.join(dir, `review-${map.course}.csv`);
    const lines = fs.readFileSync(csv, 'utf8').replace(/\r\n/g, '\n').trimEnd().split('\n');
    assert.equal(lines.length, itemsOf(map).length + 1, csv);
    assert.equal(
      lines[0],
      'unit,lesson,code,item,status,matched_id,matched_word,matched_level,candidates,decision',
    );
  }
});

test('a backlog file lists exactly the unresolved items, grouped by themed unit', () => {
  for (const map of mappings()) {
    const file = path.join(dir, `backlog-${map.course}.json`);
    if (!fs.existsSync(file)) continue;
    const backlog = JSON.parse(fs.readFileSync(file, 'utf8'));
    const total = backlog.units.reduce((n, u) => n + u.items.length, 0);
    assert.equal(total, map.summary.related + map.summary.missing, map.course);
    for (const unit of backlog.units) {
      assert.ok(unit.theme, `${map.course} unit ${unit.unit} has no theme`);
      assert.ok(unit.items.length > 0);
      for (const item of unit.items) assert.ok(item.text && item.lesson);
    }
  }
});

test('the French B1 pilot resolves at least the measured 19 percent', () => {
  const map = mappings().find((m) => m.course === 'general-fr-b1');
  assert.ok(map, 'general-fr-b1 mapping missing');
  assert.equal(Object.keys(map.lessons).length, 65);
  assert.equal(map.summary.items, 520);
  assert.ok(map.summary.resolved_pct >= 19, String(map.summary.resolved_pct));
});
