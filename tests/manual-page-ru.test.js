const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const builderDir = path.join(__dirname, '..', 'scripts', 'lesson-build');
const hasPython = spawnSync('python3', ['--version']).status === 0;

// The frame used by the Russian A1 shelf: guided-discovery lines in a <ul>, the formula in a
// <p class="gv-formula">, examples in a titled <section class="examples">, notes in box mint,
// mispairings in wrong-line / right-line, and reference tables that put the example first.
const PAGE = `
<main id="ru-a1-demo">
  <div class="page-head"><h1>Настоящее время</h1><p class="subtitle">Два спряжения</p></div>
  <div class="outcome-banner">🎯 <strong>Коммуникативная цель:</strong> Говорю о том, что делаю сейчас.</div>
  <section class="gv gv-open">
    <ul class="gv-lines"><li>Я <span class="key-verb">читаю</span>.</li><li>Ты <span class="key-verb">читаешь</span>.</li></ul>
    <p class="gv-formula"><span class="gv-rule">я читаю · ты читаешь</span></p>
  </section>
  <section class="examples"><span class="label">Примеры в контексте</span>
    <ul><li>Я читаю книгу.</li><li>Ты читаешь письмо.</li></ul>
  </section>
  <div class="box mint"><h3>👀 Что вы замечаете?</h3><p>Окончание меняется по лицам.</p></div>
  <div class="box mint"><h3>🗣️ Замечание о произношении</h3><p>Ударение на «а».</p></div>
  <div class="mistakes"><div class="m-title">Частые ошибки</div>
    <div class="mflip">
      <div class="wrong-line"><span class="x">❌</span><span class="wrong-text">Я читать.</span></div>
      <div class="right-line"><span class="v">✅</span><span class="right-text">Я читаю.</span></div>
    </div>
  </div>
  <div class="quiz-panel"><div class="qitem"><div class="qtext">Какое окончание у «ты»?</div>
    <button class="qopt">-ешь</button><button class="qopt">-ишь</button></div></div>
</main>`;

function py(code) {
  const script = `
import json, sys
sys.path.insert(0, ${JSON.stringify(builderDir)})
import manual_page, build_decks as b
page = ${JSON.stringify(PAGE)}
parsed = manual_page.parse(page)
${code}
`;
  const out = spawnSync('python3', ['-c', script], { encoding: 'utf8' });
  assert.equal(out.status, 0, out.stderr);
  return JSON.parse(out.stdout);
}

test('the Russian frame yields examples, rule, outcome, observe and pronunciation', { skip: !hasPython }, () => {
  const parsed = py(`print(json.dumps({k: parsed[k] for k in
      ('title', 'outcome', 'rule', 'observe', 'pron', 'examples', 'traps', 'practice')}))`);
  assert.equal(parsed.title, 'Настоящее время');
  assert.equal(parsed.outcome, 'Говорю о том, что делаю сейчас.');
  assert.equal(parsed.rule, 'я читаю · ты читаешь');
  assert.equal(parsed.observe, 'Окончание меняется по лицам.');
  assert.equal(parsed.pron, 'Ударение на «а».');
  assert.deepEqual(parsed.examples.map(e => e.text), ['Я читаю книгу.', 'Ты читаешь письмо.']);
  assert.deepEqual(parsed.traps, [{ wrong: 'Я читать.', right: 'Я читаю.' }]);
  assert.equal(parsed.practice.length, 1);
});

test('a two-column reference table still produces rows', { skip: !hasPython }, () => {
  const table = `<table><tr><th>Пример</th><th>Замечание</th></tr>
    <tr><td>Я студент.</td><td>между словами пусто</td></tr></table>`;
  const parsed = py(`print(json.dumps(manual_page.parse(${JSON.stringify(table)})['table']))`);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].element, 'Я студент.');
  assert.equal(parsed[0].note, 'между словами пусто');
});

test('Cyrillic titles produce a readable file id', { skip: !hasPython }, () => {
  const slugs = py(`print(json.dumps([b.slug('Привет и Добро пожаловать'), b.slug('Повелительное наклонение')]))`);
  assert.deepEqual(slugs, ['privet-i-dobro-pozhalovat', 'povelitelnoe-naklonenie']);
});

test('a field written in the wrong language is caught', { skip: !hasPython }, () => {
  const flags = py(`print(json.dumps([b.in_language('ticket, price, time', 'ru'),
                                       b.in_language('билет и цена', 'ru'),
                                       b.in_language('read a book', 'el')]))`);
  assert.deepEqual(flags, [false, true, false]);
});
