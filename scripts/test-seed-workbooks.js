const test = require('node:test');
const assert = require('node:assert/strict');

const { buildRecordsFromWorkbook, stripSensitive } = require('./seed-workbooks');

function workbookFixture() {
  return {
    language: 'en',
    level: 'a1',
    topics: [
      {
        id: 'en-a1-greetings',
        lang: 'en',
        level: 'a1',
        title: 'Greetings',
        desc: 'Say hello',
        exercises: [
          {
            id: 'en-a1-greetings-1',
            q: 'How do you say hello?',
            type: 'mcq',
            opts: ['Hello', 'Goodbye'],
            ans: 'Hello',
            fb: '✅ Hello is correct.'
          }
        ],
        grammarBlocks: [{ title: 'Hello', html: '<p>Hello</p>' }]
      }
    ]
  };
}

test('splits a workbook topic into lesson, student, and protected records', () => {
  const records = buildRecordsFromWorkbook(workbookFixture(), 'fixture.json');

  assert.equal(records.lessons.length, 1);
  assert.equal(records.studentRows.length, 1);
  assert.equal(records.protectedRows.length, 1);

  assert.deepEqual(
    {
      id: records.lessons[0].id,
      language: records.lessons[0].language,
      cefr: records.lessons[0].cefr,
      kind: records.lessons[0].kind,
      slug: records.lessons[0].slug
    },
    {
      id: 'workbook/en-a1-greetings',
      language: 'en',
      cefr: 'a1',
      kind: 'workbook',
      slug: 'en-a1-greetings'
    }
  );

  assert.equal(records.studentRows[0].lesson_id, 'workbook/en-a1-greetings');
  assert.equal(records.protectedRows[0].lesson_id, 'workbook/en-a1-greetings');
  assert.equal(records.protectedRows[0].kind, 'answer-key');
});

test('removes answers and feedback from the student body', () => {
  const records = buildRecordsFromWorkbook(workbookFixture(), 'fixture.json');
  const body = JSON.parse(records.studentRows[0].body);
  const exercise = body.exercises[0];

  assert.equal(exercise.ans, undefined);
  assert.equal(exercise.fb, undefined);
  assert.deepEqual(exercise.opts, ['Hello', 'Goodbye']);
  assert.equal(exercise.q, 'How do you say hello?');
});

test('keeps answers and feedback in the protected answer key', () => {
  const records = buildRecordsFromWorkbook(workbookFixture(), 'fixture.json');
  const key = JSON.parse(records.protectedRows[0].content);

  assert.equal(key.topicId, 'en-a1-greetings');
  assert.equal(key.exercises[0].ans, 'Hello');
  assert.equal(key.exercises[0].fb, '✅ Hello is correct.');
});

test('strips nested sensitive keys recursively', () => {
  const result = stripSensitive({
    title: 'Topic',
    answer: 'secret',
    nested: [{ fb: 'secret feedback', keep: true }]
  });

  assert.deepEqual(result, { title: 'Topic', nested: [{ keep: true }] });
});

test('rejects a workbook without language or level', () => {
  assert.throws(
    () => buildRecordsFromWorkbook({ topics: [] }, 'bad.json'),
    /language and level are required/
  );
});

test('rejects duplicate topic ids inside one workbook', () => {
  const data = workbookFixture();
  data.topics.push({ ...data.topics[0] });

  assert.throws(
    () => buildRecordsFromWorkbook(data, 'duplicate.json'),
    /Duplicate workbook topic id/
  );
});
