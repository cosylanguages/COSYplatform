(function () {
  'use strict';

  const DRAFT_PREFIX = 'cosy-lesson-studio:';
  const LESSON_PREFIX = 'studio:';
  const $ = (id) => document.getElementById(id);
  const state = {
    doc: {
      schemaVersion: 1,
      title: 'At the restaurant',
      language: 'English',
      level: 'A2',
      blocks: [
        { id: 'block-1', type: 'text', content: 'Today we will practise ordering food.' },
        { id: 'block-2', type: 'fill_blank', prompt: '___ a coffee, please.', answers: ["I'd like"] }
      ]
    },
    lessonId: null,
    codeValid: true,
    lastSaved: null
  };

  function makeId() {
    return 'block-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"]/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
    })[ch]);
  }

  function validateDocument(doc) {
    if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return 'Document must be a JSON object.';
    if (doc.schemaVersion !== 1) return 'schemaVersion must be 1.';
    if (typeof doc.title !== 'string' || !doc.title.trim()) return 'Add a lesson title.';
    if (typeof doc.language !== 'string' || !doc.language.trim()) return 'Add a language.';
    if (typeof doc.level !== 'string' || !doc.level.trim()) return 'Add a level.';
    if (!Array.isArray(doc.blocks)) return 'blocks must be an array.';
    for (let i = 0; i < doc.blocks.length; i++) {
      const block = doc.blocks[i];
      if (!block || typeof block !== 'object' || typeof block.id !== 'string') return 'Block ' + (i + 1) + ' needs an id.';
      if (block.type === 'text') {
        if (typeof block.content !== 'string') return 'Text block ' + (i + 1) + ' needs content.';
      } else if (block.type === 'fill_blank') {
        if (typeof block.prompt !== 'string') return 'Fill-in-the-blank block ' + (i + 1) + ' needs a prompt.';
        if (!Array.isArray(block.answers) || !block.answers.every((a) => typeof a === 'string')) return 'Answers for block ' + (i + 1) + ' must be a list of strings.';
      } else {
        return 'Block ' + (i + 1) + ' has unsupported type "' + String(block.type) + '".';
      }
    }
    return '';
  }

  function cloneDoc() {
    return JSON.parse(JSON.stringify(state.doc));
  }

  function syncCode() {
    $('lesson-json').value = JSON.stringify(state.doc, null, 2);
    $('code-error').textContent = '';
    state.codeValid = true;
  }

  function renderVisual() {
    const host = $('block-list');
    host.innerHTML = '';
    if (!state.doc.blocks.length) {
      const empty = document.createElement('p');
      empty.className = 'studio-empty';
      empty.textContent = 'No blocks yet. Add a text block or a fill-in-the-blank activity.';
      host.appendChild(empty);
      return;
    }
    state.doc.blocks.forEach((block, index) => {
      const card = document.createElement('article');
      card.className = 'studio-block-card';
      const head = document.createElement('div');
      head.className = 'studio-block-head';
      const name = document.createElement('strong');
      name.textContent = (index + 1) + '. ' + (block.type === 'text' ? 'Text' : 'Fill-in-the-blank');
      const controls = document.createElement('div');
      controls.className = 'studio-block-controls';
      const up = document.createElement('button');
      up.type = 'button'; up.textContent = '↑'; up.title = 'Move block up'; up.disabled = index === 0;
      up.addEventListener('click', () => moveBlock(index, -1));
      const down = document.createElement('button');
      down.type = 'button'; down.textContent = '↓'; down.title = 'Move block down'; down.disabled = index === state.doc.blocks.length - 1;
      down.addEventListener('click', () => moveBlock(index, 1));
      const remove = document.createElement('button');
      remove.type = 'button'; remove.textContent = '×'; remove.title = 'Remove block';
      remove.addEventListener('click', () => { state.doc.blocks.splice(index, 1); changed(); });
      controls.append(up, down, remove);
      head.append(name, controls);
      card.appendChild(head);

      const field = document.createElement('label');
      field.className = 'studio-field';
      const label = document.createElement('span');
      label.textContent = block.type === 'text' ? 'Text content' : 'Sentence / prompt';
      const input = block.type === 'text' ? document.createElement('textarea') : document.createElement('input');
      input.value = block.type === 'text' ? block.content : block.prompt;
      input.rows = 3;
      input.addEventListener('input', () => {
        if (block.type === 'text') block.content = input.value;
        else block.prompt = input.value;
        changed(false);
      });
      field.append(label, input);
      card.appendChild(field);

      if (block.type === 'fill_blank') {
        const answerField = document.createElement('label');
        answerField.className = 'studio-field';
        const answerLabel = document.createElement('span');
        answerLabel.textContent = 'Accepted answers (separate alternatives with |)';
        const answerInput = document.createElement('input');
        answerInput.value = block.answers.join(' | ');
        answerInput.addEventListener('input', () => {
          block.answers = answerInput.value.split('|').map((a) => a.trim()).filter(Boolean);
          changed(false);
        });
        answerField.append(answerLabel, answerInput);
        card.appendChild(answerField);
      }
      host.appendChild(card);
    });
  }

  function renderPreview() {
    const host = $('lesson-preview');
    host.replaceChildren();
    const title = document.createElement('h3');
    title.textContent = state.doc.title || 'Untitled lesson';
    host.appendChild(title);
    const meta = document.createElement('p');
    meta.className = 'preview-meta';
    meta.textContent = [state.doc.language, state.doc.level].filter(Boolean).join(' · ');
    host.appendChild(meta);
    state.doc.blocks.forEach((block, index) => {
      const item = document.createElement('section');
      item.className = 'preview-block';
      const number = document.createElement('span');
      number.className = 'preview-block-number';
      number.textContent = String(index + 1).padStart(2, '0');
      item.appendChild(number);
      if (block.type === 'text') {
        const p = document.createElement('p');
        p.textContent = block.content;
        item.appendChild(p);
      } else if (block.type === 'fill_blank') {
        const p = document.createElement('p');
        p.textContent = block.prompt;
        item.appendChild(p);
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Type your answer…';
        input.setAttribute('aria-label', 'Preview answer for activity ' + (index + 1));
        item.appendChild(input);
      }
      host.appendChild(item);
    });
    if (!state.doc.blocks.length) {
      const p = document.createElement('p');
      p.className = 'studio-empty';
      p.textContent = 'Your lesson preview will appear here.';
      host.appendChild(p);
    }
  }

  function changed(updateCode) {
    state.doc.title = $('lesson-title').value;
    state.doc.language = $('lesson-language').value;
    state.doc.level = $('lesson-level').value;
    if (updateCode !== false) syncCode();
    renderVisual();
    renderPreview();
    $('save-status').textContent = 'Unsaved changes';
  }

  function moveBlock(index, delta) {
    const next = index + delta;
    if (next < 0 || next >= state.doc.blocks.length) return;
    const [block] = state.doc.blocks.splice(index, 1);
    state.doc.blocks.splice(next, 0, block);
    changed();
  }

  function setMode(mode) {
    if (mode === 'visual' && !state.codeValid) {
      $('code-error').textContent = 'Fix the JSON error before switching to Visual.';
      return;
    }
    $('visual-editor').hidden = mode !== 'visual';
    $('code-editor').hidden = mode !== 'code';
    document.querySelectorAll('.studio-mode').forEach((button) => {
      const active = button.dataset.mode === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (mode === 'code') syncCode();
  }

  async function checkAccess() {
    if (!window.CosyAuthoring || typeof window.CosyAuthoring.canAuthor !== 'function') {
      throw new Error('Authoring access could not be verified. Please return to the teacher workspace.');
    }
    const allowed = await window.CosyAuthoring.canAuthor('teacher');
    if (!allowed) throw new Error('Only an authorized teacher or founder can open Lesson Studio.');
  }

  function storageKey() {
    return DRAFT_PREFIX + state.lessonId;
  }

  async function loadDraft(id) {
    state.lessonId = id;
    let saved = null;
    try {
      const local = localStorage.getItem(storageKey());
      if (local) saved = JSON.parse(local);
    } catch (e) { /* ignore malformed local draft */ }

    const client = window.CosyAuth ? window.CosyAuth.client : null;
    if (client && id) {
      try {
        const { data, error } = await client.from('lesson_content').select('xml_content').eq('lesson_id', id).maybeSingle();
        if (!error && data && typeof data.xml_content === 'string') {
          const remote = JSON.parse(data.xml_content);
          if (!validateDocument(remote)) saved = remote;
        }
      } catch (e) { /* a missing remote draft is normal */ }
    }
    if (saved && !validateDocument(saved)) state.doc = saved;
    $('lesson-title').value = state.doc.title;
    $('lesson-language').value = state.doc.language;
    $('lesson-level').value = state.doc.level;
    syncCode();
    renderVisual();
    renderPreview();
    $('save-status').textContent = saved ? 'Draft loaded' : 'New draft';
  }

  async function saveDraft() {
    const doc = cloneDoc();
    doc.title = $('lesson-title').value.trim();
    doc.language = $('lesson-language').value;
    doc.level = $('lesson-level').value;
    const error = validateDocument(doc);
    if (error) {
      $('save-status').textContent = error;
      return;
    }
    state.doc = doc;
    const serialized = JSON.stringify(doc);
    try { localStorage.setItem(storageKey(), serialized); } catch (e) { /* browser storage may be disabled */ }
    const client = window.CosyAuth ? window.CosyAuth.client : null;
    if (!client) {
      $('save-status').textContent = 'Saved locally only (Supabase is not connected)';
      return;
    }
    try {
      if (window.CosyLessons && typeof window.CosyLessons.saveLessonToSupabase === 'function') {
        await window.CosyLessons.saveLessonToSupabase({
          lesson_id: state.lessonId,
          title: doc.title,
          language: doc.language,
          level: doc.level,
          template_type: 'cosy-lesson-studio-v1',
          xml_content: serialized
        });
      } else {
        const { error: saveError } = await client.from('lesson_content').upsert({
          lesson_id: state.lessonId,
          xml_content: serialized,
          updated_at: new Date().toISOString()
        }, { onConflict: 'lesson_id' });
        if (saveError) throw saveError;
      }
      $('save-status').textContent = 'Draft saved';
    } catch (error) {
      $('save-status').textContent = 'Saved locally; cloud save failed: ' + (error.message || 'unknown error');
    }
  }

  function setup() {
    $('lesson-title').addEventListener('input', () => changed());
    $('lesson-language').addEventListener('change', () => changed());
    $('lesson-level').addEventListener('change', () => changed());
    document.querySelectorAll('.studio-mode').forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode)));
    $('lesson-json').addEventListener('input', () => {
      try {
        const parsed = JSON.parse($('lesson-json').value);
        const validation = validateDocument(parsed);
        if (validation) throw new Error(validation);
        state.doc = parsed;
        $('code-error').textContent = '';
        state.codeValid = true;
        $('lesson-title').value = parsed.title;
        $('lesson-language').value = parsed.language;
        $('lesson-level').value = parsed.level;
        renderVisual();
        renderPreview();
        $('save-status').textContent = 'Unsaved changes';
      } catch (error) {
        state.codeValid = false;
        $('code-error').textContent = error.message;
      }
    });
    $('add-text').addEventListener('click', () => {
      state.doc.blocks.push({ id: makeId(), type: 'text', content: 'Write your lesson text here.' });
      changed();
    });
    $('add-blank').addEventListener('click', () => {
      state.doc.blocks.push({ id: makeId(), type: 'fill_blank', prompt: 'Complete the sentence: ___', answers: ['answer'] });
      changed();
    });
    $('save-button').addEventListener('click', saveDraft);
    $('preview-button').addEventListener('click', () => {
      renderPreview();
      $('lesson-preview').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  async function init() {
    setup();
    try {
      await checkAccess();
      const params = new URLSearchParams(window.location.search);
      const requestedId = params.get('lesson');
      state.lessonId = requestedId && requestedId.startsWith(LESSON_PREFIX) ? requestedId : LESSON_PREFIX + (crypto.randomUUID ? crypto.randomUUID() : makeId());
      await loadDraft(state.lessonId);
      if (!requestedId) history.replaceState(null, '', window.location.pathname + '?lesson=' + encodeURIComponent(state.lessonId));
    } catch (error) {
      document.querySelector('.studio-shell').innerHTML = '<section class="studio-access-denied"><h1>Lesson Studio unavailable</h1><p>' + escapeHtml(error.message) + '</p><a href="teacher.html">Return to teacher workspace</a></section>';
      $('save-button').disabled = true;
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();