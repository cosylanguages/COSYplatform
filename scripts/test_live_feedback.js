#!/usr/bin/env node
'use strict';

// Focused regression tests for live classroom answer feedback.
// Run with: node scripts/test_live_feedback.js

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'classroom.html'), 'utf8');
const start = html.indexOf('function normalizeStr(str) {');
const end = html.indexOf('function checkAnswers() {', start);
assert.notEqual(start, -1, 'normalizeStr must exist in classroom.html');
assert.notEqual(end, -1, 'checkAnswerForField must precede checkAnswers');
const feedbackSource = html.slice(start, end);

function makeClassList(initial = []) {
  const values = new Set(initial);
  return {
    add(...items) { items.forEach(item => values.add(item)); },
    remove(...items) { items.forEach(item => values.delete(item)); },
    contains(item) { return values.has(item); },
    values
  };
}

function makeElement(id, value = '') {
  const el = {
    id,
    value,
    classList: makeClassList(['border-cosy-200']),
    children: [],
    attributes: {},
    appendChild(child) { this.children.push(child); },
    setAttribute(name, val) { this.attributes[name] = val; }
  };
  let text = '';
  Object.defineProperty(el, 'textContent', {
    get() { return text; },
    set(val) { text = String(val); this.children = []; }
  });
  return el;
}

function createHarness() {
  const input = makeElement('blank-1', 'hello');
  const feedback = makeElement('feedback-1');
  const saved = [];
  const context = {
    answersMap: { 'blank-1': 'hello' },
    explanationsMap: { 'blank-1': 'Use this greeting when meeting someone.' },
    currentRole: 'student',
    currentLessonPath: 'lessons/a1/greetings.json',
    window: { CosyProgress: { saveAnswer(...args) { saved.push(args); } } },
    document: {
      getElementById(id) {
        if (id === 'blank-1') return input;
        if (id === 'feedback-1') return feedback;
        return null;
      },
      querySelectorAll() { return []; },
      querySelector() { return null; },
      createElement() {
        return { className: '', textContent: '' };
      }
    }
  };
  vm.createContext(context);
  vm.runInContext(feedbackSource, context, { filename: 'classroom-live-feedback.js' });
  return { context, input, feedback, saved };
}

const h = createHarness();

// Correct answers receive positive feedback and are persisted as correct.
h.context.checkAnswerForField('blank-1', false);
assert.match(h.feedback.children[0].textContent, /Correct/);
assert.equal(h.input.classList.contains('border-green-500'), true);
assert.equal(h.saved.at(-1)[3], true);
assert.match(h.feedback.children[1].textContent, /Why: Use this greeting/);

// Incorrect answers get a retry prompt, never the answer key during live practice.
h.input.value = 'goodbye';
h.context.checkAnswerForField('blank-1', false);
assert.match(h.feedback.children[0].textContent, /try again/i);
assert.doesNotMatch(h.feedback.children[0].textContent, /hello/i);
assert.equal(h.input.classList.contains('border-red-500'), true);
assert.equal(h.saved.at(-1)[3], false);

// The explicit Check Answers action may reveal the expected answer.
h.context.checkAnswerForField('blank-1', true);
assert.match(h.feedback.children[0].textContent, /Answer: hello/);

// Clearing a field clears stale feedback and restores neutral styling.
h.input.value = '';
h.context.checkAnswerForField('blank-1', false);
assert.equal(h.feedback.textContent, '');
assert.equal(h.input.classList.contains('border-red-500'), false);
assert.equal(h.input.classList.contains('border-green-500'), false);
assert.equal(h.input.classList.contains('border-cosy-200'), true);

// Radio-group feedback must use the selected option, not the first radio in the group.
{
  const first = makeElement('question1', 'wrong');
  first.type = 'radio';
  first.name = 'question1';
  const selected = makeElement('question1-correct', 'hello');
  selected.type = 'radio';
  selected.name = 'question1';
  selected.checked = true;
  const feedback = makeElement('feedback-question1');
  const context = {
    answersMap: { question1: 'hello' },
    explanationsMap: {},
    currentRole: 'teacher',
    currentLessonPath: 'lesson',
    window: {},
    document: {
      getElementById(id) { return id === 'question1' ? first : id === 'feedback-question1' ? feedback : null; },
      querySelectorAll() { return [first, selected]; },
      querySelector() { return selected; },
      createElement() { return { className: '', textContent: '' }; }
    }
  };
  vm.createContext(context);
  vm.runInContext(feedbackSource, context, { filename: 'classroom-radio-feedback.js' });
  context.checkAnswerForField('question1', false);
  assert.match(feedback.children[0].textContent, /Correct/);
  assert.equal(first.classList.contains('border-red-500'), false);
}

// Saved answers restore after lesson rendering, and reconnect replays current answers.
assert.match(html, /restoreSavedAnswers\(currentLessonPath\)/);
assert.match(html, /CosyProgress\.loadAnswers\(lessonPath\)/);
assert.match(html, /if \(!isHost && c && c\.open\)/);
assert.match(html, /c\.send\(\{\s*type: isChoice \? 'choice' : 'blank'/);
assert.match(html, /lessonPath !== currentLessonPath/);
assert.match(html, /conn\.peer === roomId/);
assert.match(html, /checked: \(el\.type === 'radio' \|\| el\.type === 'checkbox'\)/);
assert.match(html, /el\.type === 'checkbox'/);
assert.match(html, /checkAnswerForField\(fieldKey, false, false\)/);
assert.match(html, /data-requires="clear-answers" onclick="resetClassAnswers\(\)"/);
assert.match(html, /type: 'reset-answers', lessonPath: currentLessonPath/);
assert.match(html, /case 'reset-answers'/);
assert.match(html, /clearStudentLessonAnswers\(data\.lessonPath\)/);
assert.match(html, /explanationsMap\[id\]/);

// Switching lessons must not leave the previous lesson's correct answers or
// explanations in the shared feedback maps.
assert.match(html, /function resetLessonAnswerMetadata\(\)/);
const metadataReset = html.match(/function resetLessonAnswerMetadata\(\) \{([\\s\\S]*?)\\n    \}/);
assert.ok(metadataReset, 'lesson metadata reset helper must be extractable');
assert.doesNotMatch(metadataReset[1], /answersMap\[['"]blank-[12]['"]\]\\s*=/,
  'dynamic lesson reset must not reintroduce legacy static answer keys');
assert.match(html, /function parseXmlLessonToSlides\(xmlText\) \{\s*resetLessonAnswerMetadata\(\);/);
assert.match(html, /function parseJsonLessonToSlides\(jsonData\) \{\s*resetLessonAnswerMetadata\(\);/);
assert.match(html, /Object\.keys\(explanationsMap\)\.forEach\(key => delete explanationsMap\[key\]\)/);

console.log('PASS: live feedback, answer-key hiding, cleared-state styling, saved-answer restore, reconnect replay, and lesson metadata isolation');
