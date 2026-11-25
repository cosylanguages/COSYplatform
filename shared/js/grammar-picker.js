/**
 * COSYplatform - searchable grammar picker for Lesson Studio.
 *
 * Loads the COSYmanuals grammar registry and lets a lesson author find a
 * grammar point by language, CEFR level and name instead of remembering an id.
 * The selected id is all that is stored in the lesson.
 *
 * API: CosyGrammarPicker.createPicker({...}) / filterPoints(points, opts) /
 *      languageCode(value) / loadRegistry(url) / resetCache()
 */
(function (global) {
  'use strict';

  var REGISTRY_URL = 'https://cosylanguages.github.io/COSYmanuals/data/grammar-points.json?v=20261125-1';
  var RESULT_LIMIT = 80;
  var LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
  var LEVEL_ORDER = { a1: 1, a2: 2, b1: 3, b2: 4, c1: 5, c2: 6 };
  var LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'French' },
    { code: 'es', label: 'Spanish' },
    { code: 'de', label: 'German' },
    { code: 'it', label: 'Italian' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'ru', label: 'Russian' },
    { code: 'el', label: 'Greek' },
    { code: 'ba', label: 'Bashkir' },
    { code: 'br', label: 'Breton' },
    { code: 'cv', label: 'Chuvash' },
    { code: 'hy', label: 'Armenian' },
    { code: 'ka', label: 'Georgian' },
    { code: 'tt', label: 'Tatar' }
  ];
  var LANGUAGE_BY_CODE = {};
  LANGUAGES.forEach(function (lang) { LANGUAGE_BY_CODE[lang.code] = lang.label; });

  var ID_RE = /^([a-z]{2,3})-([a-z0-9]+)-([a-z0-9][a-z0-9-]*)$/;
  var cache = null;
  var pending = null;

  function normalizeText(value) {
    var text = String(value == null ? '' : value).toLowerCase();
    if (text.normalize) text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return text.replace(/\s+/g, ' ').trim();
  }

  function languageCode(value) {
    var key = normalizeText(value);
    if (!key) return '';
    if (LANGUAGE_BY_CODE[key]) return key;
    for (var i = 0; i < LANGUAGES.length; i++) {
      if (normalizeText(LANGUAGES[i].label) === key) return LANGUAGES[i].code;
    }
    return key;
  }

  function languageLabel(code) {
    return LANGUAGE_BY_CODE[code] || String(code || '').toUpperCase();
  }

  function levelLabel(level) {
    return String(level || '').toUpperCase();
  }

  function manualUrl(id) {
    var match = ID_RE.exec(String(id || '').trim());
    if (!match) return null;
    return 'https://cosylanguages.github.io/COSYmanuals/manuals/' + match[1] +
      '/grammar/' + match[2] + '/topics/' + match[3] + '.html';
  }

  function pointHaystack(point) {
    return normalizeText([point.id, point.slug, point.title, point.subtitle].join(' '));
  }

  function scorePoint(point, query) {
    if (!query) return 0;
    var id = normalizeText(point.id);
    var slug = normalizeText(point.slug);
    var title = normalizeText(point.title);
    var subtitle = normalizeText(point.subtitle);
    if (id === query || slug === query) return 100;
    if (title === query) return 90;
    if (title.indexOf(query) === 0) return 80;
    if (slug.indexOf(query) === 0) return 70;
    if (title.indexOf(query) !== -1) return 60;
    if (subtitle.indexOf(query) !== -1) return 40;
    if (slug.indexOf(query) !== -1) return 30;
    return 10;
  }

  function comparePoints(a, b) {
    var levelDiff = (LEVEL_ORDER[a.level] || 99) - (LEVEL_ORDER[b.level] || 99);
    if (levelDiff) return levelDiff;
    return normalizeText(a.title).localeCompare(normalizeText(b.title));
  }

  /** Filter and rank registry points. `lang` may be a code or a display name. */
  function filterPoints(points, options) {
    options = options || {};
    var requestedLang = options.lang || options.language || 'all';
    var lang = requestedLang === 'all' ? 'all' : languageCode(requestedLang);
    var level = normalizeText(options.level || 'all');
    var query = normalizeText(options.query);
    var tokens = query ? query.split(' ') : [];
    var out = [];

    (points || []).forEach(function (point) {
      if (!point || !point.id) return;
      if (lang !== 'all' && point.lang !== lang) return;
      if (level !== 'all' && point.level !== level) return;
      if (tokens.length) {
        var haystack = pointHaystack(point);
        for (var i = 0; i < tokens.length; i++) {
          if (haystack.indexOf(tokens[i]) === -1) return;
        }
      }
      out.push(point);
    });

    out.sort(function (a, b) {
      if (query) {
        var scoreDiff = scorePoint(b, query) - scorePoint(a, query);
        if (scoreDiff) return scoreDiff;
      }
      return comparePoints(a, b);
    });
    return out;
  }

  function loadRegistry(url) {
    if (cache) return Promise.resolve(cache);
    if (pending) return pending;
    if (typeof fetch !== 'function') return Promise.reject(new Error('This browser cannot load the grammar list.'));
    pending = fetch(url || REGISTRY_URL, { credentials: 'omit' })
      .then(function (response) {
        if (!response.ok) throw new Error('Grammar list request failed (' + response.status + ').');
        return response.json();
      })
      .then(function (data) {
        var points = Array.isArray(data) ? data : data && data.points;
        if (!Array.isArray(points)) throw new Error('The grammar list has an unexpected format.');
        cache = points;
        return points;
      })
      .catch(function (error) {
        pending = null;
        throw error;
      });
    return pending;
  }

  function resetCache() {
    cache = null;
    pending = null;
  }

  function createPicker(options) {
    options = options || {};
    var doc = (global && global.document) || (typeof document !== 'undefined' ? document : null);
    if (!doc) throw new Error('CosyGrammarPicker.createPicker needs a document.');

    var root = doc.createElement('div');
    root.className = 'grammar-picker';
    root.setAttribute('data-grammar-picker', '');

    var selectedBox = doc.createElement('div');
    selectedBox.className = 'grammar-picker-selected';
    selectedBox.setAttribute('data-grammar-selected', '');
    selectedBox.setAttribute('aria-live', 'polite');

    var filters = doc.createElement('div');
    filters.className = 'grammar-picker-filters';

    var langSelect = doc.createElement('select');
    langSelect.setAttribute('data-grammar-language', '');
    langSelect.setAttribute('aria-label', 'Filter grammar by language');
    var levelSelect = doc.createElement('select');
    levelSelect.setAttribute('data-grammar-level', '');
    levelSelect.setAttribute('aria-label', 'Filter grammar by CEFR level');

    filters.append(field(doc, 'Language', langSelect), field(doc, 'Level', levelSelect));

    var search = doc.createElement('input');
    search.type = 'search';
    search.autocomplete = 'off';
    search.placeholder = 'Search by grammar name or ID, e.g. used to';
    search.setAttribute('data-grammar-search', '');
    search.setAttribute('aria-label', 'Search grammar points');

    var status = doc.createElement('p');
    status.className = 'studio-hint grammar-picker-status';
    status.setAttribute('data-grammar-status', '');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    var results = doc.createElement('div');
    results.className = 'grammar-picker-results';
    results.setAttribute('data-grammar-results', '');

    root.append(selectedBox, filters, field(doc, 'Search grammar', search), status, results);

    var points = [];
    var selectedId = String(options.selectedId || '').trim();
    var loaded = false;
    var loadFailed = false;

    function addOption(select, value, label) {
      var option = doc.createElement('option');
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    }

    function findPoint(id) {
      var wanted = String(id || '').trim();
      if (!wanted) return null;
      for (var i = 0; i < points.length; i++) {
        if (points[i].id === wanted) return points[i];
      }
      return null;
    }

    function renderSelected() {
      selectedBox.replaceChildren();
      var title = doc.createElement('strong');
      title.className = 'grammar-picker-selected-title';
      var meta = doc.createElement('span');
      meta.className = 'grammar-picker-selected-meta';

      if (!loaded) {
        title.textContent = selectedId || 'Loading grammar list…';
        meta.textContent = selectedId
          ? 'Loading this grammar point from COSYmanuals…'
          : 'Loading grammar points from COSYmanuals…';
        selectedBox.append(title, meta);
        return;
      }

      var point = findPoint(selectedId);

      if (!selectedId) {
        title.textContent = 'No grammar point selected yet';
        meta.textContent = 'Search or filter the list below, then choose a grammar point.';
        selectedBox.append(title, meta);
        return;
      }

      if (point) {
        title.textContent = point.title || point.id;
        meta.textContent = [levelLabel(point.level), languageLabel(point.lang), point.id].filter(Boolean).join(' · ');
        selectedBox.append(title, meta);
        if (point.subtitle) {
          var subtitle = doc.createElement('span');
          subtitle.className = 'grammar-picker-selected-subtitle';
          subtitle.textContent = point.subtitle;
          selectedBox.appendChild(subtitle);
        }
      } else {
        title.textContent = selectedId;
        meta.textContent = loadFailed
          ? 'The grammar list did not load, so this ID could not be checked.'
          : 'This ID is not in the grammar registry. Check it or choose another point.';
        selectedBox.append(title, meta);
      }

      var url = manualUrl(selectedId);
      if (url) {
        var link = doc.createElement('a');
        link.className = 'grammar-picker-manual-link';
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'Open grammar manual ↗';
        selectedBox.appendChild(link);
      }
    }

    function choose(point) {
      selectedId = point.id;
      renderSelected();
      renderResults();
      if (typeof options.onSelect === 'function') options.onSelect(point);
    }

    function renderResults() {
      var filtered = filterPoints(points, {
        lang: langSelect.value,
        level: levelSelect.value,
        query: search.value
      });
      results.replaceChildren();

      if (!filtered.length) {
        status.textContent = points.length
          ? 'No grammar points match this search and filter.'
          : 'No grammar list loaded.';
        var empty = doc.createElement('p');
        empty.className = 'studio-empty grammar-picker-empty';
        empty.textContent = points.length
          ? 'Try another spelling, level, or “All languages”.'
          : 'The grammar list is unavailable. You can still enter an ID manually.';
        results.appendChild(empty);
        return;
      }

      var shown = filtered.slice(0, RESULT_LIMIT);
      shown.forEach(function (point) {
        var button = doc.createElement('button');
        button.type = 'button';
        button.className = 'grammar-picker-option';
        button.setAttribute('data-grammar-id', point.id);
        button.setAttribute('aria-pressed', String(point.id === selectedId));

        var title = doc.createElement('strong');
        title.className = 'grammar-picker-option-title';
        title.textContent = point.title || point.id;

        var meta = doc.createElement('span');
        meta.className = 'grammar-picker-option-meta';
        meta.textContent = [levelLabel(point.level), languageLabel(point.lang), point.id].filter(Boolean).join(' · ');

        button.append(title, meta);
        if (point.subtitle) {
          var subtitle = doc.createElement('span');
          subtitle.className = 'grammar-picker-option-subtitle';
          subtitle.textContent = point.subtitle;
          button.appendChild(subtitle);
        }
        button.addEventListener('click', function () { choose(point); });
        results.appendChild(button);
      });

      status.textContent = filtered.length > RESULT_LIMIT
        ? 'Showing the first ' + RESULT_LIMIT + ' of ' + filtered.length + ' matches. Refine the search or level to narrow the list.'
        : filtered.length + (filtered.length === 1 ? ' grammar point' : ' grammar points') + '.';
    }

    function setPoints(next) {
      points = Array.isArray(next) ? next : [];
      loaded = true;
      loadFailed = false;
      var codes = {};
      var levels = {};
      points.forEach(function (point) {
        if (point.lang) codes[point.lang] = true;
        if (point.level) levels[point.level] = true;
      });

      langSelect.replaceChildren();
      addOption(langSelect, 'all', 'All languages');
      LANGUAGES.forEach(function (lang) {
        if (codes[lang.code]) addOption(langSelect, lang.code, lang.label);
      });
      Object.keys(codes).sort().forEach(function (code) {
        if (!LANGUAGE_BY_CODE[code]) addOption(langSelect, code, code.toUpperCase());
      });
      var initialLang = languageCode(options.language);
      langSelect.value = codes[initialLang] ? initialLang : 'all';

      levelSelect.replaceChildren();
      addOption(levelSelect, 'all', 'All levels');
      LEVELS.forEach(function (level) {
        if (levels[level]) addOption(levelSelect, level, levelLabel(level));
      });
      var initialLevel = normalizeText(options.level);
      levelSelect.value = levels[initialLevel] ? initialLevel : 'all';

      root.classList.remove('grammar-picker--loading');
      renderSelected();
      renderResults();
    }

    function setSelection(id) {
      selectedId = String(id || '').trim();
      renderSelected();
      renderResults();
    }

    function setLanguage(value) {
      var code = languageCode(value);
      if (code && langSelect.querySelector('option[value="' + code + '"]')) langSelect.value = code;
      else langSelect.value = 'all';
      renderResults();
    }

    function setLevel(value) {
      var level = normalizeText(value);
      if (level && levelSelect.querySelector('option[value="' + level + '"]')) levelSelect.value = level;
      else levelSelect.value = 'all';
      renderResults();
    }

    langSelect.addEventListener('change', renderResults);
    levelSelect.addEventListener('change', renderResults);
    search.addEventListener('input', renderResults);

    root.setPoints = setPoints;
    root.setSelection = setSelection;
    root.setLanguage = setLanguage;
    root.setLevel = setLevel;
    root.refresh = renderResults;

    renderSelected();

    if (Array.isArray(options.points)) {
      setPoints(options.points);
    } else {
      root.classList.add('grammar-picker--loading');
      status.textContent = 'Loading grammar points from COSYmanuals…';
      var loader = typeof options.loadRegistry === 'function' ? options.loadRegistry : loadRegistry;
      Promise.resolve().then(function () { return loader(); }).then(function (data) {
        setPoints(Array.isArray(data) ? data : data && data.points);
      }).catch(function () {
        loaded = true;
        loadFailed = true;
        root.classList.remove('grammar-picker--loading');
        root.classList.add('grammar-picker--error');
        status.textContent = 'Could not load the COSYmanuals grammar list. You can still enter an ID manually.';
        var empty = doc.createElement('p');
        empty.className = 'studio-empty grammar-picker-empty';
        empty.textContent = 'Check your connection and reopen this block.';
        results.replaceChildren(empty);
        renderSelected();
      });
    }

    return root;
  }

  function field(doc, labelText, control) {
    var label = doc.createElement('label');
    label.className = 'studio-field';
    var span = doc.createElement('span');
    span.textContent = labelText;
    label.append(span, control);
    return label;
  }

  var api = {
    REGISTRY_URL: REGISTRY_URL,
    RESULT_LIMIT: RESULT_LIMIT,
    LANGUAGES: LANGUAGES,
    languageCode: languageCode,
    languageLabel: languageLabel,
    normalizeText: normalizeText,
    manualUrl: manualUrl,
    filterPoints: filterPoints,
    loadRegistry: loadRegistry,
    resetCache: resetCache,
    createPicker: createPicker
  };

  global.CosyGrammarPicker = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
