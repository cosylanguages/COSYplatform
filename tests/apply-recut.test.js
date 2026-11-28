const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const script = path.join(root, 'scripts', 'apply-recut.py');
const hasPython = (() => {
  try {
    execFileSync('python3', ['--version'], { stdio: 'ignore' });
    return true;
  } catch (_) {
    return false;
  }
})();

const curriculum = {
  language: 'fx',
  course_type: 'general',
  level: 'B1',
  units: [
    {
      unit: 1,
      title: 'Old one',
      theme: 't22',
      macroFunction: 'old macro',
      lessons: [{ lesson: 1, title: 'L1' }, { lesson: 2, title: 'L2' }],
    },
    { unit: 2, title: 'Old two', theme: 't17', macroFunction: 'keep', lessons: [{ lesson: 1 }] },
  ],
};
const roadmap = {
  curriculumId: 'general-fx-b1',
  sequence: [
    { lessonNumber: 1, id: 'a', unit: 'Old one', lessonFile: 'lessons/fx/a.json' },
    { lessonNumber: 2, id: 'b', unit: 'Old one', lessonFile: 'lessons/fx/b.json' },
    { lessonNumber: 3, id: 'c', unit: 'Old two', lessonFile: 'lessons/fx/c.json' },
  ],
};
const spec = {
  course: 'general-fx-b1',
  units: { 1: { title: 'New one', theme: 't21', macroFunction: 'new macro', secondaryThemes: ['t02'] } },
};

function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cosy-recut-'));
  fs.mkdirSync(path.join(dir, 'curriculums', 'fx', 'general'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'roadmaps'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'lessons', 'fx'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'curriculums', 'fx', 'general', 'B1.json'), JSON.stringify(curriculum, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'roadmaps', 'general-fx-b1.json'), JSON.stringify(roadmap, null, 2) + '\n');
  for (const [name, unit] of [['a', 'Old one'], ['b', 'Old one'], ['c', 'Old two']]) {
    fs.writeFileSync(path.join(dir, 'lessons', 'fx', `${name}.json`), JSON.stringify({ id: name, unit }, null, 2) + '\n');
  }
  fs.writeFileSync(path.join(dir, 'spec.json'), JSON.stringify(spec, null, 2) + '\n');
  return dir;
}

function run(dir, extra = []) {
  return spawnSync('python3', [script, '--course', 'general-fx-b1', '--root', dir,
    '--curricula', path.join(dir, 'curriculums'), '--spec', path.join(dir, 'spec.json'), ...extra],
  { encoding: 'utf8' });
}

test('a re-cut updates curriculum, roadmap and decks together, and only once', { skip: !hasPython }, () => {
  const dir = setup();
  const read = (p) => fs.readFileSync(path.join(dir, p), 'utf8');

  const dry = run(dir);
  assert.equal(dry.status, 1, dry.stderr);
  assert.match(dry.stdout, /1 unit\(s\), 2 roadmap entr\(ies\), 2 deck\(s\) to update/);
  assert.match(read('curriculums/fx/general/B1.json'), /Old one/, 'dry run must not write');

  const write = run(dir, ['--write']);
  assert.equal(write.status, 0, write.stderr);

  const course = JSON.parse(read('curriculums/fx/general/B1.json'));
  assert.deepEqual(Object.keys(course.units[0]),
    ['unit', 'title', 'theme', 'secondaryThemes', 'macroFunction', 'lessons']);
  assert.deepEqual(course.units[0].secondaryThemes, ['t02']);
  assert.equal(course.units[0].title, 'New one');
  assert.equal(course.units[0].theme, 't21');
  assert.equal(course.units[0].macroFunction, 'new macro');
  assert.equal(course.units[1].title, 'Old two', 'undeclared units stay as they are');

  const trip = JSON.parse(read('roadmaps/general-fx-b1.json'));
  assert.deepEqual(trip.sequence.map((s) => s.unit), ['New one', 'New one', 'Old two']);

  assert.equal(JSON.parse(read('lessons/fx/a.json')).unit, 'New one');
  assert.equal(JSON.parse(read('lessons/fx/c.json')).unit, 'Old two');
  assert.deepEqual(Object.keys(JSON.parse(read('lessons/fx/a.json'))), ['id', 'unit']);

  for (const file of ['curriculums/fx/general/B1.json', 'roadmaps/general-fx-b1.json', 'lessons/fx/a.json']) {
    assert.equal(read(file).endsWith('}\n'), true, `${file} keeps a trailing newline`);
  }

  const again = run(dir);
  assert.equal(again.status, 0, again.stdout);
  assert.match(again.stdout, /0 unit\(s\), 0 roadmap entr\(ies\), 0 deck\(s\) to update/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('secondaryThemes is replaced in place without moving other keys', { skip: !hasPython }, () => {
  const dir = setup();
  const file = path.join(dir, 'curriculums', 'fx', 'general', 'B1.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.units[1].secondaryThemes = ['t06'];
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'spec.json'),
    JSON.stringify({ units: { 2: { theme: 't06', secondaryThemes: ['t17'] } } }) + '\n');
  run(dir, ['--write']);
  const unit = JSON.parse(fs.readFileSync(file, 'utf8')).units[1];
  assert.deepEqual(unit.secondaryThemes, ['t17']);
  assert.deepEqual(Object.keys(unit),
    ['unit', 'title', 'theme', 'macroFunction', 'lessons', 'secondaryThemes']);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('the shipped French B1 spec is already applied and stays inert', { skip: !hasPython }, () => {
  const result = spawnSync('python3', [script, '--course', 'general-fr-b1'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout);
  assert.match(result.stdout, /0 unit\(s\), 0 roadmap entr\(ies\), 0 deck\(s\) to update/);
});

test('every recut spec agrees with the declared unit metadata', () => {
  const dir = path.join(root, 'scripts', 'data');
  const metadata = JSON.parse(fs.readFileSync(path.join(dir, 'unit-metadata.json'), 'utf8'));
  const specs = fs.readdirSync(dir).filter((f) => f.startsWith('recut-') && f.endsWith('.json'));
  assert.ok(specs.length > 0);
  for (const file of specs) {
    const spec = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const course = spec.course || file.replace(/^recut-|\.json$/g, '');
    for (const [number, unit] of Object.entries(spec.units)) {
      const declared = metadata[course] && metadata[course].units[number];
      assert.ok(declared, `${course} unit ${number} missing from unit-metadata`);
      for (const key of ['theme', 'macroFunction']) {
        if (key in unit) assert.equal(declared[key], unit[key], `${course} unit ${number} ${key}`);
      }
      if ('secondaryThemes' in unit) {
        assert.deepEqual(declared.secondaryThemes || [], unit.secondaryThemes);
      }
    }
  }
});
