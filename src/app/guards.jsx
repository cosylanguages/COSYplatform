import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../shared/auth/AuthContext.jsx';
import { useT } from '../shared/i18n/I18nContext.jsx';
import { EmptyState, Spinner } from '../shared/ui/primitives.jsx';

/** Requires a session. Remembers where the user was heading (same-site paths only). */
export function RequireAuth() {
  const { configured, session, loading } = useAuth();
  const t = useT();
  const location = useLocation();
  if (!configured) return <EmptyState title={t('auth.notConfiguredTitle')}>{t('auth.notConfiguredMessage')}</EmptyState>;
  if (loading) return <Spinner />;
  if (!session) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  return <Outlet />;
}

export function RequireRole({ roles }) {
  const { profile } = useAuth();
  const t = useT();
  if (!roles.includes(profile?.role)) {
    return (
      <EmptyState title={t('auth.accessRestrictedTitle')} action={<Link className="btn btn-secondary" to="/hub">{t('common.backToHub')}</Link>}>
        {t('auth.roleNoPermission', { role: profile?.role || '' })}
      </EmptyState>
    );
  }
  return <Outlet />;
}
