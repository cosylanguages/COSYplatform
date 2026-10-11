/**
 * COSYplatform - COSYdata Vocabulary Resolver Client
 * Resolves vocabulary data from COSYdata repository indexes and endpoints.
 */

(function (global) {
  'use strict';

  const COSYDATA_BASE_URL = 'https://raw.githubusercontent.com/cosylanguages/COSYdata/main';

  const CosyVocabResolver = {
    COSYDATA_BASE_URL: COSYDATA_BASE_URL,

    /**
     * Resolves a word or vocabulary ID against local COSYdata index or remote fallback.
     */
    async resolveWord(term, lang = 'en') {
      if (!term) return null;
      const normalized = term.trim().toLowerCase();

      // Check local window.CosyVocabIndex if available
      if (global.CosyVocabIndex && global.CosyVocabIndex[normalized]) {
        return global.CosyVocabIndex[normalized];
      }

      // Live fetch fallback from COSYdata GitHub repository
      try {
        const indexUrl = `${COSYDATA_BASE_URL}/vocabulary/${lang}/index.json`;
        const res = await fetch(indexUrl);
        if (res.ok) {
          const remoteIndex = await res.json();
          if (remoteIndex[normalized]) {
            return remoteIndex[normalized];
          }
        }
      } catch (err) {
        console.warn(`CosyVocabResolver: Remote fetch failed for term "${term}"`, err);
      }

      return null;
    },

    /**
     * Searches vocabulary index for terms matching query.
     */
    search(query, lang = 'en', maxResults = 20) {
      if (!query || !query.trim()) return [];
      const q = query.trim().toLowerCase();
      const index = global.CosyVocabIndex || {};
      const matches = [];

      for (const word in index) {
        if (word.includes(q)) {
          index[word].forEach(entry => {
            matches.push({ word: word, id: entry.id, pos: entry.pos, file: entry.file });
          });
          if (matches.length >= maxResults) break;
        }
      }

      return matches;
    }
  };

  global.CosyVocabResolver = CosyVocabResolver;

})(typeof window !== 'undefined' ? window : global);
