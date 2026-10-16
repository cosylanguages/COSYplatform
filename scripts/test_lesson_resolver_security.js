#!/usr/bin/env node
'use strict';

// Security regression tests for student lesson-content resolution.
// Run with: node scripts/test_lesson_resolver_security.js

const assert = require('node:assert/strict');
const { loadLessonContent } = require('../shared/js/lesson-resolver.js');

function makeClient({ sanitizedBody, sanitizedError = null, canonicalLessonId = null, canonicalSlug = null, unexpected = [] } = {}) {
  const calls = [];
  const client = {
    from(table) {
      calls.push({ table });
      if (!['lesson_student_content', 'lessons'].includes(table)) unexpected.push(table);
      const chain = {
        select(column) { calls[calls.length - 1].column = column; return chain; },
        eq(column, value) { calls[calls.length - 1].filter = [column, value]; return chain; },
        async maybeSingle() {
          const call = calls[calls.length - 1];
          if (call.table === 'lesson_student_content') {
            const requestedId = call.filter && call.filter[1];
            if (sanitizedBody == null || (canonicalLessonId && requestedId !== canonicalLessonId)) {
              return { data: null, error: sanitizedError };
            }
            return { data: { body: sanitizedBody }, error: sanitizedError };
          }
          if (call.table === 'lessons' && canonicalLessonId) {
            const [field, value] = call.filter || [];
            if ((field === 'id' && value === canonicalLessonId) || (field === 'slug' && value === canonicalSlug)) {
              return { data: { id: canonicalLessonId }, error: null };
            }
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

  // Roadmap file paths resolve by a unique canonical slug, then load only
  // the sanitized body keyed by canonical lesson ID.
  {
    const h = makeClient({
      sanitizedBody: '<cosy-lesson><p>Mapped safe lesson</p></cosy-lesson>',
      canonicalLessonId: 'en:a1:greetings',
      canonicalSlug: 'greetings'
    });
    const body = await loadLessonContent(h.client, 'lessons/general-english-a1/greetings.json', 'student');
    assert.match(body, /Mapped safe lesson/);
    assert.deepEqual(h.unexpected, []);
    assert.ok(h.calls.some(c => c.table === 'lessons' && c.filter?.[0] === 'slug' && c.filter?.[1] === 'greetings'));
    assert.ok(h.calls.some(c => c.table === 'lesson_student_content' && c.filter?.[1] === 'en:a1:greetings'));
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
    assert.deepEqual(h.calls.map(c => c.table), ['lesson_student_content', 'lessons', 'lessons']);
    assert.deepEqual(h.unexpected, []);
    assert.equal(fetchCalls, 0, 'student path must not fall back to public static files');
  }

  // Missing Supabase initialization must not trigger a static-file fallback.
  {
    const originalFetch = global.fetch;
    let fetchCalls = 0;
    global.fetch = async () => { fetchCalls++; return { ok: true, async text() { return '<cosy-input-item answer="secret">'; } }; };
    try {
      await assert.rejects(
        loadLessonContent(null, 'lessons/a1/greetings.xml', 'student'),
        /Student-safe lesson content is unavailable/
      );
    } finally {
      global.fetch = originalFetch;
    }
    assert.equal(fetchCalls, 0, 'student path must not fetch static content without Supabase');
  }

  // RLS/network errors are also fail-closed for student roles.
  {
    const h = makeClient({ sanitizedError: new Error('permission denied') });
    await assert.rejects(
      loadLessonContent(h.client, 'en:a1:greetings', 'student'),
      /Student-safe lesson content is unavailable/
    );
    assert.deepEqual(h.calls.map(c => c.table), ['lesson_student_content', 'lessons', 'lessons']);
  }

  // Teacher/founder legacy fallback behavior is intentionally unchanged.
  {
    const h = makeClient();
    const originalFetch = global.fetch;
    global.fetch = async () => ({ ok: true, async text() { return '<cosy-input-item answer="teacher-preview">'; } });
    try {
      const body = await loadLessonContent(h.client, 'lessons/a1/greetings.xml', 'teacher');
      assert.match(body, /cosy-input-item/);
    } finally {
      global.fetch = originalFetch;
    }
  }

  console.log('PASS: students only receive canonical sanitized lesson content; missing/error cases fail closed');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
