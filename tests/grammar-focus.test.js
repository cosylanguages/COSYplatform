const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const GF = require('../shared/js/grammar-focus.js');

test('isValidId accepts registry-style ids and rejects junk', () => {
  for (const ok of ['en-a1-adjectives', 'fr-b2-passif-a-valeur-detat', 'ru-a1-x1', 'en-a2-present-perfect-vs-past-simple']) {
    assert.equal(GF.isValidId(ok), true, ok);
  }
  for (const bad of ['', null, undefined, 42, 'en', 'en-a1', 'EN-a1-x', 'en-a1-', 'en-a1-../x', 'en a1 x', 'en-a1-x/y', '<b>']) {
    assert.equal(GF.isValidId(bad), false, String(bad));
  }
});

test('manualUrl follows the COSYmanuals id -> page mapping', () => {
  assert.equal(
    GF.manualUrl('en-a1-adjectives'),
    'https://cosylanguages.github.io/COSYmanuals/manuals/en/grammar/a1/topics/adjectives.html'
  );
  assert.equal(
    GF.manualUrl('fr-b2-passif-a-valeur-detat'),
    'https://cosylanguages.github.io/COSYmanuals/manuals/fr/grammar/b2/topics/passif-a-valeur-detat.html'
  );
  assert.equal(GF.manualUrl('nope'), null);
  assert.equal(GF.manualUrl('en-a1-x', 'http://localhost:8000/'), 'http://localhost:8000/manuals/en/grammar/a1/topics/x.html');
});

test('renderHtml mounts the embed and keeps a fallback link', () => {
  const html = GF.renderHtml({ type: 'grammar-focus', grammarId: 'en-a2-used-to' });
  assert.match(html, /data-grammar-focus="en-a2-used-to"/);
  assert.match(html, /<div data-grammar-embed="en-a2-used-to" data-grammar-embed-chrome="off"><\/div>/);
  assert.match(html, /href="https:\/\/cosylanguages\.github\.io\/COSYmanuals\/manuals\/en\/grammar\/a2\/topics\/used-to\.html"/);
  assert.match(html, /rel="noopener"/);
});

test('display "link" renders no embed mount', () => {
  const html = GF.renderHtml({ grammarId: 'en-a2-used-to', display: 'link' });
  assert.doesNotMatch(html, /data-grammar-embed=/);
  assert.match(html, /grammar-focus__link/);
});

test('invalid or missing ids render a harmless note and never throw', () => {
  for (const el of [{}, { grammarId: '' }, { grammarId: 'bad id' }, null, undefined]) {
    const html = GF.renderHtml(el);
    assert.match(html, /grammar-focus--invalid/);
    assert.doesNotMatch(html, /data-grammar-embed=/);
  }
});

test('titles and ids are HTML-escaped', () => {
  const html = GF.renderHtml({ grammarId: 'en-a1-adjectives', title: '<img src=x onerror=alert(1)>' });
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /&lt;img/);
  const bad = GF.renderHtml({ grammarId: '"><script>alert(1)</script>' });
  assert.doesNotMatch(bad, /<script/);
});

test('the escape function passed by the host page is used', () => {
  const html = GF.renderHtml({ grammarId: 'en-a1-adjectives', title: 'T' }, (s) => `[[${s}]]`);
  assert.match(html, /\[\[T\]\]/);
});

test('hydrate loads nothing when the slide has no grammar-focus', async () => {
  const dom = new JSDOM('<div id="r"><p>hi</p></div>');
  let called = 0;
  globalThis.COSYGrammarEmbed = { renderAll() { called++; } };
  await GF.hydrate(dom.window.document.getElementById('r'));
  assert.equal(called, 0);
  delete globalThis.COSYGrammarEmbed;
});

test('hydrate renders embeds inside the given root once the script is available', async () => {
  const dom = new JSDOM('<div id="r"></div>');
  const root = dom.window.document.getElementById('r');
  root.innerHTML = GF.renderHtml({ grammarId: 'en-a1-adjectives' });
  const seen = [];
  globalThis.COSYGrammarEmbed = { renderAll(scope) { seen.push(scope); } };
  await GF.hydrate(root);
  assert.deepEqual(seen, [root]);
  delete globalThis.COSYGrammarEmbed;
});

test('hydrate survives a failing embed script (fallback link stays)', async () => {
  const dom = new JSDOM('<div id="r"></div>');
  const root = dom.window.document.getElementById('r');
  root.innerHTML = GF.renderHtml({ grammarId: 'en-a1-adjectives' });
  delete globalThis.COSYGrammarEmbed;
  globalThis.CosyLazy = { load: () => Promise.reject(new Error('offline')) };
  const warn = console.warn; console.warn = () => {};
  try { await GF.hydrate(root); } finally { console.warn = warn; delete globalThis.CosyLazy; }
  assert.ok(root.querySelector('.grammar-focus__link'));
});

test('every grammarIds entry in the curricula is a well-formed id', () => {
  const base = path.join(__dirname, '..', 'curriculums');
  const files = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith('_')) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.json')) files.push(p);
    }
  })(base);
  let total = 0;
  const bad = [];
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    for (const u of d.units || []) for (const l of u.lessons || []) {
      for (const id of l.grammarIds || []) {
        total++;
        if (!GF.isValidId(id)) bad.push(`${path.relative(base, f)}: ${id}`);
      }
    }
  }
  assert.deepEqual(bad, []);
  assert.ok(total > 0, 'expected some grammarIds in the curricula');
});

test('every grammar-focus element in the lesson files has a well-formed id', () => {
  const base = path.join(__dirname, '..', 'lessons');
  let total = 0;
  const bad = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!e.name.endsWith('.json')) continue;
      let data;
      try { data = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { continue; }
      for (const s of (data && data.slides) || []) {
        for (const el of s.elements || []) {
          if (el.type !== 'grammar-focus') continue;
          total++;
          if (!GF.isValidId(el.grammarId)) bad.push(`${path.relative(base, p)}: ${el.grammarId}`);
        }
      }
    }
  })(base);
  assert.deepEqual(bad, []);
  assert.ok(total > 0, 'expected some grammar-focus elements in the lessons');
});
