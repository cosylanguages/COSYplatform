const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const script = path.join(root, 'scripts', 'apply-unit-metadata.py');
const themeIds = JSON.parse(fs.readFileSync(path.join(root, 'cefr', 'data', 'themes.json'), 'utf8'))
  .filter((t) => t && t.id)
  .map((t) => t.id);
const python = spawnSync('python3', ['--version']).status === 0;
const hasPython = python && themeIds.length > 0;

/** A course with one unit whose theme is already set, and metadata declaring a different one. */
function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cosy-meta-'));
  const courseFile = path.join(dir, 'curriculums', 'fr', 'general', 'B2.json');
  fs.mkdirSync(path.dirname(courseFile), { recursive: true });
  const course = {
    language: 'fr',
    level: 'B2',
    units: [
      { unit: 1, title: 'Avant', theme: themeIds[0], macroFunction: 'garder', lessons: [] },
      { unit: 2, title: 'Sans thème', lessons: [] },
    ],
  };
  fs.writeFileSync(courseFile, JSON.stringify(course, null, 2) + '\n');
  const mapFile = path.join(dir, 'unit-metadata.json');
  fs.writeFileSync(mapFile, JSON.stringify({
    'general-fr-b2': {
      units: {
        1: { theme: themeIds[1], secondaryThemes: [themeIds[2]], macroFunction: 'changer' },
        2: { theme: themeIds[0], macroFunction: 'ajouter' },
      },
    },
  }, null, 2) + '\n');
  return { dir, courseFile, mapFile };
}

function run(fixtureArgs, extra = []) {
  return spawnSync('python3', [
    script, '--map', fixtureArgs.mapFile, '--curricula', path.join(fixtureArgs.dir, 'curriculums'),
    ...extra,
  ], { encoding: 'utf8' });
}

test('an existing theme is replaced, not preserved', { skip: !hasPython }, () => {
  const fx = fixture();
  const before = JSON.parse(fs.readFileSync(fx.courseFile, 'utf8')).units[0].theme;

  const dry = run(fx, []);
  assert.equal(dry.status, 1, dry.stdout + dry.stderr);
  assert.equal(JSON.parse(fs.readFileSync(fx.courseFile, 'utf8')).units[0].theme, before);

  const write = run(fx, ['--write', '--quiet']);
  assert.equal(write.status, 0, write.stdout + write.stderr);
  const after = JSON.parse(fs.readFileSync(fx.courseFile, 'utf8')).units;

  assert.equal(after[0].theme, themeIds[1]);
  assert.deepEqual(after[0].secondaryThemes, [themeIds[2]]);
  assert.equal(after[0].macroFunction, 'changer');
  assert.equal(after[1].theme, themeIds[0]);
  assert.equal(after[1].macroFunction, 'ajouter');
  assert.deepEqual(Object.keys(after[0]), ['unit', 'title', 'theme', 'secondaryThemes', 'macroFunction', 'lessons']);

  const again = run(fx, ['--quiet']);
  assert.equal(again.status, 0, 'a second pass must be a no-op');
});
