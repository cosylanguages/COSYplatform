/**
 * COSY live whiteboard: board model and message rules (no DOM).
 *
 * The teacher's browser is the host and the single source of truth. Students send
 * "ops" to the host; the host checks them with applyOp(), keeps the state, and sends
 * the accepted op to everyone. Everything a student sends is untrusted, so objects
 * are rebuilt field by field (sanitizeObject) rather than copied.
 *
 * Coordinates live on a fixed 1600 x 900 board so every screen shows the same picture.
 *
 * Objects (all have id, owner, type):
 *   stroke  { c, w, pts:[[x,y],...] }          freehand, up to 400 points
 *   line    { c, w, x1, y1, x2, y2 }
 *   rect    { c, w, x, y, bw, bh }
 *   ellipse { c, w, x, y, bw, bh }
 *   text    { c, s, x, y, text }               up to 200 characters, s = 1|2|3
 *   sticky  { c, x, y, text }                  up to 200 characters, fixed size note
 *
 * Ops: {op:'add', obj} {op:'remove', id} {op:'clear'} {op:'lock', locked}
 * Rules: students can add (when the board is not locked) and remove only their own
 * objects; only the host can clear or lock. Limits keep a board from growing without bound.
 */
(function (root, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') module.exports = factory();
  else root.CosyWhiteboard = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var W = 1600, H = 900;
  var LIMITS = { objects: 500, perOwner: 200, points: 400, text: 200, widths: [3, 6, 12], sizes: [1, 2, 3], opsPerSecond: 30 };
  var COLORS = ['#111827', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
  var STICKY_COLORS = ['#fde68a', '#bbf7d0', '#bfdbfe', '#fbcfe8'];
  var STICKY_W = 240, STICKY_H = 160;
  var TEXT_PX = { 1: 28, 2: 44, 3: 72 };
  var TYPES = ['stroke', 'line', 'rect', 'ellipse', 'text', 'sticky'];

  function num(v, lo, hi) {
    if (typeof v !== 'number' || !isFinite(v)) return null;
    return Math.round(Math.min(hi, Math.max(lo, v)) * 10) / 10;
  }
  function pick(v, list, dflt) { return list.indexOf(v) !== -1 ? v : dflt; }
  function str(v, max) {
    if (typeof v !== 'string') return '';
    // keep printable text; drop control characters
    return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
  }
  function validId(id) { return typeof id === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(id); }

  /** Rebuild an object from untrusted input. Returns null when it is not a usable object. */
  function sanitizeObject(raw) {
    if (!raw || typeof raw !== 'object' || !validId(raw.id) || TYPES.indexOf(raw.type) === -1) return null;
    var o = { id: raw.id, type: raw.type };
    if (raw.type === 'sticky') o.c = pick(raw.c, STICKY_COLORS, STICKY_COLORS[0]);
    else o.c = pick(raw.c, COLORS, COLORS[0]);
    if (raw.type === 'stroke') {
      o.w = pick(raw.w, LIMITS.widths, LIMITS.widths[1]);
      if (!Array.isArray(raw.pts) || raw.pts.length < 1 || raw.pts.length > LIMITS.points) return null;
      o.pts = [];
      for (var i = 0; i < raw.pts.length; i++) {
        var p = raw.pts[i];
        if (!Array.isArray(p) || p.length !== 2) return null;
        var x = num(p[0], 0, W), y = num(p[1], 0, H);
        if (x === null || y === null) return null;
        o.pts.push([x, y]);
      }
    } else if (raw.type === 'line') {
      o.w = pick(raw.w, LIMITS.widths, LIMITS.widths[1]);
      o.x1 = num(raw.x1, 0, W); o.y1 = num(raw.y1, 0, H); o.x2 = num(raw.x2, 0, W); o.y2 = num(raw.y2, 0, H);
      if (o.x1 === null || o.y1 === null || o.x2 === null || o.y2 === null) return null;
    } else if (raw.type === 'rect' || raw.type === 'ellipse') {
      o.w = pick(raw.w, LIMITS.widths, LIMITS.widths[1]);
      var rx = num(raw.x, 0, W), ry = num(raw.y, 0, H), bw = num(raw.bw, 0, W), bh = num(raw.bh, 0, H);
      if (rx === null || ry === null || bw === null || bh === null) return null;
      o.x = rx; o.y = ry; o.bw = Math.min(bw, W - rx); o.bh = Math.min(bh, H - ry);
    } else if (raw.type === 'text' || raw.type === 'sticky') {
      o.text = str(raw.text, LIMITS.text);
      if (!o.text) return null;
      o.x = num(raw.x, 0, W); o.y = num(raw.y, 0, H);
      if (o.x === null || o.y === null) return null;
      if (raw.type === 'text') o.s = pick(raw.s, LIMITS.sizes, 2);
    }
    return o;
  }

  function createBoard() { return { objects: [], locked: false }; }

  function countOwner(board, owner) {
    var n = 0;
    for (var i = 0; i < board.objects.length; i++) if (board.objects[i].owner === owner) n++;
    return n;
  }

  /**
   * Check an op from `actor` ({id, host}) and, if allowed, apply it to `board`.
   * Returns {ok:true, op} with the sanitized op to broadcast, or {ok:false, reason}.
   * The host's own ops go through here too, so the host and students share one rule set.
   */
  function applyOp(board, rawOp, actor) {
    if (!rawOp || typeof rawOp !== 'object' || !actor || typeof actor.id !== 'string') return { ok: false, reason: 'bad-op' };
    var isHost = actor.host === true;
    if (rawOp.op === 'add') {
      if (!isHost && board.locked) return { ok: false, reason: 'locked' };
      var obj = sanitizeObject(rawOp.obj);
      if (!obj) return { ok: false, reason: 'bad-object' };
      obj.owner = actor.id.slice(0, 60);
      for (var i = 0; i < board.objects.length; i++) if (board.objects[i].id === obj.id) return { ok: false, reason: 'duplicate' };
      if (board.objects.length >= LIMITS.objects) return { ok: false, reason: 'board-full' };
      if (countOwner(board, obj.owner) >= LIMITS.perOwner) return { ok: false, reason: 'too-many' };
      board.objects.push(obj);
      return { ok: true, op: { op: 'add', obj: obj } };
    }
    if (rawOp.op === 'remove') {
      if (!validId(rawOp.id)) return { ok: false, reason: 'bad-op' };
      var idx = -1;
      for (var j = 0; j < board.objects.length; j++) if (board.objects[j].id === rawOp.id) idx = j;
      if (idx === -1) return { ok: false, reason: 'missing' };
      if (!isHost) {
        if (board.locked) return { ok: false, reason: 'locked' };
        if (board.objects[idx].owner !== actor.id) return { ok: false, reason: 'not-yours' };
      }
      board.objects.splice(idx, 1);
      return { ok: true, op: { op: 'remove', id: rawOp.id } };
    }
    if (rawOp.op === 'clear') {
      if (!isHost) return { ok: false, reason: 'host-only' };
      board.objects = [];
      return { ok: true, op: { op: 'clear' } };
    }
    if (rawOp.op === 'lock') {
      if (!isHost) return { ok: false, reason: 'host-only' };
      board.locked = rawOp.locked === true;
      return { ok: true, op: { op: 'lock', locked: board.locked } };
    }
    return { ok: false, reason: 'bad-op' };
  }

  /**
   * Apply an op the host already accepted (students run this on what the host sends).
   * Objects are still rebuilt field by field, and the owner the host stamped is kept.
   */
  function applyAccepted(board, rawOp) {
    if (!rawOp || typeof rawOp !== 'object') return false;
    if (rawOp.op === 'add') {
      var obj = sanitizeObject(rawOp.obj);
      if (!obj || board.objects.length >= LIMITS.objects) return false;
      obj.owner = str(rawOp.obj.owner, 60);
      for (var i = 0; i < board.objects.length; i++) if (board.objects[i].id === obj.id) return false;
      board.objects.push(obj);
      return true;
    }
    if (rawOp.op === 'remove') {
      for (var j = 0; j < board.objects.length; j++) {
        if (board.objects[j].id === rawOp.id) { board.objects.splice(j, 1); return true; }
      }
      return false;
    }
    if (rawOp.op === 'clear') { board.objects = []; return true; }
    if (rawOp.op === 'lock') { board.locked = rawOp.locked === true; return true; }
    return false;
  }

  /** Rebuild a whole board from a host sync message. Anything unusable is dropped. */
  function loadSync(raw) {
    var b = createBoard();
    if (!raw || typeof raw !== 'object') return b;
    b.locked = raw.locked === true;
    if (Array.isArray(raw.objects)) {
      for (var i = 0; i < raw.objects.length && b.objects.length < LIMITS.objects; i++) {
        var o = sanitizeObject(raw.objects[i]);
        if (o) { o.owner = str(raw.objects[i].owner, 60); b.objects.push(o); }
      }
    }
    return b;
  }

  function syncMessage(board) { return { type: 'board-sync', locked: board.locked, objects: board.objects }; }

  /** Allow `opsPerSecond` ops per connection per second. state is a plain object kept per connection. */
  function allowRate(state, now) {
    var t = Math.floor(now / 1000);
    if (state.t !== t) { state.t = t; state.n = 0; }
    state.n++;
    return state.n <= LIMITS.opsPerSecond;
  }

  // ---- geometry -------------------------------------------------------------

  function distToSegment(px, py, x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1, len2 = dx * dx + dy * dy;
    var t = len2 ? Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2)) : 0;
    var cx = x1 + t * dx, cy = y1 + t * dy;
    return Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy));
  }

  function textBox(o) {
    var px = TEXT_PX[o.s] || TEXT_PX[2];
    var lines = o.text.split('\n').length;
    // rough width: a character is about 0.6 of the font size
    var longest = Math.max.apply(null, o.text.split('\n').map(function (l) { return Array.from(l).length; }));
    return { x: o.x, y: o.y, w: Math.max(px, longest * px * 0.6), h: lines * px * 1.2 };
  }

  /** True when the point (x, y) touches the object, within `tol` board units. */
  function hitTest(o, x, y, tol) {
    tol = tol || 12;
    var r = tol + (o.w || 0) / 2;
    if (o.type === 'stroke') {
      if (o.pts.length === 1) return Math.abs(o.pts[0][0] - x) <= r && Math.abs(o.pts[0][1] - y) <= r;
      for (var i = 1; i < o.pts.length; i++) {
        if (distToSegment(x, y, o.pts[i - 1][0], o.pts[i - 1][1], o.pts[i][0], o.pts[i][1]) <= r) return true;
      }
      return false;
    }
    if (o.type === 'line') return distToSegment(x, y, o.x1, o.y1, o.x2, o.y2) <= r;
    if (o.type === 'rect') {
      var inside = x >= o.x - r && x <= o.x + o.bw + r && y >= o.y - r && y <= o.y + o.bh + r;
      var deep = x > o.x + r && x < o.x + o.bw - r && y > o.y + r && y < o.y + o.bh - r;
      return inside && !deep;
    }
    if (o.type === 'ellipse') {
      var rx = o.bw / 2, ry = o.bh / 2, cx = o.x + rx, cy = o.y + ry;
      if (rx < 1 || ry < 1) return Math.abs(x - cx) <= r && Math.abs(y - cy) <= r;
      var v = Math.pow((x - cx) / rx, 2) + Math.pow((y - cy) / ry, 2);
      var edge = r / Math.min(rx, ry);
      return v <= Math.pow(1 + edge, 2) && v >= Math.pow(Math.max(0, 1 - edge), 2);
    }
    if (o.type === 'text') {
      var b = textBox(o);
      return x >= b.x - tol && x <= b.x + b.w + tol && y >= b.y - tol && y <= b.y + b.h + tol;
    }
    if (o.type === 'sticky') return x >= o.x && x <= o.x + STICKY_W && y >= o.y && y <= o.y + STICKY_H;
    return false;
  }

  /** The topmost object under the point, or null. */
  function objectAt(board, x, y, tol) {
    for (var i = board.objects.length - 1; i >= 0; i--) if (hitTest(board.objects[i], x, y, tol)) return board.objects[i];
    return null;
  }

  /** Id of the actor's newest object (used by Undo), or null. */
  function lastOwnedBy(board, owner) {
    for (var i = board.objects.length - 1; i >= 0; i--) if (board.objects[i].owner === owner) return board.objects[i].id;
    return null;
  }

  function newId() {
    var s = '';
    for (var i = 0; i < 12; i++) s += 'abcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 36));
    return 'o' + s;
  }

  /** Thin a freehand path to at most `max` points, always keeping the first and last. */
  function simplify(pts, max) {
    if (pts.length <= max) return pts.slice();
    var out = [], step = (pts.length - 1) / (max - 1);
    for (var i = 0; i < max; i++) out.push(pts[Math.round(i * step)]);
    return out;
  }

  return {
    W: W, H: H, LIMITS: LIMITS, COLORS: COLORS, STICKY_COLORS: STICKY_COLORS, STICKY_W: STICKY_W, STICKY_H: STICKY_H, TEXT_PX: TEXT_PX,
    sanitizeObject: sanitizeObject, createBoard: createBoard, applyOp: applyOp, applyAccepted: applyAccepted, loadSync: loadSync, syncMessage: syncMessage,
    allowRate: allowRate, hitTest: hitTest, objectAt: objectAt, lastOwnedBy: lastOwnedBy, newId: newId, simplify: simplify, textBox: textBox
  };
});
