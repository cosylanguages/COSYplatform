import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PIN_KEY, resolveLanguage, translate } from './i18n.js';

const I18nContext = createContext(null);

function readPinned() {
  try { return localStorage.getItem(PIN_KEY); } catch { return null; }
}

export function I18nProvider({ profileLang, children }) {
  const [pinned, setPinned] = useState(readPinned);
  const lang = useMemo(
    () =>
      resolveLanguage({
        pinned,
        urlParam: new URLSearchParams(window.location.search).get('ui'),
        profileLang,
        browserLang: navigator.language,
      }),
    [pinned, profileLang],
  );

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  // value === null means "auto".
  const pin = useCallback((value) => {
    try {
      if (value) localStorage.setItem(PIN_KEY, value); else localStorage.removeItem(PIN_KEY);
    } catch { /* storage unavailable */ }
    setPinned(value);
  }, []);

  const t = useCallback((key, params) => translate(lang, key, params), [lang]);
  const value = useMemo(() => ({ lang, pinned, pin, t }), [lang, pinned, pin, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
export const useT = () => useContext(I18nContext).t;
