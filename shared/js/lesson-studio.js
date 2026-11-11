/**
 * @typedef {Object} LessonStudioBlock
 * @property {string} id - Unique block identifier
 * @property {('text'|'fill_blank')} type - Block interaction type
 * @property {string} [content] - Text content for text blocks
 * @property {string} [prompt] - Prompt or sentence with blank for fill_blank blocks
 * @property {string[]} [answers] - Accepted answer alternatives for fill_blank blocks
 */

/**
 * @typedef {Object} LessonStudioDocument
 * @property {number} schemaVersion - Schema version (must be 1)
 * @property {string} title - Lesson title
 * @property {string} language - Target language name or code
 * @property {string} level - CEFR level (A0-C2)
 * @property {LessonStudioBlock[]} blocks - Sequential activity blocks
 */

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
    lastSaved: null,
    publishedLessonId: null
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
      } else if (block.type === 'vocab_list') {
        if (!Array.isArray(block.items)) return 'Vocabulary block ' + (i + 1) + ' needs an items array.';
      } else if (block.type === 'quiz') {
        if (typeof block.question !== 'string') return 'Quiz block ' + (i + 1) + ' needs a question.';
        if (!Array.isArray(block.options)) return 'Quiz block ' + (i + 1) + ' needs options.';
      } else if (block.type === 'discussion') {
        if (!Array.isArray(block.prompts)) return 'Discussion block ' + (i + 1) + ' needs prompts.';
      } else if (block.type === 'essay') {
        if (typeof block.prompt !== 'string') return 'Writing block ' + (i + 1) + ' needs a prompt.';
      } else if (block.type === 'correction') {
        if (!Array.isArray(block.pairs)) return 'Correction block ' + (i + 1) + ' needs pairs.';
      } else if (block.type === 'matching') {
        if (!Array.isArray(block.pairs)) return 'Matching block ' + (i + 1) + ' needs pairs.';
      } else {
        return 'Block ' + (i + 1) + ' has unsupported type "' + String(block.type) + '".';
      }
    }
    return '';
  }

  /**
   * Stricter than validateDocument: what the server requires to publish.
   * Drafts may be saved half-finished, so this runs only when publishing.
   * Returns '' when the lesson can be published, else a message for the teacher.
   */
  function validateForPublish(doc) {
    const base = validateDocument(doc);
    if (base) return base;
    if (!doc.blocks.length) return 'Add at least one block before publishing.';
    for (let i = 0; i < doc.blocks.length; i++) {
      const block = doc.blocks[i];
      const n = i + 1;
      if (block.type === 'quiz') {
        if (!block.options.every((o) => typeof o === 'string')) return 'Quiz block ' + n + ' options must be text.';
        if (typeof block.answer !== 'string' || block.options.indexOf(block.answer) === -1) {
          return 'Quiz block ' + n + ' needs a correct answer chosen from its options.';
        }
      } else if (block.type === 'vocab_list') {
        if (!block.items.every((it) => it && typeof it.word === 'string' && it.word.trim())) return 'Every vocabulary item in block ' + n + ' needs a word.';
      } else if (block.type === 'correction') {
        if (!block.pairs.every((pr) => pr && typeof pr.incorrect === 'string' && typeof pr.correct === 'string')) {
          return 'Every pair in correction block ' + n + ' needs an incorrect and a correct sentence.';
        }
      } else if (block.type === 'discussion') {
        if (!block.prompts.every((pr) => typeof pr === 'string')) return 'Discussion block ' + n + ' prompts must be text.';
      } else if (block.type === 'matching') {
        if (block.pairs.length < 2) return 'Matching block ' + n + ' needs at least two pairs.';
        if (!block.pairs.every((pr) => pr && typeof pr.left === 'string' && pr.left.trim() && typeof pr.right === 'string' && pr.right.trim())) {
          return 'Every pair in matching block ' + n + ' needs a left and a right item.';
        }
        const rights = block.pairs.map((pr) => pr.right.trim().toLowerCase());
        if (new Set(rights).size !== rights.length) return 'Matching block ' + n + ' has the same right-hand item twice, so the pairing would be ambiguous.';
      }
    }
    return '';
  }

  function isValidDocument(doc) {
    return validateDocument(doc) === '';
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
    const typeLabels = {
      text: 'Text',
      fill_blank: 'Fill-in-the-blank',
      vocab_list: 'Vocabulary Set',
      quiz: 'Multiple Choice Quiz',
      discussion: 'Discussion Prompts',
      essay: 'Writing / Essay Task',
      correction: 'Error Correction',
      matching: 'Matching'
    };

    state.doc.blocks.forEach((block, index) => {
      const card = document.createElement('article');
      card.className = 'studio-block-card';
      card.setAttribute('data-type', block.type);
      const head = document.createElement('div');
      head.className = 'studio-block-head';
      const name = document.createElement('strong');
      name.textContent = (index + 1) + '. ' + (typeLabels[block.type] || block.type);
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

      if (block.type === 'text') {
        const field = document.createElement('label');
        field.className = 'studio-field';
        const label = document.createElement('span');
        label.textContent = 'Text content';
        const input = document.createElement('textarea');
        input.value = block.content || '';
        input.rows = 3;
        input.addEventListener('input', () => { block.content = input.value; changed(false); });
        field.append(label, input);
        card.appendChild(field);
      } else if (block.type === 'fill_blank') {
        const field = document.createElement('label');
        field.className = 'studio-field';
        const label = document.createElement('span');
        label.textContent = 'Sentence / prompt (use ___ for blank)';
        const input = document.createElement('input');
        input.value = block.prompt || '';
        input.addEventListener('input', () => { block.prompt = input.value; changed(false); });
        field.append(label, input);
        card.appendChild(field);

        const answerField = document.createElement('label');
        answerField.className = 'studio-field';
        const answerLabel = document.createElement('span');
        answerLabel.textContent = 'Accepted answers (separate alternatives with |)';
        const answerInput = document.createElement('input');
        answerInput.value = (block.answers || []).join(' | ');
        answerInput.addEventListener('input', () => {
          block.answers = answerInput.value.split('|').map((a) => a.trim()).filter(Boolean);
          changed(false);
        });
        answerField.append(answerLabel, answerInput);
        card.appendChild(answerField);
      } else if (block.type === 'vocab_list') {
        block.items = block.items || [];
        const container = document.createElement('div');
        container.className = 'studio-field';
        const label = document.createElement('span');
        label.textContent = 'Target Words (Word | Definition | Example)';
        container.appendChild(label);

        block.items.forEach((item, itemIdx) => {
          const row = document.createElement('div');
          row.className = 'studio-item-row';
          const wInput = document.createElement('input');
          wInput.placeholder = 'Word';
          wInput.value = item.word || '';
          wInput.addEventListener('input', () => { item.word = wInput.value; changed(false); });
          const dInput = document.createElement('input');
          dInput.placeholder = 'Definition';
          dInput.value = item.definition || '';
          dInput.addEventListener('input', () => { item.definition = dInput.value; changed(false); });
          const eInput = document.createElement('input');
          eInput.placeholder = 'Example';
          eInput.value = item.example || '';
          eInput.addEventListener('input', () => { item.example = eInput.value; changed(false); });
          const delBtn = document.createElement('button');
          delBtn.className = 'studio-mini-btn';
          delBtn.textContent = '×';
          delBtn.addEventListener('click', () => { block.items.splice(itemIdx, 1); changed(); });
          row.append(wInput, dInput, eInput, delBtn);
          container.appendChild(row);
        });

        const addBtn = document.createElement('button');
        addBtn.className = 'studio-mini-btn';
        addBtn.type = 'button';
        addBtn.textContent = '＋ Add Word';
        addBtn.addEventListener('click', () => { block.items.push({ word: '', definition: '', example: '' }); changed(); });
        container.appendChild(addBtn);
        card.appendChild(container);
      } else if (block.type === 'quiz') {
        block.options = block.options || [];
        const qField = document.createElement('label');
        qField.className = 'studio-field';
        const qLabel = document.createElement('span');
        qLabel.textContent = 'Question Prompt';
        const qInput = document.createElement('input');
        qInput.value = block.question || '';
        qInput.addEventListener('input', () => { block.question = qInput.value; changed(false); });
        qField.append(qLabel, qInput);
        card.appendChild(qField);

        const optContainer = document.createElement('div');
        optContainer.className = 'studio-field';
        const optLabel = document.createElement('span');
        optLabel.textContent = 'Options (select radio for correct answer)';
        optContainer.appendChild(optLabel);

        block.options.forEach((opt, optIdx) => {
          const row = document.createElement('div');
          row.className = 'studio-item-row';
          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = `quiz_${index}_correct`;
          radio.checked = block.answer === opt;
          radio.addEventListener('change', () => { block.answer = opt; changed(false); });
          const oInput = document.createElement('input');
          oInput.value = opt;
          oInput.addEventListener('input', () => {
            const wasCorrect = block.answer === block.options[optIdx];
            block.options[optIdx] = oInput.value;
            if (wasCorrect) block.answer = oInput.value;
            changed(false);
          });
          const delBtn = document.createElement('button');
          delBtn.className = 'studio-mini-btn';
          delBtn.textContent = '×';
          delBtn.addEventListener('click', () => { block.options.splice(optIdx, 1); changed(); });
          row.append(radio, oInput, delBtn);
          optContainer.appendChild(row);
        });

        const addOptBtn = document.createElement('button');
        addOptBtn.className = 'studio-mini-btn';
        addOptBtn.type = 'button';
        addOptBtn.textContent = '＋ Add Option';
        addOptBtn.addEventListener('click', () => { block.options.push('Option'); changed(); });
        optContainer.appendChild(addOptBtn);
        card.appendChild(optContainer);
      } else if (block.type === 'discussion') {
        block.prompts = block.prompts || [];
        const container = document.createElement('div');
        container.className = 'studio-field';
        const label = document.createElement('span');
        label.textContent = 'Speaking / Discussion Prompts';
        container.appendChild(label);

        block.prompts.forEach((prompt, pIdx) => {
          const row = document.createElement('div');
          row.className = 'studio-item-row';
          const pInput = document.createElement('input');
          pInput.value = prompt;
          pInput.addEventListener('input', () => { block.prompts[pIdx] = pInput.value; changed(false); });
          const delBtn = document.createElement('button');
          delBtn.className = 'studio-mini-btn';
          delBtn.textContent = '×';
          delBtn.addEventListener('click', () => { block.prompts.splice(pIdx, 1); changed(); });
          row.append(pInput, delBtn);
          container.appendChild(row);
        });

        const addPromptBtn = document.createElement('button');
        addPromptBtn.className = 'studio-mini-btn';
        addPromptBtn.type = 'button';
        addPromptBtn.textContent = '＋ Add Discussion Prompt';
        addPromptBtn.addEventListener('click', () => { block.prompts.push('Discuss...'); changed(); });
        container.appendChild(addPromptBtn);
        card.appendChild(container);
      } else if (block.type === 'essay') {
        const field = document.createElement('label');
        field.className = 'studio-field';
        const label = document.createElement('span');
        label.textContent = 'Writing Task Instructions / Prompt';
        const input = document.createElement('textarea');
        input.value = block.prompt || '';
        input.rows = 3;
        input.addEventListener('input', () => { block.prompt = input.value; changed(false); });
        field.append(label, input);
        card.appendChild(field);
      } else if (block.type === 'correction') {
        block.pairs = block.pairs || [];
        const container = document.createElement('div');
        container.className = 'studio-field';
        const label = document.createElement('span');
        label.textContent = 'Linguistic Pitfall Pairs (Incorrect ➔ Correct & Note)';
        container.appendChild(label);

        block.pairs.forEach((pair, pairIdx) => {
          const row = document.createElement('div');
          row.className = 'studio-item-row';
          const wrongInput = document.createElement('input');
          wrongInput.placeholder = '❌ Incorrect expression';
          wrongInput.value = pair.incorrect || '';
          wrongInput.addEventListener('input', () => { pair.incorrect = wrongInput.value; changed(false); });
          const arrow = document.createElement('span');
          arrow.textContent = '➔';
          const rightInput = document.createElement('input');
          rightInput.placeholder = '✔️ Correct expression';
          rightInput.value = pair.correct || '';
          rightInput.addEventListener('input', () => { pair.correct = rightInput.value; changed(false); });
          const delBtn = document.createElement('button');
          delBtn.className = 'studio-mini-btn';
          delBtn.textContent = '×';
          delBtn.addEventListener('click', () => { block.pairs.splice(pairIdx, 1); changed(); });
          row.append(wrongInput, arrow, rightInput, delBtn);
          container.appendChild(row);
        });

        const addPairBtn = document.createElement('button');
        addPairBtn.className = 'studio-mini-btn';
        addPairBtn.type = 'button';
        addPairBtn.textContent = '＋ Add Error Pair';
        addPairBtn.addEventListener('click', () => { block.pairs.push({ incorrect: '', correct: '' }); changed(); });
        container.appendChild(addPairBtn);
        card.appendChild(container);
      } else if (block.type === 'matching') {
        block.pairs = block.pairs || [];
        const intro = document.createElement('div');
        intro.className = 'studio-field';
        const introLabel = document.createElement('span');
        introLabel.textContent = 'Instructions (optional)';
        const introInput = document.createElement('input');
        introInput.value = block.instructions || '';
        introInput.placeholder = 'Match each country to its capital.';
        introInput.addEventListener('input', () => { block.instructions = introInput.value; changed(false); });
        intro.append(introLabel, introInput);
        card.appendChild(intro);

        const container = document.createElement('div');
        container.className = 'studio-field';
        const label = document.createElement('span');
        label.textContent = 'Pairs (Item ➔ Its match). Students see the matches shuffled.';
        container.appendChild(label);
        block.pairs.forEach((pair, pairIdx) => {
          const row = document.createElement('div');
          row.className = 'studio-item-row';
          const leftInput = document.createElement('input');
          leftInput.placeholder = 'Item';
          leftInput.value = pair.left || '';
          leftInput.addEventListener('input', () => { pair.left = leftInput.value; changed(false); });
          const arrow = document.createElement('span');
          arrow.textContent = '➔';
          const rightInput = document.createElement('input');
          rightInput.placeholder = 'Its match';
          rightInput.value = pair.right || '';
          rightInput.addEventListener('input', () => { pair.right = rightInput.value; changed(false); });
          const delBtn = document.createElement('button');
          delBtn.className = 'studio-mini-btn';
          delBtn.type = 'button';
          delBtn.textContent = '×';
          delBtn.addEventListener('click', () => { block.pairs.splice(pairIdx, 1); changed(); });
          row.append(leftInput, arrow, rightInput, delBtn);
          container.appendChild(row);
        });
        const addMatchBtn = document.createElement('button');
        addMatchBtn.className = 'studio-mini-btn';
        addMatchBtn.type = 'button';
        addMatchBtn.textContent = '＋ Add Pair';
        addMatchBtn.addEventListener('click', () => { block.pairs.push({ left: '', right: '' }); changed(); });
        container.appendChild(addMatchBtn);
        card.appendChild(container);
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
      } else if (block.type === 'vocab_list') {
        const grid = document.createElement('div');
        grid.className = 'vocab-grid';
        (block.items || []).forEach(v => {
          const card = document.createElement('div');
          card.className = 'vocab-card';
          card.innerHTML = `
            <div class="vocab-word-badge"><span class="vocab-icon">📖</span> ${escapeHtml(v.word || 'Word')}</div>
            ${v.definition ? `<div class="vocab-def">${escapeHtml(v.definition)}</div>` : ''}
            ${v.example ? `<div class="vocab-example">“${escapeHtml(v.example)}”</div>` : ''}
          `;
          grid.appendChild(card);
        });
        item.appendChild(grid);
      } else if (block.type === 'quiz') {
        const p = document.createElement('p');
        p.style.fontWeight = '700';
        p.textContent = block.question || 'Quiz question:';
        item.appendChild(p);
        const optList = document.createElement('div');
        optList.style.display = 'flex';
        optList.style.flexDirection = 'column';
        optList.style.gap = '6px';
        (block.options || []).forEach(opt => {
          const label = document.createElement('label');
          label.style.display = 'flex';
          label.style.alignItems = 'center';
          label.style.gap = '8px';
          label.style.fontSize = '0.95rem';
          label.innerHTML = `<input type="radio" name="preview_quiz_${index}" /> ${escapeHtml(opt)}`;
          optList.appendChild(label);
        });
        item.appendChild(optList);
      } else if (block.type === 'discussion') {
        const list = document.createElement('div');
        list.className = 'discussion-list';
        (block.prompts || []).forEach((prompt, pIdx) => {
          const row = document.createElement('div');
          row.className = 'discussion-item';
          row.innerHTML = `
            <span class="discussion-num">${pIdx + 1}</span>
            <span class="discussion-text">${escapeHtml(prompt)}</span>
          `;
          list.appendChild(row);
        });
        item.appendChild(list);
      } else if (block.type === 'essay') {
        const p = document.createElement('p');
        p.style.fontWeight = '600';
        p.textContent = block.prompt || 'Writing challenge:';
        item.appendChild(p);
        const box = document.createElement('div');
        box.className = 'modern-essay-box';
        box.innerHTML = `
          <div class="modern-essay-label">✍️ Your Written Response</div>
          <textarea class="modern-essay-textarea" placeholder="Draft your answer here..."></textarea>
        `;
        item.appendChild(box);
      } else if (block.type === 'correction') {
        const list = document.createElement('div');
        list.className = 'correction-list';
        (block.pairs || []).forEach(pair => {
          const card = document.createElement('div');
          card.className = 'correction-card';
          card.innerHTML = `
            <span class="correction-wrong">❌ ${escapeHtml(pair.incorrect || '')}</span>
            <span class="correction-arrow">➔</span>
            <span class="correction-right">✔️ ${escapeHtml(pair.correct || '')}</span>
          `;
          list.appendChild(card);
        });
        item.appendChild(list);
      } else if (block.type === 'matching') {
        const note = document.createElement('p');
        note.className = 'studio-hint';
        note.textContent = (block.instructions || 'Match each item with its pair.');
        item.appendChild(note);
        const rows = (block.pairs || []).map((pair) => ({ left: pair.left || '', right: pair.right || '' }));
        const bank = document.createElement('p');
        bank.textContent = 'Choose from: ' + rows.map((r) => r.right).filter(Boolean).sort((a, b) => a.localeCompare(b)).join(' · ');
        item.appendChild(bank);
        rows.forEach((r) => {
          const line = document.createElement('div');
          line.className = 'correction-card';
          const left = document.createElement('span');
          left.textContent = r.left;
          const input = document.createElement('input');
          input.placeholder = 'Type the matching item...';
          line.append(left, input);
          item.appendChild(line);
        });
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

    const client = window.CosyAuth ? window.CosyAuth.getSupabaseClient() : null;
    if (client && id) {
      try {
        const { data, error } = await client.from('lesson_studio_drafts').select('document').eq('id', id).maybeSingle();
        if (!saved && !error && data && data.document && typeof data.document === 'object') {
          const remote = data.document;
          if (isValidDocument(remote)) saved = remote;
        }
      } catch (e) { /* a missing remote draft is normal */ }
    }
    if (saved && isValidDocument(saved)) state.doc = saved;
    $('lesson-title').value = state.doc.title;
    $('lesson-language').value = state.doc.language;
    $('lesson-level').value = state.doc.level;
    syncCode();
    renderVisual();
    renderPreview();
    $('save-status').textContent = saved ? 'Draft loaded' : 'New draft';
  }

  async function saveDraft() {
    if (!state.codeValid) {
      $('save-status').textContent = 'Fix the JSON error before saving.';
      $('code-error').textContent = 'Fix the JSON error before saving.';
      return false;
    }
    const doc = cloneDoc();
    doc.title = $('lesson-title').value.trim();
    doc.language = $('lesson-language').value;
    doc.level = $('lesson-level').value;
    const error = validateDocument(doc);
    if (error) {
      $('save-status').textContent = error;
      return false;
    }
    state.doc = doc;
    const serialized = JSON.stringify(doc);
    try { localStorage.setItem(storageKey(), serialized); } catch (e) { /* browser storage may be disabled */ }
    const client = window.CosyAuth ? window.CosyAuth.client : null;
    if (!client) {
      $('save-status').textContent = 'Saved locally only (Supabase is not connected)';
      return false;
    }
    try {
      const { data: authData, error: authError } = await client.auth.getUser();
      if (authError || !authData || !authData.user) throw new Error('Could not verify your signed-in account.');
      const { error: saveError } = await client.from('lesson_studio_drafts').upsert({
        id: state.lessonId,
        owner_id: authData.user.id,
        title: doc.title,
        language: doc.language,
        level: doc.level,
        document: doc,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      if (saveError) throw saveError;
      $('save-status').textContent = 'Draft saved to COSY';
      return true;
    } catch (error) {
      $('save-status').textContent = 'Saved locally; cloud save failed: ' + (error.message || 'unknown error');
      return false;
    }
  }

function normalizeLanguage(value) {
    const key = String(value || '').trim().toLowerCase();
    return ({ english: 'en', en: 'en', french: 'fr', fr: 'fr', italian: 'it', it: 'it',
      russian: 'ru', ru: 'ru', greek: 'el', el: 'el', spanish: 'es', es: 'es',
      german: 'de', de: 'de' })[key] || key;
  }

  async function loadPublishableCourses() {
    const select = $('publish-course');
    const client = window.CosyAuth ? window.CosyAuth.client : null;
    select.replaceChildren(new Option('Choose a course…', ''));
    if (!client) { $('publish-status').textContent = 'Connect to COSY to load courses.'; return; }
    const { data, error } = await client.rpc('list_studio_publishable_courses');
    if (error) { $('publish-status').textContent = 'Could not load courses. Apply the Lesson Studio publishing migration and try again.'; return; }
    const matching = (data || []).filter(course =>
      normalizeLanguage(course.language) === normalizeLanguage(state.doc.language) &&
      String(course.cefr).toUpperCase() === String(state.doc.level).toUpperCase()
    );
    matching.forEach(course => select.add(new Option(course.title + ' · ' + course.language + ' ' + course.cefr, course.id)));
    if (!matching.length) {
      select.add(new Option('No matching course for this language and level', ''));
      $('publish-status').textContent = 'No course matches this language and level, or you lack permission to publish to one.';
    } else $('publish-status').textContent = 'Choose the course and lesson number.';
  }

  async function publishLesson() {
    const courseId = $('publish-course').value;
    const lessonNumber = Number.parseInt($('publish-lesson-number').value, 10);
    if (!courseId || !Number.isInteger(lessonNumber) || lessonNumber < 1) {
      $('publish-status').textContent = 'Choose a course and a lesson number greater than zero.'; return;
    }
    const publishProblem = validateForPublish(state.doc);
    if (publishProblem) { $('publish-status').textContent = publishProblem; return; }
    $('publish-confirm-button').disabled = true;
    $('publish-status').textContent = 'Saving draft and publishing…';
    try {
      if (!await saveDraft()) throw new Error('The draft must be saved to COSY before it can be published.');
      const client = window.CosyAuth && window.CosyAuth.client;
      const { data, error } = await client.rpc('publish_lesson_studio_draft', {
        p_draft_id: state.lessonId, p_course_id: courseId, p_lesson_number: lessonNumber
      });
      if (error) throw error;
      const publishedId = typeof data === 'string' ? data : (data && data.lesson_id);
      if (!publishedId) throw new Error('The server did not return a published lesson identifier.');
      state.publishedLessonId = publishedId;
      $('published-link').href = 'student.html?lesson=' + encodeURIComponent(publishedId);
      $('published-link-row').hidden = false;
      $('publish-status').textContent = 'Published successfully. The student player will load the published content.';
      $('save-status').textContent = 'Draft saved · Published';
    } catch (error) { $('publish-status').textContent = error.message || 'Publishing failed.'; }
    finally { $('publish-confirm-button').disabled = false; }
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
    const addVocabBtn = $('add-vocab');
    if (addVocabBtn) {
      addVocabBtn.addEventListener('click', () => {
        state.doc.blocks.push({
          id: makeId(),
          type: 'vocab_list',
          items: [{ word: 'Discovery', definition: 'The act of finding or learning something for the first time.', example: 'The discovery of the new particle amazed scientists.' }]
        });
        changed();
      });
    }
    const addQuizBtn = $('add-quiz');
    if (addQuizBtn) {
      addQuizBtn.addEventListener('click', () => {
        state.doc.blocks.push({
          id: makeId(),
          type: 'quiz',
          question: 'What is the main hypothesis of the study?',
          options: ['Option A', 'Option B', 'Option C'],
          answer: 'Option A'
        });
        changed();
      });
    }
    const addDiscussionBtn = $('add-discussion');
    if (addDiscussionBtn) {
      addDiscussionBtn.addEventListener('click', () => {
        state.doc.blocks.push({
          id: makeId(),
          type: 'discussion',
          prompts: ['How does this technology affect modern daily communication?', 'What ethical considerations should researchers prioritize?']
        });
        changed();
      });
    }
    const addEssayBtn = $('add-essay');
    if (addEssayBtn) {
      addEssayBtn.addEventListener('click', () => {
        state.doc.blocks.push({
          id: makeId(),
          type: 'essay',
          prompt: 'Deliver your 1-minute science summary or write your reflection based on the findings discussed above.'
        });
        changed();
      });
    }
    const addMatchingBtn = $('add-matching');
    if (addMatchingBtn) {
      addMatchingBtn.addEventListener('click', () => {
        state.doc.blocks.push({
          id: makeId(),
          type: 'matching',
          instructions: 'Match each country to its capital.',
          pairs: [{ left: 'France', right: 'Paris' }, { left: 'Italy', right: 'Rome' }]
        });
        changed();
      });
    }
    const addCorrectionBtn = $('add-correction');
    if (addCorrectionBtn) {
      addCorrectionBtn.addEventListener('click', () => {
        state.doc.blocks.push({
          id: makeId(),
          type: 'correction',
          pairs: [{ incorrect: 'The AI is more better than human.', correct: 'The AI is much better than a human.' }]
        });
        changed();
      });
    }
    $('save-button').addEventListener('click', saveDraft);
    $('publish-open-button').addEventListener('click', async () => {
      $('publish-panel').hidden = !$('publish-panel').hidden;
      if (!$('publish-panel').hidden) await loadPublishableCourses();
    });
    $('publish-confirm-button').addEventListener('click', publishLesson);
    $('publish-course').addEventListener('change', () => {
      const client = window.CosyAuth && window.CosyAuth.client;
      if (!client || !$('publish-course').value) return;
      client.from('course_lessons').select('lesson_number').eq('course_id', $('publish-course').value)
        .order('lesson_number', { ascending: false }).limit(1).then(({ data }) => {
          $('publish-lesson-number').value = String(data && data.length ? Number(data[0].lesson_number) + 1 : 1);
        });
    });
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
      if (requestedId !== state.lessonId) history.replaceState(null, '', window.location.pathname + '?lesson=' + encodeURIComponent(state.lessonId));
    } catch (error) {
      document.querySelector('.studio-shell').innerHTML = '<section class="studio-access-denied"><h1>Lesson Studio unavailable</h1><p>' + escapeHtml(error.message) + '</p><a href="teacher.html">Return to teacher workspace</a></section>';
      $('save-button').disabled = true;
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();