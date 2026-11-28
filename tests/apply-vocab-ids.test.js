const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const script = path.join(root, 'scripts', 'apply-vocab-ids.py');
const hasPython = (() => {
  try {
    execFileSync('python3', ['--version'], { stdio: 'ignore' });
    return true;
  } catch (_) {
    return false;
  }
})();

const curriculum = {
  language: 'fr',
  course_type: 'general',
  level: 'B1',
  units: [
    {
      unit: 1,
      title: 'Titre',
      lessons: [
        {
          lesson: 1,
          type: 'gv',
          title: 'Leçon 1',
          duration_minutes: 60,
          grammar: ['Il faut que + subjonctif'],
          vocabulary: ['Exiger', 'Nuancer', 'Oser'],
          teacher_notes: 'code: "FR-B1-001"',
        },
        {
          lesson: 2,
          type: 'gv',
          title: 'Leçon 2',
          duration_minutes: 60,
          grammar: [],
          vocabulary: ['Truc'],
          teacher_notes: 'code: "FR-B1-002"',
        },
      ],
    },
  ],
};

const header = 'unit,lesson,code,item,status,matched_id,matched_word,matched_level,candidates,decision';
const rows = [
  '1,1,FR-B1-001,Exiger,exact,fr:exiger:verb,exiger,A2,,accept',
  '1,1,FR-B1-001,Nuancer,related,,, ,"fr:nuancer:verb (C2)",accept fr:nuancer:verb',
  '1,1,FR-B1-001,Oser,missing,,,,,author',
  '1,2,FR-B1-002,Truc,missing,,,,,replace',
  '1,2,FR-B1-002,Machin,missing,,,,,skip',
];

function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cosy-vocab-'));
  const courseFile = path.join(dir, 'B1.json');
  fs.writeFileSync(courseFile, JSON.stringify(curriculum, null, 2) + '\n');
  const csv = path.join(dir, 'review.csv');
  fs.writeFileSync(csv, [header, ...rows].join('\n') + '\n');
  return { dir, courseFile, csv };
}

function run(args) {
  return spawnSync('python3', [script, ...args], { encoding: 'utf8' });
}

test('the applier is a dry run until --write and is idempotent', { skip: !hasPython }, () => {
  const { dir, courseFile, csv } = setup();
  const before = fs.readFileSync(courseFile, 'utf8');

  const dry = run(['--course', courseFile, '--csv', csv]);
  assert.equal(dry.status, 1, dry.stderr);
  assert.match(dry.stdout, /applied 2, backlog 2, skipped 1, pending 0/);
  assert.equal(fs.readFileSync(courseFile, 'utf8'), before, 'dry run must not touch the file');

  const write = run(['--course', courseFile, '--csv', csv, '--write']);
  assert.equal(write.status, 0, write.stderr);
  const data = JSON.parse(fs.readFileSync(courseFile, 'utf8'));
  const [first, second] = data.units[0].lessons;
  assert.deepEqual(first.vocabularyIds, ['fr:exiger:verb', 'fr:nuancer:verb']);
  assert.equal(second.vocabularyIds, undefined, 'a lesson with no accepted row stays untouched');
  assert.deepEqual(first.vocabulary, ['Exiger', 'Nuancer', 'Oser'], 'vocabulary order preserved');
  assert.equal(first.teacher_notes, 'code: "FR-B1-001"');
  assert.equal(fs.readFileSync(courseFile, 'utf8').endsWith('}\n'), true);

  const again = run(['--course', courseFile, '--csv', csv]);
  assert.equal(again.status, 0, again.stderr);
  assert.match(again.stdout, /0 lesson\(s\) to change/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('vocabularyIds lands right after vocabulary', { skip: !hasPython }, () => {
  const { dir, courseFile, csv } = setup();
  run(['--course', courseFile, '--csv', csv, '--write']);
  const keys = Object.keys(JSON.parse(fs.readFileSync(courseFile, 'utf8')).units[0].lessons[0]);
  assert.equal(keys.indexOf('vocabularyIds'), keys.indexOf('vocabulary') + 1, keys.join(','));
  fs.rmSync(dir, { recursive: true, force: true });
});

test('the backlog lists author and replace rows', { skip: !hasPython }, () => {
  const { dir, courseFile, csv } = setup();
  const out = path.join(dir, 'backlog.json');
  run(['--course', courseFile, '--csv', csv, '--backlog-out', out]);
  const backlog = JSON.parse(fs.readFileSync(out, 'utf8'));
  assert.deepEqual(backlog.items.map((i) => [i.item, i.action]), [['Oser', 'author'], ['Truc', 'replace']]);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('unknown or malformed ids stop the run before writing', { skip: !hasPython }, () => {
  const { dir, courseFile, csv } = setup();
  fs.mkdirSync(path.join(dir, 'vocabulary', 'fr'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'vocabulary', 'fr', 'b1.json'),
    JSON.stringify([{ id: 'fr:exiger:verb', word: 'exiger' }]),
  );
  fs.writeFileSync(csv, [header, '1,1,FR-B1-001,Exiger,exact,fr:exiger:verb,exiger,A2,,accept',
    '1,1,FR-B1-001,Nuancer,related,,, ,,accept fr:notthere:verb'].join('\n') + '\n');
  const before = fs.readFileSync(courseFile, 'utf8');
  const result = run(['--course', courseFile, '--csv', csv, '--cosydata', dir, '--write']);
  assert.equal(result.status, 2, result.stdout);
  assert.match(result.stderr, /unknown id 'fr:notthere:verb'/);
  assert.equal(fs.readFileSync(courseFile, 'utf8'), before);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('unreviewed sheets are a no-op', { skip: !hasPython }, () => {
  const result = run(['--course', 'general-fr-b1']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /applied 0, backlog 0, skipped 0, pending 520/);
});
