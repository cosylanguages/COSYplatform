const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const script = path.join(__dirname, '..', 'scripts', 'audit-can-do.py');
const hasPython = spawnSync('python3', ['--version']).status === 0;

function classify(cando) {
  const run = spawnSync('python3', [script, '--explain', cando], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  return run.stdout.trim();
}

test('a can-do whose object is the form is form-first', { skip: !hasPython }, () => {
  assert.equal(classify('I can use articles accurately'), 'form-first');
  assert.equal(classify('Formare il congiuntivo presente dei verbi comuni.'), 'form-first');
  assert.equal(classify('I can choose between all present tenses.'), 'form-first');
  assert.equal(classify('Могу образовать сослагательное наклонение.'), 'form-first');
});

test('a communicative verb with a grammar tail stays a task', { skip: !hasPython }, () => {
  assert.equal(classify("Je peux parler d'alimentation avec les pronoms en et y"), 'task-with-grammar');
  assert.equal(classify("Je peux exprimer le but avec le subjonctif"), 'task-with-grammar');
  assert.equal(classify('I can use the language from Unit 1 in a longer speaking task about City'), 'task');
});

test('a can-do with no grammar term is a task', { skip: !hasPython }, () => {
  assert.equal(classify('Rispondere alle domande di un colloquio.'), 'task');
  assert.equal(classify('I can describe a problem to a doctor.'), 'task');
  assert.equal(classify(''), 'empty');
});
