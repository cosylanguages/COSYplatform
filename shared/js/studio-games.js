/**
 * shared/js/studio-games.js
 * Native study games for Lesson Studio lessons: flashcards and memory match.
 * Used by the student page and the Studio preview.
 *
 * renderElement(el) returns safe markup (every author string is escaped) holding the
 * cards in a hidden list; init(root) then builds the playable game from that list with
 * DOM calls, so author text only ever reaches the page as text.
 * The games run entirely in the browser: nothing is graded or stored.
 */
(function (root, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    root.CosyStudioGames = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var LIMITS = { flashcards: { min: 1, max: 60, text: 200 }, memory: { min: 3, max: 12, text: 60 } };

  function esc(v) {
    return String(v === undefined || v === null ? '' : v)
      .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function clean(v) { return typeof v === 'string' ? v.trim() : ''; }

  /** Returns [{front, back}] or null when the deck is not valid. */
  function validCards(cards) {
    var L = LIMITS.flashcards;
    if (!Array.isArray(cards) || cards.length < L.min || cards.length > L.max) return null;
    var out = [];
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var f = c && clean(c.front), b = c && clean(c.back);
      if (!f || !b || f.length > L.text || b.length > L.text) return null;
      out.push({ front: f, back: b });
    }
    return out;
  }

  /** Returns [{a, b}] or null. All sides must differ, or a match would be ambiguous. */
  function validPairs(pairs) {
    var L = LIMITS.memory;
    if (!Array.isArray(pairs) || pairs.length < L.min || pairs.length > L.max) return null;
    var out = [], seen = {};
    for (var i = 0; i < pairs.length; i++) {
      var p = pairs[i];
      var a = p && clean(p.a), b = p && clean(p.b);
      if (!a || !b || a.length > L.text || b.length > L.text) return null;
      var ka = a.toLowerCase(), kb = b.toLowerCase();
      if (seen[ka] || seen[kb] || ka === kb) return null;
      seen[ka] = seen[kb] = true;
      out.push({ a: a, b: b });
    }
    return out;
  }

  function renderElement(el) {
    if (!el || typeof el !== 'object') return '';
    if (el.type === 'flashcards') {
      var cards = validCards(el.cards);
      if (!cards) return '';
      return '<section class="sg-game" data-game="flashcards" aria-label="Flashcards"><ol class="sg-source" hidden>' +
        cards.map(function (c) { return '<li><span data-x>' + esc(c.front) + '</span><span data-y>' + esc(c.back) + '</span></li>'; }).join('') +
        '</ol><div class="sg-mount"></div></section>';
    }
    if (el.type === 'memory-match') {
      var pairs = validPairs(el.pairs);
      if (!pairs) return '';
      return '<section class="sg-game" data-game="memory" aria-label="Memory match"><ul class="sg-source" hidden>' +
        pairs.map(function (p) { return '<li><span data-x>' + esc(p.a) + '</span><span data-y>' + esc(p.b) + '</span></li>'; }).join('') +
        '</ul><div class="sg-mount"></div></section>';
    }
    return '';
  }

  function ensureStyles(doc) {
    if (doc.getElementById('studio-games-style')) return;
    var st = doc.createElement('style');
    st.id = 'studio-games-style';
    st.textContent =
      '.sg-game{margin:16px 0;padding:16px;border:1px solid #cbd5e1;border-radius:12px;background:#f8fafc}' +
      '.sg-status{font-size:.9rem;color:#334155;margin:8px 0}' +
      '.sg-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}' +
      '.sg-btn{font:inherit;font-weight:600;padding:8px 14px;border-radius:8px;border:1px solid #475569;background:#fff;color:#0f172a;cursor:pointer}' +
      '.sg-btn:focus-visible,.sg-card:focus-visible,.sg-tile:focus-visible{outline:3px solid #1d4ed8;outline-offset:2px}' +
      '.sg-btn.sg-good{border-color:#047857;color:#065f46}.sg-btn.sg-again{border-color:#b45309;color:#92400e}' +
      '.sg-card{display:flex;align-items:center;justify-content:center;width:100%;min-height:150px;padding:20px;font:inherit;font-size:1.25rem;text-align:center;border:2px solid #1e3a8a;border-radius:12px;background:#fff;color:#0f172a;cursor:pointer}' +
      '.sg-card.sg-flipped{background:#eff6ff}' +
      '.sg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px}' +
      '.sg-tile{min-height:76px;padding:8px;font:inherit;font-weight:600;border:2px solid #1e3a8a;border-radius:10px;background:#1e3a8a;color:#fff;cursor:pointer;word-break:break-word}' +
      '.sg-tile.sg-up{background:#fff;color:#0f172a}.sg-tile.sg-done{background:#d1fae5;border-color:#047857;color:#064e3b;cursor:default}' +
      '@media (prefers-reduced-motion:no-preference){.sg-card,.sg-tile{transition:background .15s}}';
    (doc.head || doc.documentElement).appendChild(st);
  }

  function readSource(section) {
    return Array.prototype.map.call(section.querySelectorAll('.sg-source > li'), function (li) {
      return { x: li.querySelector('[data-x]').textContent, y: li.querySelector('[data-y]').textContent };
    });
  }

  function el(doc, tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function initFlashcards(section, doc) {
    var all = readSource(section);
    var mount = section.querySelector('.sg-mount');
    var deck, pos, known, missed, flipped;

    function start(cards) { deck = cards; pos = 0; known = 0; missed = []; flipped = false; draw(); }

    function draw() {
      mount.replaceChildren();
      var status = el(doc, 'p', 'sg-status');
      status.setAttribute('role', 'status');
      if (pos >= deck.length) {
        status.textContent = 'Deck finished: ' + known + ' of ' + deck.length + ' known.';
        mount.appendChild(status);
        var row = el(doc, 'div', 'sg-row');
        if (missed.length) {
          var again = el(doc, 'button', 'sg-btn', 'Practise the ' + missed.length + ' you missed');
          again.type = 'button';
          again.addEventListener('click', function () { start(missed.slice()); });
          row.appendChild(again);
        }
        var restart = el(doc, 'button', 'sg-btn', 'Start over');
        restart.type = 'button';
        restart.addEventListener('click', function () { start(all.slice()); });
        row.appendChild(restart);
        mount.appendChild(row);
        return;
      }
      var card = deck[pos];
      status.textContent = 'Card ' + (pos + 1) + ' of ' + deck.length + ' · known ' + known;
      var face = el(doc, 'button', 'sg-card' + (flipped ? ' sg-flipped' : ''), flipped ? card.y : card.x);
      face.type = 'button';
      face.setAttribute('aria-label', (flipped ? 'Back: ' : 'Front: ') + (flipped ? card.y : card.x) + '. Press to ' + (flipped ? 'show the front' : 'flip'));
      face.addEventListener('click', function () { flipped = !flipped; draw(); var f = mount.querySelector('.sg-card'); if (f) f.focus(); });
      mount.append(status, face);
      if (flipped) {
        var row2 = el(doc, 'div', 'sg-row');
        var no = el(doc, 'button', 'sg-btn sg-again', 'Again');
        no.type = 'button';
        no.addEventListener('click', function () { missed.push(card); pos++; flipped = false; draw(); var f = mount.querySelector('.sg-card, .sg-btn'); if (f) f.focus(); });
        var yes = el(doc, 'button', 'sg-btn sg-good', 'Got it');
        yes.type = 'button';
        yes.addEventListener('click', function () { known++; pos++; flipped = false; draw(); var f = mount.querySelector('.sg-card, .sg-btn'); if (f) f.focus(); });
        row2.append(no, yes);
        mount.appendChild(row2);
      }
    }
    start(all.slice());
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function initMemory(section, doc) {
    var pairs = readSource(section);
    var mount = section.querySelector('.sg-mount');

    function start() {
      mount.replaceChildren();
      var tiles = [];
      pairs.forEach(function (p, i) { tiles.push({ pair: i, text: p.x }, { pair: i, text: p.y }); });
      shuffle(tiles);
      var status = el(doc, 'p', 'sg-status', 'Find the matching pairs. Moves: 0');
      status.setAttribute('role', 'status');
      var grid = el(doc, 'div', 'sg-grid');
      var open = [], moves = 0, matched = 0, locked = false;

      function label(t, b) {
        var state = b._done ? 'matched' : (b._up ? 'face up' : 'face down');
        b.setAttribute('aria-label', (b._up || b._done ? t.text + ', ' : 'Card, ') + state);
      }

      tiles.forEach(function (t) {
        var b = el(doc, 'button', 'sg-tile', '?');
        b.type = 'button';
        b._up = false; b._done = false;
        label(t, b);
        b.addEventListener('click', function () {
          if (locked || b._up || b._done) return;
          b._up = true; b.textContent = t.text; b.classList.add('sg-up'); label(t, b);
          open.push({ t: t, b: b });
          if (open.length < 2) return;
          moves++;
          var first = open[0], second = open[1];
          open = [];
          if (first.t.pair === second.t.pair) {
            [first, second].forEach(function (o) { o.b._done = true; o.b.classList.remove('sg-up'); o.b.classList.add('sg-done'); label(o.t, o.b); });
            matched++;
            status.textContent = matched === pairs.length
              ? 'All ' + pairs.length + ' pairs matched in ' + moves + ' moves.'
              : 'Matched! Moves: ' + moves;
            if (matched === pairs.length) {
              var again = el(doc, 'button', 'sg-btn', 'Play again');
              again.type = 'button';
              again.addEventListener('click', start);
              var row = el(doc, 'div', 'sg-row');
              row.appendChild(again);
              mount.appendChild(row);
            }
          } else {
            status.textContent = 'Not a pair. Moves: ' + moves;
            locked = true;
            setTimeout(function () {
              [first, second].forEach(function (o) { o.b._up = false; o.b.textContent = '?'; o.b.classList.remove('sg-up'); label(o.t, o.b); });
              locked = false;
            }, 900);
          }
        });
        grid.appendChild(b);
      });
      mount.append(status, grid);
    }
    start();
  }

  /** Make every game under `rootEl` playable. Safe to call again; each game starts once. */
  function init(rootEl) {
    if (!rootEl || !rootEl.querySelectorAll) return;
    var doc = rootEl.ownerDocument || document;
    ensureStyles(doc);
    Array.prototype.forEach.call(rootEl.querySelectorAll('section.sg-game:not([data-ready])'), function (section) {
      section.setAttribute('data-ready', '1');
      var kind = section.getAttribute('data-game');
      if (kind === 'flashcards') initFlashcards(section, doc);
      else if (kind === 'memory') initMemory(section, doc);
    });
  }

  return { LIMITS: LIMITS, validCards: validCards, validPairs: validPairs, renderElement: renderElement, init: init };
});
