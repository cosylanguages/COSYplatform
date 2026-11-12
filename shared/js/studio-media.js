/**
 * shared/js/studio-media.js
 * Shows Lesson Studio media (pictures, audio, video, PDFs, video embeds) on the student,
 * teacher and Studio preview pages.
 *
 *  - Uploaded files live in the private 'lesson-media' bucket. The page asks Supabase for a
 *    short-lived signed link; if the person may not read the file, no link is issued.
 *  - Video embeds are limited to YouTube, Vimeo and Rutube. Only a provider and an id are
 *    stored; the address is built here from a fixed template after the id passes a strict
 *    pattern, so a lesson can never point an iframe at an arbitrary site.
 *  - Author text (alt, caption) is only ever set with textContent.
 */
(function (root, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    root.CosyStudioMedia = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var BUCKET = 'lesson-media';
  var UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
  var PATH_RE = new RegExp('^' + UUID + '/' + UUID + '\\.[a-z0-9]{2,4}$');
  var KINDS = ['image', 'audio', 'video', 'pdf'];

  var EMBEDS = {
    youtube: { id: /^[A-Za-z0-9_-]{11}$/, src: function (id) { return 'https://www.youtube-nocookie.com/embed/' + id; } },
    vimeo: { id: /^[0-9]{6,12}$/, src: function (id) { return 'https://player.vimeo.com/video/' + id; } },
    rutube: { id: /^[0-9a-f]{32}$/, src: function (id) { return 'https://rutube.ru/play/embed/' + id; } }
  };

  function isValidPath(path) { return typeof path === 'string' && PATH_RE.test(path); }

  function embedSrc(provider, id) {
    var e = Object.prototype.hasOwnProperty.call(EMBEDS, provider) ? EMBEDS[provider] : null;
    return e && typeof id === 'string' && e.id.test(id) ? e.src(id) : null;
  }

  /** Turn a pasted video address into { provider, id }, or null if it is not a supported one. */
  function parseVideoUrl(input) {
    var url;
    try { url = new URL(String(input || '').trim()); } catch (e) { return null; }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    var host = url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
    var parts = url.pathname.split('/').filter(Boolean);
    var id = null;
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (parts[0] === 'watch') id = url.searchParams.get('v');
      else if (['embed', 'shorts', 'live', 'v'].indexOf(parts[0]) !== -1) id = parts[1];
      return embedSrc('youtube', id) ? { provider: 'youtube', id: id } : null;
    }
    if (host === 'youtu.be') {
      id = parts[0];
      return embedSrc('youtube', id) ? { provider: 'youtube', id: id } : null;
    }
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      id = parts.filter(function (p) { return /^[0-9]{6,12}$/.test(p); }).pop();
      return embedSrc('vimeo', id) ? { provider: 'vimeo', id: id } : null;
    }
    if (host === 'rutube.ru') {
      if (parts[0] === 'video' || (parts[0] === 'play' && parts[1] === 'embed')) id = parts[parts[0] === 'video' ? 1 : 2];
      return embedSrc('rutube', id) ? { provider: 'rutube', id: id } : null;
    }
    return null;
  }

  function escapeAttr(v) {
    return String(v === undefined || v === null ? '' : v)
      .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /**
   * HTML for a student-body element, or '' if it is not a media element (or is invalid).
   * Uploaded files render as a placeholder that hydrate() fills with a signed link.
   */
  function renderElement(el) {
    if (!el || typeof el !== 'object') return '';
    var caption = typeof el.caption === 'string' && el.caption.trim()
      ? '<figcaption class="studio-media-caption" style="font-size:.9rem;color:#475569;margin-top:6px;">' + escapeAttr(el.caption) + '</figcaption>' : '';
    if (el.type === 'media') {
      if (KINDS.indexOf(el.kind) === -1 || !isValidPath(el.path)) return '';
      return '<figure class="studio-media" data-media-kind="' + escapeAttr(el.kind) + '" data-media-path="' + escapeAttr(el.path) +
        '" data-media-alt="' + escapeAttr(el.alt || '') + '" style="margin:14px 0;">' +
        '<div class="studio-media-slot" style="color:#64748b;font-size:.9rem;">Loading…</div>' + caption + '</figure>';
    }
    if (el.type === 'video-embed') {
      var src = embedSrc(el.provider, el.id);
      if (!src) return '';
      return '<figure class="studio-media" style="margin:14px 0;">' +
        '<div style="position:relative;padding-top:56.25%;border-radius:8px;overflow:hidden;background:#0f172a;">' +
        '<iframe src="' + escapeAttr(src) + '" title="' + escapeAttr(el.caption || 'Video') + '" loading="lazy" allowfullscreen ' +
        'allow="fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" ' +
        'sandbox="allow-scripts allow-same-origin allow-presentation allow-popups" ' +
        'style="position:absolute;inset:0;width:100%;height:100%;border:0;"></iframe></div>' + caption + '</figure>';
    }
    return '';
  }

  function fill(slot, kind, url, alt) {
    var node;
    if (kind === 'image') {
      node = document.createElement('img');
      node.src = url; node.alt = alt || ''; node.loading = 'lazy';
      node.style.cssText = 'max-width:100%;border-radius:8px;display:block;';
    } else if (kind === 'audio') {
      node = document.createElement('audio');
      node.src = url; node.controls = true; node.preload = 'none';
      node.style.cssText = 'width:100%;';
    } else if (kind === 'video') {
      node = document.createElement('video');
      node.src = url; node.controls = true; node.preload = 'metadata'; node.playsInline = true;
      node.style.cssText = 'max-width:100%;border-radius:8px;';
    } else {
      node = document.createElement('a');
      node.href = url; node.target = '_blank'; node.rel = 'noopener noreferrer';
      node.textContent = '📄 Open PDF';
      node.style.cssText = 'font-weight:600;';
    }
    slot.replaceChildren(node);
  }

  /** Resolve every placeholder under `root` to a signed link. Safe to call repeatedly. */
  async function hydrate(rootEl, client) {
    if (!rootEl || !rootEl.querySelectorAll) return;
    var figures = rootEl.querySelectorAll('figure.studio-media[data-media-path]:not([data-hydrated])');
    for (var i = 0; i < figures.length; i++) {
      var fig = figures[i];
      var slot = fig.querySelector('.studio-media-slot');
      var path = fig.getAttribute('data-media-path');
      var kind = fig.getAttribute('data-media-kind');
      fig.setAttribute('data-hydrated', '1');
      if (!slot) continue;
      if (!client || !client.storage || !isValidPath(path) || KINDS.indexOf(kind) === -1) { slot.textContent = 'Media unavailable.'; continue; }
      try {
        var res = await client.storage.from(BUCKET).createSignedUrl(path, 3600);
        if (res.error || !res.data || !res.data.signedUrl) throw res.error || new Error('no link');
        fill(slot, kind, res.data.signedUrl, fig.getAttribute('data-media-alt'));
      } catch (e) {
        slot.textContent = 'Media unavailable.';
        fig.removeAttribute('data-hydrated');
      }
    }
  }

  return {
    BUCKET: BUCKET, KINDS: KINDS, EMBEDS: EMBEDS,
    isValidPath: isValidPath, embedSrc: embedSrc, parseVideoUrl: parseVideoUrl,
    renderElement: renderElement, hydrate: hydrate
  };
});
