const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

const Picker = require('../shared/js/grammar-picker.js');

const points = [
  { id: 'en-a1-adjectives', lang: 'en', level: 'a1', slug: 'adjectives', title: 'Adjectives', subtitle: 'Describing words' },
  { id: 'en-a2-used-to', lang: 'en', level: 'a2', slug: 'used-to', title: 'Used to', subtitle: 'Past habits and states' },
  { id: 'en-a2-past-simple', lang: 'en', level: 'a2', slug: 'past-simple', title: 'Past simple', subtitle: 'Finished actions' },
  { id: 'fr-a1-passe-compose', lang: 'fr', level: 'a1', slug: 'passe-compose', title: 'Passé composé', subtitle: 'Actions terminées' },
  { id: 'fr-b1-subjonctif', lang: 'fr', level: 'b1', slug: 'subjonctif', title: 'Subjonctif', subtitle: 'Doubt and emotion' },
  { id: 'de-a1-artikel', lang: 'de', level: 'a1', slug: 'artikel', title: 'Artikel', subtitle: 'Der, die, das' }
];

function withDocument(run) {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  const previous = global.document;
  global.document = dom.window.document;
  try {
    return run(dom);
  } finally {
    global.document = previous;
  }
}

test('languageCode accepts codes and display names', () => {
  assert.equal(Picker.languageCode('English'), 'en');
  assert.equal(Picker.languageCode('French'), 'fr');
  assert.equal(Picker.languageCode('fr'), 'fr');
  assert.equal(Picker.languageCode('Russian'), 'ru');
  assert.equal(Picker.languageCode('Other'), 'other');
});

test('filterPoints filters by language and CEFR level', () => {
  const ids = Picker.filterPoints(points, { language: 'English', level: 'A2' }).map((point) => point.id);
  assert.deepEqual(ids.sort(), ['en-a2-past-simple', 'en-a2-used-to']);
});

test('filterPoints ignores accents and matches title, subtitle, slug and id', () => {
  const accented = Picker.filterPoints(points, { language: 'French', level: 'A1', query: 'passe compose' });
  assert.equal(accented.length, 1);
  assert.equal(accented[0].id, 'fr-a1-passe-compose');

  assert.equal(Picker.filterPoints(points, { query: 'actions' })[0].id, 'fr-a1-passe-compose');
  assert.equal(Picker.filterPoints(points, { query: 'en-a2-used-to' })[0].id, 'en-a2-used-to');
  assert.equal(Picker.filterPoints(points, { query: 'past-simple' })[0].id, 'en-a2-past-simple');
});

test('filterPoints ranks an exact id and a title prefix above a subtitle match', () => {
  assert.equal(Picker.filterPoints(points, { query: 'en-a2-used-to' })[0].id, 'en-a2-used-to');
  assert.equal(Picker.filterPoints(points, { query: 'used' })[0].id, 'en-a2-used-to');
  assert.equal(Picker.filterPoints(points, { query: 'past' })[0].id, 'en-a2-past-simple');
});

test('createPicker defaults to the lesson language and level, then filters the list', () => {
  withDocument((dom) => {
    const root = Picker.createPicker({ points, language: 'English', level: 'A2' });
    assert.equal(root.querySelector('[data-grammar-language]').value, 'en');
    assert.equal(root.querySelector('[data-grammar-level]').value, 'a2');

    const ids = Array.from(root.querySelectorAll('[data-grammar-id]')).map((button) => button.dataset.grammarId);
    assert.deepEqual(ids.sort(), ['en-a2-past-simple', 'en-a2-used-to']);

    const search = root.querySelector('[data-grammar-search]');
    search.value = 'used';
    search.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    assert.equal(root.querySelectorAll('[data-grammar-id]').length, 1);
    assert.equal(root.querySelector('[data-grammar-id]').dataset.grammarId, 'en-a2-used-to');
  });
});

test('createPicker selects a grammar point and shows it above the results', () => {
  withDocument((dom) => {
    let chosen = null;
    const root = Picker.createPicker({
      points,
      language: 'English',
      level: 'A2',
      onSelect: (point) => { chosen = point; }
    });

    root.querySelector('[data-grammar-id="en-a2-used-to"]').click();
    assert.equal(chosen.id, 'en-a2-used-to');
    assert.match(root.querySelector('[data-grammar-selected]').textContent, /Used to/);
    assert.equal(root.querySelector('[data-grammar-id="en-a2-used-to"]').getAttribute('aria-pressed'), 'true');
    assert.match(root.querySelector('[data-grammar-selected] a').href, /manuals\/en\/grammar\/a2\/topics\/used-to\.html$/);
  });
});

test('createPicker falls back to all languages and levels when the lesson values do not exist', () => {
  withDocument(() => {
    const root = Picker.createPicker({ points, language: 'Other', level: 'A0' });
    assert.equal(root.querySelector('[data-grammar-language]').value, 'all');
    assert.equal(root.querySelector('[data-grammar-level]').value, 'all');
    assert.equal(root.querySelectorAll('[data-grammar-id]').length, points.length);
  });
});

test('createPicker loads the registry when no points are supplied', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  const previous = global.document;
  global.document = dom.window.document;
  try {
    const root = Picker.createPicker({ language: 'English', level: 'A2', loadRegistry: async () => points });
    assert.match(root.querySelector('[data-grammar-status]').textContent, /Loading grammar points/);
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(root.querySelector('[data-grammar-level]').value, 'a2');
    assert.deepEqual(
      Array.from(root.querySelectorAll('[data-grammar-id]')).map((button) => button.dataset.grammarId).sort(),
      ['en-a2-past-simple', 'en-a2-used-to']
    );
  } finally {
    global.document = previous;
  }
});

test('createPicker flags a selected id that is not in the registry', () => {
  withDocument(() => {
    const root = Picker.createPicker({ points, selectedId: 'xx-a1-missing' });
    assert.match(root.querySelector('[data-grammar-selected]').textContent, /not in the grammar registry/i);
    assert.match(root.querySelector('[data-grammar-selected] a').href, /manuals\/xx\/grammar\/a1\/topics\/missing\.html$/);
  });
});
