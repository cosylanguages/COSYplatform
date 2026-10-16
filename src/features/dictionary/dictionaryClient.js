import { config } from '../../shared/config/config.js';

let cache = null;

/**
 * Loads the COSYdata search index once. Expected shape (to be published by COSYdata):
 *   { "<term>": [{ "id": "...", "pos": "noun", "file": "a1/family.json" }, ...], ... }
 * Returns null when no index URL is configured.
 */
export async function loadIndex(url = config.cosydataIndexUrl) {
  if (!url) return null;
  if (!cache) {
    cache = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`Dictionary index: HTTP ${r.status}`);
      return r.json();
    });
    cache.catch(() => { cache = null; });
  }
  return cache;
}

/** Level and theme come from the file path, e.g. "a1/family.json" -> {level:"A1", theme:"family"}. */
export function entryMeta(entry) {
  const [levelRaw = '', themeRaw = ''] = String(entry.file || '').split('/');
  return {
    level: levelRaw ? levelRaw.toUpperCase().replace('_', '-') : '',
    theme: themeRaw.replace('.json', '').replace(/[-_]/g, ' '),
  };
}

/** Exact matches first, then prefix, then substring. Limits results to keep the panel quiet. */
export function searchIndex(index, query, limit = 12) {
  const q = String(query || '').trim().toLowerCase();
  if (!index || q.length < 2) return [];
  const exact = [], prefix = [], partial = [];
  for (const term of Object.keys(index)) {
    const lower = term.toLowerCase();
    if (lower === q) exact.push(term);
    else if (lower.startsWith(q)) prefix.push(term);
    else if (lower.includes(q)) partial.push(term);
  }
  return [...exact, ...prefix.sort(), ...partial.sort()]
    .slice(0, limit)
    .map((term) => ({ term, exact: term.toLowerCase() === q, entries: index[term] }));
}
