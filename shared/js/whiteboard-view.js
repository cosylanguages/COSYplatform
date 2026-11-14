/**
 * COSY live whiteboard: the board you see and draw on (toolbar + canvas).
 * Rules and data live in whiteboard-core.js. This file only draws and sends ops.
 *
 *   const board = CosyWhiteboardView.mount(container, {
 *     isHost: () => boolean,            // the teacher's browser is the host
 *     selfId: () => string,             // this browser's id as the host knows it ('host' for the host)
 *     toHost: (msg) => void,            // student -> host
 *     broadcast: (msg) => void,         // host -> every student
 *     notify: (text) => void            // optional: short status for the user
 *   });
 *   board.receiveFromStudent(msg, peerId)   host: a student's {type:'board-op'} packet
 *   board.receiveFromHost(msg)              student: 'board-op' or 'board-sync' from the host
 *   board.syncMessage()                     host: full state to send to a newly connected student
 *   board.refresh()                         call when the board becomes visible or the layout changes
 */
(function (root, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') module.exports = factory(require('./whiteboard-core.js'));
  else root.CosyWhiteboardView = factory(root.CosyWhiteboard);
})(typeof self !== 'undefined' ? self : this, function (WB) {
  'use strict';

  var TOOLS = [
    ['pen', 'Pen'], ['eraser', 'Eraser'], ['line', 'Line'], ['rect', 'Rectangle'],
    ['ellipse', 'Ellipse'], ['text', 'Text'], ['sticky', 'Note']
  ];
  var COLOR_NAMES = { '#111827': 'Black', '#ef4444': 'Red', '#3b82f6': 'Blue', '#10b981': 'Green', '#f59e0b': 'Orange', '#8b5cf6': 'Purple' };
  var WIDTH_NAMES = { 3: 'Thin', 6: 'Medium', 12: 'Thick' };
  var STYLE_ID = 'cosy-wb-styles';

  function ensureStyles(doc) {
    if (doc.getElementById(STYLE_ID)) return;
    var st = doc.createElement('style');
    st.id = STYLE_ID;
    st.textContent =
      '.cwb{display:flex;flex-direction:column;gap:8px;width:100%;height:100%;min-height:320px}' +
      '.cwb-bar{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center}' +
      '.cwb-group{display:flex;gap:4px;align-items:center;flex-wrap:wrap}' +
      '.cwb-btn{font:inherit;font-size:.8rem;font-weight:600;min-height:36px;padding:4px 10px;border:1px solid #94a3b8;border-radius:8px;background:#fff;color:#0f172a;cursor:pointer}' +
      '.cwb-btn[aria-pressed="true"]{background:#1e3a8a;border-color:#1e3a8a;color:#fff}' +
      '.cwb-btn:disabled{opacity:.45;cursor:not-allowed}' +
      '.cwb-btn:focus-visible,.cwb-note input:focus-visible{outline:3px solid #1d4ed8;outline-offset:2px}' +
      '.cwb-swatch{width:30px;height:30px;min-height:30px;padding:0;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #64748b}' +
      '.cwb-swatch[aria-pressed="true"]{box-shadow:0 0 0 3px #1e3a8a}' +
      '.cwb-stage{position:relative;flex:1;min-height:240px;border:1px solid #cbd5e1;border-radius:10px;background:#e2e8f0;overflow:hidden}' +
      '.cwb-canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair}' +
      '.cwb-canvas[data-tool="eraser"]{cursor:cell}.cwb-canvas.cwb-ro{cursor:not-allowed}' +
      '.cwb-edit{position:absolute;z-index:2;font:inherit;border:2px solid #1d4ed8;border-radius:6px;padding:4px;background:#fff;color:#0f172a;resize:none;min-width:140px}' +
      '.cwb-note{display:flex;gap:6px;align-items:center;flex-wrap:wrap}' +
      '.cwb-note input{flex:1;min-width:160px;font:inherit;font-size:.85rem;padding:6px 8px;border:1px solid #94a3b8;border-radius:8px}' +
      '.cwb-status{font-size:.78rem;color:#334155;min-height:1.1em}';
    (doc.head || doc.documentElement).appendChild(st);
  }

  function mount(container, transport) {
    var doc = container.ownerDocument;
    ensureStyles(doc);
    var board = WB.createBoard();
    var tool = 'pen', color = WB.COLORS[0], width = 6, size = 2, stickyColor = WB.STICKY_COLORS[0];
    var draft = null;          // shape being dragged right now (not yet sent)
    var drawing = false;
    var requested = {};        // ids already asked to be erased (waiting for the host's echo)
    var rate = {};             // per-student rate limit state, keyed by peer id
    var editor = null;
    var noteCount = 0;

    function el(tag, cls, text) { var n = doc.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; }
    function isHost() { return !!transport.isHost(); }
    function me() { return { id: isHost() ? 'host' : String(transport.selfId() || 'student'), host: isHost() }; }
    function say(text) { status.textContent = text; if (transport.notify && text) transport.notify(text); }
    function canEdit() { return isHost() || !board.locked; }

    // ---- layout ----------------------------------------------------------------
    container.textContent = '';
    var wrap = el('div', 'cwb');
    var bar = el('div', 'cwb-bar');
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', 'Whiteboard tools');
    var toolBtns = {}, colorBtns = {}, widthBtns = {};

    var gTools = el('div', 'cwb-group');
    TOOLS.forEach(function (t) {
      var b = el('button', 'cwb-btn', t[1]);
      b.type = 'button';
      b.addEventListener('click', function () { setTool(t[0]); });
      toolBtns[t[0]] = b; gTools.appendChild(b);
    });
    var gColor = el('div', 'cwb-group');
    gColor.setAttribute('role', 'group'); gColor.setAttribute('aria-label', 'Colour');
    WB.COLORS.forEach(function (c) {
      var b = el('button', 'cwb-btn cwb-swatch');
      b.type = 'button'; b.style.background = c; b.setAttribute('aria-label', COLOR_NAMES[c] || c);
      b.addEventListener('click', function () { color = c; refreshBar(); });
      colorBtns[c] = b; gColor.appendChild(b);
    });
    var gWidth = el('div', 'cwb-group');
    gWidth.setAttribute('role', 'group'); gWidth.setAttribute('aria-label', 'Line thickness');
    WB.LIMITS.widths.forEach(function (w) {
      var b = el('button', 'cwb-btn', WIDTH_NAMES[w]);
      b.type = 'button';
      b.addEventListener('click', function () { width = w; size = w === 3 ? 1 : w === 6 ? 2 : 3; refreshBar(); });
      widthBtns[w] = b; gWidth.appendChild(b);
    });
    var gActions = el('div', 'cwb-group');
    var undoBtn = el('button', 'cwb-btn', 'Undo'); undoBtn.type = 'button';
    undoBtn.addEventListener('click', undo);
    var saveBtn = el('button', 'cwb-btn', 'Save PNG'); saveBtn.type = 'button';
    saveBtn.addEventListener('click', savePng);
    var clearBtn = el('button', 'cwb-btn', 'Clear board'); clearBtn.type = 'button';
    clearBtn.addEventListener('click', function () {
      if (!isHost()) return;
      if (board.objects.length && !(doc.defaultView && doc.defaultView.confirm && !doc.defaultView.confirm('Clear the whole board for everyone?'))) submit({ op: 'clear' });
    });
    var lockBtn = el('button', 'cwb-btn', 'Lock for students'); lockBtn.type = 'button';
    lockBtn.addEventListener('click', function () { if (isHost()) submit({ op: 'lock', locked: !board.locked }); });
    gActions.append(undoBtn, saveBtn, clearBtn, lockBtn);
    bar.append(gTools, gColor, gWidth, gActions);

    var stage = el('div', 'cwb-stage');
    var canvas = el('canvas', 'cwb-canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Shared whiteboard. Drawing needs a pointer or touch. Use the note box below to add text without drawing.');
    stage.appendChild(canvas);

    var noteForm = el('form', 'cwb-note');
    var noteLabel = el('label', '', 'Add a note: ');
    var noteInput = el('input'); noteInput.type = 'text'; noteInput.maxLength = WB.LIMITS.text; noteInput.placeholder = 'Type text, then press Add';
    noteLabel.appendChild(noteInput);
    var addText = el('button', 'cwb-btn', 'Add as text'); addText.type = 'submit';
    var addSticky = el('button', 'cwb-btn', 'Add as note'); addSticky.type = 'button';
    noteForm.append(noteLabel, addText, addSticky);
    var status = el('div', 'cwb-status'); status.setAttribute('role', 'status');
    wrap.append(bar, stage, noteForm, status);
    container.appendChild(wrap);

    var ctx = canvas.getContext('2d');
    var scale = 1, offX = 0, offY = 0, dpr = 1;

    // ---- state changes -----------------------------------------------------------
    function setTool(t) { tool = t; closeEditor(); refreshBar(); }

    function refreshBar() {
      var ro = !canEdit();
      TOOLS.forEach(function (t) { toolBtns[t[0]].setAttribute('aria-pressed', String(tool === t[0])); toolBtns[t[0]].disabled = ro; });
      WB.COLORS.forEach(function (c) { colorBtns[c].setAttribute('aria-pressed', String(color === c)); colorBtns[c].disabled = ro; });
      WB.LIMITS.widths.forEach(function (w) { widthBtns[w].setAttribute('aria-pressed', String(width === w)); widthBtns[w].disabled = ro; });
      undoBtn.disabled = ro || !WB.lastOwnedBy(board, me().id);
      clearBtn.hidden = !isHost(); lockBtn.hidden = !isHost();
      lockBtn.setAttribute('aria-pressed', String(board.locked));
      lockBtn.textContent = board.locked ? 'Unlock for students' : 'Lock for students';
      addText.disabled = ro; addSticky.disabled = ro; noteInput.disabled = ro;
      canvas.classList.toggle('cwb-ro', ro);
      canvas.setAttribute('data-tool', tool);
      if (ro && !isHost()) status.textContent = 'The teacher has locked the board. You can look but not draw.';
      else if (status.textContent.indexOf('locked') !== -1) status.textContent = '';
    }

    /** Send an op: the host checks and broadcasts it, a student asks the host. */
    function submit(op) {
      if (isHost()) {
        var r = WB.applyOp(board, op, me());
        if (!r.ok) { say(reasonText(r.reason)); return false; }
        transport.broadcast({ type: 'board-op', op: r.op });
        render(); refreshBar();
        return true;
      }
      if (!canEdit()) { say(reasonText('locked')); return false; }
      transport.toHost({ type: 'board-op', op: op });
      return true;
    }

    function reasonText(r) {
      return { locked: 'The board is locked.', 'board-full': 'The board is full. Ask your teacher to clear it.', 'too-many': 'You have added the maximum number of items.', 'not-yours': 'You can only erase your own drawings.', 'bad-object': 'That item could not be added.' }[r] || 'That change was not allowed.';
    }

    function addObject(o) { o.id = WB.newId(); return submit({ op: 'add', obj: o }); }

    function undo() {
      var id = WB.lastOwnedBy(board, me().id);
      if (id) submit({ op: 'remove', id: id });
    }

    // ---- receiving ---------------------------------------------------------------
    function receiveFromStudent(msg, peerId) {
      if (!isHost() || !msg || msg.type !== 'board-op') return;
      var key = String(peerId || 'unknown');
      rate[key] = rate[key] || {};
      if (!WB.allowRate(rate[key], Date.now())) return;
      var r = WB.applyOp(board, msg.op, { id: key, host: false });
      if (!r.ok) return;
      transport.broadcast({ type: 'board-op', op: r.op });
      render(); refreshBar();
    }

    function receiveFromHost(msg) {
      if (isHost() || !msg) return;
      if (msg.type === 'board-sync') board = WB.loadSync(msg);
      else if (msg.type === 'board-op') WB.applyAccepted(board, msg.op);
      else return;
      requested = {};
      render(); refreshBar();
    }

    function syncMessage() { return WB.syncMessage(board); }

    // ---- drawing -----------------------------------------------------------------
    function toBoard(e) {
      var rect = canvas.getBoundingClientRect();
      var x = (e.clientX - rect.left - offX) / scale, y = (e.clientY - rect.top - offY) / scale;
      return [Math.min(WB.W, Math.max(0, x)), Math.min(WB.H, Math.max(0, y))];
    }

    function eraseAt(p) {
      var mine = me().id;
      var pool = { objects: isHost() ? board.objects : board.objects.filter(function (o) { return o.owner === mine; }) };
      var hit = WB.objectAt(pool, p[0], p[1], 14);
      if (hit && !requested[hit.id]) {
        requested[hit.id] = true;
        if (isHost()) delete requested[hit.id];
        submit({ op: 'remove', id: hit.id });
      }
    }

    canvas.addEventListener('pointerdown', function (e) {
      if (!canEdit() || e.button > 0) return;
      var p = toBoard(e);
      if (tool === 'text' || tool === 'sticky') { e.preventDefault(); openEditor(p, e); return; }
      closeEditor();
      drawing = true;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }
      if (tool === 'eraser') { eraseAt(p); return; }
      if (tool === 'pen') draft = { type: 'stroke', c: color, w: width, pts: [p] };
      else draft = { type: tool, c: color, w: width, x0: p[0], y0: p[1], x1: p[0], y1: p[1] };
      render();
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!drawing) return;
      var p = toBoard(e);
      if (tool === 'eraser') { eraseAt(p); return; }
      if (!draft) return;
      if (draft.type === 'stroke') {
        var last = draft.pts[draft.pts.length - 1];
        if (Math.abs(last[0] - p[0]) + Math.abs(last[1] - p[1]) >= 3) draft.pts.push(p);
      } else { draft.x1 = p[0]; draft.y1 = p[1]; }
      render();
    });
    function finish() {
      if (!drawing) return;
      drawing = false;
      var d = draft; draft = null;
      if (d) {
        if (d.type === 'stroke') {
          addObject({ type: 'stroke', c: d.c, w: d.w, pts: WB.simplify(d.pts, WB.LIMITS.points) });
        } else if (Math.abs(d.x1 - d.x0) + Math.abs(d.y1 - d.y0) >= 6) {
          if (d.type === 'line') addObject({ type: 'line', c: d.c, w: d.w, x1: d.x0, y1: d.y0, x2: d.x1, y2: d.y1 });
          else addObject({ type: d.type, c: d.c, w: d.w, x: Math.min(d.x0, d.x1), y: Math.min(d.y0, d.y1), bw: Math.abs(d.x1 - d.x0), bh: Math.abs(d.y1 - d.y0) });
        }
      }
      render();
    }
    canvas.addEventListener('pointerup', finish);
    canvas.addEventListener('pointercancel', function () { drawing = false; draft = null; render(); });

    // ---- text and notes ------------------------------------------------------------
    function closeEditor() { if (editor) { var e = editor; editor = null; e.remove(); } }
    function openEditor(p, ev) {
      closeEditor();
      var ta = el('textarea', 'cwb-edit');
      ta.maxLength = WB.LIMITS.text; ta.rows = tool === 'sticky' ? 4 : 2;
      ta.setAttribute('aria-label', tool === 'sticky' ? 'Note text. Enter adds it, Escape cancels.' : 'Text. Enter adds it, Escape cancels.');
      var rect = canvas.getBoundingClientRect();
      ta.style.left = Math.max(0, Math.min(rect.width - 160, ev.clientX - rect.left)) + 'px';
      ta.style.top = Math.max(0, Math.min(rect.height - 80, ev.clientY - rect.top)) + 'px';
      var kind = tool;
      var done = false;
      function commit() {
        if (done) return; done = true;
        var text = ta.value.trim();
        closeEditor();
        if (text) placeText(kind, text, p[0], p[1]);
      }
      ta.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(); }
        else if (e.key === 'Escape') { e.preventDefault(); done = true; closeEditor(); }
      });
      ta.addEventListener('blur', commit);
      stage.appendChild(ta);
      editor = ta;
      ta.focus();
    }

    function placeText(kind, text, x, y) {
      if (kind === 'sticky') addObject({ type: 'sticky', c: stickyColor, x: Math.min(x, WB.W - WB.STICKY_W), y: Math.min(y, WB.H - WB.STICKY_H), text: text });
      else addObject({ type: 'text', c: color, s: size, x: x, y: y, text: text });
    }
    function nextSpot() {
      var i = noteCount++ % 8;
      return [80 + i * 40, 80 + i * 40];
    }
    noteForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var t = noteInput.value.trim(); if (!t) return;
      var s = nextSpot(); placeText('text', t, s[0], s[1]); noteInput.value = '';
      say('Text added to the board.');
    });
    addSticky.addEventListener('click', function () {
      var t = noteInput.value.trim(); if (!t) { noteInput.focus(); return; }
      var s = nextSpot();
      stickyColor = WB.STICKY_COLORS[noteCount % WB.STICKY_COLORS.length];
      placeText('sticky', t, s[0], s[1]); noteInput.value = '';
      say('Note added to the board.');
    });

    // ---- rendering -----------------------------------------------------------------
    function fit() {
      var rect = canvas.getBoundingClientRect();
      var cw = Math.max(1, rect.width), ch = Math.max(1, rect.height);
      dpr = (doc.defaultView && doc.defaultView.devicePixelRatio) || 1;
      var pw = Math.round(cw * dpr), ph = Math.round(ch * dpr);
      if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
      scale = Math.min(cw / WB.W, ch / WB.H);
      offX = (cw - WB.W * scale) / 2; offY = (ch - WB.H * scale) / 2;
    }

    function wrapLines(c, text, maxW) {
      var out = [];
      text.split('\n').forEach(function (para) {
        var words = para.split(/\s+/), line = '';
        words.forEach(function (w) {
          var tryLine = line ? line + ' ' + w : w;
          if (line && c.measureText(tryLine).width > maxW) { out.push(line); line = w; } else line = tryLine;
        });
        out.push(line);
      });
      return out;
    }

    function drawObject(c, o) {
      c.strokeStyle = o.c; c.fillStyle = o.c; c.lineWidth = o.w || 6; c.lineCap = 'round'; c.lineJoin = 'round';
      if (o.type === 'stroke') {
        c.beginPath(); c.moveTo(o.pts[0][0], o.pts[0][1]);
        if (o.pts.length === 1) c.lineTo(o.pts[0][0] + 0.1, o.pts[0][1]);
        for (var i = 1; i < o.pts.length; i++) c.lineTo(o.pts[i][0], o.pts[i][1]);
        c.stroke();
      } else if (o.type === 'line') {
        c.beginPath(); c.moveTo(o.x1, o.y1); c.lineTo(o.x2, o.y2); c.stroke();
      } else if (o.type === 'rect') {
        c.strokeRect(o.x, o.y, o.bw, o.bh);
      } else if (o.type === 'ellipse') {
        c.beginPath(); c.ellipse(o.x + o.bw / 2, o.y + o.bh / 2, Math.max(0.5, o.bw / 2), Math.max(0.5, o.bh / 2), 0, 0, Math.PI * 2); c.stroke();
      } else if (o.type === 'text') {
        var px = WB.TEXT_PX[o.s] || 44;
        c.font = '600 ' + px + 'px system-ui, sans-serif'; c.textBaseline = 'top';
        o.text.split('\n').forEach(function (l, i) { c.fillText(l, o.x, o.y + i * px * 1.2); });
      } else if (o.type === 'sticky') {
        c.fillStyle = o.c; c.fillRect(o.x, o.y, WB.STICKY_W, WB.STICKY_H);
        c.strokeStyle = 'rgba(15,23,42,.35)'; c.lineWidth = 2; c.strokeRect(o.x, o.y, WB.STICKY_W, WB.STICKY_H);
        c.fillStyle = '#0f172a'; c.textBaseline = 'top';
        var fs = 24, lines;
        for (; fs >= 11; fs -= 2) {
          c.font = '500 ' + fs + 'px system-ui, sans-serif';
          lines = wrapLines(c, o.text, WB.STICKY_W - 20);
          if (lines.length * fs * 1.2 <= WB.STICKY_H - 20) break;
        }
        lines.forEach(function (l, i) { c.fillText(l, o.x + 10, o.y + 10 + i * fs * 1.2); });
      }
    }

    function draftObject() {
      if (!draft) return null;
      if (draft.type === 'stroke') return draft;
      if (draft.type === 'line') return { type: 'line', c: draft.c, w: draft.w, x1: draft.x0, y1: draft.y0, x2: draft.x1, y2: draft.y1 };
      return { type: draft.type, c: draft.c, w: draft.w, x: Math.min(draft.x0, draft.x1), y: Math.min(draft.y0, draft.y1), bw: Math.abs(draft.x1 - draft.x0), bh: Math.abs(draft.y1 - draft.y0) };
    }

    function paint(c, withBackground) {
      if (withBackground) { c.fillStyle = '#ffffff'; c.fillRect(0, 0, WB.W, WB.H); }
      board.objects.forEach(function (o) { c.save(); drawObject(c, o); c.restore(); });
      var d = draftObject();
      if (d) { c.save(); c.globalAlpha = 0.75; drawObject(c, d); c.restore(); }
    }

    function render() {
      fit();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#e2e8f0'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offX, dpr * offY);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, WB.W, WB.H); ctx.clip();
      paint(ctx, true);
      ctx.restore();
    }

    function savePng() {
      var out = doc.createElement('canvas'); out.width = WB.W; out.height = WB.H;
      var c = out.getContext('2d'); paint(c, true);
      out.toBlob(function (blob) {
        if (!blob) { say('Could not save the board.'); return; }
        var a = doc.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'cosy-whiteboard.png';
        doc.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
        say('Board saved as an image.');
      }, 'image/png');
    }

    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(function () { render(); }).observe(stage);
    refreshBar();
    render();

    return {
      receiveFromStudent: receiveFromStudent,
      receiveFromHost: receiveFromHost,
      syncMessage: syncMessage,
      refresh: function () { render(); refreshBar(); },
      getBoard: function () { return board; },
      setTool: setTool
    };
  }

  return { mount: mount };
});
