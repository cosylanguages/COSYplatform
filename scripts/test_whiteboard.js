// Tests for the live whiteboard rules (shared/js/whiteboard-core.js). Run: node scripts/test_whiteboard.js
const assert = require('assert');
const WB = require('../shared/js/whiteboard-core.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }
const host = { id: 'host', host: true };
const stu = { id: 'peer-a', host: false };
const stu2 = { id: 'peer-b', host: false };
const stroke = (id, pts) => ({ id, type: 'stroke', c: '#ef4444', w: 6, pts: pts || [[10, 10], [50, 60]] });

t('host and students can add; the host stamps the owner', () => {
  const b = WB.createBoard();
  const r = WB.applyOp(b, { op: 'add', obj: { ...stroke('s1'), owner: 'someone-else' } }, stu);
  assert.ok(r.ok); assert.strictEqual(b.objects[0].owner, 'peer-a'); assert.strictEqual(r.op.obj.owner, 'peer-a');
  assert.ok(WB.applyOp(b, { op: 'add', obj: stroke('s2') }, host).ok);
  assert.strictEqual(b.objects.length, 2);
});

t('a student can remove only their own objects; the host can remove any', () => {
  const b = WB.createBoard();
  WB.applyOp(b, { op: 'add', obj: stroke('s1') }, stu);
  assert.strictEqual(WB.applyOp(b, { op: 'remove', id: 's1' }, stu2).reason, 'not-yours');
  assert.ok(WB.applyOp(b, { op: 'remove', id: 's1' }, stu).ok);
  WB.applyOp(b, { op: 'add', obj: stroke('s2') }, stu);
  assert.ok(WB.applyOp(b, { op: 'remove', id: 's2' }, host).ok);
  assert.strictEqual(WB.applyOp(b, { op: 'remove', id: 'nope' }, host).reason, 'missing');
});

t('clear and lock are host-only', () => {
  const b = WB.createBoard();
  WB.applyOp(b, { op: 'add', obj: stroke('s1') }, stu);
  assert.strictEqual(WB.applyOp(b, { op: 'clear' }, stu).reason, 'host-only');
  assert.strictEqual(WB.applyOp(b, { op: 'lock', locked: true }, stu).reason, 'host-only');
  assert.strictEqual(b.objects.length, 1); assert.strictEqual(b.locked, false);
  assert.ok(WB.applyOp(b, { op: 'clear' }, host).ok); assert.strictEqual(b.objects.length, 0);
});

t('a locked board refuses student adds and removes but not the host', () => {
  const b = WB.createBoard();
  WB.applyOp(b, { op: 'add', obj: stroke('s1') }, stu);
  WB.applyOp(b, { op: 'lock', locked: true }, host);
  assert.strictEqual(WB.applyOp(b, { op: 'add', obj: stroke('s2') }, stu).reason, 'locked');
  assert.strictEqual(WB.applyOp(b, { op: 'remove', id: 's1' }, stu).reason, 'locked');
  assert.ok(WB.applyOp(b, { op: 'add', obj: stroke('s3') }, host).ok);
  WB.applyOp(b, { op: 'lock', locked: false }, host);
  assert.ok(WB.applyOp(b, { op: 'add', obj: stroke('s4') }, stu).ok);
});

t('malformed ops and objects are rejected', () => {
  const b = WB.createBoard();
  const bad = [
    null, 'x', {}, { op: 'explode' }, { op: 'add' }, { op: 'add', obj: null },
    { op: 'add', obj: { id: 'a b', type: 'stroke', pts: [[1, 1]] } },
    { op: 'add', obj: { id: 'x', type: 'script', pts: [[1, 1]] } },
    { op: 'add', obj: { id: 'x', type: 'stroke', pts: [] } },
    { op: 'add', obj: { id: 'x', type: 'stroke', pts: [[1, 'a']] } },
    { op: 'add', obj: { id: 'x', type: 'stroke', pts: [[NaN, 1]] } },
    { op: 'add', obj: { id: 'x', type: 'stroke', pts: [[1, 2, 3]] } },
    { op: 'add', obj: { id: 'x', type: 'stroke', pts: Array.from({ length: 401 }, () => [1, 1]) } },
    { op: 'add', obj: { id: 'x', type: 'text', x: 1, y: 1, text: '   ' } },
    { op: 'add', obj: { id: 'x', type: 'text', x: 1, y: 1, text: 5 } },
    { op: 'add', obj: { id: 'x', type: 'line', x1: 1, y1: 1, x2: 'z', y2: 1 } },
    { op: 'remove', id: '<b>' }
  ];
  bad.forEach((op, i) => assert.strictEqual(WB.applyOp(b, op, stu).ok, false, 'case ' + i));
  assert.strictEqual(WB.applyOp(b, { op: 'add', obj: stroke('x') }, null).ok, false);
  assert.strictEqual(b.objects.length, 0);
});

t('values are clamped and unknown colours, widths and extra fields are dropped', () => {
  const o = WB.sanitizeObject({ id: 'a', type: 'rect', c: 'red; background:url(x)', w: 99, x: -50, y: 5000, bw: 99999, bh: 40, evil: '<img onerror=x>', owner: 'x' });
  assert.strictEqual(o.c, WB.COLORS[0]); assert.strictEqual(o.w, 6);
  assert.strictEqual(o.x, 0); assert.strictEqual(o.y, 900); assert.strictEqual(o.bw, 1600); assert.strictEqual(o.bh, 0);
  assert.strictEqual(o.evil, undefined); assert.strictEqual(o.owner, undefined);
  const s = WB.sanitizeObject({ id: 'b', type: 'sticky', c: '#000', x: 1, y: 1, text: 'hi\u0000\u0007 there' });
  assert.strictEqual(s.c, WB.STICKY_COLORS[0]); assert.strictEqual(s.text, 'hi there');
  const long = WB.sanitizeObject({ id: 'c', type: 'text', x: 1, y: 1, text: 'a'.repeat(500) });
  assert.strictEqual(long.text.length, 200);
});

t('text is kept as data: markup stays as characters', () => {
  const o = WB.sanitizeObject({ id: 'a', type: 'text', x: 1, y: 1, text: '<img src=x onerror=alert(1)>' });
  assert.strictEqual(o.text, '<img src=x onerror=alert(1)>');
});

t('duplicate ids, a full board and a greedy owner are refused', () => {
  const b = WB.createBoard();
  assert.ok(WB.applyOp(b, { op: 'add', obj: stroke('d') }, stu).ok);
  assert.strictEqual(WB.applyOp(b, { op: 'add', obj: stroke('d') }, stu2).reason, 'duplicate');
  for (let i = 0; i < 199; i++) assert.ok(WB.applyOp(b, { op: 'add', obj: stroke('a' + i) }, stu).ok);
  assert.strictEqual(WB.applyOp(b, { op: 'add', obj: stroke('over') }, stu).reason, 'too-many');
  for (let i = 0; i < 200; i++) assert.ok(WB.applyOp(b, { op: 'add', obj: stroke('h' + i) }, host).ok);
  for (let i = 0; i < 100; i++) assert.ok(WB.applyOp(b, { op: 'add', obj: stroke('p' + i) }, stu2).ok);
  assert.strictEqual(WB.applyOp(b, { op: 'add', obj: stroke('full') }, stu2).reason, 'board-full');
  assert.strictEqual(b.objects.length, 500);
});

t('a late joiner rebuilds the same board from a sync, dropping bad entries', () => {
  const b = WB.createBoard();
  WB.applyOp(b, { op: 'add', obj: stroke('s1') }, stu);
  WB.applyOp(b, { op: 'add', obj: { id: 't1', type: 'text', x: 5, y: 5, s: 3, c: '#3b82f6', text: 'Hola' } }, host);
  WB.applyOp(b, { op: 'lock', locked: true }, host);
  const msg = JSON.parse(JSON.stringify(WB.syncMessage(b)));
  msg.objects.push({ id: 'bad id', type: 'stroke', pts: [[1, 1]] }, 'junk', null);
  const copy = WB.loadSync(msg);
  assert.strictEqual(copy.locked, true); assert.strictEqual(copy.objects.length, 2);
  assert.strictEqual(copy.objects[0].owner, 'peer-a'); assert.deepStrictEqual(copy.objects[1], b.objects[1]);
  assert.strictEqual(WB.loadSync(null).objects.length, 0);
  assert.strictEqual(WB.loadSync({ objects: 'x' }).objects.length, 0);
});

t('the rate limiter allows a burst up to the limit, then resets each second', () => {
  const st = {};
  let allowed = 0;
  for (let i = 0; i < 50; i++) if (WB.allowRate(st, 5000 + i)) allowed++;
  assert.strictEqual(allowed, WB.LIMITS.opsPerSecond);
  assert.ok(WB.allowRate(st, 6000));
});

t('eraser hit-testing finds each kind of object and prefers the topmost', () => {
  const b = WB.createBoard();
  const add = (o) => assert.ok(WB.applyOp(b, { op: 'add', obj: o }, host).ok);
  add({ id: 'l', type: 'line', c: '#111827', w: 6, x1: 100, y1: 100, x2: 300, y2: 100 });
  add({ id: 'r', type: 'rect', c: '#111827', w: 6, x: 500, y: 500, bw: 200, bh: 100 });
  add({ id: 'e', type: 'ellipse', c: '#111827', w: 6, x: 800, y: 300, bw: 200, bh: 100 });
  add({ id: 't', type: 'text', c: '#111827', s: 2, x: 1000, y: 700, text: 'Hello' });
  add({ id: 'n', type: 'sticky', c: '#fde68a', x: 100, y: 400, text: 'note' });
  add({ id: 's', type: 'stroke', c: '#111827', w: 6, pts: [[100, 700], [200, 750], [300, 700]] });
  assert.strictEqual(WB.objectAt(b, 200, 102).id, 'l');
  assert.strictEqual(WB.objectAt(b, 200, 140), null);
  assert.strictEqual(WB.objectAt(b, 500, 550).id, 'r');
  assert.strictEqual(WB.objectAt(b, 600, 550), null, 'inside an unfilled rectangle is empty');
  assert.strictEqual(WB.objectAt(b, 900, 300).id, 'e');
  assert.strictEqual(WB.objectAt(b, 900, 350), null, 'inside an unfilled ellipse is empty');
  assert.strictEqual(WB.objectAt(b, 1010, 710).id, 't');
  assert.strictEqual(WB.objectAt(b, 200, 480).id, 'n');
  assert.strictEqual(WB.objectAt(b, 150, 725).id, 's');
  assert.strictEqual(WB.objectAt(b, 1500, 100), null);
  add({ id: 'top', type: 'sticky', c: '#bbf7d0', x: 90, y: 390, text: 'on top' });
  assert.strictEqual(WB.objectAt(b, 200, 480).id, 'top');
});

t('undo finds the actor\'s newest object', () => {
  const b = WB.createBoard();
  WB.applyOp(b, { op: 'add', obj: stroke('a') }, stu);
  WB.applyOp(b, { op: 'add', obj: stroke('b') }, stu2);
  WB.applyOp(b, { op: 'add', obj: stroke('c') }, stu);
  assert.strictEqual(WB.lastOwnedBy(b, 'peer-a'), 'c');
  assert.strictEqual(WB.lastOwnedBy(b, 'peer-b'), 'b');
  assert.strictEqual(WB.lastOwnedBy(b, 'nobody'), null);
});

t('simplify keeps endpoints and caps the length; ids are valid', () => {
  const pts = Array.from({ length: 2000 }, (_, i) => [i % 1600, i % 900]);
  const s = WB.simplify(pts, 400);
  assert.strictEqual(s.length, 400); assert.deepStrictEqual(s[0], pts[0]); assert.deepStrictEqual(s[399], pts[1999]);
  assert.strictEqual(WB.simplify([[1, 1], [2, 2]], 400).length, 2);
  for (let i = 0; i < 50; i++) assert.ok(/^[A-Za-z0-9_-]{1,40}$/.test(WB.newId()));
});

t('students apply accepted ops, keeping the host-stamped owner and ignoring junk', () => {
  const b = WB.createBoard();
  assert.ok(WB.applyAccepted(b, { op: 'add', obj: { ...stroke('s1'), owner: 'peer-a' } }));
  assert.strictEqual(b.objects[0].owner, 'peer-a');
  assert.strictEqual(WB.applyAccepted(b, { op: 'add', obj: { ...stroke('s1'), owner: 'peer-a' } }), false);
  assert.strictEqual(WB.applyAccepted(b, { op: 'add', obj: { id: 'x', type: 'nope' } }), false);
  assert.strictEqual(WB.applyAccepted(b, null), false);
  assert.ok(WB.applyAccepted(b, { op: 'lock', locked: true })); assert.strictEqual(b.locked, true);
  assert.ok(WB.applyAccepted(b, { op: 'remove', id: 's1' })); assert.strictEqual(b.objects.length, 0);
  WB.applyAccepted(b, { op: 'add', obj: { ...stroke('s2'), owner: 'h' } });
  assert.ok(WB.applyAccepted(b, { op: 'clear' })); assert.strictEqual(b.objects.length, 0);
});

console.log(`\n${n} whiteboard tests passed`);
