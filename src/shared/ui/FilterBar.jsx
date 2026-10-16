import { useT } from '../i18n/I18nContext.jsx';

/**
 * Search + selects + level chips, with a live result count and one-click clear.
 * selects: [{ key, label, allLabel, options: [{value,label}] }]
 * chips:   { key, label, options: [{value,label}] }  (single-select segmented control)
 */
export function FilterBar({ values, onChange, onClear, active, searchPlaceholder, selects = [], chips, shown, total }) {
  const t = useT();
  return (
    <section className="filterbar" aria-label={t('filters.search')}>
      <div className="filter-row">
        <label className="field grow">
          <span className="field-label">{t('filters.search')}</span>
          <input type="search" value={values.q} placeholder={searchPlaceholder} onChange={(e) => onChange('q', e.target.value)} />
        </label>
        {selects.map((s) => (
          <label className="field" key={s.key}>
            <span className="field-label">{s.label}</span>
            <select value={values[s.key]} onChange={(e) => onChange(s.key, e.target.value)}>
              <option value="">{s.allLabel}</option>
              {s.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        ))}
      </div>
      {chips && (
        <div className="chips" role="group" aria-label={chips.label}>
          {chips.options.map((o) => (
            <button
              key={o.value}
              type="button"
              className="chip"
              aria-pressed={values[chips.key] === o.value}
              onClick={() => onChange(chips.key, values[chips.key] === o.value ? '' : o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
      <div className="filter-meta">
        <span className="muted" aria-live="polite">{t('filters.showing', { shown, total })}</span>
        {active && <button type="button" className="link" onClick={onClear}>{t('filters.clear')}</button>}
      </div>
    </section>
  );
}
