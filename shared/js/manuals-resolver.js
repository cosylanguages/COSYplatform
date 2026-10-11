/**
 * COSYplatform - COSYmanuals Content Integration Client
 * Sources grammar, vocabulary, and communication manuals data from COSYmanuals.
 */

(function (global) {
  'use strict';

  const COSYMANUALS_BASE_URL = 'https://cosylanguages.github.io/COSYmanuals';

  const CosyManualsResolver = {
    COSYMANUALS_BASE_URL: COSYMANUALS_BASE_URL,

    getManualUrl(category, lang, level, topic) {
      return `${COSYMANUALS_BASE_URL}/manuals/${lang}/${category}/${level}/topics/${topic}.html`;
    },

    async fetchManualData(category, lang, level, topic) {
      const url = this.getManualUrl(category, lang, level, topic);
      try {
        const res = await fetch(url);
        if (res.ok) return await res.text();
      } catch (e) {
        console.warn(`CosyManualsResolver: Failed to fetch manual data from ${url}`, e);
      }
      return null;
    }
  };

  global.CosyManualsResolver = CosyManualsResolver;

})(typeof window !== 'undefined' ? window : global);
