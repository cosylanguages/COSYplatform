const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function createHarness({ delayUpsert = false } = {}) {
  const storage = new Map();
  const rows = new Map();
  let upsertStarted;
  let releaseUpsert;
  const started = new Promise(resolve => { upsertStarted = resolve; });
  const gate = new Promise(resolve => { releaseUpsert = resolve; });

  const client = {
    auth: { getSession: async () => ({ data: { session: { user: { id: 'student-1' } } } }) },
    from(table) {
      assert.equal(table, 'lesson_answers');
      let operation = 'select';
      let payload;
      const filters = {};
      const query = {
        select() { operation = 'select'; return query; },
        delete() { operation = 'delete'; return query; },
        upsert(value) { operation = 'upsert'; payload = value; return query; },
        eq(key, value) { filters[key] = value; return query; },
        then(resolve, reject) {
          return (async () => {
            if (operation === 'upsert') {
              if (delayUpsert) {
                upsertStarted();
                await gate;
              }
              rows.set([payload.student_id, payload.lesson_id, payload.field_key].join('::'), payload);
              return { error: null };
            }
            if (operation === 'delete') {
              for (const [key, row] of rows) {
                if (row.student_id === filters.student_id && row.lesson_id === filters.lesson_id) rows.delete(key);
              }
              return { error: null };
            }
            const data = [...rows.values()].filter(row =>
              row.student_id === filters.student_id && row.lesson_id === filters.lesson_id
            ).map(row => ({ field_key: row.field_key, value: row.value }));
            return { data, error: null };
          })().then(resolve, reject);
        }
      };
      return query;
    }
  };

  const window = {
    CosyAuth: { client },
    addEventListener() {}
  };
  const context = {
    window,
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, value); }
    },
    setTimeout,
    clearTimeout,
    Date,
    Math,
    Map,
    Object,
    Promise,
    console
  };
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, '../shared/js/progress.js'), 'utf8'),
    context,
    { filename: 'shared/js/progress.js' }
  );
  return { progress: window.CosyProgress, rows, started, releaseUpsert };
}

test('reset waits for an in-flight upsert and leaves the lesson empty', async () => {
  const harness = createHarness({ delayUpsert: true });
  await harness.progress.saveAnswer('lesson-a', 'q1', 'answer');
  await new Promise(resolve => setTimeout(resolve, 850));
  await harness.started;

  const reset = harness.progress.clearLessonAnswers('lesson-a');
  harness.releaseUpsert();
  assert.equal(await reset, true);
  assert.equal(harness.rows.size, 0);
});

test('reset clears server answers and reports success', async () => {
  const harness = createHarness();
  await harness.progress.saveAnswer('lesson-a', 'q1', 'answer');
  await harness.progress.flush();
  assert.equal(harness.rows.size, 1);
  assert.equal(await harness.progress.clearLessonAnswers('lesson-a'), true);
  assert.equal(harness.rows.size, 0);
});
