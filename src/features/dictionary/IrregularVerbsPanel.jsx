import { useMemo, useState } from 'react';
import { useT } from '../../shared/i18n/I18nContext.jsx';
import { IRREGULAR_VERBS } from './irregularVerbs.js';

export function IrregularVerbsPanel() {
  const t = useT();
  const [q, setQ] = useState('');
  const rows = useMemo(() => {
    const n = q.trim().toLowerCase();
    return n ? IRREGULAR_VERBS.filter((v) => [v.v1, v.v2, v.v3].some((x) => x.toLowerCase().includes(n))) : IRREGULAR_VERBS;
  }, [q]);
  return (
    <div>
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('tools.verbsPlaceholder')} aria-label={t('tools.verbsHeading')} />
      {rows.length === 0 ? <p className="muted">{t('tools.verbNoMatch', { query: q })}</p> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>{t('tools.verbV1')}</th><th>{t('tools.verbV2')}</th><th>{t('tools.verbV3')}</th></tr></thead>
            <tbody>{rows.map((v) => <tr key={v.v1}><td>{v.v1}</td><td>{v.v2}</td><td>{v.v3}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
