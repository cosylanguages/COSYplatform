import { useT } from '../i18n/I18nContext.jsx';

export function Button({ variant = 'primary', className = '', ...props }) {
  return <button type="button" className={`btn btn-${variant} ${className}`} {...props} />;
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Spinner() {
  const t = useT();
  return <p className="muted" role="status">{t('common.loading')}</p>;
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      {children && <p className="muted">{children}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ error }) {
  const t = useT();
  return (
    <div className="empty" role="alert">
      <h2>{t('common.errorTitle')}</h2>
      <p className="muted">{error?.message || t('common.genericError')}</p>
    </div>
  );
}
