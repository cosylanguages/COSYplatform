/**
 * COSYplatform - grammar-focus lesson element
 * -------------------------------------------
 * Shows a COSYmanuals grammar point inside a lesson slide, by id. The platform
 * never copies grammar text: the id is the only thing stored in the lesson.
 *
 *   { "type": "grammar-focus", "grammarId": "en-a2-used-to" }
 *   { "type": "grammar-focus", "grammarId": "en-a2-used-to", "display": "link" }
 *   { "type": "grammar-focus", "grammarId": "en-a2-used-to", "title": "Look back" }
 *
 * display: "embed" (default) renders the explanation through the COSYmanuals
 *          grammar embed (shadow DOM, fetched cross-origin);
 *          "link" renders only a link to the manual page.
 *
 * Ids look like `<lang>-<level>-<slug>` (registry: COSYmanuals
 * data/grammar-points.json) and map deterministically to
 * `manuals/<lang>/grammar/<level>/topics/<slug>.html`.
 *
 * API: CosyGrammarFocus.isValidId / manualUrl / renderHtml(el, escapeFn) / hydrate(root)
 */
(function (global) {
  'use strict';

  var MANUALS_BASE = 'https://cosylanguages.github.io/COSYmanuals/';
  var EMBED_SCRIPT = MANUALS_BASE + 'shared/js/grammar-embed.js';
  // Same pattern as the COSYmanuals embed, so both sides agree on what an id is.
  var ID_RE = /^([a-z]{2,3})-([a-z0-9]+)-([a-z0-9][a-z0-9-]*)$/;

  function isValidId(id) {
    return typeof id === 'string' && ID_RE.test(id.trim());
  }

  function manualPath(id) {
    var m = ID_RE.exec(String(id || '').trim());
    return m ? 'manuals/' + m[1] + '/grammar/' + m[2] + '/topics/' + m[3] + '.html' : null;
  }

  function manualUrl(id, base) {
    var path = manualPath(id);
    return path ? (base || MANUALS_BASE) + path : null;
  }

  function defaultEscape(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** HTML for one grammar-focus element. Never throws on bad input. */
  function renderHtml(el, escapeFn) {
    var esc = escapeFn || defaultEscape;
    var id = el && typeof el.grammarId === 'string' ? el.grammarId.trim() : '';
    if (!isValidId(id)) {
      return '<div class="grammar-focus grammar-focus--invalid" role="note">' +
        'Grammar point unavailable' + (id ? ' (' + esc(id) + ')' : '') + '.</div>';
    }
    var url = manualUrl(id);
    var linkOnly = el.display === 'link';
    var title = el.title ? '<div class="grammar-focus__title">' + esc(el.title) + '</div>' : '';
    var link = '<a class="grammar-focus__link" href="' + esc(url) + '" target="_blank" rel="noopener">' +
      '📘 ' + esc(id) + ' ↗</a>';
    var body = linkOnly
      ? '<div class="grammar-focus__bar">' + link + '</div>'
      : '<div data-grammar-embed="' + esc(id) + '" data-grammar-embed-chrome="off"></div>' +
        '<div class="grammar-focus__bar">' + link + '</div>';
    return '<section class="grammar-focus" data-grammar-focus="' + esc(id) + '">' + title + body + '</section>';
  }

  function loadEmbedScript() {
    if (global.COSYGrammarEmbed) return Promise.resolve();
    if (global.CosyLazy && global.CosyLazy.load) return global.CosyLazy.load(EMBED_SCRIPT);
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = EMBED_SCRIPT;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('grammar embed script failed to load')); };
      document.head.appendChild(s);
    });
  }

  /**
   * Render every embed mount inside `root`. Safe to call after each re-render:
   * the embed marks finished hosts, and the script is loaded at most once.
   * On failure the "open in COSYmanuals" link stays, so the lesson still works.
   */
  function hydrate(root) {
    var scope = root || document;
    if (!scope.querySelector || !scope.querySelector('.grammar-focus [data-grammar-embed]')) {
      return Promise.resolve();
    }
    return loadEmbedScript().then(function () {
      if (global.COSYGrammarEmbed) global.COSYGrammarEmbed.renderAll(scope);
    }).catch(function (err) {
      if (global.console) console.warn('CosyGrammarFocus: embed unavailable', err);
    });
  }

  var api = {
    MANUALS_BASE: MANUALS_BASE,
    isValidId: isValidId,
    manualPath: manualPath,
    manualUrl: manualUrl,
    renderHtml: renderHtml,
    hydrate: hydrate
  };

  global.CosyGrammarFocus = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
