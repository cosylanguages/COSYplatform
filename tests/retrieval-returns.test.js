const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const builderDir = path.join(__dirname, '..', 'scripts', 'lesson-build');
const hasPython = spawnSync('python3', ['--version']).status === 0;

function run(code) {
  const script = `
import json, sys
sys.path.insert(0, ${JSON.stringify(builderDir)})
import build_decks as b
${code}
`;
  const out = spawnSync('python3', ['-c', script], { encoding: 'utf8' });
  assert.equal(out.status, 0, out.stderr);
  return JSON.parse(out.stdout);
}

test('parse_returns reads a curriculum retrieval set', { skip: !hasPython }, () => {
  const notes = 'code: "IT-B1-002"\nreturns: [{"block": "pending:it:intanto", "q": "Che cosa facevi?"}]';
  const parsed = run(`print(json.dumps(b.parse_returns(${JSON.stringify(notes)})))`);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].block, 'pending:it:intanto');
  assert.equal(parsed[0].q, 'Che cosa facevi?');
});

test('parse_returns is empty when the note has no retrieval set', { skip: !hasPython }, () => {
  assert.deepEqual(run('print(json.dumps(b.parse_returns("code: \\"IT-B1-001\\"")))'), []);
});

test('parse_returns ignores a malformed payload instead of crashing', { skip: !hasPython }, () => {
  const notes = 'returns: [{"block": "x", "q": }]';
  assert.deepEqual(run(`print(json.dumps(b.parse_returns(${JSON.stringify(notes)})))`), []);
});

test('a retrieval set becomes numbered questions carrying their block ids', { skip: !hasPython }, () => {
  const code = `
t = b.SCAFFOLD['it']
returns = [{"block": "pending:it:intanto", "q": "Che cosa facevi?"},
           {"block": "cosydata:it:gia:adverb", "q": "Hai gia mangiato?"}]
print(json.dumps(b.recycling_elements(t, returns, ['a', 'b'], 'Ripasso')))
`;
  const elements = run(code);
  assert.equal(elements.length, 4);
  assert.equal(elements[0].type, 'instruction');
  assert.equal(elements[1].type, 'blockquote');
  assert.equal(elements[1].content, '1. Che cosa facevi?\n2. Hai gia mangiato?');
  assert.deepEqual(elements[1].usesChunk, ['pending:it:intanto', 'cosydata:it:gia:adverb']);
  assert.equal(elements[3].type, 'input');
});

test('without a retrieval set stage 2 falls back to the vocabulary recall', { skip: !hasPython }, () => {
  const code = `
t = b.SCAFFOLD['it']
print(json.dumps(b.recycling_elements(t, [], ['ciao', 'grazie'], 'Ripasso di A2')))
`;
  const elements = run(code);
  assert.equal(elements.length, 4);
  assert.equal(elements[1].content, 'Lessico da riattivare: ciao, grazie');
  assert.ok(!('usesChunk' in elements[1]));
});

test('every scaffolded language has the retrieval strings', { skip: !hasPython }, () => {
  const code = `
print(json.dumps({lang: all(k in t for k in ('retrieval_head', 'retrieval_task', 'retrieval_answer'))
                  for lang, t in b.SCAFFOLD.items()}))
`;
  const covered = run(code);
  for (const [lang, ok] of Object.entries(covered)) {
    assert.equal(ok, true, `${lang} is missing retrieval scaffolding`);
  }
});
