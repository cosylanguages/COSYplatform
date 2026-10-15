#!/usr/bin/env node
'use strict';

// Dependency-free regression tests for shared/js/progress.js.
// Run with: node scripts/test_progress.js

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'shared', 'js', 'progress.js'), 'utf8');

function createHarness({ userId = 'student-123', answers = [], readError = false, deleteError = false } = {}) {
  const storage = new Map();
  const upserts = [];
  const deletes = [];
  const context = {
    console,
    Date,
    Map,
    JSON,
    Promise,
    setTimeout,
    clearTimeout,
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); },
      removeItem(key) { storage.delete(key); }
    },
    addEventListener() {},
    CosyAuth: {
      client: {
        auth: {
          getSession: async () => ({ data: { session: { user: { id: userId } } } })
        },
        from(table) {
          assert.equal(table, 'lesson_answers');
          return {
            upsert: async (payload, options) => {
              upserts.push({ payload, options });
              return { error: null };
            },
            delete() {
              return {
                eq(column, userId) {
                  return {
                    async eq(lessonColumn, lessonId) {
                      deletes.push({ column, userId, lessonColumn, lessonId });
                      return { error: deleteError ? { message: 'delete denied' } : null };
                    }
                  };
                }
              };
            },
            select() {
              return {
                eq() {
                  return {
                    eq() {
                      return Promise.resolve({ data: readError ? null : answers, error: readError ? { message: 'offline' } : null });
                    }
                  };
                }
              };
            }
          };
        }
      }
    }
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(source, context, { filename: 'shared/js/progress.js' });
  return { context, storage, upserts, deletes };
}

async function main() {
  // Saving queues a durable offline copy immediately; flush persists it to Supabase.
  const h = createHarness();
  await h.context.CosyProgress.saveAnswer('lessons/a1/greetings.json', 'blank_1', 'hello', true);

  const pendingKey = 'cosy_pending_answers_student-123';
  const pending = JSON.parse(h.storage.get(pendingKey));
  assert.equal(pending['lessons/a1/greetings.json::blank_1'].value, 'hello');
  assert.equal(pending['lessons/a1/greetings.json::blank_1'].isCorrect, true);

  await h.context.CosyProgress.flush();
  assert.equal(h.upserts.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(h.upserts[0].payload)), {
    student_id: 'student-123',
    lesson_id: 'lessons/a1/greetings.json',
    field_key: 'blank_1',
    value: 'hello',
    is_correct: true,
    updated_at: h.upserts[0].payload.updated_at
  });
  assert.equal(h.upserts[0].options.onConflict, 'student_id,lesson_id,field_key');
  assert.equal(JSON.parse(h.storage.get(pendingKey))['lessons/a1/greetings.json::blank_1'], undefined);

  // Loading returns saved field values from the authenticated student's rows.
  const loadedHarness = createHarness({
    answers: [
      { field_key: 'blank_1', value: 'hello', is_correct: true },
      { field_key: 'choice_2', value: 'B', is_correct: false }
    ]
  });
  const loaded = await loadedHarness.context.CosyProgress.loadAnswers('lessons/a1/greetings.json');
  assert.deepEqual(JSON.parse(JSON.stringify(loaded)), { blank_1: 'hello', choice_2: 'B' });

  // Unsynced local values remain available offline and override stale server values.
  const offlineHarness = createHarness({
    answers: [{ field_key: 'blank_1', value: 'old server value', is_correct: false }],
    readError: true
  });
  await offlineHarness.context.CosyProgress.saveAnswer('lessons/a1/greetings.json', 'blank_1', 'new local value', true);
  const offlineLoaded = await offlineHarness.context.CosyProgress.loadAnswers('lessons/a1/greetings.json');
  assert.deepEqual(JSON.parse(JSON.stringify(offlineLoaded)), { blank_1: 'new local value' });

  // Teacher-triggered reset asks each student to delete only their own lesson rows.
  await h.context.CosyProgress.saveAnswer('lessons/a1/greetings.json', 'blank_2', 'to clear');
  assert.equal(await h.context.CosyProgress.clearLessonAnswers('lessons/a1/greetings.json'), true);
  assert.deepEqual(h.deletes.at(-1), {
    column: 'student_id',
    userId: 'student-123',
    lessonColumn: 'lesson_id',
    lessonId: 'lessons/a1/greetings.json'
  });
  assert.equal(Object.keys(JSON.parse(h.storage.get(pendingKey))).some(key => key.startsWith('lessons/a1/greetings.json::')), false);

  // If server deletion is denied, reset reports failure and retains queued data.
  const deniedReset = createHarness({ deleteError: true });
  await deniedReset.context.CosyProgress.saveAnswer('lessons/a1/greetings.json', 'blank_3', 'keep me');
  assert.equal(await deniedReset.context.CosyProgress.clearLessonAnswers('lessons/a1/greetings.json'), false);
  assert.equal(JSON.parse(deniedReset.storage.get(pendingKey))['lessons/a1/greetings.json::blank_3'].value, 'keep me');

  // Missing identifiers are ignored instead of writing malformed records.
  await h.context.CosyProgress.saveAnswer('', 'blank_2', 'ignored');
  await h.context.CosyProgress.saveAnswer('lesson-id', '', 'ignored');
  await h.context.CosyProgress.flush();
  assert.equal(h.upserts.length, 1);

  console.log('PASS: progress queue, Supabase flush/load, offline fallback, safe lesson reset, and invalid-input guards');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
