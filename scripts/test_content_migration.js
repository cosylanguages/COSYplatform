#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const { sanitizeStudentContent, extractProtectedContent } = require('./ingest_roadmaps.js');

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
