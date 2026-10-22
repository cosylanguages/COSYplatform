#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { sanitizeStudentContent, extractProtectedContent, loadRoadmapFiles } = require('./ingest_roadmaps.js');


const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cosy-roadmap-source-'));
try {
  fs.mkdirSync(path.join(tempRoot, 'roadmaps'));
  fs.writeFileSync(path.join(tempRoot, 'roadmaps', 'science-en-b2.json'), JSON.stringify({
    title: 'Science English B2',
    totalLessons: 1,
    sequence: [{ id: 'sample-science', title: 'Sample', lessonFile: 'lessons/science-en/sample.json' }]
  }));
  const mergedRoadmaps = loadRoadmapFiles(tempRoot);
  const sourceRoadmap = mergedRoadmaps.find(item => item.filename === 'science-en-b2.json');
  assert.ok(sourceRoadmap, 'source-only roadmaps must be included in the migration inventory');
  assert.equal(JSON.parse(sourceRoadmap.content).sequence[0].id, 'sample-science');
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

const source = {
  id: 'sample',
  title: 'Safe lesson title',
  teacherNotes: [{ type: 'instruction', content: 'PRIVATE teacher plan' }],
  slides: [{
    id: 'slide-1',
    title: 'Practice',
    teacherNotes: [{ type: 'speech', content: 'PRIVATE script' }],
    elements: [
      { type: 'instruction', content: 'Complete the sentences.' },
      { type: 'input', placeholder: 'Answer one', answers: ['correct response'] },
      { type: 'test', content: 'Choose one', options: ['right', 'wrong'], answers: ['right'], explanation: 'PRIVATE answer rationale' }
    ]
  }]
};
const raw = JSON.stringify(source);
const studentBody = sanitizeStudentContent(raw);
const protectedRows = extractProtectedContent(raw);
const clean = JSON.parse(studentBody);

assert.equal(clean.title, 'Safe lesson title');
assert.equal('teacherNotes' in clean, false);
assert.equal('teacherNotes' in clean.slides[0], false);
assert.equal('answers' in clean.slides[0].elements[1], false);
assert.equal('answers' in clean.slides[0].elements[2], false);
assert.equal('explanation' in clean.slides[0].elements[2], false);
assert.doesNotMatch(studentBody, /PRIVATE|correct response/);
assert.deepEqual(JSON.parse(protectedRows.find(row => row.kind === 'answer-key').content), {
  s0_el_1: ['correct response'],
  s0_el_2: ['right']
});
assert.ok(protectedRows.some(row => row.kind === 'teacher-notes' && row.content.includes('PRIVATE script')));

assert.throws(
  () => extractProtectedContent(JSON.stringify({
    id: 'unsupported',
    metadata: { answers: ['must not silently disappear'] },
    slides: []
  })),
  /Unsupported sensitive fields/,
  'unmapped answer fields must block migration rather than be silently stripped'
);

assert.throws(
  () => extractProtectedContent(studentBody),
  /missing its private answer key/,
  'a sanitized public copy must not be mistaken for a complete answer-key migration source'
);

assert.throws(
  () => sanitizeStudentContent(JSON.stringify([{ answers: ['secret'] }])),
  /must be an object/,
  'JSON arrays must not bypass object-based sanitization'
);
assert.throws(
  () => sanitizeStudentContent('<lesson><answer>secret</answer></lesson>'),
  /structural XML migration/,
  'XML answer tags must be blocked until structural parsing is implemented'
);

assert.throws(
  () => sanitizeStudentContent('<cosy-test><cosy-test-item correct="true">secret</cosy-test-item></cosy-test>'),
  /structural XML migration/
);
assert.throws(
  () => extractProtectedContent('<cosy-input><cosy-input-item>secret</cosy-input-item></cosy-input>'),
  /structural XML migration/
);

console.log('PASS: JSON student bodies exclude answers, teacher notes, and explanations.');
console.log('PASS: protected answer keys use the classroom field IDs.');
console.log('PASS: XML containing answer metadata is blocked pending structural parsing.');
