import { useEffect, useRef } from 'react';
import { useT } from '../i18n/I18nContext.jsx';

/** Side drawer for classroom tools. Closes on Escape; focus moves in on open. */
export function Drawer({ open, onClose, title, children }) {
  const t = useT();
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    ref.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <aside className="drawer" role="dialog" aria-label={title} tabIndex={-1} ref={ref}>
      <header className="drawer-head">
        <h2>{title}</h2>
        <button type="button" className="btn btn-ghost" onClick={onClose} aria-label={t('toolbox.close')}>×</button>
      </header>
      <div className="drawer-body">{children}</div>
    </aside>
  );
}
