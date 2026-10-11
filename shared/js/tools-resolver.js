/**
 * COSYplatform - COSYtools Grammar & Interactive Practice Integration Client
 * Links and embeds grammar reference and interactive practice exercises from COSYtools.
 */

(function (global) {
  'use strict';

  const COSYTOOLS_BASE_URL = 'https://cosylanguages.github.io/COSYtools';

  const CosyToolsResolver = {
    COSYTOOLS_BASE_URL: COSYTOOLS_BASE_URL,

    getGrammarRefUrl(topicId, lang = 'en', level = 'a1') {
      return `${COSYTOOLS_BASE_URL}/grammar/${lang}/${level}/${topicId}.html`;
    },

    getPracticeEmbedUrl(practiceRef, lang = 'en') {
      return `${COSYTOOLS_BASE_URL}/practice/${lang}/${practiceRef}`;
    }
  };

  global.CosyToolsResolver = CosyToolsResolver;

})(typeof window !== 'undefined' ? window : global);
