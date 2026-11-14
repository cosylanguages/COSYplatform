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

  var LIMITS = {
    flashcards: { min: 1, max: 60, text: 200 },
    memory: { min: 3, max: 12, text: 60 },
    hangman: { min: 1, max: 20, minLen: 2, maxLen: 30, hint: 120 },
    anagram: { min: 1, max: 20, minLen: 3, maxLen: 30, hint: 120 },
    wordsearch: { min: 3, max: 12, minLen: 3, maxLen: 12 },
    crossword: { min: 3, max: 15, minLen: 2, maxLen: 15, clue: 120 }
  };
  var HANGMAN_LIVES = 6;

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


  /** [{word, hint?}] for hangman / anagram, or null. Words must differ; anagram words are single words. */
  function validWordList(items, kind) {
    var L = LIMITS[kind];
    if (!Array.isArray(items) || items.length < L.min || items.length > L.max) return null;
    var out = [], seen = {};
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var w = it && clean(it.word);
      var h = it && it.hint !== undefined && it.hint !== null ? clean(it.hint) : '';
      if (!w || w.length < L.minLen || w.length > L.maxLen || h.length > L.hint) return null;
      if (kind === 'anagram' && /\s/.test(w)) return null;
      if (kind === 'hangman' && !/\p{L}/u.test(w)) return null;
      var k = w.toLowerCase();
      if (seen[k]) return null;
      seen[k] = true;
      out.push({ word: w, hint: h });
    }
    return out;
  }

  /** ['word', ...] for word search, or null. Single words of 3-12 letters, all different. */
  function validWords(words) {
    var L = LIMITS.wordsearch;
    if (!Array.isArray(words) || words.length < L.min || words.length > L.max) return null;
    var out = [], seen = {};
    for (var i = 0; i < words.length; i++) {
      var w = clean(words[i]);
      if (!w || /\s/.test(w) || Array.from(w).length < L.minLen || Array.from(w).length > L.maxLen) return null;
      var k = w.toLowerCase();
      if (seen[k]) return null;
      seen[k] = true;
      out.push(w);
    }
    return out;
  }

  /** [{word, clue}] for a crossword, or null. Single words, all different, every entry has a clue. */
  function validEntries(entries) {
    var L = LIMITS.crossword;
    if (!Array.isArray(entries) || entries.length < L.min || entries.length > L.max) return null;
    var out = [], seen = {};
    for (var i = 0; i < entries.length; i++) {
      var it = entries[i];
      var w = it && clean(it.word), c = it && clean(it.clue);
      if (!w || /\s/.test(w) || Array.from(w).length < L.minLen || Array.from(w).length > L.maxLen) return null;
      if (!c || c.length > L.clue) return null;
      var k = w.toLowerCase();
      if (seen[k]) return null;
      seen[k] = true;
      out.push({ word: w, clue: c });
    }
    return out;
  }

  function sourceList(tag, itemsHtml) { return '<' + tag + ' class="sg-source" hidden>' + itemsHtml + '</' + tag + '>'; }

  function renderElement(el) {
    if (!el || typeof el !== 'object') return '';
    if (el.type === 'flashcards') {
      var cards = validCards(el.cards);
      if (!cards) return '';
      return '<section class="sg-game" data-game="flashcards" aria-label="Flashcards"><ol class="sg-source" hidden>' +
        cards.map(function (c) { return '<li><span data-x>' + esc(c.front) + '</span><span data-y>' + esc(c.back) + '</span></li>'; }).join('') +
        '</ol><div class="sg-mount"></div></section>';
    }
    if (el.type === 'hangman' || el.type === 'anagram') {
      var list = validWordList(el.words, el.type);
      if (!list) return '';
      return '<section class="sg-game" data-game="' + el.type + '" aria-label="' + (el.type === 'hangman' ? 'Hangman' : 'Anagram') + '">' +
        sourceList('ol', list.map(function (w) { return '<li><span data-x>' + esc(w.word) + '</span><span data-y>' + esc(w.hint) + '</span></li>'; }).join('')) +
        '<div class="sg-mount"></div></section>';
    }
    if (el.type === 'crossword') {
      var ents = validEntries(el.entries);
      if (!ents) return '';
      return '<section class="sg-game" data-game="crossword" aria-label="Crossword">' +
        sourceList('ol', ents.map(function (e) { return '<li><span data-x>' + esc(e.word) + '</span><span data-y>' + esc(e.clue) + '</span></li>'; }).join('')) +
        '<div class="sg-mount"></div></section>';
    }
    if (el.type === 'word-search') {
      var ws = validWords(el.words);
      if (!ws) return '';
      return '<section class="sg-game" data-game="wordsearch" data-directions="' + (el.directions === 'all' ? 'all' : 'basic') + '" aria-label="Word search">' +
        sourceList('ul', ws.map(function (w) { return '<li><span data-x>' + esc(w) + '</span><span data-y></span></li>'; }).join('')) +
        '<div class="sg-mount"></div></section>';
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
      '.sg-mask{font-size:1.6rem;letter-spacing:.2em;font-weight:700;margin:10px 0;word-break:break-word}' +
      '.sg-input{font:inherit;font-size:1.1rem;padding:8px;border:2px solid #475569;border-radius:8px;width:5em;text-align:center}' +
      '.sg-letters{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}' +
      '.sg-letter{min-width:44px;min-height:44px;font:inherit;font-size:1.2rem;font-weight:700;border:2px solid #1e3a8a;border-radius:8px;background:#fff;color:#0f172a;cursor:pointer}' +
      '.sg-letter:disabled{opacity:.35;cursor:default}' +
      '.sg-built{min-height:48px;font-size:1.5rem;font-weight:700;letter-spacing:.15em;margin:8px 0;word-break:break-word}' +
      '.sg-ws{display:inline-block;border:2px solid #1e3a8a;border-radius:8px;overflow:hidden;max-width:100%}' +
      '.sg-wsrow{display:flex}' +
      '.sg-cell{width:34px;height:34px;padding:0;font:inherit;font-weight:700;border:1px solid #cbd5e1;background:#fff;color:#0f172a;cursor:pointer}' +
      '.sg-cell.sg-start{background:#fde68a}.sg-cell.sg-found{background:#bbf7d0;color:#064e3b}' +
      '.sg-cell:focus-visible{outline:3px solid #1d4ed8;outline-offset:-3px;position:relative}' +
      '.sg-cw{display:inline-block;max-width:100%;overflow:auto}' +
      '.sg-cwrow{display:flex}' +
      '.sg-cwcell{position:relative;width:36px;height:36px;box-sizing:border-box}' +
      '.sg-cwcell.sg-block{background:transparent}' +
      '.sg-cwnum{position:absolute;top:1px;left:3px;font-size:.6rem;line-height:1;pointer-events:none;color:#334155}' +
      '.sg-cwin{width:100%;height:100%;box-sizing:border-box;padding:6px 0 0;border:1px solid #475569;background:#fff;color:#0f172a;font:inherit;font-weight:700;text-align:center;text-transform:uppercase}' +
      '.sg-cwin.sg-inword{background:#dbeafe}' +
      '.sg-cwin:focus-visible{outline:3px solid #1d4ed8;outline-offset:-3px;position:relative}' +
      '.sg-cwin.sg-wrong{border:2px dashed #b91c1c;background:#fee2e2}' +
      '.sg-cwin.sg-right{background:#bbf7d0}' +
      '.sg-clues{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:12px 0}' +
      '.sg-clues ol{margin:0;padding-left:0;list-style:none}' +
      '.sg-clue{display:block;width:100%;text-align:left;font:inherit;padding:6px 8px;border:1px solid transparent;border-radius:6px;background:transparent;color:#0f172a;cursor:pointer}' +
      '.sg-clue.sg-cur{border-color:#1d4ed8;background:#dbeafe}' +
      '.sg-wordlist{display:flex;gap:8px 16px;flex-wrap:wrap;list-style:none;padding:0;margin:10px 0}' +
      '.sg-wordlist .sg-got{text-decoration:line-through;color:#047857}' +
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


  function btn(doc, text, fn) {
    var b = el(doc, 'button', 'sg-btn', text);
    b.type = 'button';
    b.addEventListener('click', fn);
    return b;
  }

  function initHangman(section, doc) {
    var words = readSource(section);
    var mount = section.querySelector('.sg-mount');
    var order = shuffle(words.slice());
    var pos = 0, won = 0;

    function isLetter(ch) { return /\p{L}/u.test(ch); }

    function round() {
      mount.textContent = '';
      if (pos >= order.length) {
        var done = el(doc, 'p', 'sg-status', 'Finished: ' + won + ' of ' + order.length + ' words solved.');
        done.setAttribute('role', 'status');
        mount.append(done, btn(doc, 'Play again', function () { order = shuffle(words.slice()); pos = 0; won = 0; round(); }));
        var f = mount.querySelector('button'); if (f) f.focus();
        return;
      }
      var item = order[pos];
      var chars = Array.from(item.x);
      var guessed = {}, lives = HANGMAN_LIVES, over = false;
      var info = el(doc, 'p', 'sg-status');
      var mask = el(doc, 'div', 'sg-mask');
      var live = el(doc, 'p', 'sg-status');
      live.setAttribute('role', 'status');
      var form = doc.createElement('form');
      var lab = el(doc, 'label', '', 'Type a letter ');
      var inp = el(doc, 'input', 'sg-input');
      inp.type = 'text'; inp.maxLength = 2; inp.autocomplete = 'off';
      inp.setAttribute('aria-label', 'Guess a letter');
      lab.appendChild(inp);
      var go = el(doc, 'button', 'sg-btn', 'Guess');
      go.type = 'submit';
      form.append(lab, go);
      var tried = el(doc, 'p', 'sg-status');

      function shown(ch) { return !isLetter(ch) || guessed[ch.toLowerCase()]; }
      function draw() {
        info.textContent = 'Word ' + (pos + 1) + ' of ' + order.length + (item.y ? ' — hint: ' + item.y : '');
        mask.textContent = chars.map(function (ch) { return shown(ch) ? ch : '_'; }).join(' ');
        mask.setAttribute('aria-label', chars.map(function (ch) { return shown(ch) ? ch : 'blank'; }).join(' '));
        var wrong = Object.keys(guessed).filter(function (k) { return !chars.some(function (c) { return c.toLowerCase() === k; }); });
        tried.textContent = 'Wrong letters: ' + (wrong.join(' ') || 'none');
      }
      function finish(win) {
        over = true;
        if (win) won++;
        live.textContent = win ? 'Solved! The word is ' + item.x + '.' : 'Out of lives. The word was ' + item.x + '.';
        form.hidden = true;
        var next = btn(doc, pos + 1 < order.length ? 'Next word' : 'See result', function () { pos++; round(); });
        mount.appendChild(next);
        next.focus();
      }
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (over) return;
        var g = Array.from(inp.value.trim().toLowerCase())[0];
        inp.value = '';
        inp.focus();
        if (!g || !isLetter(g)) { live.textContent = 'Type one letter.'; return; }
        if (guessed[g]) { live.textContent = 'You already tried ' + g + '.'; return; }
        guessed[g] = true;
        var hit = chars.some(function (c) { return c.toLowerCase() === g; });
        if (!hit) lives--;
        live.textContent = (hit ? 'Yes, ' + g + ' is in the word.' : 'No ' + g + '.') + ' Lives left: ' + lives + '.';
        draw();
        if (chars.every(shown)) finish(true);
        else if (lives <= 0) finish(false);
      });
      mount.append(info, mask, live, form, tried);
      draw();
      live.textContent = 'Lives: ' + lives + '.';
      inp.focus();
    }
    round();
  }

  function initAnagram(section, doc) {
    var words = readSource(section);
    var mount = section.querySelector('.sg-mount');
    var order = shuffle(words.slice());
    var pos = 0, solved = 0;

    function scramble(chars) {
      var out = chars.slice();
      for (var t = 0; t < 20; t++) {
        shuffle(out);
        if (out.join('') !== chars.join('')) break;
      }
      return out;
    }

    function round() {
      mount.textContent = '';
      if (pos >= order.length) {
        var done = el(doc, 'p', 'sg-status', 'Finished: ' + solved + ' of ' + order.length + ' solved.');
        done.setAttribute('role', 'status');
        mount.append(done, btn(doc, 'Play again', function () { order = shuffle(words.slice()); pos = 0; solved = 0; round(); }));
        mount.querySelector('button').focus();
        return;
      }
      var item = order[pos];
      var target = Array.from(item.x);
      var tiles = scramble(target).map(function (ch) { return { ch: ch, used: false }; });
      var built = [];
      var finished = false;
      var info = el(doc, 'p', 'sg-status', 'Word ' + (pos + 1) + ' of ' + order.length + (item.y ? ' — hint: ' + item.y : ''));
      var shownBuilt = el(doc, 'div', 'sg-built');
      var letters = el(doc, 'div', 'sg-letters');
      var live = el(doc, 'p', 'sg-status');
      live.setAttribute('role', 'status');
      var controls = el(doc, 'div', 'sg-row');

      function draw() {
        shownBuilt.textContent = built.length ? built.map(function (i) { return tiles[i].ch; }).join('') : '…';
        tiles.forEach(function (t) { t.b.disabled = t.used || finished; });
      }
      tiles.forEach(function (t, i) {
        var b = el(doc, 'button', 'sg-letter', t.ch);
        b.type = 'button';
        t.b = b;
        b.addEventListener('click', function () {
          if (t.used || finished) return;
          t.used = true; built.push(i); live.textContent = '';
          draw();
        });
        letters.appendChild(b);
      });
      function undo() {
        if (finished || !built.length) return;
        tiles[built.pop()].used = false; live.textContent = ''; draw();
      }
      function check() {
        if (finished) return;
        if (built.length !== target.length) { live.textContent = 'Use all the letters first.'; return; }
        var guess = built.map(function (i) { return tiles[i].ch; }).join('');
        if (guess.toLowerCase() === item.x.toLowerCase()) {
          finished = true; solved++;
          live.textContent = 'Correct! ' + item.x;
          draw();
          var next = btn(doc, pos + 1 < order.length ? 'Next word' : 'See result', function () { pos++; round(); });
          controls.appendChild(next);
          next.focus();
        } else {
          live.textContent = 'Not quite. Try again.';
        }
      }
      controls.append(
        btn(doc, 'Undo', undo),
        btn(doc, 'Clear', function () { if (finished) return; built.forEach(function (i) { tiles[i].used = false; }); built = []; live.textContent = ''; draw(); }),
        btn(doc, 'Check', check)
      );
      mount.append(info, shownBuilt, letters, controls, live);
      draw();
    }
    round();
  }

  var DIRS_BASIC = [[0, 1], [1, 0], [1, 1]];
  var DIRS_ALL = DIRS_BASIC.concat([[0, -1], [-1, 0], [-1, -1], [1, -1], [-1, 1]]);

  function buildGrid(words, dirs) {
    var chars = words.map(function (w) { return Array.from(w.toUpperCase()); });
    var longest = Math.max.apply(null, chars.map(function (c) { return c.length; }));
    var size = Math.max(10, longest + 2);
    var pool = [];
    chars.forEach(function (c) { pool = pool.concat(c); });
    for (var attempt = 0; attempt < 200; attempt++) {
      if (attempt && attempt % 50 === 0 && size < 16) size++;
      var grid = [];
      for (var r = 0; r < size; r++) { grid.push([]); for (var c0 = 0; c0 < size; c0++) grid[r].push(''); }
      var ok = true;
      for (var i = 0; i < chars.length && ok; i++) {
        var w = chars[i], placed = false;
        for (var t = 0; t < 100 && !placed; t++) {
          var d = dirs[Math.floor(Math.random() * dirs.length)];
          var r0 = Math.floor(Math.random() * size), c1 = Math.floor(Math.random() * size);
          var er = r0 + d[0] * (w.length - 1), ec = c1 + d[1] * (w.length - 1);
          if (er < 0 || er >= size || ec < 0 || ec >= size) continue;
          var fits = true;
          for (var k = 0; k < w.length; k++) {
            var cur = grid[r0 + d[0] * k][c1 + d[1] * k];
            if (cur && cur !== w[k]) { fits = false; break; }
          }
          if (!fits) continue;
          for (var k2 = 0; k2 < w.length; k2++) grid[r0 + d[0] * k2][c1 + d[1] * k2] = w[k2];
          placed = true;
        }
        ok = placed;
      }
      if (ok) {
        for (var a = 0; a < size; a++) for (var b = 0; b < size; b++) {
          if (!grid[a][b]) grid[a][b] = pool[Math.floor(Math.random() * pool.length)];
        }
        return { grid: grid, size: size, chars: chars };
      }
    }
    return null;
  }

  function initWordSearch(section, doc) {
    var words = readSource(section).map(function (w) { return w.x; });
    var dirs = section.getAttribute('data-directions') === 'all' ? DIRS_ALL : DIRS_BASIC;
    var mount = section.querySelector('.sg-mount');

    function start() {
      mount.textContent = '';
      var built = buildGrid(words, dirs);
      if (!built) { mount.appendChild(el(doc, 'p', 'sg-status', 'Could not build this puzzle.')); return; }
      var grid = built.grid, size = built.size;
      var found = {}, foundCount = 0, startCell = null, cur = [0, 0];
      var live = el(doc, 'p', 'sg-status');
      live.setAttribute('role', 'status');
      var table = el(doc, 'div', 'sg-ws');
      table.setAttribute('role', 'grid');
      table.setAttribute('aria-label', 'Word search grid. Arrow keys move. Press Enter on the first and last letter of a word.');
      var cells = [];
      var list = el(doc, 'ul', 'sg-wordlist');
      var items = words.map(function (w) { var li = el(doc, 'li', '', w); list.appendChild(li); return li; });

      function setTab(r, c) {
        cells[cur[0]][cur[1]].tabIndex = -1;
        cur = [r, c];
        cells[r][c].tabIndex = 0;
      }
      function clearStart() { if (startCell) { cells[startCell[0]][startCell[1]].classList.remove('sg-start'); startCell = null; } }
      function pick(r, c) {
        if (!startCell) {
          startCell = [r, c];
          cells[r][c].classList.add('sg-start');
          live.textContent = 'Start set at ' + grid[r][c] + '. Choose the last letter.';
          return;
        }
        var dr = r - startCell[0], dc = c - startCell[1];
        var n = Math.max(Math.abs(dr), Math.abs(dc));
        var line = [];
        if (n > 0 && (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) {
          for (var k = 0; k <= n; k++) line.push([startCell[0] + Math.sign(dr) * k, startCell[1] + Math.sign(dc) * k]);
        }
        var text = line.map(function (p) { return grid[p[0]][p[1]]; }).join('');
        var rev = Array.from(text).reverse().join('');
        var hit = -1;
        words.forEach(function (w, i) {
          var u = w.toUpperCase();
          if (!found[i] && (u === text || (dirs === DIRS_ALL && u === rev))) hit = i;
        });
        clearStart();
        if (hit < 0) { live.textContent = 'That is not one of the words.'; return; }
        found[hit] = true; foundCount++;
        line.forEach(function (p) { cells[p[0]][p[1]].classList.add('sg-found'); });
        items[hit].classList.add('sg-got');
        items[hit].textContent = words[hit] + ' (found)';
        live.textContent = 'Found ' + words[hit] + '. ' + foundCount + ' of ' + words.length + '.';
        if (foundCount === words.length) {
          live.textContent = 'You found all ' + words.length + ' words!';
          var again = btn(doc, 'Play again', start);
          mount.appendChild(again);
          again.focus();
        }
      }

      for (var r = 0; r < size; r++) {
        var row = el(doc, 'div', 'sg-wsrow');
        row.setAttribute('role', 'row');
        cells.push([]);
        for (var c = 0; c < size; c++) {
          var b = el(doc, 'button', 'sg-cell', grid[r][c]);
          b.type = 'button';
          b.tabIndex = r === 0 && c === 0 ? 0 : -1;
          b.setAttribute('role', 'gridcell');
          (function (r, c, b) {
            b.addEventListener('click', function () { setTab(r, c); pick(r, c); });
            b.addEventListener('keydown', function (e) {
              var nr = r, nc = c;
              if (e.key === 'ArrowRight') nc++;
              else if (e.key === 'ArrowLeft') nc--;
              else if (e.key === 'ArrowDown') nr++;
              else if (e.key === 'ArrowUp') nr--;
              else if (e.key === 'Escape') { clearStart(); live.textContent = 'Selection cancelled.'; return; }
              else return;
              e.preventDefault();
              if (nr < 0 || nc < 0 || nr >= size || nc >= size) return;
              setTab(nr, nc);
              cells[nr][nc].focus();
            });
          })(r, c, b);
          cells[r].push(b);
          row.appendChild(b);
        }
        table.appendChild(row);
      }
      mount.append(table, el(doc, 'p', 'sg-status', 'Find these words:'), list, live);
    }
    start();
  }


  var CW_DIRS = [[0, 1], [1, 0]]; // across, down

  /** Lay the words out on a grid so they cross. Returns {placed, size rows/cols, cells} or null. */
  function layoutCrossword(entries) {
    var best = null;
    for (var attempt = 0; attempt < 150; attempt++) {
      var order = entries.map(function (e, i) { return { e: e, i: i, ch: Array.from(e.word.toUpperCase()) }; });
      order.sort(function (a, b) { return b.ch.length - a.ch.length || Math.random() - 0.5; });
      if (attempt > 0) { var f = order.shift(); shuffle(order); order.unshift(f); }
      var cells = {}, placed = [];
      function get(r, c) { return cells[r + ',' + c]; }
      function fits(w, r, c, d) {
        var before = get(r - d[0], c - d[1]), after = get(r + d[0] * w.length, c + d[1] * w.length);
        if (before || after) return -1;
        var cross = 0;
        for (var k = 0; k < w.length; k++) {
          var rr = r + d[0] * k, cc = c + d[1] * k, cur = get(rr, cc);
          if (cur) { if (cur !== w[k]) return -1; cross++; continue; }
          // an empty cell must not touch letters sideways
          if (get(rr + d[1], cc + d[0]) || get(rr - d[1], cc - d[0])) return -1;
        }
        return cross === w.length ? -1 : cross;
      }
      for (var oi = 0; oi < order.length; oi++) {
        var o = order[oi], w = o.ch, cand = [];
        if (!placed.length) { cand.push({ r: 0, c: 0, d: CW_DIRS[0], x: 0 }); }
        else {
          placed.forEach(function (pl) {
            pl.ch.forEach(function (pc, pk) {
              w.forEach(function (wc, wk) {
                if (pc !== wc) return;
                var d = pl.d === CW_DIRS[0] ? CW_DIRS[1] : CW_DIRS[0];
                var r = pl.r + pl.d[0] * pk - d[0] * wk, c = pl.c + pl.d[1] * pk - d[1] * wk;
                var x = fits(w, r, c, d);
                if (x >= 1) cand.push({ r: r, c: c, d: d, x: x });
              });
            });
          });
        }
        if (!cand.length) continue;
        cand.sort(function (a, b) { return b.x - a.x || Math.random() - 0.5; });
        var pick = cand[0];
        for (var k = 0; k < w.length; k++) cells[(pick.r + pick.d[0] * k) + ',' + (pick.c + pick.d[1] * k)] = w[k];
        placed.push({ entry: o.e, idx: o.i, ch: w, r: pick.r, c: pick.c, d: pick.d });
      }
      if (!best || placed.length > best.placed.length) best = { placed: placed, cells: cells };
      if (placed.length === entries.length) break;
    }
    if (!best) return null;
    var minR = Infinity, minC = Infinity, maxR = -Infinity, maxC = -Infinity;
    Object.keys(best.cells).forEach(function (k) {
      var p = k.split(','), r = +p[0], c = +p[1];
      minR = Math.min(minR, r); minC = Math.min(minC, c); maxR = Math.max(maxR, r); maxC = Math.max(maxC, c);
    });
    best.placed.forEach(function (pl) { pl.r -= minR; pl.c -= minC; });
    best.rows = maxR - minR + 1; best.cols = maxC - minC + 1;
    // number entries by reading order of their starting cell
    var starts = {}, n = 0;
    best.placed.slice().sort(function (a, b) { return a.r - b.r || a.c - b.c; }).forEach(function (pl) {
      var key = pl.r + ',' + pl.c;
      if (!starts[key]) starts[key] = ++n;
      pl.num = starts[key];
    });
    return best;
  }

  function initCrossword(section, doc) {
    var entries = readSource(section).map(function (e) { return { word: e.x, clue: e.y }; });
    var mount = section.querySelector('.sg-mount');
    var lay = layoutCrossword(entries);
    mount.textContent = '';
    if (!lay) { mount.appendChild(el(doc, 'p', 'sg-status', 'Could not build this crossword.')); return; }
    var inputs = {}; // 'r,c' -> input
    var letterAt = {};
    lay.placed.forEach(function (pl) {
      pl.ch.forEach(function (ch, k) { letterAt[(pl.r + pl.d[0] * k) + ',' + (pl.c + pl.d[1] * k)] = ch; });
    });
    var cur = lay.placed[0], live = el(doc, 'p', 'sg-status');
    live.setAttribute('role', 'status');
    var grid = el(doc, 'div', 'sg-cw');
    var clueBtns = [];
    function across(pl) { return pl.d === CW_DIRS[0]; }
    function cellsOf(pl) {
      return pl.ch.map(function (_, k) { return (pl.r + pl.d[0] * k) + ',' + (pl.c + pl.d[1] * k); });
    }
    function select(pl, focusKey) {
      cur = pl;
      Object.keys(inputs).forEach(function (k) { inputs[k].classList.remove('sg-inword'); });
      cellsOf(pl).forEach(function (k) { inputs[k].classList.add('sg-inword'); });
      clueBtns.forEach(function (b) { b.btn.classList.toggle('sg-cur', b.pl === pl); if (b.pl === pl) b.btn.setAttribute('aria-current', 'true'); else b.btn.removeAttribute('aria-current'); });
      if (focusKey) inputs[focusKey].focus();
    }
    function entriesAt(key) {
      return lay.placed.filter(function (pl) { return cellsOf(pl).indexOf(key) !== -1; });
    }
    function move(key, dr, dc) {
      var p = key.split(','), nk = (+p[0] + dr) + ',' + (+p[1] + dc);
      if (inputs[nk]) { inputs[nk].focus(); return true; }
      return false;
    }

    for (var r = 0; r < lay.rows; r++) {
      var row = el(doc, 'div', 'sg-cwrow');
      for (var c = 0; c < lay.cols; c++) {
        var key = r + ',' + c, cell = el(doc, 'div', 'sg-cwcell');
        if (!letterAt[key]) { cell.classList.add('sg-block'); row.appendChild(cell); continue; }
        var inp = el(doc, 'input', 'sg-cwin');
        inp.type = 'text'; inp.maxLength = 2; inp.autocomplete = 'off'; inp.setAttribute('autocapitalize', 'off');
        inp.tabIndex = -1;
        inp.setAttribute('aria-label', 'Row ' + (r + 1) + ', column ' + (c + 1));
        inputs[key] = inp;
        (function (key, inp) {
          inp.addEventListener('focus', function () {
            var here = entriesAt(key);
            if (here.indexOf(cur) === -1) select(here[0]);
            Object.keys(inputs).forEach(function (k) { inputs[k].tabIndex = -1; });
            inp.tabIndex = 0;
            if (inp.select) inp.select();
          });
          inp.addEventListener('input', function () {
            var typed = Array.from(inp.value.trim());
            var ch = typed[typed.length - 1] || '';
            inp.value = ch.toUpperCase();
            inp.classList.remove('sg-wrong', 'sg-right'); inp.removeAttribute('aria-invalid');
            if (ch && cur) {
              var ks = cellsOf(cur), at = ks.indexOf(key);
              if (at !== -1 && at + 1 < ks.length) inputs[ks[at + 1]].focus();
            }
          });
          inp.addEventListener('click', function () {
            var here = entriesAt(key);
            if (here.length > 1 && here.indexOf(cur) !== -1) select(here[(here.indexOf(cur) + 1) % here.length]);
          });
          inp.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') { if (move(key, 0, 1)) e.preventDefault(); else e.preventDefault(); }
            else if (e.key === 'ArrowLeft') { move(key, 0, -1); e.preventDefault(); }
            else if (e.key === 'ArrowDown') { move(key, 1, 0); e.preventDefault(); }
            else if (e.key === 'ArrowUp') { move(key, -1, 0); e.preventDefault(); }
            else if (e.key === 'Backspace' && !inp.value && cur) {
              var ks = cellsOf(cur), at = ks.indexOf(key);
              if (at > 0) { e.preventDefault(); inputs[ks[at - 1]].value = ''; inputs[ks[at - 1]].focus(); }
            }
          });
        })(key, inp);
        cell.appendChild(inp);
        row.appendChild(cell);
      }
      grid.appendChild(row);
    }
    lay.placed.forEach(function (pl) {
      var num = el(doc, 'span', 'sg-cwnum', String(pl.num));
      num.setAttribute('aria-hidden', 'true');
      var first = inputs[pl.r + ',' + pl.c].parentNode;
      if (!first.querySelector('.sg-cwnum')) first.appendChild(num);
    });

    var clues = el(doc, 'div', 'sg-clues');
    [['Across', true], ['Down', false]].forEach(function (g) {
      var list = lay.placed.filter(function (pl) { return across(pl) === g[1]; }).sort(function (a, b) { return a.num - b.num; });
      var box = el(doc, 'div');
      box.appendChild(el(doc, 'h4', '', g[0]));
      var ol = el(doc, 'ol');
      if (!list.length) ol.appendChild(el(doc, 'li', '', '—'));
      list.forEach(function (pl) {
        var li = el(doc, 'li');
        var b = el(doc, 'button', 'sg-clue', pl.num + '. ' + pl.entry.clue + ' (' + pl.ch.length + ')');
        b.type = 'button';
        b.addEventListener('click', function () { select(pl, pl.r + ',' + pl.c); });
        li.appendChild(b); ol.appendChild(li);
        clueBtns.push({ pl: pl, btn: b });
      });
      box.appendChild(ol); clues.appendChild(box);
    });

    function check() {
      var wrong = 0, empty = 0;
      Object.keys(inputs).forEach(function (k) {
        var i = inputs[k], v = i.value;
        i.classList.remove('sg-wrong', 'sg-right'); i.removeAttribute('aria-invalid');
        if (!v) { empty++; return; }
        if (v.toUpperCase() === letterAt[k]) i.classList.add('sg-right');
        else { wrong++; i.classList.add('sg-wrong'); i.setAttribute('aria-invalid', 'true'); }
      });
      if (!wrong && !empty) live.textContent = 'Perfect! The crossword is complete.';
      else live.textContent = wrong + ' wrong' + (wrong === 1 ? ' letter' : ' letters') + ' (dashed red), ' + empty + ' still empty.';
    }
    var controls = el(doc, 'div', 'sg-row');
    controls.append(
      btn(doc, 'Check', check),
      btn(doc, 'Reveal this word', function () {
        cellsOf(cur).forEach(function (k) { inputs[k].value = letterAt[k]; inputs[k].classList.remove('sg-wrong'); });
        live.textContent = 'Revealed: ' + cur.entry.word + '.';
      }),
      btn(doc, 'Clear all', function () {
        Object.keys(inputs).forEach(function (k) { inputs[k].value = ''; inputs[k].classList.remove('sg-wrong', 'sg-right'); inputs[k].removeAttribute('aria-invalid'); });
        live.textContent = '';
      })
    );
    var skipped = entries.length - lay.placed.length;
    mount.append(grid, clues, controls, live);
    if (skipped > 0) mount.appendChild(el(doc, 'p', 'sg-status', skipped + ' word(s) could not be fitted into the grid and were left out. Try adding words that share letters.'));
    var f0 = inputs[lay.placed[0].r + ',' + lay.placed[0].c];
    f0.tabIndex = 0;
    select(lay.placed[0]);
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
      else if (kind === 'hangman') initHangman(section, doc);
      else if (kind === 'anagram') initAnagram(section, doc);
      else if (kind === 'wordsearch') initWordSearch(section, doc);
      else if (kind === 'crossword') initCrossword(section, doc);
    });
  }

  return { LIMITS: LIMITS, validCards: validCards, validPairs: validPairs, validWordList: validWordList, validWords: validWords, validEntries: validEntries, renderElement: renderElement, init: init };
});
