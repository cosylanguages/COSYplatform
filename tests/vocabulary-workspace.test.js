'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'profile.html'), 'utf8');

const user = {
  id: 'student-1',
  email: 'ada@example.com',
  created_at: '2026-01-02T00:00:00Z',
  last_sign_in_at: '2026-11-24T10:00:00Z'
};

const profile = {
  id: user.id,
  role: 'student',
  display_name: 'Ada Lovelace',
  language_access: ['en', 'fr'],
  course_level: 'b1',
  created_at: user.created_at
};

function makeClient() {
  const rows = new Map();
  return {
    rows,
    from(table) {
      let deleteId = null;
      let deleting = false;
      const query = {
        select() { return query; },
        eq(key, value) {
          if (table === 'vocabulary_lists' && key === 'id') deleteId = value;
          return query;
        },
        or() { return query; },
        order() { return query; },
        limit() { return query; },
        in() { return query; },
        maybeSingle: async () => ({
          data: table === 'profiles' ? profile : null,
          error: null
        }),
        upsert: async (row) => {
          rows.set(row.id, row);
          return { data: [row], error: null };
        },
        delete() {
          deleting = true;
          return query;
        },
        then(resolve, reject) {
          if (table === 'vocabulary_lists') {
            if (deleting && deleteId) rows.delete(deleteId);
            deleting = false;
            deleteId = null;
            return Promise.resolve({ data: Array.from(rows.values()), error: null, count: rows.size }).then(resolve, reject);
          }
          return Promise.resolve({ data: [], error: null, count: 0 }).then(resolve, reject);
        }
      };
      return query;
    }
  };
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function submit(form) {
  form.dispatchEvent(new form.ownerDocument.defaultView.Event('submit', { bubbles: true, cancelable: true }));
}

test('student can create, practise and delete a personal vocabulary list', async () => {
  const client = makeClient();
  const dom = new JSDOM(html, {
    url: 'https://cosylanguages.github.io/COSYplatform/profile.html',
    runScripts: 'dangerously',
    beforeParse(window) {
      window.CosyAuth = {
        client,
        getAuthAndProfile: async () => ({ user, session: { user }, profile }),
        logout() {}
      };
    }
  });

  await wait(350);
  const document = dom.window.document;
  const nav = document.querySelector('#profile-nav-buttons [data-section="vocabulary"]');
  assert.ok(nav, 'vocabulary nav item exists');
  nav.click();
  await wait(80);

  assert.equal(document.getElementById('profile-content').hidden, false);
  assert.equal(document.querySelector('[data-section="vocabulary"]').hidden, false);
  assert.ok(document.querySelector('#vocab-lists .vocab-empty'), 'empty state is shown');

  document.getElementById('vocab-new-list').click();
  assert.equal(document.getElementById('vocab-dialog').hidden, false);
  const listForm = document.getElementById('vocab-list-form');
  listForm.elements.title.value = 'Travel essentials';
  submit(listForm);
  await wait(80);

  assert.equal(document.getElementById('vocab-dialog').hidden, true);
  assert.equal(document.getElementById('vocab-detail-view').hidden, false);
  assert.equal(document.getElementById('vocab-detail-title').textContent, 'Travel essentials');
  assert.equal(client.rows.size, 1, 'list is written through the client');

  document.getElementById('vocab-add-word').click();
  const wordForm = document.getElementById('vocab-word-form');
  wordForm.elements.term.value = 'layover';
  wordForm.elements.meaning.value = 'a short stop between flights';
  wordForm.elements.example.value = 'We had a three-hour layover in Istanbul.';
  submit(wordForm);
  await wait(80);

  assert.equal(document.querySelectorAll('#vocab-detail-words .vocab-word-row').length, 1);
  assert.match(document.getElementById('vocab-detail-words').textContent, /layover/);
  assert.match(document.getElementById('vocab-detail-words').textContent, /a short stop between flights/);
  assert.equal(client.rows.size, 1);
  assert.equal(Array.from(client.rows.values())[0].words.length, 1);

  document.querySelector('[data-vocab-action="edit-word"]').click();
  const editWordForm = document.getElementById('vocab-word-form');
  editWordForm.elements.meaning.value = 'a stop between connecting flights';
  submit(editWordForm);
  await wait(80);
  assert.match(document.getElementById('vocab-detail-words').textContent, /connecting flights/);

  document.getElementById('vocab-edit').click();
  const editListForm = document.getElementById('vocab-list-form');
  editListForm.elements.title.value = 'Travel words';
  submit(editListForm);
  await wait(80);
  assert.equal(document.getElementById('vocab-detail-title').textContent, 'Travel words');

  document.getElementById('vocab-practice').click();
  assert.equal(document.getElementById('vocab-practice-view').hidden, false);
  assert.equal(document.getElementById('vocab-practice-term').textContent, 'layover');
  document.getElementById('vocab-practice-reveal').click();
  assert.equal(document.getElementById('vocab-practice-answer').hidden, false);
  document.querySelector('[data-vocab-grade="known"]').click();
  assert.equal(document.getElementById('vocab-practice-summary').hidden, false);
  assert.match(document.getElementById('vocab-summary-title').textContent, /solid/);
  assert.match(document.getElementById('vocab-summary-copy').textContent, /the word/);

  document.getElementById('vocab-summary-back').click();
  assert.equal(document.getElementById('vocab-detail-view').hidden, false);

  document.querySelector('[data-vocab-action="delete-word"]').click();
  document.getElementById('vocab-confirm-delete').click();
  await wait(80);
  assert.match(document.getElementById('vocab-detail-words').textContent, /No words in this list yet/);
  assert.equal(Array.from(client.rows.values())[0].words.length, 0);

  document.getElementById('vocab-delete').click();
  document.getElementById('vocab-confirm-delete').click();
  await wait(80);

  assert.equal(document.getElementById('vocab-lists-view').hidden, false);
  assert.ok(document.querySelector('#vocab-lists .vocab-empty'), 'empty state returns after deletion');
  assert.equal(client.rows.size, 0, 'list is deleted through the client');

  dom.window.close();
});
