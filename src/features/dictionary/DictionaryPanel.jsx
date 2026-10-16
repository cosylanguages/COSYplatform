import { useEffect, useMemo, useState } from 'react';
import { config } from '../../shared/config/config.js';
import { useT } from '../../shared/i18n/I18nContext.jsx';
import { Badge } from '../../shared/ui/primitives.jsx';
import { entryMeta, loadIndex, searchIndex } from './dictionaryClient.js';

export function DictionaryPanel() {
  const t = useT();
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(undefined); // undefined = loading, null = not configured
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    loadIndex().then(setIndex, () => setFailed(true));
  }, []);

  const results = useMemo(() => searchIndex(index, query), [index, query]);

  return (
    <div>
      <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('tools.dictPlaceholder')} aria-label={t('tools.dictHeading')} />
      {failed && <p className="muted" role="alert">{t('tools.dictLoadFailed')}</p>}
      {index === undefined && !failed && <p className="muted">{t('tools.loadingDictionary')}</p>}
      {index === null && <p className="muted">{t('tools.dictLoadFailed')}</p>}
      {query.length >= 2 && index && results.length === 0 && <p className="muted">{t('tools.dictNoMatch', { query })}</p>}
      <ul className="plain">
        {results.map((r) => (
          <li key={r.term} className="dict-item">
            <strong>{r.term}</strong> {r.exact && <Badge tone="accent">{t('tools.exactMatch')}</Badge>}
            {r.entries.map((e) => {
              const m = entryMeta(e);
              return (
                <div key={e.id} className="muted">
                  {e.pos} {m.level && <Badge>{m.level}</Badge>} {m.theme}{' '}
                  <a href={`${config.ecosystem.data}`} target="_blank" rel="noreferrer">COSYdata</a>
                </div>
              );
            })}
          </li>
        ))}
      </ul>
    </div>
  );
}
