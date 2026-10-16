// Pure i18n helpers (no React). UI chrome only: lesson content is never translated.
import en from './en.json';
import fr from './fr.json';
import it from './it.json';
import ru from './ru.json';
import el from './el.json';

export const UI_LANGS = ['en', 'fr', 'it', 'ru', 'el'];
export const UI_LANG_LABELS = { en: 'English', fr: 'Français', it: 'Italiano', ru: 'Русский', el: 'Ελληνικά' };
export const PIN_KEY = 'cosy_ui_lang';
export const dictionaries = { en, fr, it, ru, el };

const supported = (code) => {
  const c = String(code || '').toLowerCase().split('-')[0];
  return UI_LANGS.includes(c) ? c : null;
};

/**
 * Resolution order: pinned choice, ?ui=, profile.ui_lang, browser language, English.
 * Course languages without a UI translation (hy, ka, tt, ba, br...) fall back to English.
 */
export function resolveLanguage({ pinned, urlParam, profileLang, browserLang } = {}) {
  return supported(pinned) || supported(urlParam) || supported(profileLang) || supported(browserLang) || 'en';
}

export function interpolate(template, params = {}) {
  return String(template).replace(/\{(\w+)\}/g, (m, k) => (k in params ? String(params[k]) : m));
}

/** t('common.lessons', {count: 3}) picks .one/.few/.many/.other by Intl.PluralRules. */
export function translate(lang, key, params = {}) {
  const dict = dictionaries[lang] || en;
  let resolved = key;
  if (typeof params.count === 'number') {
    const cat = new Intl.PluralRules(lang).select(params.count);
    const candidates = [`${key}.${cat}`, `${key}.other`];
    resolved = candidates.find((k) => k in dict || k in en) || key;
  }
  const value = dict[resolved] ?? en[resolved] ?? key;
  return interpolate(value, params);
}
