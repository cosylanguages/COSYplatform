#!/usr/bin/env node
'use strict';

// Security regression tests for student lesson-content resolution.
// Run with: node scripts/test_lesson_resolver_security.js

const assert = require('node:assert/strict');
const { loadLessonContent } = require('../shared/js/lesson-resolver.js');

function makeClient({ sanitizedBody, sanitizedError = null, unexpected = [] } = {}) {
  const calls = [];
  const client = {
    from(table) {
      calls.push({ table });
      if (table !== 'lesson_student_content') unexpected.push(table);
      const chain = {
        select(column) { calls[calls.length - 1].column = column; return chain; },
        eq(column, value) { calls[calls.length - 1].filter = [column, value]; return chain; },
        async maybeSingle() {
          if (calls[calls.length - 1].table === 'lesson_student_content') {
            return { data: sanitizedBody == null ? null : { body: sanitizedBody }, error: sanitizedError };
          }
          return { data: null, error: null };
        }
      };
      return chain;
    }
  };
  return { client, calls, unexpected };
}

async function main() {
  // Sanitized canonical student content loads normally.
  {
    const h = makeClient({ sanitizedBody: '<cosy-lesson><p>Safe lesson</p></cosy-lesson>' });
    const body = await loadLessonContent(h.client, 'en:a1:greetings', 'student');
    assert.match(body, /Safe lesson/);
    assert.deepEqual(h.calls.map(c => c.table), ['lesson_student_content']);
    assert.deepEqual(h.unexpected, []);
  }

  // Missing sanitized content must fail closed, without querying legacy tables
  // or fetching the public lesson path where answer metadata may be exposed.
  {
    const h = makeClient();
    const originalFetch = global.fetch;
    let fetchCalls = 0;
    global.fetch = async () => { fetchCalls++; return { ok: true, async text() { return '<cosy-input-item answer="secret">'; } }; };
    try {
      await assert.rejects(
        loadLessonContent(h.client, 'lessons/a1/greetings.xml', 'student'),
        /Student-safe lesson content is unavailable/
      );
    } finally {
      global.fetch = originalFetch;
    }
    assert.deepEqual(h.calls.map(c => c.table), ['lesson_student_content']);
    assert.deepEqual(h.unexpected, []);
    assert.equal(fetchCalls, 0, 'student path must not fall back to public static files');
  }

  // RLS/network errors are also fail-closed for student roles.
  {
    const h = makeClient({ sanitizedError: new Error('permission denied') });
    await assert.rejects(
      loadLessonContent(h.client, 'en:a1:greetings', 'student'),
      /Student-safe lesson content is unavailable/
    );
    assert.deepEqual(h.calls.map(c => c.table), ['lesson_student_content']);
  }

  // Teacher/founder legacy fallback behavior is intentionally unchanged.
  {
    const h = makeClient();
    const body = await loadLessonContent(h.client, 'lessons/a1/greetings.xml', 'teacher');
    assert.match(body, /cosy-input-item/);
  }

  console.log('PASS: students only receive canonical sanitized lesson content; missing/error cases fail closed');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
