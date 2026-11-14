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

  const MB = 1024 * 1024;
  const MEDIA_RULES = {
    image: { label: 'picture', max: 5 * MB, accept: 'image/png,image/jpeg,image/webp,image/gif', types: { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' } },
    audio: { label: 'audio', max: 20 * MB, accept: 'audio/mpeg,audio/mp4,audio/x-m4a,audio/ogg,audio/webm,audio/wav', types: { 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/ogg': 'ogg', 'audio/webm': 'webm', 'audio/wav': 'wav', 'audio/x-wav': 'wav' } },
    video: { label: 'video', max: 50 * MB, accept: 'video/mp4,video/webm', types: { 'video/mp4': 'mp4', 'video/webm': 'webm' } },
    pdf: { label: 'PDF', max: 15 * MB, accept: 'application/pdf', types: { 'application/pdf': 'pdf' } }
  };
  const MEDIA_KINDS = Object.keys(MEDIA_RULES);

  /** Upload to the private lesson-media bucket under the author's own folder. Returns the stored path. */
  async function uploadLessonMedia(kind, file) {
    const rule = MEDIA_RULES[kind];
    const ext = rule.types[file.type];
    if (!ext) throw new Error('That file type is not allowed for a ' + rule.label + ' block.');
    if (file.size > rule.max) throw new Error('That file is too large (limit ' + Math.round(rule.max / MB) + ' MB for a ' + rule.label + ').');
    const client = window.CosyAuth ? window.CosyAuth.client : null;
    if (!client || !client.storage) throw new Error('Sign in to upload files.');
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError || !authData || !authData.user) throw new Error('Could not verify your signed-in account.');
    const path = authData.user.id + '/' + crypto.randomUUID() + '.' + ext;
    const { error } = await client.storage.from('lesson-media').upload(path, file, { contentType: file.type, upsert: false, cacheControl: '3600' });
    if (error) throw new Error(error.message || 'Upload failed.');
    return path;
  }

  const MEDIA_LABELS = { image: 'Picture', audio: 'Audio', video: 'Video', pdf: 'PDF' };

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
      } else if (block.type === 'true_false') {
        if (!Array.isArray(block.statements)) return 'True/False block ' + (i + 1) + ' needs statements.';
      } else if (block.type === 'word_order') {
        if (!Array.isArray(block.sentences)) return 'Word order block ' + (i + 1) + ' needs sentences.';
      } else if (block.type === 'sort_columns') {
        if (!Array.isArray(block.columns) || !Array.isArray(block.items)) return 'Sorting block ' + (i + 1) + ' needs columns and items.';
      } else if (block.type === 'put_in_order') {
        if (!Array.isArray(block.items)) return 'Ordering block ' + (i + 1) + ' needs items.';
      } else if (block.type === 'flashcards') {
        if (!Array.isArray(block.cards)) return 'Flashcards block ' + (i + 1) + ' needs cards.';
      } else if (block.type === 'memory_match') {
        if (!Array.isArray(block.pairs)) return 'Memory match block ' + (i + 1) + ' needs pairs.';
      } else if (block.type === 'hangman' || block.type === 'anagram' || block.type === 'word_search') {
        if (!Array.isArray(block.words)) return 'Word game block ' + (i + 1) + ' needs words.';
      } else if (block.type === 'crossword') {
        if (!Array.isArray(block.entries)) return 'Crossword block ' + (i + 1) + ' needs entries.';
      } else if (MEDIA_KINDS.indexOf(block.type) !== -1) {
        // path / embed / alt / caption are checked when publishing, so a draft can be saved half-finished.
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
      if (block.type === 'fill_blank' && block.bank !== undefined && (!Array.isArray(block.bank) || !block.bank.every((w) => typeof w === 'string'))) {
        return 'The word box in block ' + n + ' must be a list of words.';
      }
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
      } else if (block.type === 'flashcards') {
        const games = window.CosyStudioGames;
        if (!block.cards.length) return 'Flashcards block ' + n + ' needs at least one card.';
        if (block.cards.length > 60) return 'Flashcards block ' + n + ' can have at most 60 cards.';
        if (games && !games.validCards(block.cards)) return 'Every card in flashcards block ' + n + ' needs a front and a back (up to 200 characters each).';
      } else if (block.type === 'hangman' || block.type === 'anagram') {
        const games = window.CosyStudioGames;
        const isHang = block.type === 'hangman';
        const name = isHang ? 'Hangman' : 'Anagram';
        const max = isHang ? 30 : 30, min = isHang ? 2 : 3;
        if (!block.words.length) return name + ' block ' + n + ' needs at least one word.';
        if (block.words.length > 20) return name + ' block ' + n + ' can have at most 20 words.';
        const seen = new Set();
        for (const w of block.words) {
          const text = w && typeof w.word === 'string' ? w.word.trim() : '';
          if (!text) return 'Every word in ' + name.toLowerCase() + ' block ' + n + ' needs text.';
          if (text.length < min || text.length > max) return 'Words in ' + name.toLowerCase() + ' block ' + n + ' must be ' + min + ' to ' + max + ' characters long.';
          if (!isHang && /\s/.test(text)) return 'Anagram words in block ' + n + ' must be single words (no spaces).';
          if (isHang && !/\p{L}/u.test(text)) return 'Every hangman word in block ' + n + ' needs at least one letter.';
          if (w.hint !== undefined && w.hint !== null && (typeof w.hint !== 'string' || w.hint.trim().length > 120)) return 'Hints in ' + name.toLowerCase() + ' block ' + n + ' can be up to 120 characters.';
          if (seen.has(text.toLowerCase())) return 'Every word in ' + name.toLowerCase() + ' block ' + n + ' must be different.';
          seen.add(text.toLowerCase());
        }
        if (games && !games.validWordList(block.words, block.type)) return name + ' block ' + n + ' has an invalid word.';
      } else if (block.type === 'crossword') {
        const games = window.CosyStudioGames;
        if (block.entries.length < 3) return 'Crossword block ' + n + ' needs at least 3 entries.';
        if (block.entries.length > 15) return 'Crossword block ' + n + ' can have at most 15 entries.';
        const seen = new Set();
        for (const e of block.entries) {
          const text = e && typeof e.word === 'string' ? e.word.trim() : '';
          const clue = e && typeof e.clue === 'string' ? e.clue.trim() : '';
          if (!text) return 'Every entry in crossword block ' + n + ' needs a word.';
          if (/\s/.test(text)) return 'Crossword words in block ' + n + ' must be single words (no spaces).';
          if (Array.from(text).length < 2 || Array.from(text).length > 15) return 'Crossword words in block ' + n + ' must be 2 to 15 letters long.';
          if (!clue) return 'Every crossword entry in block ' + n + ' needs a clue.';
          if (clue.length > 120) return 'Crossword clues in block ' + n + ' can be up to 120 characters.';
          if (seen.has(text.toLowerCase())) return 'Every word in crossword block ' + n + ' must be different.';
          seen.add(text.toLowerCase());
        }
        if (games && !games.validEntries(block.entries)) return 'Crossword block ' + n + ' has an invalid entry.';
      } else if (block.type === 'word_search') {
        const games = window.CosyStudioGames;
        if (block.words.length < 3) return 'Word search block ' + n + ' needs at least 3 words.';
        if (block.words.length > 12) return 'Word search block ' + n + ' can have at most 12 words.';
        const seen = new Set();
        for (const w of block.words) {
          const text = typeof w === 'string' ? w.trim() : '';
          if (!text) return 'Every word in word search block ' + n + ' needs text.';
          if (/\s/.test(text)) return 'Word search words in block ' + n + ' must be single words (no spaces).';
          if (Array.from(text).length < 3 || Array.from(text).length > 12) return 'Word search words in block ' + n + ' must be 3 to 12 letters long.';
          if (seen.has(text.toLowerCase())) return 'Every word in word search block ' + n + ' must be different.';
          seen.add(text.toLowerCase());
        }
        if (block.directions !== undefined && block.directions !== 'basic' && block.directions !== 'all') return 'Word search block ' + n + ' has an unknown direction setting.';
        if (games && !games.validWords(block.words)) return 'Word search block ' + n + ' has an invalid word.';
      } else if (block.type === 'memory_match') {
        const games = window.CosyStudioGames;
        if (block.pairs.length < 3) return 'Memory match block ' + n + ' needs at least 3 pairs.';
        if (block.pairs.length > 12) return 'Memory match block ' + n + ' can have at most 12 pairs.';
        const sides = [];
        const complete = block.pairs.every((pr) => pr && typeof pr.a === 'string' && pr.a.trim() && typeof pr.b === 'string' && pr.b.trim() && pr.a.trim().length <= 60 && pr.b.trim().length <= 60);
        if (!complete) return 'Every pair in memory match block ' + n + ' needs two words (up to 60 characters each).';
        block.pairs.forEach((pr) => { sides.push(pr.a.trim().toLowerCase(), pr.b.trim().toLowerCase()); });
        if (new Set(sides).size !== sides.length) return 'Every word in memory match block ' + n + ' must be different, or a match would be ambiguous.';
        if (games && !games.validPairs(block.pairs)) return 'Memory match block ' + n + ' has an invalid pair.';
      } else if (MEDIA_KINDS.indexOf(block.type) !== -1) {
        const media = window.CosyStudioMedia;
        const hasFile = typeof block.path === 'string' && block.path !== '';
        const hasEmbed = !!(block.embed && media && media.embedSrc(block.embed.provider, block.embed.id));
        const label = MEDIA_LABELS[block.type] || block.type;
        if (block.type === 'video') {
          if (hasFile && block.embed) return label + ' block ' + n + ' has both an uploaded file and a link. Keep one.';
          if (!hasFile && !hasEmbed) return label + ' block ' + n + ' needs an uploaded file or a YouTube, Vimeo or Rutube link.';
        } else if (!hasFile) {
          return label + ' block ' + n + ' needs an uploaded file.';
        }
        if (hasFile && media && !media.isValidPath(block.path)) return label + ' block ' + n + ' has an invalid file. Upload it again.';
        if (block.type === 'image' && !(typeof block.alt === 'string' && block.alt.trim())) {
          return 'Picture block ' + n + ' needs alt text (a short description for people who cannot see it).';
        }
        if (block.caption !== undefined && typeof block.caption !== 'string') return label + ' block ' + n + ' caption must be text.';
      } else if (block.type === 'true_false') {
        if (!block.statements.length) return 'True/False block ' + n + ' needs at least one statement.';
        if (!block.statements.every((st) => st && typeof st.text === 'string' && st.text.trim() && typeof st.answer === 'boolean')) {
          return 'Every statement in True/False block ' + n + ' needs text and a True or False answer.';
        }
      } else if (block.type === 'word_order') {
        if (!block.sentences.length) return 'Word order block ' + n + ' needs at least one sentence.';
        if (!block.sentences.every((sn) => typeof sn === 'string' && sn.trim().split(/\s+/).length >= 3)) {
          return 'Every sentence in word order block ' + n + ' needs at least three words.';
        }
      } else if (block.type === 'sort_columns') {
        const cols = block.columns.map((c) => (typeof c === 'string' ? c.trim() : ''));
        if (cols.length < 2 || cols.some((c) => !c)) return 'Sorting block ' + n + ' needs at least two named columns.';
        if (new Set(cols.map((c) => c.toLowerCase())).size !== cols.length) return 'Sorting block ' + n + ' has two columns with the same name.';
        if (block.items.length < 2) return 'Sorting block ' + n + ' needs at least two items.';
        if (!block.items.every((it) => it && typeof it.text === 'string' && it.text.trim() && block.columns.indexOf(it.column) !== -1)) {
          return 'Every item in sorting block ' + n + ' needs text and one of the columns.';
        }
      } else if (block.type === 'put_in_order') {
        const items = block.items.map((it) => (typeof it === 'string' ? it.trim() : ''));
        if (items.length < 3 || items.some((it) => !it)) return 'Ordering block ' + n + ' needs at least three items.';
        if (new Set(items.map((it) => it.toLowerCase())).size !== items.length) return 'Ordering block ' + n + ' has the same item twice.';
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
      matching: 'Matching',
      true_false: 'True or False',
      word_order: 'Word Order',
      sort_columns: 'Sort into Columns',
      put_in_order: 'Put in Order',
      image: 'Picture',
      audio: 'Audio',
      video: 'Video',
      pdf: 'PDF',
      flashcards: 'Flashcards',
      memory_match: 'Memory Match',
      hangman: 'Hangman',
      anagram: 'Anagram',
      word_search: 'Word Search',
      crossword: 'Crossword'
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

        const bankField = document.createElement('label');
        bankField.className = 'studio-field';
        const bankLabel = document.createElement('span');
        bankLabel.textContent = 'Word box (optional, separate words with |; students see them shuffled)';
        const bankInput = document.createElement('input');
        bankInput.value = (block.bank || []).join(' | ');
        bankInput.addEventListener('input', () => {
          const words = bankInput.value.split('|').map((w) => w.trim()).filter(Boolean);
          if (words.length) block.bank = words; else delete block.bank;
          changed(false);
        });
        bankField.append(bankLabel, bankInput);
        card.appendChild(bankField);
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
      } else if (block.type === 'true_false') {
        block.statements = block.statements || [];
        const container = document.createElement('div');
        container.className = 'studio-field';
        const label = document.createElement('span');
        label.textContent = 'Statements (students answer True or False)';
        container.appendChild(label);
        block.statements.forEach((st, idx) => {
          const row = document.createElement('div');
          row.className = 'studio-item-row';
          const text = document.createElement('input');
          text.placeholder = 'Statement';
          text.value = st.text || '';
          text.addEventListener('input', () => { st.text = text.value; changed(false); });
          const answer = document.createElement('select');
          [['true', 'True'], ['false', 'False']].forEach(([v, t]) => {
            const o = document.createElement('option'); o.value = v; o.textContent = t; answer.appendChild(o);
          });
          answer.value = st.answer === false ? 'false' : 'true';
          answer.addEventListener('change', () => { st.answer = answer.value === 'true'; changed(false); });
          const del = document.createElement('button');
          del.className = 'studio-mini-btn'; del.type = 'button'; del.textContent = '×';
          del.addEventListener('click', () => { block.statements.splice(idx, 1); changed(); });
          row.append(text, answer, del);
          container.appendChild(row);
        });
        const add = document.createElement('button');
        add.className = 'studio-mini-btn'; add.type = 'button'; add.textContent = '＋ Add Statement';
        add.addEventListener('click', () => { block.statements.push({ text: '', answer: true }); changed(); });
        container.appendChild(add);
        card.appendChild(container);
      } else if (block.type === 'word_order') {
        block.sentences = block.sentences || [];
        const container = document.createElement('div');
        container.className = 'studio-field';
        const label = document.createElement('span');
        label.textContent = 'Correct sentences (students see the words shuffled and type the sentence)';
        container.appendChild(label);
        block.sentences.forEach((sn, idx) => {
          const row = document.createElement('div');
          row.className = 'studio-item-row';
          const input = document.createElement('input');
          input.placeholder = 'I would like a coffee';
          input.value = sn || '';
          input.addEventListener('input', () => { block.sentences[idx] = input.value; changed(false); });
          const del = document.createElement('button');
          del.className = 'studio-mini-btn'; del.type = 'button'; del.textContent = '×';
          del.addEventListener('click', () => { block.sentences.splice(idx, 1); changed(); });
          row.append(input, del);
          container.appendChild(row);
        });
        const add = document.createElement('button');
        add.className = 'studio-mini-btn'; add.type = 'button'; add.textContent = '＋ Add Sentence';
        add.addEventListener('click', () => { block.sentences.push(''); changed(); });
        container.appendChild(add);
        card.appendChild(container);
      } else if (block.type === 'sort_columns') {
        block.columns = block.columns || [];
        block.items = block.items || [];
        const colField = document.createElement('label');
        colField.className = 'studio-field';
        const colLabel = document.createElement('span');
        colLabel.textContent = 'Columns (separate with |)';
        const colInput = document.createElement('input');
        colInput.value = block.columns.join(' | ');
        // 'change' (not 'input'): the item menus below are rebuilt from the columns.
        colInput.addEventListener('change', () => {
          block.columns = colInput.value.split('|').map((c) => c.trim()).filter(Boolean);
          block.items.forEach((it) => { if (block.columns.indexOf(it.column) === -1) it.column = block.columns[0] || ''; });
          changed();
        });
        colField.append(colLabel, colInput);
        card.appendChild(colField);

        const container = document.createElement('div');
        container.className = 'studio-field';
        const label = document.createElement('span');
        label.textContent = 'Items (and the column each belongs to)';
        container.appendChild(label);
        block.items.forEach((it, idx) => {
          const row = document.createElement('div');
          row.className = 'studio-item-row';
          const text = document.createElement('input');
          text.placeholder = 'Item';
          text.value = it.text || '';
          text.addEventListener('input', () => { it.text = text.value; changed(false); });
          const col = document.createElement('select');
          block.columns.forEach((c) => { const o = document.createElement('option'); o.value = c; o.textContent = c; col.appendChild(o); });
          col.value = block.columns.indexOf(it.column) !== -1 ? it.column : (block.columns[0] || '');
          if (it.column !== col.value) it.column = col.value;
          col.addEventListener('change', () => { it.column = col.value; changed(false); });
          const del = document.createElement('button');
          del.className = 'studio-mini-btn'; del.type = 'button'; del.textContent = '×';
          del.addEventListener('click', () => { block.items.splice(idx, 1); changed(); });
          row.append(text, col, del);
          container.appendChild(row);
        });
        const add = document.createElement('button');
        add.className = 'studio-mini-btn'; add.type = 'button'; add.textContent = '＋ Add Item';
        add.addEventListener('click', () => { block.items.push({ text: '', column: block.columns[0] || '' }); changed(); });
        container.appendChild(add);
        card.appendChild(container);
      } else if (block.type === 'put_in_order') {
        block.items = block.items || [];
        const intro = document.createElement('label');
        intro.className = 'studio-field';
        const introLabel = document.createElement('span');
        introLabel.textContent = 'Instructions (optional)';
        const introInput = document.createElement('input');
        introInput.value = block.instructions || '';
        introInput.placeholder = 'Put the morning routine in order.';
        introInput.addEventListener('input', () => { block.instructions = introInput.value; changed(false); });
        intro.append(introLabel, introInput);
        card.appendChild(intro);

        const container = document.createElement('div');
        container.className = 'studio-field';
        const label = document.createElement('span');
        label.textContent = 'Items in the CORRECT order (students see them shuffled)';
        container.appendChild(label);
        block.items.forEach((it, idx) => {
          const row = document.createElement('div');
          row.className = 'studio-item-row';
          const num = document.createElement('span');
          num.textContent = String(idx + 1) + '.';
          const input = document.createElement('input');
          input.placeholder = 'Step ' + (idx + 1);
          input.value = it || '';
          input.addEventListener('input', () => { block.items[idx] = input.value; changed(false); });
          const del = document.createElement('button');
          del.className = 'studio-mini-btn'; del.type = 'button'; del.textContent = '×';
          del.addEventListener('click', () => { block.items.splice(idx, 1); changed(); });
          row.append(num, input, del);
          container.appendChild(row);
        });
        const add = document.createElement('button');
        add.className = 'studio-mini-btn'; add.type = 'button'; add.textContent = '＋ Add Step';
        add.addEventListener('click', () => { block.items.push(''); changed(); });
        container.appendChild(add);
        card.appendChild(container);
      } else if (MEDIA_KINDS.indexOf(block.type) !== -1) {
        const rule = MEDIA_RULES[block.type];
        const status = document.createElement('p');
        status.className = 'studio-hint';
        const describe = () => {
          if (block.path) status.textContent = 'File: ' + (block.fileName || 'uploaded') + '. Choose another file to replace it.';
          else if (block.embed) status.textContent = 'Linked: ' + block.embed.provider + ' video ' + block.embed.id + '.';
          else status.textContent = block.type === 'video' ? 'Upload a video file (up to ' + Math.round(rule.max / MB) + ' MB) or paste a link.' : 'Choose a ' + rule.label + ' file (up to ' + Math.round(rule.max / MB) + ' MB).';
        };
        describe();

        const fileField = document.createElement('label');
        fileField.className = 'studio-field';
        const fileLabel = document.createElement('span');
        fileLabel.textContent = 'Upload ' + rule.label + ' file';
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = rule.accept;
        fileInput.addEventListener('change', async () => {
          const file = fileInput.files && fileInput.files[0];
          if (!file) return;
          status.textContent = 'Uploading…';
          try {
            const path = await uploadLessonMedia(block.type, file);
            block.path = path;
            block.fileName = file.name;
            delete block.embed;
            changed();
          } catch (err) {
            status.textContent = err.message || 'Upload failed.';
            fileInput.value = '';
          }
        });
        fileField.append(fileLabel, fileInput);
        card.append(fileField, status);

        if (block.type === 'video') {
          const linkField = document.createElement('label');
          linkField.className = 'studio-field';
          const linkLabel = document.createElement('span');
          linkLabel.textContent = 'Or paste a YouTube, Vimeo or Rutube link';
          const linkInput = document.createElement('input');
          linkInput.placeholder = 'https://www.youtube.com/watch?v=…';
          linkInput.value = block.embed ? block.embed.provider + ': ' + block.embed.id : '';
          linkInput.addEventListener('change', () => {
            const text = linkInput.value.trim();
            if (!text) { delete block.embed; changed(); return; }
            const parsed = window.CosyStudioMedia ? window.CosyStudioMedia.parseVideoUrl(text) : null;
            if (!parsed) { status.textContent = 'That link is not a YouTube, Vimeo or Rutube video address.'; return; }
            block.embed = parsed;
            delete block.path;
            delete block.fileName;
            changed();
          });
          linkField.append(linkLabel, linkInput);
          card.appendChild(linkField);
        }

        if (block.type === 'image') {
          const altField = document.createElement('label');
          altField.className = 'studio-field';
          const altLabel = document.createElement('span');
          altLabel.textContent = 'Alt text (required: describe the picture)';
          const altInput = document.createElement('input');
          altInput.value = block.alt || '';
          altInput.addEventListener('input', () => { block.alt = altInput.value; changed(false); });
          altField.append(altLabel, altInput);
          card.appendChild(altField);
        }

        const capField = document.createElement('label');
        capField.className = 'studio-field';
        const capLabel = document.createElement('span');
        capLabel.textContent = 'Caption (optional)';
        const capInput = document.createElement('input');
        capInput.value = block.caption || '';
        capInput.addEventListener('input', () => { if (capInput.value) block.caption = capInput.value; else delete block.caption; changed(false); });
        capField.append(capLabel, capInput);
        card.appendChild(capField);
      } else if (block.type === 'crossword') {
        block.entries = block.entries || [];
        const container = document.createElement('div');
        container.className = 'studio-field';
        const label = document.createElement('span');
        label.textContent = 'Entries (3 to 15). Each needs a single word and a clue. The grid is built automatically, so choose words that share letters.';
        container.appendChild(label);
        block.entries.forEach((row, idx) => {
          const line = document.createElement('div');
          line.className = 'studio-item-row';
          const one = document.createElement('input');
          one.placeholder = 'Word';
          one.value = row.word || '';
          one.addEventListener('input', () => { row.word = one.value; changed(false); });
          const two = document.createElement('input');
          two.placeholder = 'Clue';
          two.value = row.clue || '';
          two.addEventListener('input', () => { row.clue = two.value; changed(false); });
          const del = document.createElement('button');
          del.className = 'studio-mini-btn'; del.type = 'button'; del.textContent = '×';
          del.addEventListener('click', () => { block.entries.splice(idx, 1); changed(); });
          line.append(one, two, del);
          container.appendChild(line);
        });
        const add = document.createElement('button');
        add.className = 'studio-mini-btn'; add.type = 'button'; add.textContent = '＋ Add Entry';
        add.addEventListener('click', () => { block.entries.push({ word: '', clue: '' }); changed(); });
        container.appendChild(add);
        card.appendChild(container);
      } else if (block.type === 'hangman' || block.type === 'anagram' || block.type === 'word_search') {
        const isSearch = block.type === 'word_search';
        block.words = block.words || [];
        const container = document.createElement('div');
        container.className = 'studio-field';
        const label = document.createElement('span');
        label.textContent = block.type === 'hangman'
          ? 'Words (1 to 20). Students guess the letters. The optional hint is shown to them.'
          : block.type === 'anagram'
            ? 'Words (1 to 20, single words). Students rebuild each word from shuffled letters.'
            : 'Words (3 to 12, 3 to 12 letters each, no spaces). Students find them in a letter grid.';
        container.appendChild(label);
        block.words.forEach((row, idx) => {
          const line = document.createElement('div');
          line.className = 'studio-item-row';
          const one = document.createElement('input');
          one.placeholder = 'Word';
          one.value = isSearch ? (typeof row === 'string' ? row : '') : (row.word || '');
          one.addEventListener('input', () => { if (isSearch) block.words[idx] = one.value; else row.word = one.value; changed(false); });
          line.appendChild(one);
          if (!isSearch) {
            const two = document.createElement('input');
            two.placeholder = 'Hint (optional)';
            two.value = row.hint || '';
            two.addEventListener('input', () => { if (two.value) row.hint = two.value; else delete row.hint; changed(false); });
            line.appendChild(two);
          }
          const del = document.createElement('button');
          del.className = 'studio-mini-btn'; del.type = 'button'; del.textContent = '×';
          del.addEventListener('click', () => { block.words.splice(idx, 1); changed(); });
          line.appendChild(del);
          container.appendChild(line);
        });
        const add = document.createElement('button');
        add.className = 'studio-mini-btn'; add.type = 'button'; add.textContent = '＋ Add Word';
        add.addEventListener('click', () => { block.words.push(isSearch ? '' : { word: '' }); changed(); });
        container.appendChild(add);
        if (isSearch) {
          const dirField = document.createElement('label');
          dirField.className = 'studio-field';
          const dirText = document.createElement('span');
          dirText.textContent = 'Directions';
          const sel = document.createElement('select');
          [['basic', 'Across, down and diagonal'], ['all', 'Also backwards (harder)']].forEach(([v, t]) => {
            const o = document.createElement('option'); o.value = v; o.textContent = t; sel.appendChild(o);
          });
          sel.value = block.directions === 'all' ? 'all' : 'basic';
          sel.addEventListener('change', () => { block.directions = sel.value; changed(false); });
          dirField.append(dirText, sel);
          container.appendChild(dirField);
        }
        card.appendChild(container);
      } else if (block.type === 'flashcards' || block.type === 'memory_match') {
        const isDeck = block.type === 'flashcards';
        const key = isDeck ? 'cards' : 'pairs';
        const f1 = isDeck ? 'front' : 'a';
        const f2 = isDeck ? 'back' : 'b';
        block[key] = block[key] || [];
        const container = document.createElement('div');
        container.className = 'studio-field';
        const label = document.createElement('span');
        label.textContent = isDeck
          ? 'Cards (front ➔ back). Students flip through them and mark what they know.'
          : 'Pairs (3 to 12). Students flip tiles to find the matches. Every word must be different.';
        container.appendChild(label);
        block[key].forEach((row, idx) => {
          const line = document.createElement('div');
          line.className = 'studio-item-row';
          const one = document.createElement('input');
          one.placeholder = isDeck ? 'Front' : 'Word';
          one.value = row[f1] || '';
          one.addEventListener('input', () => { row[f1] = one.value; changed(false); });
          const arrow = document.createElement('span');
          arrow.textContent = '➔';
          const two = document.createElement('input');
          two.placeholder = isDeck ? 'Back' : 'Its match';
          two.value = row[f2] || '';
          two.addEventListener('input', () => { row[f2] = two.value; changed(false); });
          const del = document.createElement('button');
          del.className = 'studio-mini-btn'; del.type = 'button'; del.textContent = '×';
          del.addEventListener('click', () => { block[key].splice(idx, 1); changed(); });
          line.append(one, arrow, two, del);
          container.appendChild(line);
        });
        const add = document.createElement('button');
        add.className = 'studio-mini-btn'; add.type = 'button';
        add.textContent = isDeck ? '＋ Add Card' : '＋ Add Pair';
        add.addEventListener('click', () => { block[key].push(isDeck ? { front: '', back: '' } : { a: '', b: '' }); changed(); });
        container.appendChild(add);
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
        if (Array.isArray(block.bank) && block.bank.length) {
          const box = document.createElement('p');
          box.className = 'studio-hint';
          box.textContent = 'Word box: ' + block.bank.slice().sort((a, b) => String(a).localeCompare(String(b))).join(' · ');
          item.appendChild(box);
        }
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
      } else if (block.type === 'true_false') {
        (block.statements || []).forEach((st) => {
          const line = document.createElement('div');
          line.className = 'correction-card';
          const t = document.createElement('span');
          t.textContent = st.text || '';
          line.appendChild(t);
          ['True', 'False'].forEach((v) => {
            const b = document.createElement('button');
            b.type = 'button'; b.textContent = v;
            line.appendChild(b);
          });
          item.appendChild(line);
        });
      } else if (block.type === 'word_order') {
        (block.sentences || []).forEach((sn) => {
          const words = String(sn || '').trim().split(/\s+/).filter(Boolean).sort((a, b) => a.localeCompare(b));
          const p = document.createElement('p');
          p.textContent = 'Put the words in order: ' + words.join(' / ');
          item.appendChild(p);
          const input = document.createElement('input');
          input.placeholder = 'Type the sentence...';
          item.appendChild(input);
        });
      } else if (block.type === 'sort_columns') {
        const note = document.createElement('p');
        note.className = 'studio-hint';
        note.textContent = 'Columns: ' + (block.columns || []).join(' | ');
        item.appendChild(note);
        (block.items || []).forEach((it) => {
          const line = document.createElement('div');
          line.className = 'correction-card';
          const t = document.createElement('span');
          t.textContent = it.text || '';
          const sel = document.createElement('select');
          (block.columns || []).forEach((c) => { const o = document.createElement('option'); o.textContent = c; sel.appendChild(o); });
          line.append(t, sel);
          item.appendChild(line);
        });
      } else if (block.type === 'put_in_order') {
        const note = document.createElement('p');
        note.className = 'studio-hint';
        note.textContent = block.instructions || 'Put these in the correct order.';
        item.appendChild(note);
        const bank = document.createElement('p');
        bank.textContent = (block.items || []).slice().sort((a, b) => String(a).localeCompare(String(b))).join(' · ');
        item.appendChild(bank);
      } else if (MEDIA_KINDS.indexOf(block.type) !== -1) {
        const media = window.CosyStudioMedia;
        const el = block.type === 'video' && block.embed
          ? { type: 'video-embed', provider: block.embed.provider, id: block.embed.id, caption: block.caption }
          : { type: 'media', kind: block.type, path: block.path, alt: block.alt, caption: block.caption };
        const holder = document.createElement('div');
        holder.innerHTML = media ? media.renderElement(el) : '';
        if (!holder.innerHTML) holder.textContent = 'Add a file or link to see a preview.';
        item.appendChild(holder);
        if (media) media.hydrate(holder, window.CosyAuth ? window.CosyAuth.client : null);
      } else if (block.type === 'crossword') {
        const games = window.CosyStudioGames;
        const holder = document.createElement('div');
        holder.innerHTML = games ? games.renderElement({ type: 'crossword', entries: block.entries }) : '';
        if (!holder.innerHTML) holder.textContent = 'Add 3 to 15 different single words, each with a clue, to see the crossword.';
        item.appendChild(holder);
        if (games) games.init(holder);
      } else if (block.type === 'hangman' || block.type === 'anagram' || block.type === 'word_search') {
        const games = window.CosyStudioGames;
        const holder = document.createElement('div');
        holder.innerHTML = games ? games.renderElement(block.type === 'word_search'
          ? { type: 'word-search', words: block.words, directions: block.directions }
          : { type: block.type, words: block.words }) : '';
        if (!holder.innerHTML) holder.textContent = block.type === 'word_search'
          ? 'Add 3 to 12 different single words (3 to 12 letters) to play the word search.'
          : 'Add valid, different words to play the game.';
        item.appendChild(holder);
        if (games) games.init(holder);
      } else if (block.type === 'flashcards' || block.type === 'memory_match') {
        const games = window.CosyStudioGames;
        const holder = document.createElement('div');
        holder.innerHTML = games ? games.renderElement(block.type === 'flashcards'
          ? { type: 'flashcards', cards: block.cards }
          : { type: 'memory-match', pairs: block.pairs }) : '';
        if (!holder.innerHTML) holder.textContent = block.type === 'flashcards'
          ? 'Add at least one card with a front and a back to see the deck.'
          : 'Add 3 to 12 pairs, every word different, to play the game.';
        item.appendChild(holder);
        if (games) games.init(holder);
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
    const addBlockButton = (id, make) => {
      const el = $(id);
      if (el) el.addEventListener('click', () => { state.doc.blocks.push(Object.assign({ id: makeId() }, make())); changed(); });
    };
    addBlockButton('add-truefalse', () => ({ type: 'true_false', statements: [{ text: 'The sun is a star.', answer: true }, { text: 'Paris is in Spain.', answer: false }] }));
    addBlockButton('add-wordorder', () => ({ type: 'word_order', sentences: ['I would like a coffee'] }));
    addBlockButton('add-sort', () => ({ type: 'sort_columns', instructions: 'Is it past or present?', columns: ['Past', 'Present'], items: [{ text: 'went', column: 'Past' }, { text: 'goes', column: 'Present' }] }));
    addBlockButton('add-order', () => ({ type: 'put_in_order', instructions: 'Put the morning routine in order.', items: ['Wake up', 'Have breakfast', 'Go to work'] }));
    addBlockButton('add-image', () => ({ type: 'image', alt: '' }));
    addBlockButton('add-audio', () => ({ type: 'audio' }));
    addBlockButton('add-video', () => ({ type: 'video' }));
    addBlockButton('add-pdf', () => ({ type: 'pdf' }));
    addBlockButton('add-flashcards', () => ({ type: 'flashcards', cards: [{ front: 'hola', back: 'hello' }, { front: 'adiós', back: 'goodbye' }] }));
    addBlockButton('add-hangman', () => ({ type: 'hangman', words: [{ word: 'house', hint: 'where you live' }, { word: 'garden' }] }));
    addBlockButton('add-anagram', () => ({ type: 'anagram', words: [{ word: 'teacher', hint: 'works at a school' }, { word: 'window' }] }));
    addBlockButton('add-wordsearch', () => ({ type: 'word_search', directions: 'basic', words: ['apple', 'bread', 'cheese', 'water'] }));
    addBlockButton('add-crossword', () => ({ type: 'crossword', entries: [{ word: 'teacher', clue: 'works at a school' }, { word: 'student', clue: 'learns at a school' }, { word: 'lesson', clue: 'a class' }, { word: 'homework', clue: 'work to do at home' }] }));
    addBlockButton('add-memory', () => ({ type: 'memory_match', pairs: [{ a: 'cat', b: 'gato' }, { a: 'dog', b: 'perro' }, { a: 'house', b: 'casa' }] }));
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