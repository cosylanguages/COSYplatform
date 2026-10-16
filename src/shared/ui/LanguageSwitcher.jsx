import { useI18n } from '../i18n/I18nContext.jsx';
import { UI_LANGS, UI_LANG_LABELS } from '../i18n/i18n.js';

export function LanguageSwitcher() {
  const { pinned, pin, t } = useI18n();
  return (
    <select className="lang-switcher" aria-label={t('switcher.ariaLabel')} value={pinned || 'auto'} onChange={(e) => pin(e.target.value === 'auto' ? null : e.target.value)}>
      <option value="auto">{t('switcher.auto')}</option>
      {UI_LANGS.map((l) => <option key={l} value={l}>{UI_LANG_LABELS[l]}</option>)}
    </select>
  );
}
