// Tests for turning the server's teacher view of a Studio lesson into a classroom lesson body.
// Run: node scripts/test_studio_teacher_view.js
const assert = require('assert');
const { mergeStudioTeacherView, loadLessonContent } = require('../shared/js/lesson-resolver.js');

let n = 0;
function t(name, fn) { return Promise.resolve().then(fn).then(() => { n++; console.log('ok -', name); }); }

const view = () => ({
  body: { schemaVersion: 1, title: 'T', slides: [
    { id: 'slide-1', title: 'Part 1', elements: [{ type: 'studio-heading', content: 'Ordering' }] },
    { id: 'slide-2', title: 'Part 2', elements: [{ type: 'studio-prompt', content: '___ coffee' }, { type: 'studio-input', fieldKey: 'f1' }] },
    { id: 'slide-3', title: 'Part 3', elements: [{ type: 'quiz', fieldKey: 'q1', question: 'Pick', options: ['a', 'b'] }] }
  ] },
  answerKey: [{ blockId: 'f1', acceptedAnswers: ["I'd like", 'I would like'] }, { blockId: 'q1', acceptedAnswers: ['b'] }],
  notes: [{ slide: 0, texts: ['Warm up'] }, { slide: 1, texts: ['Elicit', 'Second'] }, { slide: 2, texts: ['Closing'] }]
});

(async () => {
  await t('answers and notes are attached to the right slides and questions', () => {
    const out = JSON.parse(mergeStudioTeacherView(view()));
    assert.deepStrictEqual(out.slides[1].elements[1].teacherKey, ["I'd like", 'I would like']);
    assert.deepStrictEqual(out.slides[2].elements[0].teacherKey, ['b']);
    assert.strictEqual(out.slides[0].elements[0].teacherKey, undefined);
    assert.deepStrictEqual(out.slides[1].teacherNotes.map((x) => x.content), ['Elicit', 'Second']);
    assert.strictEqual(out.slides[0].teacherNotes[0].title, 'Teacher note');
    assert.strictEqual(out.slides[2].teacherNotes[0].content, 'Closing');
  });

  await t('bad or missing parts are ignored, and a missing body is an error', () => {
    const v = view();
    v.answerKey = [null, { blockId: 5 }, { blockId: 'f1', acceptedAnswers: 'x' }, { blockId: 'q1', acceptedAnswers: ['b', 7] }];
    v.notes = [null, { slide: 99, texts: ['x'] }, { slide: 'a', texts: ['x'] }, { slide: 0, texts: 'x' }, { slide: 1, texts: ['', 5, 'ok'] }];
    const out = JSON.parse(mergeStudioTeacherView(v));
    assert.strictEqual(out.slides[1].elements[1].teacherKey, undefined);
    assert.deepStrictEqual(out.slides[2].elements[0].teacherKey, ['b']);
    assert.strictEqual(out.slides[0].teacherNotes, undefined);
    assert.deepStrictEqual(out.slides[1].teacherNotes.map((x) => x.content), ['ok']);
    assert.throws(() => mergeStudioTeacherView(null), /unavailable/);
    assert.throws(() => mergeStudioTeacherView({ body: {} }), /unavailable/);
    assert.throws(() => mergeStudioTeacherView({ body: { slides: 'x' } }), /unavailable/);
  });

  await t('the input is not modified', () => {
    const v = view(); const copy = JSON.stringify(v);
    mergeStudioTeacherView(v);
    assert.strictEqual(JSON.stringify(v), copy);
  });

  await t('teachers load Studio lessons through the server function; students read the student body', async () => {
    const calls = [];
    const client = {
      rpc: async (name, args) => { calls.push(['rpc', name, args.p_lesson_id]); return { data: view(), error: null }; },
      from: (table) => ({ select: () => ({ eq: () => ({ maybeSingle: async () => { calls.push(['from', table]); return { data: { body: '{"slides":[]}' }, error: null }; } }) }) })
    };
    const teacher = JSON.parse(await loadLessonContent(client, 'studio:abc', 'teacher'));
    assert.ok(teacher.slides[1].teacherNotes);
    assert.deepStrictEqual(calls[0], ['rpc', 'get_studio_lesson_teacher_view', 'studio:abc']);
    const founder = JSON.parse(await loadLessonContent(client, 'studio:abc', 'founder'));
    assert.ok(founder.slides[2].elements[0].teacherKey);
    calls.length = 0;
    const student = await loadLessonContent(client, 'studio:abc', 'student');
    assert.strictEqual(student, '{"slides":[]}');
    assert.deepStrictEqual(calls, [['from', 'lesson_student_content']], 'a student never calls the teacher function');
  });

  await t('a refused teacher view is an error, not a silent fallback', async () => {
    const client = { rpc: async () => ({ data: null, error: { message: 'no access' } }), from: () => { throw new Error('must not fall back'); } };
    await assert.rejects(() => loadLessonContent(client, 'studio:abc', 'teacher'), /unavailable/);
  });

  console.log(`\n${n} teacher view tests passed`);
})().catch((e) => { console.error(e); process.exit(1); });
